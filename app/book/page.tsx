"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkUser();
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchTimeSlots();
    }
  }, [selectedService]);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setUser(session?.user || null);
    setLoading(false);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching services:", error);
    } else {
      setServices(data || []);
      if (data && data.length > 0) {
        setSelectedService(data[0].id);
      }
    }
  };

  const fetchTimeSlots = async () => {
    if (!selectedService) return;

    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("service_id", selectedService)
      .eq("is_available", true)
      .gte("start_time", new Date().toISOString())
      .order("start_time");

    if (error) {
      console.error("Error fetching time slots:", error);
    } else {
      setTimeSlots(data || []);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!user) {
      router.push(`/auth/login?redirectedFrom=/book`);
      return;
    }
    setSelectedSlot(slot);
    setError(null);
    setSuccess(false);
  };

  const handleBooking = async () => {
    if (!user || !selectedSlot || !selectedService) return;

    setBookingLoading(true);
    setError(null);

    const { error: bookingError } = await supabase.from("bookings").insert({
      user_id: user.id,
      service_id: selectedService,
      slot_id: selectedSlot.id,
      status: "confirmed",
      notes: notes || null,
    });

    if (bookingError) {
      setError(bookingError.message);
      setBookingLoading(false);
    } else {
      setSuccess(true);
      setSelectedSlot(null);
      setNotes("");
      fetchTimeSlots(); // Refresh slots
      setBookingLoading(false);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }
  };

  const getCalendarEvents = () => {
    return timeSlots.map((slot) => ({
      id: slot.id,
      title: `Available (${slot.capacity - slot.booked_count} spots)`,
      start: slot.start_time,
      end: slot.end_time,
      extendedProps: slot,
      backgroundColor: slot.booked_count >= slot.capacity ? "#ef4444" : "#10b981",
      borderColor: slot.booked_count >= slot.capacity ? "#dc2626" : "#059669",
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  const selectedServiceData = services.find((s) => s.id === selectedService);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-black dark:text-white">
            Panhandle Pathway
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</span>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Sign In to Book
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">Book a Service</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Select a service and choose an available time slot
        </p>

        {success && (
          <div className="mt-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm text-green-600 dark:text-green-400">
              Booking confirmed! Redirecting to your dashboard...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Service Selection */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-black dark:text-white">Services</h2>
              <div className="mt-4 space-y-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      selectedService === service.id
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-zinc-200 bg-white text-black hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    }`}
                  >
                    <div className="font-medium">{service.name}</div>
                    <div className="mt-1 text-sm opacity-75">
                      {service.duration} min • ${service.price}
                    </div>
                  </button>
                ))}
              </div>

              {selectedServiceData && (
                <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
                  <h3 className="font-medium text-black dark:text-white">
                    {selectedServiceData.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedServiceData.description}
                  </p>
                  <div className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Duration: {selectedServiceData.duration} minutes</p>
                    <p>Capacity: {selectedServiceData.capacity} person(s)</p>
                    <p className="font-medium text-black dark:text-white">
                      Price: ${selectedServiceData.price}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Available Time Slots
              </h2>
              <div className="mt-4">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridWeek,timeGridDay",
                  }}
                  events={getCalendarEvents()}
                  eventClick={(info) => {
                    handleSlotClick(info.event.extendedProps as TimeSlot);
                  }}
                  slotMinTime="09:00:00"
                  slotMaxTime="17:00:00"
                  allDaySlot={false}
                  height="auto"
                  eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    meridiem: "short",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Confirm Booking
              </h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-black dark:text-white">Service:</strong>{" "}
                  {selectedServiceData?.name}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-black dark:text-white">Date:</strong>{" "}
                  {new Date(selectedSlot.start_time).toLocaleDateString()}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-black dark:text-white">Time:</strong>{" "}
                  {new Date(selectedSlot.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(selectedSlot.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  <strong className="text-black dark:text-white">Price:</strong> $
                  {selectedServiceData?.price}
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-black shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="Any special requests or information..."
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    setNotes("");
                    setError(null);
                  }}
                  className="flex-1 rounded-md border border-zinc-300 bg-white py-2 text-black transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="flex-1 rounded-md bg-black py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
