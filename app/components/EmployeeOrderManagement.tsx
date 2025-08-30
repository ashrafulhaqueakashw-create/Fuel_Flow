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
  employeeId: number;
  onSaved?: () => void;
};

export default function EmployeeOrderManagement({
  employeeId,
  onSaved,
}: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filter, setFilter] = useState<
    "all" | "confirmed" | "processing" | "completed" | "cancelled"
  >("confirmed"); // Start with confirmed orders for employee focus

  // Order update states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "confirmed" as Order["status"],
    notes: "",
  });

  const loadOrders = async () => {
    try {
      // Fetch orders assigned to this employee
      const url = `/api/orders?employeeId=${employeeId}${
        filter !== "all" ? `&status=${filter}` : ""
      }`;
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
  }, [filter, employeeId]);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updateData,
          employee_id: employeeId, // Preserve employee assignment
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update order");
      }

      setSuccessMessage("Order updated successfully!");
      setShowUpdateModal(false);
      setSelectedOrder(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

      await loadOrders();
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Error updating order");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      notes: order.notes || "",
    });
    setError(""); // Clear any previous errors
    setSuccessMessage(""); // Clear any previous success messages
    setShowUpdateModal(true);
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          My Assigned Orders
        </h3>
        <div className="text-sm text-gray-600">
          Total Orders: {orders.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-2 rounded">{error}</div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-800 px-4 py-2 rounded">
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex space-x-2 flex-wrap">
        {["all", "confirmed", "processing", "completed", "cancelled"].map(
          (status) => (
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
          )
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="text-lg font-semibold">Orders ({orders.length})</h4>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No orders assigned to you for the selected filter.
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
                      {order.status !== "completed" &&
                        order.status !== "cancelled" && (
                          <button
                            onClick={() => openUpdateModal(order)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Update
                          </button>
                        )}
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
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processing Notes
                  </label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, notes: e.target.value })
                    }
                    placeholder="Add notes about order processing, issues, or completion..."
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
