/* eslint-disable @typescript-eslint/no-explicit-any */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      const res = await fetch("/api/customer/profile");
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await res.json();
      setCustomer(data.customer);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Synchronizing dashboard...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 text-center max-w-sm">
          <p className="text-red-500 font-semibold">Session verification failed</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 w-full py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-slate-900 text-white relative overflow-hidden py-8 px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[150%] rounded-full bg-primary-600/10 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[40%] h-[150%] rounded-full bg-fuel-orange/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">⚡</span>
              <h1 className="text-2xl font-black tracking-tight">
                Fuel<span className="text-fuel-orange font-black">Flow</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-md border border-primary-500/10">
                Customer Portal
              </span>
            </div>
            <p className="text-sm text-gray-400">Welcome, {customer.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <section className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-all relative ${activeTab === "dashboard"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("booking")}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-all relative ${activeTab === "booking"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              Smart Booking
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-all relative ${activeTab === "bookings"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-3.5 px-1 border-b-2 font-semibold text-sm transition-all relative ${activeTab === "reviews"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              My Reviews
            </button>
          </nav>
        </section>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full blur-2xl -z-10" />
                <h2 className="text-base font-bold text-gray-800 mb-5">
                  My Profile
                </h2>
                <div className="space-y-4">
                  <div className="pb-3.5 border-b border-gray-50">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Name</span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{customer.name}</p>
                  </div>
                  <div className="pb-3.5 border-b border-gray-50">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Email Address</span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{customer.email}</p>
                  </div>
                  <div className="pb-3.5 border-b border-gray-50">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Customer Type</span>
                    <p className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md inline-block mt-1">
                      {customer.type}
                    </p>
                  </div>
                  {customer.company_name && (
                    <div className="pb-3.5 border-b border-gray-50">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Company Name</span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{customer.company_name}</p>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="pb-3.5 border-b border-gray-50">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Phone</span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{customer.phone}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div className="pb-3.5 border-b border-gray-50">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Address</span>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{customer.address}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Member Since</span>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      {new Date(customer.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <h2 className="text-base font-bold text-gray-800 mb-5">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/customer/order"
                    className="p-5 rounded-2xl bg-gradient-to-tr from-primary-50 to-primary-100/20 border border-primary-100 hover:border-primary-300 hover:bg-primary-100/30 transition-all flex flex-col gap-3 group"
                  >
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="font-bold text-sm text-primary-900 group-hover:text-primary-600 transition-colors">
                        Place New Order
                      </h3>
                      <p className="text-xs text-primary-700/80 mt-0.5">
                        Order fuel or accessory products instantly
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="p-5 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100/20 border border-amber-100 hover:border-amber-300 hover:bg-amber-100/30 text-left transition-all flex flex-col gap-3 group"
                  >
                    <span className="text-2xl">★</span>
                    <div>
                      <h3 className="font-bold text-sm text-amber-900 group-hover:text-amber-600 transition-colors">
                        Leave a Review
                      </h3>
                      <p className="text-xs text-amber-700/80 mt-0.5">
                        Rate and share feedback on our dispatcher services
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
                <h2 className="text-base font-bold text-gray-800 mb-4">
                  Recent Activity
                </h2>
                {recentReviews.length > 0 || recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {/* Recent Orders */}
                    {recentOrders.slice(0, 3).map((order) => (
                      <div
                        key={`order-${order.id}`}
                        className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl transition-colors hover:bg-gray-100/50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-lg">
                          📦
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-800">
                              Order #{order.order_number || order.id}
                            </p>
                            <span
                              className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${order.status === "delivered" || order.status === "completed"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : order.status === "processing" || order.status === "confirmed"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : order.status === "pending"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-gray-50 text-gray-600 border border-gray-200"
                                }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[11px] text-gray-500">
                              {order.order_items?.length || 0} Items • Total: Tk {order.total_amount ? Number(order.total_amount).toFixed(2) : "0.00"}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Recent Reviews */}
                    {recentReviews.slice(0, 2).map((review) => (
                      <div
                        key={`review-${review.id}`}
                        className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl transition-colors hover:bg-gray-100/50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                          ★
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-800 truncate">
                              {review.title}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xs ${i < review.rating ? "text-amber-400" : "text-gray-200"
                                    }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                              {review.service_type?.replace("_", " ")}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No recent activity to display.</p>
                    <div className="flex justify-center space-x-4 mt-4">
                      <Link
                        href="/customer/order"
                        className="text-primary-600 hover:text-primary-800 text-xs font-semibold"
                      >
                        Place an order →
                      </Link>
                      <button
                        onClick={() => setActiveTab("reviews")}
                        className="text-amber-600 hover:text-amber-800 text-xs font-semibold"
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
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <SmartBooking
              onBookingComplete={() => setActiveTab("bookings")}
              customerEmail={customer?.email}
              customerName={customer?.name}
            />
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <BookingHistory />
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <CustomerReviews
              customerEmail={customer?.email}
              customerName={customer?.name}
            />
          </div>
        )}
      </main>
    </div>
  );
}
