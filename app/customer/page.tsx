"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerDashboard() {
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
                  <p className="font-medium text-gray-900">{customer.email}</p>
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
                <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-left transition-colors">
                  <h3 className="font-semibold">View Order History</h3>
                  <p className="text-sm text-blue-600">See your past orders</p>
                </button>
                <button className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-left transition-colors">
                  <h3 className="font-semibold">Current Promotions</h3>
                  <p className="text-sm text-green-600">Available discounts</p>
                </button>
                <button className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-left transition-colors">
                  <h3 className="font-semibold">Loyalty Points</h3>
                  <p className="text-sm text-purple-600">Check your rewards</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="text-gray-600">
                <p>No recent activity to display.</p>
                <p className="text-sm mt-2">
                  Your fuel purchases and transactions will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
