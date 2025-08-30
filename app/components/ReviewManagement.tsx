"use client";
import { useState, useEffect } from "react";

type Review = {
  id: number;
  customer_name: string;
  customer_email: string;
  order_number?: number;
  rating: number;
  title: string;
  comment?: string;
  service_type: "delivery" | "product_quality" | "customer_service" | "overall";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

type Props = {
  onSaved?: () => void;
};

export default function ReviewManagement({ onSaved }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  const loadReviews = async () => {
    try {
      const url =
        filter === "all" ? "/api/reviews" : `/api/reviews?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  const loadReviewDetails = async (reviewId: number) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedReview(data.data);
      }
    } catch (err) {
      console.error("Failed to load review details:", err);
    }
  };

  const handleUpdateStatus = async (
    reviewId: number,
    status: "approved" | "rejected"
  ) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update review");
      }

      await loadReviews();
      setSelectedReview(null);
      onSaved?.();
    } catch (err: any) {
      setError(err.message || "Error updating review");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete review");
      }

      await loadReviews();
      setSelectedReview(null);
      onSaved?.();
    } catch (err: any) {
      setError(err.message || "Error deleting review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "delivery":
        return "Delivery Service";
      case "product_quality":
        return "Product Quality";
      case "customer_service":
        return "Customer Service";
      case "overall":
        return "Overall Experience";
      default:
        return type;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Review Management
        </h3>
        <div className="text-sm text-gray-600">
          Total Reviews: {reviews.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-2 rounded">{error}</div>
      )}

      {/* Filters */}
      <div className="flex space-x-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="text-lg font-semibold">Reviews ({reviews.length})</h4>
        </div>

        {reviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No reviews found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.customer_email}
                        </div>
                        {review.order_number && (
                          <div className="text-xs text-gray-400">
                            Order #{review.order_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                      <div className="text-xs text-gray-500">
                        {review.rating}/5
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {review.title}
                      </div>
                      {review.comment && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {review.comment}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getServiceTypeLabel(review.service_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => loadReviewDetails(review.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {review.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(review.id, "approved")
                            }
                            disabled={loading}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(review.id, "rejected")
                            }
                            disabled={loading}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Review Details</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Customer:</strong> {selectedReview.customer_name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedReview.customer_email}
                  </div>
                  {selectedReview.order_number && (
                    <div>
                      <strong>Order:</strong> #{selectedReview.order_number}
                    </div>
                  )}
                  <div>
                    <strong>Service:</strong>{" "}
                    {getServiceTypeLabel(selectedReview.service_type)}
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedReview.status
                      )}`}
                    >
                      {selectedReview.status}
                    </span>
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedReview.created_at).toLocaleString()}
                  </div>
                </div>

                <div>
                  <strong>Rating:</strong>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-gray-500">
                      ({selectedReview.rating}/5)
                    </span>
                  </div>
                </div>

                <div>
                  <strong>Title:</strong>
                  <p className="mt-1 text-gray-900">{selectedReview.title}</p>
                </div>

                {selectedReview.comment && (
                  <div>
                    <strong>Review:</strong>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                      {selectedReview.comment}
                    </p>
                  </div>
                )}

                {selectedReview.status === "pending" && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedReview.id, "approved")
                      }
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Approve Review"}
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(selectedReview.id, "rejected")
                      }
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Reject Review"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
