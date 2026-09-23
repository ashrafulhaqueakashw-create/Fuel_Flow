/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fuel, Phone, MapPin, ShieldCheck, ArrowLeft, LogOut, Truck } from "lucide-react";
import OrderForm from "../../components/OrderForm";

export default function CustomerOrderPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
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
          <p className="mt-4 text-slate-500 text-xs font-semibold">Loading ordering terminal...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <p className="text-rose-600 font-bold text-sm">Customer Record Not Found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 w-full py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded-xl text-xs font-bold"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-700">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <strong className="text-white">Customer Support: 16223</strong> / +880 1800-383535
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Dhaka Rapid Urban Dispatch
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

      {/* Main Nav Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#9a3412] border border-orange-200">
                    Order Terminal
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Dispatch Request Terminal • {customer.name}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/customer")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#9a3412] mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Doorstep Dispatcher</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Place Your Fuel & Supply Order
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Choose fuel items, volume, and input your dispatch location. Calibrated mobile dispensers will arrive on schedule.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <OrderForm
            customerId={customer.id}
            onOrderPlaced={() => {
              router.push("/customer");
            }}
          />
        </div>
      </main>
    </div>
  );
}
