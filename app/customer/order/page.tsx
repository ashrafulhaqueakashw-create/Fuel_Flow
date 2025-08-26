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
              <p className="text-blue-200">Order Fuel & Products</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/customer")}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Place Your Order
          </h2>
          <p className="text-gray-600">
            Welcome back, {customer.name}! Browse our available items and add
            them to your cart.
          </p>
        </div>

        <OrderForm
          customerId={customer.id}
          onOrderPlaced={() => {
            // You could show a success message or redirect
            console.log("Order placed successfully!");
          }}
        />
      </main>
    </div>
  );
}
