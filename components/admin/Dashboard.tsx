import { useGetList } from "react-admin";
import { useMemo, useState } from "react";

// StatCard component - defined outside to avoid recreation during render
const StatCard = ({
  title,
  value,
  unit = "",
  color = "blue",
  isDark = false
}: {
  title: string;
  value: number | string;
  unit?: string;
  color?: string;
  isDark?: boolean;
}) => {
  const colorMap: Record<string, string> = {
    blue: isDark ? "bg-gray-800 border-blue-800" : "bg-blue-50 border-blue-200",
    green: isDark ? "bg-gray-800 border-green-800" : "bg-green-50 border-green-200",
    orange: isDark ? "bg-gray-800 border-orange-800" : "bg-orange-50 border-orange-200",
    red: isDark ? "bg-gray-800 border-red-800" : "bg-red-50 border-red-200",
    purple: isDark ? "bg-gray-800 border-purple-800" : "bg-purple-50 border-purple-200",
  };

  const textColorMap: Record<string, string> = {
    blue: isDark ? "text-blue-400" : "text-blue-700",
    green: isDark ? "text-green-400" : "text-green-700",
    orange: isDark ? "text-orange-400" : "text-orange-700",
    red: isDark ? "text-red-400" : "text-red-700",
    purple: isDark ? "text-purple-400" : "text-purple-700",
  };

  return (
    <div className={`${colorMap[color]} border rounded-lg p-6`}>
      <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
      <p className={`text-3xl font-bold ${textColorMap[color]}`}>
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </div>
  );
};

