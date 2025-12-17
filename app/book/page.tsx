"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCart } from "@/components/store/CartContext";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  capacity: number;
  price: number;
};

type TimeSlot = {
  id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  is_available: boolean;
};

export default function BookPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeSlotsMap, setTimeSlotsMap] = useState<Record<string, TimeSlot[]>>({});
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [lastBookedService, setLastBookedService] = useState<Service | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const fetchAllSlots = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_time_slots_with_availability", {
      p_service_id: null,
    });

    if (error) {
      console.error("Error fetching time slots:", error);
      return;
    }

    const grouped: Record<string, TimeSlot[]> = {};
    (data || []).forEach((slot: any) => {
      grouped[slot.service_id] = grouped[slot.service_id] || [];
      grouped[slot.service_id].push({
        ...slot,
        booked_count: slot.booked_count ?? 0,
        is_available: slot.is_available ?? true,
      } as TimeSlot);
    });
    setTimeSlotsMap(grouped);
  }, []);

  const checkUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setUser(null);
      setAuthRequired(true);
      setLoading(false);
      return;
    }
    setAuthRequired(false);
    setUser(session.user);
    setLoading(false);
  }, []);

  const fetchServices = useCallback(async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching services:", error);
      setError(error.message || "Unable to load services right now. Please try again or contact support.");
      setServices([]);
      setSelectedService(null);
      return;
    }

    if (!data || data.length === 0) {
      setError("No services available. Please check back later.");
      setServices([]);
      setSelectedService(null);
      return;
    }

    setServices(data);
    setSelectedService(data[0].id);
    setError(null);

    // fetch all slots for all services
    await fetchAllSlots();
  }, [fetchAllSlots]);

  const fetchTimeSlots = useCallback(async () => {
    if (!selectedService) return;

    const { data, error } = await supabase.rpc("get_time_slots_with_availability", {
      p_service_id: selectedService,
    });

    if (error) {
      console.error("Error fetching time slots:", error);
      setError(error.message || "Unable to load time slots. Please try again.");
    } else {
      const filtered = (data || [])
        .filter((slot: any) => new Date(slot.start_time) >= new Date())
        .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .map((slot: any) => ({
          ...slot,
          booked_count: slot.booked_count ?? 0,
          is_available: slot.is_available ?? true,
        })) as TimeSlot[];
      setTimeSlots(filtered);
    }
  }, [selectedService]);

  useEffect(() => {
    checkUser();
    fetchServices();
  }, [checkUser, fetchServices]);

  useEffect(() => {
    if (selectedService) {
      fetchTimeSlots();
    }
  }, [fetchTimeSlots, selectedService]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!user) {
      router.push(`/auth/login?redirectedFrom=/book`);
      return;
    }
    const available = slot.capacity - slot.booked_count;
    if (available <= 0) {
      setInfoNotice("This slot is full. Please pick another time.");
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot(slot);
    setError(null);
    setSuccess(false);
    setCartNotice(null);
    setInfoNotice(null);
  };

  const handleBooking = async () => {
    if (!user || !selectedSlot || !selectedService) return;

    setBookingLoading(true);
    setError(null);

    // Prevent duplicate bookings for the same user/slot
    const { data: existingBooking, error: existingCheckError } = await supabase
      .from("bookings")
      .select("id,status")
      .eq("slot_id", selectedSlot.id)
      .eq("user_id", user.id)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (existingCheckError && existingCheckError.code !== "PGRST116") {
      setError(existingCheckError.message || "Could not verify existing booking. Please try again.");
      setBookingLoading(false);
      return;
    }

    if (existingBooking) {
      setError("You already have a booking for this time slot.");
      setBookingLoading(false);
      return;
    }

    const { data: newBooking, error: bookingError } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: selectedService,
      slot_id: selectedSlot.id,
      status: "confirmed",
      notes: notes || null,
    }).select().single();

    if (bookingError) {
      if ((bookingError as any)?.code === "23505") {
        setError("This time slot was just booked. Please pick another available time.");
      } else {
        setError(bookingError.message);
      }
      setBookingLoading(false);
    } else {
      setSuccess(true);
      const svc = services.find((s) => s.id === selectedService);
      const slotForCart = selectedSlot;
      // Increment slot booked_count and availability
      try {
        const { data: slotRow } = await supabase
          .from("time_slots")
          .select("booked_count, capacity")
          .eq("id", selectedSlot.id)
          .single();
        if (slotRow) {
          const newCount = Math.min((slotRow.capacity ?? 0), (slotRow.booked_count ?? 0) + 1);
          const isAvailable = newCount < (slotRow.capacity ?? 0);
          await supabase
            .from("time_slots")
            .update({ booked_count: newCount, is_available: isAvailable })
            .eq("id", selectedSlot.id);
        }
      } catch (err) {
        console.error("Failed to update slot count after booking:", err);
      }

      setLastBookedService(svc || null);
      // Add the booking to cart so checkout has the line item
      if (svc && slotForCart) {
        addItem({
          productId: `booking-${slotForCart.id}`,
          productName: `${svc.name} (${new Date(slotForCart.start_time).toLocaleDateString()})`,
          price: svc.price,
          imageUrl: null,
          quantity: 1,
          kind: "booking",
          serviceId: svc.id,
          slotId: slotForCart.id,
          startTime: slotForCart.start_time,
          endTime: slotForCart.end_time,
          bookingId: newBooking?.id,
        });
      }
      setSelectedSlot(null);
      setNotes("");
      fetchTimeSlots();
      setBookingLoading(false);

      // Send confirmation email (don't block on this)
      if (newBooking?.id) {
        fetch("/api/bookings/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: newBooking.id }),
        }).catch((err) => console.error("Failed to send confirmation email:", err));
      }

      setTimeout(() => {
        router.push("/checkout");
      }, 1200);
    }
  };

  const addBookingToCart = () => {
    if (!user) {
      router.push("/auth/login?redirectedFrom=/book");
      return;
    }
    if (!selectedService || !selectedServiceData || !selectedSlot) {
      setInfoNotice("Select a service and time slot first.");
      return;
    }
    const available = selectedSlot.capacity - selectedSlot.booked_count;
    if (available <= 0) return;
    addItem({
      productId: `booking-${selectedSlot.id}`,
      productName: `${selectedServiceData.name} (${new Date(selectedSlot.start_time).toLocaleDateString()})`,
      price: selectedServiceData.price,
      imageUrl: null,
      quantity: 1,
      kind: "booking",
      serviceId: selectedServiceData.id,
      slotId: selectedSlot.id,
      startTime: selectedSlot.start_time,
      endTime: selectedSlot.end_time,
    });
    setCartNotice("Booking added to cart. Proceed to checkout to pay.");
    setSelectedSlot(null);
    setInfoNotice(null);
  };

  const getCalendarEvents = () => {
    return timeSlots.map((slot) => {
      const available = slot.capacity - slot.booked_count;
      const isFull = available <= 0;
      const startDate = new Date(slot.start_time);
      const endDate = new Date(slot.end_time);
      const sameDay = startDate.toDateString() === endDate.toDateString();

      const startTimeStr = startDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const endTimeStr = endDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      const startDayStr = startDate.toLocaleDateString([], { month: "short", day: "numeric" });
      const endDayStr = endDate.toLocaleDateString([], { month: "short", day: "numeric" });

      const title = sameDay
        ? `${startDayStr} ${startTimeStr} - ${endTimeStr} | ${available} spot${available !== 1 ? "s" : ""}`
        : `${startDayStr} - ${endDayStr} ${startTimeStr} - ${endTimeStr} | ${available} spot${available !== 1 ? "s" : ""}`;

      return {
        id: slot.id,
        title,
        start: slot.start_time,
        end: slot.end_time,
        extendedProps: slot,
        backgroundColor: isFull ? "#ef4444" : "#10b981",
        borderColor: isFull ? "#dc2626" : "#059669",
        textColor: "#ffffff",
        display: 'block',
      };
    });
  };

  if (loading) {
    return (
      <main className="page" style={{ textAlign: "center" }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (authRequired) {
    return (
      <main className="page">
        <div className="card" style={{ textAlign: "center" }}>
          <h2>Please sign in to book</h2>
          <p className="section__lede">Sign in to view available services and time slots.</p>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 10 }}>
            <Link className="btn-primary" href="/auth/login?redirectedFrom=/book">
              Sign in
            </Link>
            <Link className="btn-ghost" href="/auth/signup?redirectedFrom=/book">
              Create account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedAvailability =
    selectedSlot ? Math.max(0, selectedSlot.capacity - selectedSlot.booked_count) : null;

  return (
    <main className="page">
      <header className="hero" style={{ marginBottom: 32 }}>
        <div className="hero__text">
          <span className="badge badge-blue">Book a consultation</span>
          <h1>Choose a service and time</h1>
          <p>Pick a program, then grab an available slot that fits your schedule.</p>
          <div className="hero__cta">
            <Link className="btn-gold" href="/store">
              Browse programs
            </Link>
            <Link className="btn-primary" href="/dashboard">
              View your bookings
            </Link>
          </div>
        </div>
        <div className="hero__image">
          <div className="hero__image-placeholder">
            <span>Calendar preview</span>
          </div>
        </div>
      </header>

      {success && (
        <div className="card" style={{ borderColor: "rgba(16,185,129,0.3)", background: "#f0fdf4" }}>
          <p style={{ color: "#15803d", fontWeight: 700 }}>Booking confirmed! Redirecting to your dashboard...</p>
          {lastBookedService ? (
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn-primary" href="/checkout">
                Pay for booking (${lastBookedService.price})
              </Link>
              <Link className="btn-ghost" href="/dashboard">
                View bookings
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {cartNotice && (
        <div className="card" style={{ borderColor: "rgba(46,163,217,0.3)", background: "#eef7fb" }}>
          <p style={{ color: "#1E7FB6", fontWeight: 700 }}>{cartNotice}</p>
          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn-primary" href="/checkout">
              Go to checkout
            </Link>
            <Link className="btn-ghost" href="/cart">
              View cart
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: "rgba(248,113,113,0.4)", background: "#fef2f2" }}>
          <p style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</p>
        </div>
      )}

      {infoNotice && (
        <div className="card" style={{ borderColor: "rgba(255,196,85,0.4)", background: "#fff7e6" }}>
          <p style={{ color: "#92400e", fontWeight: 700 }}>{infoNotice}</p>
        </div>
      )}

      <div className="grid-cards" style={{ alignItems: "start" }}>
        <div className="card" style={{ gridColumn: "span 1" }}>
          <h2>Services</h2>
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  setSelectedService(service.id);
                  setSelectedSlot(null);
                  setCartNotice(null);
                }}
                className="card card--bordered"
                style={{
                  textAlign: "left",
                  background: selectedService === service.id ? "#eef7fb" : "#fff",
                  borderColor: selectedService === service.id ? "var(--blue-primary)" : "rgba(14,47,74,0.12)",
                  boxShadow: selectedService === service.id ? "0 10px 24px rgba(30,127,182,0.14)" : "0 12px 28px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                }}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{service.name}</div>
                    <div className="section__lede" style={{ marginTop: 4 }}>
                      {service.duration} min - ${service.price}
                    </div>
                  </div>
                  <span className="badge badge-blue">{service.capacity} seats</span>
                </div>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {timeSlotsMap[service.id] && timeSlotsMap[service.id].length ? (
                    <span className="section__lede">
                      {timeSlotsMap[service.id].length} available slot{timeSlotsMap[service.id].length !== 1 ? 's' : ''} · Next: {new Date(timeSlotsMap[service.id][0].start_time).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="section__lede" style={{ color: "#9ca3af" }}>
                      No available slots
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedService(service.id);
                      setSelectedSlot(null);
                      setCartNotice(null);
                      setInfoNotice(null);
                    }}
                    className="btn-ghost"
                    style={{ padding: "6px 10px" }}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedServiceData && (
            <div className="card" style={{ marginTop: 16, background: "#fffdf7" }}>
              <h3>{selectedServiceData.name}</h3>
              <p className="section__lede" style={{ marginTop: 4 }}>
                {selectedServiceData.description}
              </p>
              <div className="feature-list" style={{ marginTop: 10 }}>
                <li>Duration: {selectedServiceData.duration} minutes</li>
                <li>Capacity: {selectedServiceData.capacity} person(s)</li>
                <li style={{ fontWeight: 700 }}>Price: ${selectedServiceData.price}</li>
              </div>
              {selectedSlot ? (
                <div style={{ marginTop: 10 }} className="pill">
                  Selected: {new Date(selectedSlot.start_time).toLocaleDateString()} at{" "}
                  {new Date(selectedSlot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
                  {selectedAvailability} spots left
                </div>
              ) : (
                <p className="section__lede" style={{ marginTop: 8 }}>
                  Choose a time slot to proceed.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2>Available time slots</h2>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#10b981" }}></div>
                <span className="section__lede" style={{ fontSize: 13 }}>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#ef4444" }}></div>
                <span className="section__lede" style={{ fontSize: 13 }}>Full</span>
              </div>
              <span className="badge badge-blue">Local time</span>
            </div>
          </div>
          <div style={{
            '--fc-border-color': '#e5e7eb',
            '--fc-button-bg-color': '#2FA4D9',
            '--fc-button-border-color': '#1E7FB6',
            '--fc-button-hover-bg-color': '#1E7FB6',
            '--fc-button-hover-border-color': '#1E7FB6',
            '--fc-button-active-bg-color': '#1E7FB6',
            '--fc-button-active-border-color': '#1E7FB6',
            '--fc-today-bg-color': '#fef3c7',
          } as React.CSSProperties}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={getCalendarEvents()}
              eventClick={(info) => {
                handleSlotClick(info.event.extendedProps as TimeSlot);
              }}
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00"
              allDaySlot={false}
              height="auto"
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
              dayMaxEvents={3}
              moreLinkText="more slots"
              eventDisplay="block"
              displayEventTime={false}
              displayEventEnd={false}
            />
          </div>
        </div>
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card" style={{ maxWidth: 520, width: "100%" }}>
            <h3>Confirm booking</h3>
            <div className="feature-list" style={{ marginTop: 12 }}>
              <li>
                <strong>Service:</strong> {selectedServiceData?.name}
              </li>
              <li>
                <strong>Date:</strong>{" "}
                {(() => {
                  const startDate = new Date(selectedSlot.start_time);
                  const endDate = new Date(selectedSlot.end_time);
                  const startDateStr = startDate.toLocaleDateString();
                  const endDateStr = endDate.toLocaleDateString();

                  // Check if start and end are on different dates
                  if (startDateStr !== endDateStr) {
                    return `${startDateStr} - ${endDateStr}`;
                  }
                  return startDateStr;
                })()}
              </li>
              <li>
                <strong>Time:</strong> {new Date(selectedSlot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                {new Date(selectedSlot.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </li>
              <li>
                <strong>Availability:</strong> {selectedAvailability} spots left
              </li>
              <li>
                <strong>Price:</strong> ${selectedServiceData?.price}
              </li>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="eyebrow" style={{ display: "block", marginBottom: 6 }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)" }}
                placeholder="Any special requests or information..."
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <button
                onClick={addBookingToCart}
                disabled={selectedAvailability !== null && selectedAvailability <= 0}
                className="btn-ghost"
                style={{ flex: 1 }}
              >
                Add booking to cart
              </button>
              <button
                onClick={handleBooking}
                disabled={bookingLoading || (selectedAvailability !== null && selectedAvailability <= 0)}
                className="btn-primary"
                style={{ flex: 1 }}
              >
                {bookingLoading ? "Booking..." : "Book now"}
              </button>
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setNotes("");
                  setError(null);
                }}
                className="btn-gold"
                style={{ flex: 1, background: "#fff", color: "var(--text)", border: "1px solid rgba(0,0,0,0.12)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
