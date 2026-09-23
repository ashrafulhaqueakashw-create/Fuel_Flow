/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Truck,
  RefreshCw,
  CreditCard,
} from "lucide-react";

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
    } catch {
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
        fetchBookings();
        onUpdate?.();
      } else {
        setError("Failed to update booking status");
      }
    } catch {
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
        fetchBookings();
        onUpdate?.();
      } else {
        setError("Failed to update payment status");
      }
    } catch {
      setError("Error updating payment");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200";
      case "paid":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredBookings = bookings.filter(
    (booking) => filter === "all" || booking.booking_status === filter
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
            Dispatch Queue Management
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Fuel Delivery Bookings ({bookings.length})
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Review time-slot bookings, calibrate order approvals, and manage payment settlements
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-800 rounded-xl text-xs font-semibold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        {["all", "confirmed", "in_progress", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filter === status
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {status === "all"
                ? "All Bookings"
                : status.charAt(0).toUpperCase() +
                  status.slice(1).replace("_", " ")}
            </button>
          )
        )}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
            No bookings found for the selected filter.
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      Booking #{booking.id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="font-bold text-xs text-slate-800">
                      {booking.customer_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{booking.customer_email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      booking.booking_status
                    )}`}
                  >
                    {booking.booking_status?.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      booking.payment_status
                    )}`}
                  >
                    Payment: {booking.payment_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#c2410c]" />
                    <span>Time Window</span>
                  </p>
                  <p className="font-bold text-slate-900">{booking.date}</p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {booking.start_time} - {booking.end_time}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#c2410c]" />
                    <span>Fuel Details</span>
                  </p>
                  <p className="font-bold text-slate-900 font-mono">
                    {Number(booking.quantity_liters)} L
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium capitalize">
                    {booking.fuel_type} (৳{Number(booking.price_per_liter).toFixed(2)}/L)
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-[#c2410c]" />
                    <span>Net Amount</span>
                  </p>
                  <p className="font-extrabold text-slate-900 font-mono text-sm text-[#c2410c]">
                    ৳{Number(booking.final_amount).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium capitalize">
                    {booking.payment_method?.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 mb-4">
                <p>
                  <strong className="text-slate-900">Delivery Address:</strong> {booking.delivery_address}
                </p>
                {booking.special_instructions && (
                  <p>
                    <strong className="text-slate-900">Notes:</strong> {booking.special_instructions}
                  </p>
                )}
              </div>

              {/* Admin Approval & Status Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Booking Status:</span>
                    <select
                      value={booking.booking_status}
                      onChange={(e) =>
                        updateBookingStatus(booking.id, e.target.value)
                      }
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c]"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Payment Status:</span>
                    <select
                      value={booking.payment_status}
                      onChange={(e) =>
                        updatePaymentStatus(booking.id, e.target.value)
                      }
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c]"
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
