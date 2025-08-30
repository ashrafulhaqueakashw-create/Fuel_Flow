"use client";
import { useState } from "react";

type Review = {
  id: number;
  service_type: string;
};

type Props = {
  orderId?: number;
  orderNumber?: number;
  customerEmail?: string;
  customerName?: string;
  onSubmitted?: () => void;
  onSaved?: () => void;
  onCancel?: () => void;
  existingReviews?: Review[];
};

export default function ReviewForm({
  orderId,
  orderNumber,
  customerEmail,
  customerName,
  onSubmitted,
  onSaved,
  onCancel,
  existingReviews = [],
}: Props) {
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    service_type: "overall" as
      | "delivery"
      | "product_quality"
      | "customer_service"
      | "overall",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Check if this service type has already been reviewed
    if (
      existingReviews.some(
        (review) => review.service_type === formData.service_type
      )
    ) {
      setError("You have already reviewed this service type for this order.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order_id: orderId,
          order_number: orderNumber,
          customer_email: customerEmail,
          customer_name: customerName,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to submit review");
      }

      setSuccess("Review submitted successfully! Thank you for your feedback.");
      setFormData({
        rating: 5,
        title: "",
        comment: "",
        service_type: "overall",
      });

      setTimeout(() => {
        onSubmitted?.();
        onSaved?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData({ ...formData, rating: star })}
            className={`text-2xl transition-colors ${
              star <= formData.rating
                ? "text-yellow-400 hover:text-yellow-500"
                : "text-gray-300 hover:text-yellow-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {orderNumber
          ? `Review Order #${orderNumber}`
          : orderId
          ? `Review Order #${orderId}`
          : "Submit a Review"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          {renderStars()}
          <p className="text-sm text-gray-500 mt-1">
            {formData.rating} out of 5 stars
          </p>
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Aspect
          </label>
          <select
            value={formData.service_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                service_type: e.target.value as any,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {!existingReviews.some((r) => r.service_type === "overall") && (
              <option value="overall">Overall Experience</option>
            )}
            {!existingReviews.some((r) => r.service_type === "delivery") && (
              <option value="delivery">Delivery Service</option>
            )}
            {!existingReviews.some(
              (r) => r.service_type === "product_quality"
            ) && <option value="product_quality">Product Quality</option>}
            {!existingReviews.some(
              (r) => r.service_type === "customer_service"
            ) && <option value="customer_service">Customer Service</option>}
          </select>
          {existingReviews.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Already reviewed:{" "}
              {existingReviews
                .map((r) => r.service_type.replace("_", " "))
                .join(", ")}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Summarize your experience"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Review
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
            placeholder="Tell us about your experience..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
