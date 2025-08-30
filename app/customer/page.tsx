"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomerReviews from "../components/CustomerReviews";
import SmartBooking from "../components/SmartBooking";
import BookingHistory from "../components/BookingHistory";

export default function CustomerDashboard() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "reviews" | "booking" | "bookings"
  >("dashboard");
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      const res = await fetch("/api/customer/profile");
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await res.json();
      setCustomer(data.customer);

      // Fetch recent reviews after getting customer data
      if (data.customer?.email) {
        fetchRecentReviews(data.customer.email);
        fetchRecentOrders();
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentReviews = async (customerEmail: string) => {
    try {
      const res = await fetch(
        `/api/reviews?customer_email=${encodeURIComponent(
          customerEmail
        )}&limit=5`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecentReviews(data.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Get the 5 most recent orders
          const recentOrdersData = data.data.slice(0, 5);
          setRecentOrders(recentOrdersData);
        }
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/customer/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-red-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">FuelFlow</h1>
              <p className="text-blue-200">Customer Portal</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "booking"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Smart Booking
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "bookings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Reviews
            </button>
          </nav>
        </div>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  My Profile
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900">
                      {customer.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <p className="font-medium text-gray-900 capitalize">
                      {customer.type}
                    </p>
                  </div>
                  {customer.company_name && (
                    <div>
                      <span className="text-gray-600">Company:</span>
                      <p className="font-medium text-gray-900">
                        {customer.company_name}
                      </p>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium text-gray-900">
                        {customer.phone}
                      </p>
                    </div>
                  )}
                  {customer.address && (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="font-medium text-gray-900">
                        {customer.address}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Member Since:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/customer/order"
                    className="bg-red-100 hover:bg-red-200 text-red-800 p-4 rounded-lg text-left transition-colors block"
                  >
                    <h3 className="font-semibold">Place New Order</h3>
                    <p className="text-sm text-red-600">
                      Order fuel and products
                    </p>
                  </Link>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-left transition-colors"
                  >
                    <h3 className="font-semibold">Leave a Review</h3>
                    <p className="text-sm text-yellow-600">Rate our services</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h2>
                {recentReviews.length > 0 || recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {/* Recent Orders */}
                    {recentOrders.slice(0, 3).map((order) => (
                      <div
                        key={`order-${order.id}`}
                        className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-semibold">
                              📦
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              Order #{order.order_number || order.id}
                            </p>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === "delivered" ||
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "processing" ||
                                    order.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.order_items?.length || 0} items • Total: $
                            {order.total_amount
                              ? Number(order.total_amount).toFixed(2)
                              : "0.00"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Recent Reviews */}
                    {recentReviews.slice(0, 2).map((review) => (
                      <div
                        key={`review-${review.id}`}
                        className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-sm font-semibold">
                              ★
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {review.title}
                            </p>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xs ${
                                    i < review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {review.service_type?.replace("_", " ")} review
                            {review.order_number &&
                              ` • Order #${review.order_number}`}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                review.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : review.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {/* {review.status} */}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex space-x-4 text-center pt-2 border-t">
                      {recentOrders.length > 3 && (
                        <button className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View all orders →
                        </button>
                      )}
                      {recentReviews.length > 2 && (
                        <button
                          onClick={() => setActiveTab("reviews")}
                          className="flex-1 text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                        >
                          View all reviews →
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <p>No recent activity to display.</p>
                    <p className="text-sm mt-2">
                      Your recent orders and reviews will appear here.
                    </p>
                    <div className="flex space-x-3 mt-3">
                      <Link
                        href="/customer/order"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Place an order →
                      </Link>
                      <button
                        onClick={() => setActiveTab("reviews")}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      >
                        Leave a review →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "booking" && (
          <SmartBooking
            onBookingComplete={() => setActiveTab("bookings")}
            customerEmail={customer?.email}
            customerName={customer?.name}
          />
        )}

        {activeTab === "bookings" && <BookingHistory />}

        {activeTab === "reviews" && (
          <CustomerReviews
            customerEmail={customer?.email}
            customerName={customer?.name}
          />
        )}
      </main>
    </div>
  );
}
