import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// StatCard component
const StatCard = ({
  title,
  value,
  unit = "",
  color = "blue",
  onClick,
  isDark = false
}: {
  title: string;
  value: number | string;
  unit?: string;
  color?: string;
  onClick?: () => void;
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

  const hoverColorMap: Record<string, string> = {
    blue: isDark ? "hover:bg-gray-700" : "hover:bg-blue-100",
    green: isDark ? "hover:bg-gray-700" : "hover:bg-green-100",
    orange: isDark ? "hover:bg-gray-700" : "hover:bg-orange-100",
    red: isDark ? "hover:bg-gray-700" : "hover:bg-red-100",
    purple: isDark ? "hover:bg-gray-700" : "hover:bg-purple-100",
  };

  return (
    <div
      className={`${colorMap[color]} border rounded-lg p-6 ${onClick ? `cursor-pointer ${hoverColorMap[color]} transition-colors` : ''}`}
      onClick={onClick}
    >
      <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title} {onClick && <span className="text-xs">👁️</span>}</p>
      <p className={`text-3xl font-bold ${textColorMap[color]}`}>
        {value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </div>
  );
};

// Modal component for displaying items
const ItemModal = ({
  isOpen,
  onClose,
  title,
  items,
  type
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: any[];
  type: 'bookings' | 'orders';
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No items to display</p>
        ) : (
          <div className="space-y-4">
            {type === 'orders' ? (
              items.map((order: any, index: number) => (
                <div key={order.id || index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 text-sm text-black">
                    <div><span className="font-semibold">Order ID:</span> {order.id?.substring(0, 8)}...</div>
                    <div><span className="font-semibold">Total:</span> ${parseFloat(order.total || 0).toFixed(2)}</div>
                    <div><span className="font-semibold">Status:</span> <span className="capitalize">{order.status}</span></div>
                    <div><span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleDateString()}</div>
                    {order.stripe_payment_id && (
                      <div className="col-span-2"><span className="font-semibold">Payment ID:</span> {order.stripe_payment_id}</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              items.map((booking: any, index: number) => (
                <div key={booking.id || index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 text-sm text-black">
                    <div><span className="font-semibold">Booking ID:</span> {booking.id?.substring(0, 8)}...</div>
                    <div><span className="font-semibold">Status:</span> <span className="capitalize">{booking.status}</span></div>
                    <div><span className="font-semibold">Service ID:</span> {booking.service_id?.substring(0, 8)}...</div>
                    <div><span className="font-semibold">Date:</span> {new Date(booking.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const RevenuePage = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    items: any[];
    type: 'bookings' | 'orders';
  }>({
    isOpen: false,
    title: '',
    items: [],
    type: 'bookings'
  });

  useEffect(() => {
    fetchData();
    // Load dark mode preference from localStorage
    const savedTheme = localStorage.getItem('revenuePageTheme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('revenuePageTheme', newMode ? 'dark' : 'light');
  };

  const fetchData = async () => {
    try {
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "confirmed");

      const { data: servicesData } = await supabase
        .from("services")
        .select("*");

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .in("status", ["completed", "processing"]);

      setBookings(bookingsData || []);
      setServices(servicesData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (!startDate && !endDate) return orders;

    return orders.filter((order: Record<string, unknown>) => {
      const orderDate = new Date(order.created_at as string);
      const start = startDate ? new Date(startDate) : new Date("1900-01-01");
      const end = endDate ? new Date(endDate) : new Date("2100-01-01");
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, startDate, endDate]);

  // Compute revenue metrics
  const metrics = useMemo(() => {
    // BOOKING REVENUE
    const confirmedCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "confirmed").length;
    const pendingCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "pending").length;
    const cancelledCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "cancelled").length;
    const completedCount = filteredBookings.filter((b: Record<string, unknown>) => b.status === "completed").length;

    const confirmedBookingsData = filteredBookings.filter((b: Record<string, unknown>) => b.status === "confirmed");
    let bookingRevenue = 0;
    const prices: number[] = [];

    confirmedBookingsData.forEach((booking: Record<string, unknown>) => {
      const serviceId = booking.service_id;
      const service = services.find((s: Record<string, unknown>) => s.id === serviceId);
      if (service && service.price) {
        const price = Number(service.price) || 0;
        bookingRevenue += price;
        prices.push(price);
      }
    });

    const averageBookingValue = confirmedCount > 0 ? (bookingRevenue / confirmedCount).toFixed(2) : "0.00";
    const highestRevenue = prices.length > 0 ? Math.max(...prices).toFixed(2) : "0.00";
    const lowestRevenue = prices.length > 0 ? Math.min(...prices).toFixed(2) : "0.00";

    // PRODUCT/ORDER REVENUE
    let productRevenue = 0;
    let completedOrders = 0;
    let processingOrders = 0;
    let pendingOrders = 0;
    let cancelledOrders = 0;
    let refundedOrders = 0;

    filteredOrders.forEach((order: Record<string, unknown>) => {
      const total = Number(order.total) || 0;

      // Only count completed and processing orders towards revenue
      if (order.status === "completed" || order.status === "processing") {
        productRevenue += total;
      }

      if (order.status === "completed") completedOrders++;
      if (order.status === "processing") processingOrders++;
      if (order.status === "pending") pendingOrders++;
      if (order.status === "cancelled") cancelledOrders++;
      if (order.status === "refunded") refundedOrders++;
    });

    const successfulOrders = completedOrders + processingOrders;
    const averageOrderValue = successfulOrders > 0 ? (productRevenue / successfulOrders).toFixed(2) : "0.00";

    // COMBINED REVENUE
    const totalRevenue = bookingRevenue + productRevenue;

    return {
      // Combined
      totalRevenue: totalRevenue.toFixed(2),

      // Booking-specific
      bookingRevenue: bookingRevenue.toFixed(2),
      confirmedBookings: confirmedCount,
      averageBookingValue,
      highestRevenue,
      lowestRevenue,
      totalBookings: filteredBookings.length,
      pendingBookings: pendingCount,
      cancelledBookings: cancelledCount,
      completedBookings: completedCount,

      // Product/Order-specific
      productRevenue: productRevenue.toFixed(2),
      totalOrders: filteredOrders.length,
      completedOrders,
      processingOrders,
      pendingOrders,
      cancelledOrders,
      refundedOrders,
      averageOrderValue,
    };
  }, [filteredBookings, filteredOrders, services]);

  // Helper functions to show modals
  const showBookings = (status: string, title: string) => {
    const items = filteredBookings.filter((b: Record<string, unknown>) => b.status === status);
    setModalState({
      isOpen: true,
      title,
      items,
      type: 'bookings'
    });
  };

  const showOrders = (status: string, title: string) => {
    const items = filteredOrders.filter((o: Record<string, unknown>) => o.status === status);
    setModalState({
      isOpen: true,
      title,
      items,
      type: 'orders'
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: '',
      items: [],
      type: 'bookings'
    });
  };

  if (loading) {
    return (
      <div className={`p-8 min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading revenue data...</p>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>💰 Revenue Analytics</h1>
        <div className="flex gap-4 items-end">
          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>🌞</span>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>🌙</span>
          </div>

          <button
            onClick={() => window.location.href = '/admin'}
            className={`px-4 py-2 rounded-lg transition ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            ← Back to Dashboard
          </button>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className={`px-4 py-2 rounded-lg transition ${
                isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {startDate || endDate ? (
        <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          📅 Showing data from {startDate || "beginning"} to {endDate || "today"}
        </p>
      ) : null}

      {/* Main Revenue Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 p-6 rounded-lg border ${
        isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-green-900' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
      }`}>
        <StatCard title="💰 Total Revenue (All)" value={`$${metrics.totalRevenue}`} color="green" isDark={isDarkMode} />
        <StatCard title="📅 Booking Revenue" value={`$${metrics.bookingRevenue}`} color="blue" isDark={isDarkMode} />
        <StatCard title="🛍️ Product Revenue" value={`$${metrics.productRevenue}`} color="purple" isDark={isDarkMode} />
      </div>

      {/* Booking Revenue Section */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>📅 Booking Revenue</h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-blue-900' : 'bg-blue-50 border-blue-200'
        }`}>
          <StatCard title="💰 Booking Revenue" value={`$${metrics.bookingRevenue}`} color="blue" isDark={isDarkMode} />
          <StatCard title="✅ Confirmed Bookings" value={metrics.confirmedBookings} color="green" isDark={isDarkMode} />
          <StatCard title="📊 Avg Booking Value" value={`$${metrics.averageBookingValue}`} color="blue" isDark={isDarkMode} />
          <StatCard title="📈 Total Bookings" value={metrics.totalBookings} color="blue" isDark={isDarkMode} />
        </div>
      </div>

      {/* Product Revenue Section */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>🛍️ Product Revenue</h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-purple-900' : 'bg-purple-50 border-purple-200'
        }`}>
          <StatCard title="💰 Product Revenue" value={`$${metrics.productRevenue}`} color="purple" isDark={isDarkMode} />
          <StatCard
            title="✅ Completed Orders"
            value={metrics.completedOrders}
            color="green"
            onClick={() => showOrders('completed', '✅ Completed Orders')}
            isDark={isDarkMode}
          />
          <StatCard
            title="⚙️ Processing Orders"
            value={metrics.processingOrders}
            color="orange"
            onClick={() => showOrders('processing', '⚙️ Processing Orders')}
            isDark={isDarkMode}
          />
          <StatCard title="📊 Avg Order Value" value={`$${metrics.averageOrderValue}`} color="purple" isDark={isDarkMode} />
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>📊 Booking Status Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="⏳ Pending Bookings"
            value={metrics.pendingBookings}
            color="orange"
            onClick={() => showBookings('pending', '⏳ Pending Bookings')}
            isDark={isDarkMode}
          />
          <StatCard
            title="❌ Cancelled Bookings"
            value={metrics.cancelledBookings}
            color="red"
            onClick={() => showBookings('cancelled', '❌ Cancelled Bookings')}
            isDark={isDarkMode}
          />
          <StatCard
            title="✔️ Completed Bookings"
            value={metrics.completedBookings}
            color="green"
            onClick={() => showBookings('completed', '✔️ Completed Bookings')}
            isDark={isDarkMode}
          />
          <StatCard title="💎 Highest Service Price" value={`$${metrics.highestRevenue}`} color="purple" isDark={isDarkMode} />
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="mb-8">
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>📦 Order Status Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="📊 Total Orders" value={metrics.totalOrders} color="purple" isDark={isDarkMode} />
          <StatCard
            title="⏳ Pending Orders"
            value={metrics.pendingOrders}
            color="orange"
            onClick={() => showOrders('pending', '⏳ Pending Orders')}
            isDark={isDarkMode}
          />
          <StatCard
            title="⚙️ Processing Orders"
            value={metrics.processingOrders}
            color="blue"
            onClick={() => showOrders('processing', '⚙️ Processing Orders')}
            isDark={isDarkMode}
          />
          <StatCard
            title="✅ Completed Orders"
            value={metrics.completedOrders}
            color="green"
            onClick={() => showOrders('completed', '✅ Completed Orders')}
            isDark={isDarkMode}
          />
        </div>
      </div>

      {/* Problem Orders Section */}
      {(metrics.cancelledOrders > 0 || metrics.refundedOrders > 0) && (
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>⚠️ Issue Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="❌ Cancelled Orders"
              value={metrics.cancelledOrders}
              color="red"
              onClick={() => showOrders('cancelled', '❌ Cancelled Orders')}
              isDark={isDarkMode}
            />
            <StatCard
              title="💸 Refunded Orders"
              value={metrics.refundedOrders}
              color="red"
              onClick={() => showOrders('refunded', '💸 Refunded Orders')}
              isDark={isDarkMode}
            />
            <StatCard
              title="🔄 Issue Rate"
              value={`${metrics.totalOrders > 0 ? ((metrics.cancelledOrders + metrics.refundedOrders) / metrics.totalOrders * 100).toFixed(1) : '0'}%`}
              color="orange"
              isDark={isDarkMode}
            />
            <StatCard
              title="✅ Success Rate"
              value={`${metrics.totalOrders > 0 ? ((metrics.completedOrders + metrics.processingOrders) / metrics.totalOrders * 100).toFixed(1) : '0'}%`}
              color="green"
              isDark={isDarkMode}
            />
          </div>
        </div>
      )}

      {/* Revenue Insights */}
      <div className={`rounded-lg border p-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>💡 Revenue Insights</h2>
        <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {/* Total Revenue */}
          {Number(metrics.totalRevenue) > 0 && (
            <p className="text-green-600 font-semibold">
              💰 Total Revenue: ${metrics.totalRevenue} (Bookings: ${metrics.bookingRevenue} | Products: ${metrics.productRevenue})
            </p>
          )}
          {Number(metrics.totalRevenue) === 0 && (
            <p className="text-orange-600">📊 No revenue generated in this period.</p>
          )}

          {/* Booking Insights */}
          {Number(metrics.bookingRevenue) > 0 && (
            <p className="text-blue-600">
              📅 Booking revenue of ${metrics.bookingRevenue} from {metrics.confirmedBookings} confirmed booking(s).
              Average: ${metrics.averageBookingValue} per booking.
            </p>
          )}
          {Number(metrics.bookingRevenue) === 0 && metrics.confirmedBookings > 0 && (
            <p className="text-orange-600">
              💬 Services may not have prices set. {metrics.confirmedBookings} confirmed booking(s) with no revenue recorded.
            </p>
          )}
          {metrics.pendingBookings > 0 && (
            <p className="text-orange-600">
              ⏳ {metrics.pendingBookings} pending booking(s) could generate up to ${(Number(metrics.averageBookingValue) * metrics.pendingBookings).toFixed(2)} if confirmed.
            </p>
          )}

          {/* Product/Order Insights */}
          {Number(metrics.productRevenue) > 0 && (
            <p className="text-purple-600">
              🛍️ Product revenue of ${metrics.productRevenue} from {metrics.totalOrders} order(s).
              Average: ${metrics.averageOrderValue} per order.
            </p>
          )}
          {metrics.completedOrders > 0 && (
            <p className="text-green-600">
              ✅ {metrics.completedOrders} completed order(s). Great job fulfilling orders!
            </p>
          )}
          {metrics.processingOrders > 0 && (
            <p className="text-blue-600">
              ⚙️ {metrics.processingOrders} order(s) currently being processed.
            </p>
          )}
          {metrics.pendingOrders > 0 && (
            <p className="text-orange-600">
              ⏳ {metrics.pendingOrders} order(s) pending payment confirmation.
            </p>
          )}

          {/* Cancelled items */}
          {metrics.cancelledBookings > 0 && (
            <p className="text-red-600">
              ❌ {metrics.cancelledBookings} booking(s) were cancelled, representing potential lost revenue.
            </p>
          )}
          {metrics.cancelledOrders > 0 && (
            <p className="text-red-600">
              ❌ {metrics.cancelledOrders} order(s) were cancelled. Review reasons to improve conversion rates.
            </p>
          )}
          {metrics.refundedOrders > 0 && (
            <p className="text-red-600">
              💸 {metrics.refundedOrders} order(s) were refunded. Consider following up on customer satisfaction.
            </p>
          )}

          {/* Overall Performance */}
          {metrics.totalOrders > 0 && (
            <p className={`${(metrics.cancelledOrders + metrics.refundedOrders) / metrics.totalOrders < 0.1 ? 'text-green-600' : 'text-orange-600'} font-semibold`}>
              📊 Order success rate: {((metrics.completedOrders + metrics.processingOrders) / metrics.totalOrders * 100).toFixed(1)}%
              {(metrics.cancelledOrders + metrics.refundedOrders) / metrics.totalOrders < 0.1
                ? ' - Excellent performance!'
                : ' - Consider reviewing checkout flow and customer support.'}
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <ItemModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        items={modalState.items}
        type={modalState.type}
      />
    </div>
  );
};


