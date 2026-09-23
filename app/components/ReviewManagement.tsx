/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

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
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "approved":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
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
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-xs ${
              star <= rating ? "text-amber-400" : "text-slate-200"
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
            Customer Feedback Moderation
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Customer Reviews ({reviews.length})
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Approve or reject customer ratings and reviews to display on the public landing page showcase
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-2.5 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              filter === status
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {status === "all" ? "All Reviews" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No reviews found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Title & Feedback</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{review.customer_name}</div>
                      <div className="text-[11px] text-slate-500">{review.customer_email}</div>
                      {review.order_number && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Order #{review.order_number}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStars(review.rating)}
                      <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        {review.rating} / 5
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{review.title}</div>
                      {review.comment && (
                        <div className="text-[11px] text-slate-600 truncate mt-0.5">
                          {review.comment}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                      {getServiceTypeLabel(review.service_type)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getStatusColor(
                          review.status
                        )}`}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => loadReviewDetails(review.id)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          View
                        </button>
                        {review.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(review.id, "approved")}
                              disabled={loading}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(review.id, "rejected")}
                              disabled={loading}
                              className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={loading}
                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Review Feedback Detail</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                  <span className="font-bold text-slate-900">{selectedReview.customer_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-700">{selectedReview.customer_email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rating</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderStars(selectedReview.rating)}
                    <span className="font-bold text-slate-800">({selectedReview.rating}/5)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Service</span>
                  <span className="font-semibold text-slate-700">
                    {getServiceTypeLabel(selectedReview.service_type)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject Title</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReview.title}</p>
              </div>

              {selectedReview.comment && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Comment</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mt-1">
                    {selectedReview.comment}
                  </p>
                </div>
              )}

              {selectedReview.status === "pending" && (
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateStatus(selectedReview.id, "approved")}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                  >
                    Approve Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReview.id, "rejected")}
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
                  >
                    Reject Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
