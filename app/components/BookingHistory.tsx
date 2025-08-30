"use client";
import { useState, useEffect } from "react";

type Booking = {
  id: number;
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
  onRefresh?: () => void;
};

export default function BookingHistory({ onRefresh }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">My Bookings</h3>
        <button
          onClick={fetchBookings}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No bookings found.</p>
          <p className="text-sm text-gray-500 mt-1">
            Your fuel delivery bookings will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Booking #{booking.id}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(booking.date)} •{" "}
                    {formatTime(booking.start_time)} -{" "}
                    {formatTime(booking.end_time)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      booking.booking_status
                    )}`}
                  >
                    {booking.booking_status}
                  </span>
                  <br />
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getStatusColor(
                      booking.payment_status
                    )}`}
                  >
                    {booking.payment_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Fuel Type</p>
                  <p className="font-medium capitalize">{booking.fuel_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">
                    {Number(booking.quantity_liters)}L
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price per Liter</p>
                  <p className="font-medium">
                    ${Number(booking.price_per_liter).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">
                    {booking.payment_method}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span>Subtotal:</span>
                  <span>${Number(booking.total_amount).toFixed(2)}</span>
                </div>
                {Number(booking.discount_applied) > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600 mb-2">
                    <span>Discount ({Number(booking.discount_applied)}%):</span>
                    <span>
                      -$
                      {(
                        (Number(booking.total_amount) *
                          Number(booking.discount_applied)) /
                        100
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center font-medium text-lg border-t pt-2">
                  <span>Final Amount:</span>
                  <span>${Number(booking.final_amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="text-sm">{booking.delivery_address}</p>
                </div>
                {booking.special_instructions && (
                  <div>
                    <p className="text-sm text-gray-500">
                      Special Instructions
                    </p>
                    <p className="text-sm">{booking.special_instructions}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-gray-500">
                <span>
                  Booked on {new Date(booking.created_at).toLocaleString()}
                </span>
                <span
                  className={`px-2 py-1 rounded-full ${
                    booking.congestion_level === "low"
                      ? "bg-green-100 text-green-600"
                      : booking.congestion_level === "medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {booking.congestion_level} congestion
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
