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
  >("confirmed");

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "confirmed" as Order["status"],
    notes: "",
  });

  const loadOrders = async () => {
    try {
      const url = `/api/orders?employeeId=${employeeId}${filter !== "all" ? `&status=${filter}` : ""
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          employee_id: employeeId,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update order");
      }

      setSuccessMessage("Order updated successfully!");
      setShowUpdateModal(false);
      setSelectedOrder(null);

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
    setError("");
    setSuccessMessage("");
    setShowUpdateModal(true);
  };

  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Assigned Orders Console
          </h3>
          <p className="text-xs text-gray-500">Manage dispatch and update status</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100">
          {orders.length} Assigned
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-3 rounded-2xl border border-red-200 text-xs animate-shake">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-800 px-4 py-3 rounded-2xl border border-green-200 text-xs">
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 flex-wrap gap-1 w-max">
        {["all", "confirmed", "processing", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${filter === status
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
                }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No orders assigned to you for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/75">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-800">
                        #{order.id}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">
                        {order.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-800">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-gray-800">
                      Tk {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-semibold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold space-x-3">
                      <button
                        onClick={() => loadOrderDetails(order.id)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Details
                      </button>
                      {order.status !== "completed" &&
                        order.status !== "cancelled" && (
                          <button
                            onClick={() => openUpdateModal(order)}
                            className="text-emerald-600 hover:text-emerald-800"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl animate-scale-up">
            <div className="p-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
                <h3 className="text-base font-bold text-gray-800">
                  Order Details #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="pb-2 border-b border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedOrder.customer_name}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedOrder.customer_email}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total amount</span>
                    <p className="text-sm font-extrabold text-primary-600 mt-0.5">Tk {formatPrice(selectedOrder.total_amount)}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Status</span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border mt-1 ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="pb-2 border-b border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</span>
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mt-0.5">{selectedOrder.payment_method}</p>
                  </div>
                  <div className="pb-2 border-b border-gray-50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Date</span>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedOrder.delivery_address && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery Destination</span>
                    <p className="text-xs text-gray-700 font-medium mt-1 leading-relaxed">{selectedOrder.delivery_address}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Internal Notes</span>
                    <p className="text-xs text-gray-600 mt-1 italic">{selectedOrder.notes}</p>
                  </div>
                )}

                {selectedOrder.items && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Items</span>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wider">Item Name</th>
                            <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wider">Unit Price</th>
                            <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wider">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 font-semibold text-gray-800">{item.item_name}</td>
                              <td className="px-4 py-3 text-gray-600">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-600">
                                Tk {formatPrice(item.unit_price)}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-800">
                                Tk {formatPrice(item.total_price)}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl animate-scale-up">
            <form onSubmit={handleUpdateOrder} className="p-6 space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-800">
                  Update Order #{selectedOrder.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Update Status *
                  </label>
                  <select
                    value={updateData.status}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        status: e.target.value as Order["status"],
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
                    required
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Processing Notes
                  </label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, notes: e.target.value })
                    }
                    placeholder="Add notes about order processing, issues, or completion..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98]"
                >
                  {loading ? "Updating..." : "Update Status"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
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
