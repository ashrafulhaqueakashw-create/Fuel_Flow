"use client";
import React, { useState, useEffect } from "react";

type Booking = {
  id: number;
  customer_email: string;
  customer_name: string;
  fuel_type: string;
  quantity_liters: number;
  price_per_liter: number;
  total_amount: number;
  discount_applied: number;
  final_amount: number;
  delivery_address: string;
  payment_status: string;
  booking_status: string;
  payment_method: string;
  special_instructions: string;
  created_at: string;
  date: string;
  start_time: string;
  end_time: string;
  congestion_level: string;
};

type Props = {
  onUpdate?: () => void;
};

export default function BookingManagement({ onUpdate }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "confirmed" | "in_progress" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings");
      const data = await res.json();

      if (data.success) {
        setBookings(data.data || []);
      } else {
        setError("Failed to load bookings");
      }
    } catch (err) {
      setError("Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_status: status }),
      });

      const data = await res.json();
      if (data.success) {
        fetchBookings(); // Refresh the list
        onUpdate?.();
      } else {
        setError("Failed to update booking status");
      }
    } catch (err) {
      setError("Error updating booking");
    }
  };

  const updatePaymentStatus = async (bookingId: number, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: status }),
      });

      const data = await res.json();
      if (data.success) {
        fetchBookings(); // Refresh the list
        onUpdate?.();
      } else {
        setError("Failed to update payment status");
      }
    } catch (err) {
      setError("Error updating payment");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = bookings.filter(
    (booking) => filter === "all" || booking.booking_status === filter
  );

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <button
          onClick={fetchBookings}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {["all", "confirmed", "in_progress", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace("_", " ")}
            </button>
          )
        )}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No bookings found for the selected filter.
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-lg shadow border"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Booking #{booking.id}
                  </h3>
                  <p className="text-gray-600">
                    {booking.customer_name} ({booking.customer_email})
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.booking_status
                    )}`}
                  >
                    {booking.booking_status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      booking.payment_status
                    )}`}
                  >
                    {booking.payment_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Scheduled Time</p>
                  <p className="font-medium">
                    {booking.date} at {booking.start_time} - {booking.end_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fuel Details</p>
                  <p className="font-medium">
                    {Number(booking.quantity_liters)}L {booking.fuel_type}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Final Amount</p>
                  <p className="font-medium">
                    Tk{Number(booking.final_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="font-medium">{booking.delivery_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{booking.payment_method}</p>
                </div>
              </div>

              {booking.special_instructions && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Special Instructions</p>
                  <p className="font-medium">{booking.special_instructions}</p>
                </div>
              )}

              {/* Admin Actions */}
              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Booking Status:</span>
                    <select
                      value={booking.booking_status}
                      onChange={(e) =>
                        updateBookingStatus(booking.id, e.target.value)
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Payment Status:</span>
                    <select
                      value={booking.payment_status}
                      onChange={(e) =>
                        updatePaymentStatus(booking.id, e.target.value)
                      }
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
