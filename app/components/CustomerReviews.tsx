"use client";
import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";

type Order = {
  id: number;
  order_number: number;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
};

type Review = {
  id: number;
  order_number: number;
  rating: number;
  title: string;
  service_type: string;
  status: string;
  created_at: string;
};

type Props = {
  customerEmail: string;
  customerName?: string;
};

export default function CustomerReviews({
  customerEmail,
  customerName,
}: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrdersAndReviews = async () => {
    try {
      setLoading(true);

      // Load customer's orders
      const ordersRes = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          // Only show completed orders
          const completedOrders = ordersData.data.filter(
            (order: Order) =>
              order.status === "delivered" || order.status === "completed"
          );
          setOrders(completedOrders);
        }
      }

      // Load customer's reviews
      const reviewsRes = await fetch(
        `/api/reviews?customer_email=${encodeURIComponent(customerEmail)}`
      );
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        if (reviewsData.success) {
          setReviews(reviewsData.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Failed to load your orders and reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerEmail) {
      loadOrdersAndReviews();
    }
  }, [customerEmail]);

  const handleReviewSaved = () => {
    setShowReviewForm(false);
    setSelectedOrder(null);
    loadOrdersAndReviews();
  };

  const getOrderReviews = (orderNumber: number) => {
    return reviews.filter((review) => review.order_number === orderNumber);
  };

  const hasReviewForService = (orderNumber: number, serviceType: string) => {
    return reviews.some(
      (review) =>
        review.order_number === orderNumber &&
        review.service_type === serviceType
    );
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Reviews</h2>
        <div className="text-sm text-gray-600">
          {orders.length} Completed Orders • {reviews.length} Reviews Given
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-3 rounded">{error}</div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No completed orders available for review.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Complete an order to leave a review about our services.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderReviews = getOrderReviews(order.order_number);

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow border p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Completed on{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: $
                      {order.total_amount
                        ? Number(order.total_amount).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Items:
                  </h4>
                  <div className="space-y-1">
                    {order.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="text-sm text-gray-600 flex justify-between"
                      >
                        <span>
                          {item.product_name} x {item.quantity}
                        </span>
                        <span>
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Existing Reviews */}
                {orderReviews.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Your Reviews:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {orderReviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="text-sm font-medium">
                                {review.title}
                              </h5>
                              <p className="text-xs text-gray-600 capitalize">
                                {review.service_type.replace("_", " ")}
                              </p>
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                review.status
                              )}`}
                            >
                              {review.status}
                            </span>
                          </div>
                          {renderStars(review.rating)}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Actions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Leave a Review:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "delivery", label: "Delivery Service" },
                      { key: "product_quality", label: "Product Quality" },
                      { key: "customer_service", label: "Customer Service" },
                      { key: "overall", label: "Overall Experience" },
                    ].map((service) => (
                      <button
                        key={service.key}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowReviewForm(true);
                        }}
                        disabled={hasReviewForService(
                          order.order_number,
                          service.key
                        )}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          hasReviewForService(order.order_number, service.key)
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        {hasReviewForService(order.order_number, service.key)
                          ? `${service.label} ✓`
                          : `Review ${service.label}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Review Order #{selectedOrder.order_number}
                </h3>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <ReviewForm
                orderNumber={selectedOrder.order_number}
                customerEmail={customerEmail}
                customerName={customerName}
                onSaved={handleReviewSaved}
                existingReviews={getOrderReviews(selectedOrder.order_number)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
