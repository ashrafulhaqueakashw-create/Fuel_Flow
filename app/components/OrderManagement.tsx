"use client";
import { useState, useEffect } from "react";

type OrderItem = {
  id: number;
  inventory_id: number;
  item_name: string;
  category: string;
  quantity: number | string;
  unit_price: number | string;
  total_price: number | string;
  unit: string;
};

type Order = {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  employee_id?: number;
  employee_name?: string;
  total_amount: number | string;
  payment_method: string;
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  delivery_address?: string;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

type Props = {
  onSaved?: () => void;
};

export default function OrderManagement({ onSaved }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "processing" | "completed" | "cancelled"
  >("all");

  // Order update states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "pending" as Order["status"],
    employee_id: "",
    delivery_date: "",
    notes: "",
  });

  const loadOrders = async () => {
    try {
      const url =
        filter === "all" ? "/api/orders" : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  const loadOrderDetails = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.success) {
        setSelectedOrder(data.data);
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update order");
      }

      setShowUpdateModal(false);
      setSelectedOrder(null);
      await loadOrders();
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Error updating order");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        await loadOrders();
      } else {
        setError(data.message || "Failed to delete order");
      }
    } catch (err: any) {
      setError("Error deleting order");
    }
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      employee_id: order.employee_id?.toString() || "",
      delivery_date: order.delivery_date || "",
      notes: order.notes || "",
    });
    setShowUpdateModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number | string) => {
    return typeof price === "string"
      ? parseFloat(price).toFixed(2)
      : price.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Order Management
        </h3>
        <div className="text-sm text-gray-600">
          Total Orders: {orders.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-2 rounded">{error}</div>
      )}

      {/* Filters */}
      <div className="flex space-x-2 flex-wrap">
        {[
          "all",
          "pending",
          "confirmed",
          "processing",
          "completed",
          "cancelled",
        ].map((status) => (
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

      {/* Orders List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="text-lg font-semibold">Orders ({orders.length})</h4>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No orders found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => loadOrderDetails(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openUpdateModal(order)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
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

      {/* Order Details Modal */}
      {selectedOrder && !showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Order Details #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Customer:</strong> {selectedOrder.customer_name}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedOrder.customer_email}
                  </div>
                  <div>
                    <strong>Total:</strong> $
                    {formatPrice(selectedOrder.total_amount)}
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <strong>Payment:</strong> {selectedOrder.payment_method}
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>

                {selectedOrder.delivery_address && (
                  <div>
                    <strong>Delivery Address:</strong>{" "}
                    {selectedOrder.delivery_address}
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <strong>Notes:</strong> {selectedOrder.notes}
                  </div>
                )}

                {selectedOrder.items && (
                  <div>
                    <strong>Items:</strong>
                    <div className="mt-2 border rounded">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Item
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Qty
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Price
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="px-4 py-2">{item.item_name}</td>
                              <td className="px-4 py-2">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-4 py-2">
                                ${formatPrice(item.unit_price)}
                              </td>
                              <td className="px-4 py-2">
                                ${formatPrice(item.total_price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Order Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <form onSubmit={handleUpdateOrder} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Update Order #{selectedOrder.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={updateData.status}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        status: e.target.value as Order["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="datetime-local"
                    value={updateData.delivery_date}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        delivery_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
