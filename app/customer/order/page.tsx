/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    } catch (error) {
      console.error("Error fetching profile:", error);
      router.push("/");
    } finally {
      setLoading(false);
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
          <p className="mt-4 text-gray-500 text-sm">Loading ordering terminal...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <p className="text-red-500 font-semibold">Customer record not found</p>
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
                Order Terminal
              </span>
            </div>
            <p className="text-sm text-gray-400">Dispatch Request Dispatcher</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/customer")}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            Place Your Dispatch Order
          </h2>
          <p className="text-sm text-gray-500">
            Select fuel quantity, products, and input your dispatch/delivery details.
          </p>
        </div>

        <OrderForm
          customerId={customer.id}
          onOrderPlaced={() => {
            console.log("Order placed successfully!");
          }}
        />
      </main>
    </div>
  );
}
