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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Calendar,
  ShoppingBag,
  ClipboardList,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  ShoppingCart,
  AlertTriangle,
  Info,
  X,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";

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
  service_kind?: "training" | "consultation";
  registration_cutoff_days?: number | null;
  late_fee_days?: number | null;
  late_fee_amount?: number | null;
  time_limit_minutes?: number | null;
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
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
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
  const [lastLateFee, setLastLateFee] = useState<number>(0);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const getServiceRules = (svc?: Service | null) => {
    const kind = svc?.service_kind ?? "training";
    const cutoff = kind === "consultation" ? svc?.registration_cutoff_days ?? 0 : 0;
    const feeDays = svc?.late_fee_days ?? 7;
    const feeAmount = svc?.late_fee_amount ?? 25;
    return { kind, cutoff, feeDays, feeAmount };
  };

  const daysUntil = (iso: string) => {
    const now = new Date();
    const target = new Date(iso);
    const diffMs = target.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };
  const isLate = (iso: string, svc?: Service | null) => daysUntil(iso) < getServiceRules(svc).feeDays;
  const getLateFee = (iso: string, svc?: Service | null) =>
    isLate(iso, svc) ? getServiceRules(svc).feeAmount : 0;

  const fetchAllSlots = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_time_slots_with_availability", {
      p_service_id: null,
    });

    if (error) {
      console.error("Error fetching time slots:", error);
      return;
    }

    const grouped: Record<string, TimeSlot[]> = {};
    const normalizeSlot = (slot: any) =>
      ({
        ...slot,
        booked_count: slot.booked_count ?? 0,
        is_available: slot.is_available ?? true,
      }) as TimeSlot;

    const upcoming = (data || [])
      .map(normalizeSlot)
      .filter((slot: TimeSlot) => new Date(slot.start_time) >= new Date())
      .sort((a: TimeSlot, b: TimeSlot) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    upcoming.forEach((slot: TimeSlot) => {
      grouped[slot.service_id] = grouped[slot.service_id] || [];
      grouped[slot.service_id].push(slot);
    });

    setTimeSlotsMap(grouped);
    setAllSlots(upcoming);
    setTimeSlots(upcoming);
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
    setSelectedService(null);
    setError(null);

    await fetchAllSlots();
  }, [fetchAllSlots]);

  useEffect(() => {
    checkUser();
    fetchServices();
  }, [checkUser, fetchServices]);

  useEffect(() => {
    if (!selectedService) {
      setTimeSlots(allSlots);
      return;
    }
    const slots = timeSlotsMap[selectedService] || [];
    setTimeSlots(slots);
  }, [allSlots, selectedService, timeSlotsMap]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!user) {
      router.push(`/auth/login?redirectedFrom=/book`);
      return;
    }
    if (!selectedService) {
      setSelectedService(slot.service_id);
    }
    const svc = services.find((s) => s.id === (selectedService ?? slot.service_id));
    const { cutoff } = getServiceRules(svc);
    if (cutoff > 0 && daysUntil(slot.start_time) < cutoff) {
      setInfoNotice(`Registration must be completed at least ${cutoff} days in advance.`);
      setSelectedSlot(null);
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

    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        service_id: selectedService,
        slot_id: selectedSlot.id,
        status: "confirmed",
        notes: notes || null,
      })
      .select()
      .single();

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
      try {
        const { data: slotRow } = await supabase
          .from("time_slots")
          .select("booked_count, capacity")
          .eq("id", selectedSlot.id)
          .single();
        if (slotRow) {
          const newCount = Math.min(slotRow.capacity ?? 0, (slotRow.booked_count ?? 0) + 1);
          const isAvailable = newCount < (slotRow.capacity ?? 0);
          await supabase
            .from("time_slots")
            .update({ booked_count: newCount, is_available: isAvailable })
            .eq("id", selectedSlot.id);
        }
      } catch (err) {
        console.error("Failed to update slot count after booking:", err);
      }

      if (svc && slotForCart) {
        const lateFee = getLateFee(slotForCart.start_time, svc);
        setLastLateFee(lateFee);
        addItem({
          productId: `booking-${slotForCart.id}`,
          productName: `${svc.name} (${new Date(slotForCart.start_time).toLocaleDateString()})`,
          price: svc.price + lateFee,
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
      setBookingLoading(false);

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
    const lateFee = getLateFee(selectedSlot.start_time, selectedServiceData);
    addItem({
      productId: `booking-${selectedSlot.id}`,
      productName: `${selectedServiceData.name} (${new Date(selectedSlot.start_time).toLocaleDateString()})`,
      price: selectedServiceData.price + lateFee,
      imageUrl: null,
      quantity: 1,
      kind: "booking",
      serviceId: selectedServiceData.id,
      slotId: selectedSlot.id,
      startTime: selectedSlot.start_time,
      endTime: selectedSlot.end_time,
    });
    const svcRules = getServiceRules(selectedServiceData);
    setCartNotice(
      lateFee > 0
        ? `Booking added to cart with a $${lateFee.toFixed(2)} late fee (within ${svcRules.feeDays} days). Proceed to checkout.`
        : "Booking added to cart. Proceed to checkout to pay."
    );
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
        display: "block",
      };
    });
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="page-container">
        <EmptyState
          icon={Calendar}
          title="Please sign in to book"
          description="Sign in to view available services and time slots."
        >
          <div className="flex gap-3">
            <Button variant="primary" asChild>
              <Link href="/auth/login?redirectedFrom=/book">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/auth/signup?redirectedFrom=/book">
                <UserPlus className="h-4 w-4" />
                Create account
              </Link>
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  const selectedServiceData = services.find((s) => s.id === selectedService);
  const selectedAvailability = selectedSlot ? Math.max(0, selectedSlot.capacity - selectedSlot.booked_count) : null;

  return (
    <div className="page-container">
      <PageHeader
        badge="Book a consultation"
        badgeVariant="blue"
        title="Choose a service and time"
        description="Pick a program, then grab an available slot that fits your schedule."
      >
        <Button variant="gold" asChild>
          <Link href="/store">
            <ShoppingBag className="h-4 w-4" />
            Browse programs
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/dashboard">
            <ClipboardList className="h-4 w-4" />
            View your bookings
          </Link>
        </Button>
      </PageHeader>

      {/* Notices */}
      {success && (
        <Card variant="highlight" className="p-4 mb-6 border-[var(--teal-500)]/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[var(--teal-500)] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[var(--teal-600)]">Booking confirmed! Redirecting to checkout...</p>
              {lastBookedService && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Button variant="primary" size="sm" asChild>
                    <Link href="/checkout">Pay for booking (${(lastBookedService.price + lastLateFee).toFixed(2)})</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">View bookings</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {cartNotice && (
        <Card variant="highlight" className="p-4 mb-6 border-[var(--primary)]/30">
          <div className="flex items-start gap-3">
            <ShoppingCart className="h-5 w-5 text-[var(--primary)] mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-[var(--primary)]">{cartNotice}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Button variant="primary" size="sm" asChild>
                  <Link href="/checkout">Go to checkout</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/cart">View cart</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card variant="default" className="p-4 mb-6 border-[var(--error)]/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--error)] shrink-0" />
            <p className="font-bold text-[var(--error)]">{error}</p>
          </div>
        </Card>
      )}

      {infoNotice && (
        <Card variant="default" className="p-4 mb-6 border-[var(--gold-500)]/30 bg-[var(--gold-50)]">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-[var(--gold-600)] shrink-0" />
            <p className="font-bold text-[var(--gold-700)]">{infoNotice}</p>
          </div>
        </Card>
      )}

      {/* Main grid: services + calendar */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Services sidebar */}
        <div className="space-y-4">
          <Card variant="highlight" className="p-5">
            <h2 className="text-base mb-4">Services</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <Card
                  key={service.id}
                  variant={selectedService === service.id ? "bordered" : "default"}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedService === service.id
                      ? "border-[var(--primary)] shadow-[var(--shadow-glow-blue)]"
                      : "hover:border-[var(--border)]"
                  }`}
                  onClick={() => {
                    setSelectedService((prev) => (prev === service.id ? null : service.id));
                    setSelectedSlot(null);
                    setCartNotice(null);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-[var(--foreground)]">{service.name}</p>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1 flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> {service.duration} min
                        <span className="text-[var(--foreground-muted)]">·</span>
                        <DollarSign className="h-3.5 w-3.5" /> ${service.price}
                      </p>
                    </div>
                    <Badge variant="blue">
                      <Users className="h-3 w-3" /> {service.capacity}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {timeSlotsMap[service.id]?.length ? (
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {timeSlotsMap[service.id].length} slot{timeSlotsMap[service.id].length !== 1 ? "s" : ""} · Next:{" "}
                        {new Date(timeSlotsMap[service.id][0].start_time).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--foreground-muted)]">No available slots</span>
                    )}
                    <Button
                      variant={selectedService === service.id ? "primary" : "gold"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService((prev) => (prev === service.id ? null : service.id));
                        setSelectedSlot(null);
                        setCartNotice(null);
                        setInfoNotice(null);
                      }}
                    >
                      {selectedService === service.id ? "Show all" : "Select"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Selected service detail */}
          {selectedServiceData && (
            <Card variant="default" className="p-5">
              <h3 className="text-base mb-2">{selectedServiceData.name}</h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-3">{selectedServiceData.description}</p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Duration: {selectedServiceData.duration} minutes
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Capacity: {selectedServiceData.capacity} person(s)
                </li>
                <li className="flex items-center gap-2 font-bold">
                  <DollarSign className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Price: ${selectedServiceData.price}
                </li>
              </ul>
              {selectedSlot ? (
                <Badge variant="success" className="mt-3">
                  Selected: {new Date(selectedSlot.start_time).toLocaleDateString()} at{" "}
                  {new Date(selectedSlot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {selectedAvailability} spots left
                </Badge>
              ) : (
                <p className="text-sm text-[var(--foreground-muted)] mt-3">Choose a time slot to proceed.</p>
              )}
            </Card>
          )}
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card variant="default" className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-base">Available time slots</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#10b981]" />
                  <span className="text-xs text-[var(--foreground-muted)]">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
                  <span className="text-xs text-[var(--foreground-muted)]">Full</span>
                </div>
                <Badge variant="blue">Local time</Badge>
              </div>
            </div>
            <div
              style={
                {
                  "--fc-border-color": "#e5e7eb",
                  "--fc-button-bg-color": "var(--primary)",
                  "--fc-button-border-color": "var(--blue-700)",
                  "--fc-button-hover-bg-color": "var(--blue-700)",
                  "--fc-button-hover-border-color": "var(--blue-700)",
                  "--fc-button-active-bg-color": "var(--blue-700)",
                  "--fc-button-active-border-color": "var(--blue-700)",
                  "--fc-today-bg-color": "var(--gold-50)",
                } as React.CSSProperties
              }
            >
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
          </Card>
        </div>
      </div>

      {/* Booking confirmation modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card variant="default" className="max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base">Confirm booking</h3>
              <button
                onClick={() => { setSelectedSlot(null); setNotes(""); setError(null); }}
                className="rounded-lg p-1 hover:bg-[var(--surface)] transition-colors"
              >
                <X className="h-5 w-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Service</span>
                <span className="font-bold">{selectedServiceData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Date</span>
                <span className="font-bold">
                  {(() => {
                    const startDate = new Date(selectedSlot.start_time);
                    const endDate = new Date(selectedSlot.end_time);
                    if (startDate.toLocaleDateString() !== endDate.toLocaleDateString()) {
                      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
                    }
                    return startDate.toLocaleDateString();
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Time</span>
                <span className="font-bold">
                  {new Date(selectedSlot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(selectedSlot.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Availability</span>
                <span className="font-bold">{selectedAvailability} spots left</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Price</span>
                <span className="font-bold">${selectedServiceData?.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Late fee</span>
                <span className="font-bold">
                  {getLateFee(selectedSlot.start_time, selectedServiceData) > 0
                    ? `$${getLateFee(selectedSlot.start_time, selectedServiceData)}`
                    : "$0.00"}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2">
                <span className="font-bold">Total</span>
                <span className="font-extrabold text-[var(--blue-900)]">
                  ${((selectedServiceData?.price ?? 0) + getLateFee(selectedSlot.start_time, selectedServiceData)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[var(--foreground)] mb-1.5">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors"
                placeholder="Any special requests or information..."
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={addBookingToCart}
                disabled={selectedAvailability !== null && selectedAvailability <= 0}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleBooking}
                disabled={bookingLoading || (selectedAvailability !== null && selectedAvailability <= 0)}
              >
                {bookingLoading ? "Booking..." : "Book now"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