export const Dashboard = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboardTheme') === 'dark';
    }
    return false;
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('dashboardTheme', newMode ? 'dark' : 'light');
  };

  // Fetch all data
  const { data: bookings = [] } = useGetList("bookings", {
    pagination: { page: 1, perPage: 10000 },
  });
  const { data: services = [] } = useGetList("services", {
    pagination: { page: 1, perPage: 10000 },
  });
  const { data: timeSlots = [] } = useGetList("time_slots", {
    pagination: { page: 1, perPage: 10000 },
  });
  const { data: profiles = [] } = useGetList("profiles", {
    pagination: { page: 1, perPage: 10000 },
  });
  const { data: organizations = [] } = useGetList("organizations", {
    pagination: { page: 1, perPage: 10000 },
  });

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    if (!startDate && !endDate) return bookings;

    return bookings.filter((booking: Record<string, unknown>) => {
      const bookingDate = new Date(booking.created_at as string);
      const start = startDate ? new Date(startDate) : new Date("1900-01-01");
      const end = endDate ? new Date(endDate) : new Date("2100-01-01");
      return bookingDate >= start && bookingDate <= end;
    });
  }, [bookings, startDate, endDate]);

  // Compute metrics using useMemo
  const metrics = useMemo(() => {
    const confirmedCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "confirmed").length;
    const pendingCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "pending").length;
    const cancelledCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "cancelled").length;
    const activeServiceCount = services.filter((s: Record<string, unknown>) => s.is_active).length;
    const availableSlotsCount = timeSlots.filter((t: Record<string, unknown>) => t.is_available).length;
    const fullSlotsCount = timeSlots.filter((t: Record<string, unknown>) => !t.is_available).length;

    // Calculate booking rate
    const totalCapacity = timeSlots.reduce((sum: number, slot: Record<string, unknown>) => sum + (Number(slot.capacity) || 0), 0);
    const totalBooked = timeSlots.reduce((sum: number, slot: Record<string, unknown>) => sum + (Number(slot.booked_count) || 0), 0);
    const capacityUtil = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
    const bookingRate = filteredBookings.length > 0 ? Math.round((confirmedCount / filteredBookings.length) * 100) : 0;

    return {
      totalBookings: filteredBookings.length,
      confirmedBookings: confirmedCount,
      pendingBookings: pendingCount,
      cancelledBookings: cancelledCount,
      totalServices: services.length,
      activeServices: activeServiceCount,
      totalTimeSlots: timeSlots.length,
      availableSlots: availableSlotsCount,
      fullSlots: fullSlotsCount,
      totalUsers: profiles.length,
      totalOrganizations: organizations.length,
      bookingRate,
      capacityUtilization: capacityUtil,
    };
  }, [filteredBookings, services, timeSlots, profiles, organizations]);

  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h1>
        <div className="flex gap-4 items-end">
          <button
            onClick={toggleDarkMode}
            className={`px-3 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className={`px-4 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
            >
              Clear Dates
            </button>
          )}
        </div>
      </div>

      {startDate || endDate ? (
        <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          📅 Showing data from {startDate || "beginning"} to {endDate || "today"}
        </p>
      ) : null}

      {/* Revenue Section - Top Priority */}
      <div className={`grid grid-cols-1 mb-8 p-8 rounded-lg border ${isDarkMode ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-green-700' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>💰 Revenue Analytics</h2>
            <p className={isDarkMode ? 'text-green-300' : 'text-green-700'}>View detailed revenue reports and booking analytics</p>
          </div>
          <button
            onClick={() => window.location.href = "/admin/revenue"}
            className={`px-6 py-3 rounded-lg transition font-semibold ${isDarkMode ? 'bg-green-700 text-white hover:bg-green-600' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            View Full Report →
          </button>
        </div>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Bookings" value={metrics.totalBookings} color="blue" isDark={isDarkMode} />
        <StatCard title="Confirmed Bookings" value={metrics.confirmedBookings} color="green" isDark={isDarkMode} />
        <StatCard title="Pending Bookings" value={metrics.pendingBookings} color="orange" isDark={isDarkMode} />
        <StatCard title="Cancelled Bookings" value={metrics.cancelledBookings} color="red" isDark={isDarkMode} />
      </div>

      {/* Services Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Services" value={metrics.totalServices} color="blue" isDark={isDarkMode} />
        <StatCard title="Active Services" value={metrics.activeServices} color="green" isDark={isDarkMode} />
        <StatCard title="Booking Confirmation Rate" value={metrics.bookingRate} unit="%" color="purple" isDark={isDarkMode} />
      </div>

      {/* Time Slots Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Time Slots" value={metrics.totalTimeSlots} color="blue" isDark={isDarkMode} />
        <StatCard title="Available Slots" value={metrics.availableSlots} color="green" isDark={isDarkMode} />
        <StatCard title="Full Slots" value={metrics.fullSlots} color="red" isDark={isDarkMode} />
        <StatCard title="Capacity Utilization" value={metrics.capacityUtilization} unit="%" color="purple" isDark={isDarkMode} />
      </div>

      {/* Users & Organizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Users" value={metrics.totalUsers} color="blue" isDark={isDarkMode} />
        <StatCard title="Total Organizations" value={metrics.totalOrganizations} color="purple" isDark={isDarkMode} />
      </div>

      {/* Analytics Insights */}
      <div className={`mt-8 rounded-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Quick Insights</h2>
        <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {metrics.capacityUtilization > 80 && (
            <p className={isDarkMode ? 'text-orange-400' : 'text-orange-600'}>
              ⚠️ High capacity utilization ({metrics.capacityUtilization}%). Consider adding more time slots.
            </p>
          )}
          {metrics.bookingRate < 60 && (
            <p className={isDarkMode ? 'text-orange-400' : 'text-orange-600'}>
              📊 Booking confirmation rate is low ({metrics.bookingRate}%). Review pending bookings.
            </p>
          )}
          {metrics.activeServices === 0 && (
            <p className={isDarkMode ? 'text-red-400' : 'text-red-600'}>🚨 No active services. Create services to start accepting bookings.</p>
          )}
          {metrics.totalTimeSlots === 0 && (
            <p className={isDarkMode ? 'text-red-400' : 'text-red-600'}>🚨 No time slots available. Generate time slots for active services.</p>
          )}
          {metrics.totalOrganizations > 0 && (
            <p className={isDarkMode ? 'text-green-400' : 'text-green-600'}>✅ {metrics.totalOrganizations} organization(s) are using the platform.</p>
          )}
          {metrics.confirmedBookings > 0 && (
            <p className={isDarkMode ? 'text-green-400' : 'text-green-600'}>✅ {metrics.confirmedBookings} confirmed booking(s) in this period.</p>
          )}
        </div>
      </div>
    </div>
  );
};


