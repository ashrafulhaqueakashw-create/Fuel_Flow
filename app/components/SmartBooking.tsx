"use client";
import { useState, useEffect } from "react";

type TimeSlot = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  available_capacity: number;
  congestion_level: "low" | "medium" | "high";
  discount_percentage: number;
  is_bookable: boolean;
};

type FuelPrice = {
  fuel_type: "petrol" | "diesel" | "gas";
  price_per_liter: number;
};

type Props = {
  onBookingComplete?: () => void;
  customerEmail?: string;
  customerName?: string;
};

export default function SmartBooking({
  onBookingComplete,
  customerEmail,
  customerName,
}: Props) {
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [bookingForm, setBookingForm] = useState({
    fuel_type: "petrol" as "petrol" | "diesel" | "gas",
    quantity_liters: "",
    delivery_address: "",
    payment_method: "card" as "card" | "wallet" | "cod",
    special_instructions: "",
  });

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchTimeSlots(today);
  }, []);

  const fetchTimeSlots = async (date: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/time-slots?date=${date}`);
      const data = await res.json();

      if (data.success) {
        setTimeSlots(data.data.time_slots || []);
        setFuelPrices(data.data.fuel_prices || []);
      } else {
        setError("Failed to load time slots");
      }
    } catch (err) {
      setError("Error loading time slots");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchTimeSlots(date);
  };

  const calculateTotal = () => {
    if (!selectedSlot || !bookingForm.quantity_liters)
      return { total: 0, discount: 0, final: 0 };

    const fuelPrice = fuelPrices.find(
      (p) => p.fuel_type === bookingForm.fuel_type
    );
    if (!fuelPrice) return { total: 0, discount: 0, final: 0 };

    const total =
      parseFloat(bookingForm.quantity_liters) *
      Number(fuelPrice.price_per_liter);
    const discount = (total * selectedSlot.discount_percentage) / 100;
    const final = total - discount;

    return { total, discount, final };
  };

  const handleBooking = async () => {
    if (
      !selectedSlot ||
      !bookingForm.quantity_liters ||
      !bookingForm.delivery_address
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time_slot_id: selectedSlot.id,
          ...bookingForm,
          quantity_liters: parseFloat(bookingForm.quantity_liters),
          customer_email: customerEmail || "guest@fuelflow.com",
          customer_name: customerName || "Guest Customer",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Booking created successfully!");
        setSelectedSlot(null);
        setBookingForm({
          fuel_type: "petrol",
          quantity_liters: "",
          delivery_address: "",
          payment_method: "card",
          special_instructions: "",
        });
        fetchTimeSlots(selectedDate); // Refresh slots
        onBookingComplete?.();
      } else {
        setError(data.message || "Failed to create booking");
      }
    } catch (err) {
      setError("Error creating booking");
    } finally {
      setLoading(false);
    }
  };

  const getCongestionColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCongestionIcon = (level: string) => {
    switch (level) {
      case "low":
        return "🟢";
      case "medium":
        return "🟡";
      case "high":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getNextSevenDays = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const { total, discount, final } = calculateTotal();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Smart Booking System
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
            {success}
          </div>
        )}

        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Date</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {getNextSevenDays().map((date) => (
              <button
                key={date}
                onClick={() => handleDateChange(date)}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDate === date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
                <br />
                <span className="text-xs">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Fuel Prices */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Current Fuel Prices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fuelPrices.map((price) => (
              <div key={price.fuel_type} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {price.fuel_type}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    ${Number(price.price_per_liter).toFixed(2)}/L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Available Time Slots - {new Date(selectedDate).toLocaleDateString()}
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading time slots...</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No time slots available for the selected date.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSlot?.id === slot.id
                      ? "border-blue-500 bg-blue-50"
                      : slot.is_bookable
                      ? "border-gray-200 hover:border-blue-300 bg-white"
                      : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                  }`}
                  onClick={() => slot.is_bookable && setSelectedSlot(slot)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {formatTime(slot.start_time)} -{" "}
                      {formatTime(slot.end_time)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getCongestionColor(
                        slot.congestion_level
                      )}`}
                    >
                      {getCongestionIcon(slot.congestion_level)}{" "}
                      {slot.congestion_level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {slot.available_capacity}/{slot.max_capacity} available
                    </span>
                    {slot.discount_percentage > 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full font-medium">
                        {slot.discount_percentage}% OFF
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        slot.congestion_level === "low"
                          ? "bg-green-500"
                          : slot.congestion_level === "medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${
                          (slot.current_bookings / slot.max_capacity) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  {!slot.is_bookable && (
                    <p className="text-xs text-red-600 mt-2">Fully booked</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form */}
        {selectedSlot && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Complete Your Booking
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    value={bookingForm.fuel_type}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        fuel_type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="gas">Gas</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (Liters) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={bookingForm.quantity_liters}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        quantity_liters: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter liters"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={bookingForm.payment_method}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        payment_method: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    value={bookingForm.delivery_address}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        delivery_address: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full delivery address"
                  />
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={bookingForm.special_instructions}
                    onChange={(e) =>
                      setBookingForm({
                        ...bookingForm,
                        special_instructions: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special delivery instructions"
                  />
                </div>
              </div>
            </div>

            {/* Price Summary */}
            {bookingForm.quantity_liters && (
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <h4 className="font-medium mb-3">Price Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({bookingForm.quantity_liters}L × $
                      {Number(
                        fuelPrices.find(
                          (p) => p.fuel_type === bookingForm.fuel_type
                        )?.price_per_liter || 0
                      ).toFixed(2)}
                      ):
                    </span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {selectedSlot.discount_percentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Time Slot Discount ({selectedSlot.discount_percentage}
                        %):
                      </span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-medium text-lg">
                    <span>Total:</span>
                    <span>${final.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Book Button */}
            <div className="mt-6">
              <button
                onClick={handleBooking}
                disabled={
                  loading ||
                  !bookingForm.quantity_liters ||
                  !bookingForm.delivery_address
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? "Processing..." : `Book Slot - $${final.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
