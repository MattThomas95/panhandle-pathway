import { useGetList, useGetIdentity } from "react-admin";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// StatCard component
const StatCard = ({ title, value, unit = "", color = "blue" }: { title: string; value: number | string; unit?: string; color?: string }) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    orange: "bg-orange-50 border-orange-200",
    red: "bg-red-50 border-red-200",
    purple: "bg-purple-50 border-purple-200",
  };

  const textColorMap: Record<string, string> = {
    blue: "text-blue-700",
    green: "text-green-700",
    orange: "text-orange-700",
    red: "text-red-700",
    purple: "text-purple-700",
  };

  return (
    <div className={`${colorMap[color]} border rounded-lg p-6`}>
      <p className="text-sm text-gray-600 mb-2">{title}</p>
      <p className={`text-3xl font-bold ${textColorMap[color]}`}>
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </div>
  );
};

export const RevenuePage = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Check authorization using hook
  const { data: identity, isLoading: authLoading } = useGetIdentity();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && identity?.role !== "admin") {
      navigate("/admin");
    }
  }, [identity, authLoading, navigate]);

  // Fetch all data
  const { data: bookings = [] } = useGetList("bookings", {
    pagination: { page: 1, perPage: 10000 },
  });
  const { data: services = [] } = useGetList("services", {
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

  // Compute revenue metrics
  const metrics = useMemo(() => {
    const confirmedCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "confirmed").length;
    const pendingCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "pending").length;
    const cancelledCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "cancelled").length;
    const completedCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "completed").length;

    // Calculate revenue details
    const confirmedBookingsData = filteredBookings.filter((b: Record<string, unknown>) => b.status === "confirmed");
    let totalRevenue = 0;
    const prices: number[] = [];

    confirmedBookingsData.forEach((booking: Record<string, unknown>) => {
      const serviceId = booking.service_id;
      const service = services.find((s: Record<string, unknown>) => s.id === serviceId);
      if (service && service.price) {
        const price = Number(service.price) || 0;
        totalRevenue += price;
        prices.push(price);
      }
    });

    const averageBookingValue = confirmedCount > 0 ? (totalRevenue / confirmedCount).toFixed(2) : "0.00";
    const highestRevenue = prices.length > 0 ? Math.max(...prices).toFixed(2) : "0.00";
    const lowestRevenue = prices.length > 0 ? Math.min(...prices).toFixed(2) : "0.00";

    return {
      totalRevenue: totalRevenue.toFixed(2),
      confirmedBookings: confirmedCount,
      averageBookingValue,
      highestRevenue,
      lowestRevenue,
      totalBookings: filteredBookings.length,
      pendingBookings: pendingCount,
      cancelledBookings: cancelledCount,
      completedBookings: completedCount,
    };
  }, [filteredBookings, services]);

  if (authLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (identity?.role !== "admin") {
    return null;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">💰 Revenue Analytics</h1>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {startDate || endDate ? (
        <p className="mb-6 text-sm text-gray-600">
          📅 Showing data from {startDate || "beginning"} to {endDate || "today"}
        </p>
      ) : null}

      {/* Main Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <StatCard title="💰 Total Revenue" value={`$${metrics.totalRevenue}`} color="green" />
        <StatCard title="✅ Confirmed Bookings" value={metrics.confirmedBookings} color="green" />
        <StatCard title="📊 Avg Booking Value" value={`$${metrics.averageBookingValue}`} color="green" />
      </div>

      {/* Revenue Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="💎 Highest Service Price" value={`$${metrics.highestRevenue}`} color="purple" />
        <StatCard title="💵 Lowest Service Price" value={`$${metrics.lowestRevenue}`} color="orange" />
        <StatCard title="📈 Revenue Per Booking" value={`$${metrics.averageBookingValue}`} color="blue" />
        <StatCard title="🎯 Confirmed Bookings" value={metrics.confirmedBookings} color="green" />
      </div>

      {/* Booking Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="📊 Total Bookings" value={metrics.totalBookings} color="blue" />
        <StatCard title="⏳ Pending Bookings" value={metrics.pendingBookings} color="orange" />
        <StatCard title="❌ Cancelled Bookings" value={metrics.cancelledBookings} color="red" />
        <StatCard title="✔️ Completed Bookings" value={metrics.completedBookings} color="green" />
      </div>

      {/* Revenue Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Revenue Insights</h2>
        <div className="space-y-3 text-gray-700">
          {Number(metrics.totalRevenue) > 0 && (
            <p className="text-green-600">
              💰 Total Revenue: ${metrics.totalRevenue} from {metrics.confirmedBookings} confirmed booking(s).
            </p>
          )}
          {Number(metrics.totalRevenue) === 0 && metrics.confirmedBookings > 0 && (
            <p className="text-orange-600">
              💬 Services may not have prices set. {metrics.confirmedBookings} confirmed booking(s) with no revenue recorded.
            </p>
          )}
          {metrics.confirmedBookings === 0 && (
            <p className="text-orange-600">📊 No confirmed bookings in this period. Revenue generation awaits.</p>
          )}
          {Number(metrics.averageBookingValue) > 0 && (
            <p className="text-blue-600">
              📈 Average booking value is ${metrics.averageBookingValue}. Service pricing range: ${metrics.lowestRevenue} - ${metrics.highestRevenue}.
            </p>
          )}
          {metrics.pendingBookings > 0 && (
            <p className="text-orange-600">
              ⏳ {metrics.pendingBookings} pending booking(s) could generate up to ${(Number(metrics.averageBookingValue) * metrics.pendingBookings).toFixed(2)} if confirmed.
            </p>
          )}
          {metrics.cancelledBookings > 0 && (
            <p className="text-red-600">
              ❌ {metrics.cancelledBookings} booking(s) were cancelled, representing potential lost revenue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
