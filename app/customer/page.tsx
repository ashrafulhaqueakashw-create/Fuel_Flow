/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Fuel,
  User,
  Calendar,
  Star,
  Package,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Truck,
  CheckCircle,
  Building,
} from "lucide-react";
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
      const res = await fetch("/api/orders");
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
    } catch {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#c2410c] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500 text-xs font-semibold">Synchronizing customer portal...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <p className="text-rose-600 font-bold text-sm">Session Verification Expired</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Please sign in to access your customer orders.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-xl text-xs font-bold transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-700">
      {/* ─── TOP ANNOUNCEMENT BAR (MATCHES LANDING PAGE) ─── */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <strong className="text-white">Customer Care: 16223</strong> / +880 1800-383535
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Dhaka Metropole Doorstep Delivery
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              BSTI Calibrated Flowmeters (99.9% Purity)
            </span>
          </div>
        </div>
      </div>

      {/* ─── MAIN NAV HEADER (MATCHES LANDING PAGE) ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#c2410c] flex items-center justify-center text-white shadow-sm group-hover:bg-[#9a3412] transition-colors">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Fuel<span className="text-[#c2410c]">Flow</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 capitalize">
                    {customer.type} Customer
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Welcome, {customer.name}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer/order"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all active:scale-95"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Place Order</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ─── TAB NAVIGATION BAR ─── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Overview & Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("booking")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "booking"
                  ? "bg-[#c2410c] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Smart Booking</span>
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "bookings"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Booking History</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "reviews"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>My Reviews</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left Profile Card (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#c2410c] font-black text-lg flex items-center justify-center">
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{customer.name}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{customer.email}</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Type
                  </span>
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                    {customer.type}
                  </span>
                </div>

                {customer.company_name && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Commercial Entity
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{customer.company_name}</span>
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Phone
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {customer.phone || "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Default Delivery Address
                  </span>
                  <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">
                    {customer.address || "No address saved"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Registered Member Since
                  </span>
                  <p className="font-medium text-slate-500 mt-0.5 text-[11px]">
                    {new Date(customer.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Activity & Quick Actions (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Quick Actions Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/customer/order"
                  className="bg-white hover:bg-orange-50/40 border border-slate-200 hover:border-orange-300 p-6 rounded-2xl transition-all shadow-sm flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#c2410c] flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#c2410c] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Order Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Immediate Fuel Dispatch</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Order bulk diesel, octane, or lubricants with BSTI digital meters
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveTab("booking")}
                  className="bg-white hover:bg-orange-50/40 text-left border border-slate-200 hover:border-orange-300 p-6 rounded-2xl transition-all shadow-sm flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Save up to 15%</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Smart Off-Peak Booking</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Schedule arrival during off-peak slots for automated time-slot discounts
                    </p>
                  </div>
                </button>
              </div>

              {/* Recent Orders & Activity */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">Recent Order Activity</h4>
                  <Link
                    href="/customer/order"
                    className="text-xs font-bold text-[#c2410c] hover:underline"
                  >
                    View All Orders →
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No orders placed yet. Choose &quot;Place Order&quot; above to request fuel delivery.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 font-mono">
                              Order #{ord.order_number || ord.id}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(ord.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold font-mono text-xs text-slate-900 block">
                            ৳{ord.total_amount ? Number(ord.total_amount).toFixed(2) : "0.00"}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {ord.status || "confirmed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: SMART BOOKING ─── */}
        {activeTab === "booking" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
            <SmartBooking
              onBookingComplete={() => setActiveTab("bookings")}
              customerEmail={customer?.email}
              customerName={customer?.name}
            />
          </div>
        )}

        {/* ─── TAB 3: BOOKINGS HISTORY ─── */}
        {activeTab === "bookings" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
            <BookingHistory />
          </div>
        )}

        {/* ─── TAB 4: REVIEWS ─── */}
        {activeTab === "reviews" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
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
