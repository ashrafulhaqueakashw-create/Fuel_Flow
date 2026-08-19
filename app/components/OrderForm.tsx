"use client";
import { useState, useEffect } from "react";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  price: number | string;
  quantity: number | string;
  unit: string;
  description?: string;
};

type CartItem = {
  inventory_id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  total: number;
};

type Props = {
  customerId?: number;
  onOrderPlaced?: () => void;
};

export default function OrderForm({ customerId, onOrderPlaced }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<"all" | "fuel" | "product" | "service">(
    "all"
  );

  const [orderData, setOrderData] = useState({
    payment_method: "cash",
    delivery_address: "",
    notes: "",
  });

  const loadInventory = async () => {
    try {
      const url =
        filter === "all"
          ? "/api/inventory"
          : `/api/inventory?category=${filter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        const availableItems = (data.data || []).filter(
          (item: InventoryItem) => {
            const qty =
              typeof item.quantity === "string"
                ? parseInt(item.quantity)
                : item.quantity;
            return qty > 0;
          }
        );
        setItems(availableItems);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const addToCart = (item: InventoryItem, quantity: number) => {
    if (quantity <= 0) return;

    const price =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    const availableQty =
      typeof item.quantity === "string"
        ? parseInt(item.quantity)
        : item.quantity;

    if (quantity > availableQty) {
      setError(`Only ${availableQty} ${item.unit} available for ${item.name}`);
      return;
    }

    const existingItem = cart.find(
      (cartItem) => cartItem.inventory_id === item.id
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > availableQty) {
        setError(
          `Total quantity would exceed available stock (${availableQty} ${item.unit})`
        );
        return;
      }

      setCart(
        cart.map((cartItem) =>
          cartItem.inventory_id === item.id
            ? {
              ...cartItem,
              quantity: cartItem.quantity + quantity,
              total: (cartItem.quantity + quantity) * price,
            }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          inventory_id: item.id,
          name: item.name,
          price,
          quantity,
          unit: item.unit,
          total: price * quantity,
        },
      ]);
    }

    setError("");
  };

  const removeFromCart = (inventoryId: number) => {
    setCart(cart.filter((item) => item.inventory_id !== inventoryId));
  };

  const updateCartQuantity = (inventoryId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(inventoryId);
      return;
    }

    const item = items.find((item) => item.id === inventoryId);
    if (!item) return;

    const availableQty =
      typeof item.quantity === "string"
        ? parseInt(item.quantity)
        : item.quantity;
    if (quantity > availableQty) {
      setError(`Only ${availableQty} ${item.unit} available`);
      return;
    }

    setCart(
      cart.map((cartItem) =>
        cartItem.inventory_id === inventoryId
          ? { ...cartItem, quantity, total: quantity * cartItem.price }
          : cartItem
      )
    );
    setError("");
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      setError("Please log in to place an order");
      return;
    }

    if (cart.length === 0) {
      setError("Please add items to your cart");
      return;
    }

    if (
      !orderData.delivery_address ||
      orderData.delivery_address.trim() === ""
    ) {
      setError("Delivery address is required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          items: cart.map((item) => ({
            inventory_id: item.inventory_id,
            quantity: item.quantity,
          })),
          payment_method: orderData.payment_method,
          delivery_address: orderData.delivery_address,
          notes: orderData.notes || null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      setSuccess(`Order placed successfully! Order ID: #${data.data.id}`);
      setCart([]);
      setOrderData({
        payment_method: "cash",
        delivery_address: "",
        notes: "",
      });

      await loadInventory();
      onOrderPlaced?.();
    } catch (err: any) {
      setError(err?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | string) => {
    return typeof price === "string"
      ? parseFloat(price).toFixed(2)
      : price.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-3 rounded-2xl border border-red-200 text-sm animate-shake">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-800 px-4 py-3 rounded-2xl border border-green-200 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h4 className="text-base font-bold text-gray-800">
                  Select Dispatch Items
                </h4>
                <p className="text-xs text-gray-500">Filter and add to your cart</p>
              </div>

              {/* Filters */}
              <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                {["all", "fuel", "product", "service"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${filter === cat
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="text-center text-gray-400 py-12 text-sm">
                No items available for the selected category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const maxQty =
                    typeof item.quantity === "string"
                      ? parseInt(item.quantity)
                      : item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="border border-gray-100 bg-gray-50/20 hover:bg-white rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:border-gray-200/80 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-sm text-gray-800 group-hover:text-primary-600 transition-colors">
                            {item.name}
                          </h5>
                          <span
                            className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${item.category === "fuel"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : item.category === "product"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                              }`}
                          >
                            {item.category}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-base font-extrabold text-gray-800">
                            Tk {formatPrice(item.price)}
                            <span className="text-xs font-normal text-gray-400">
                              {" "}
                              / {item.unit}
                            </span>
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {maxQty} available
                          </span>
                        </div>

                        {/* Add to Cart Control */}
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={maxQty}
                            placeholder="Qty"
                            className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 bg-white"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const qty = parseInt(
                                  (e.target as HTMLInputElement).value
                                );
                                if (qty > 0) {
                                  addToCart(item, qty);
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }
                            }}
                          />
                          <button
                            onClick={(e) => {
                              const input = (e.target as HTMLButtonElement)
                                .previousElementSibling as HTMLInputElement;
                              const qty = parseInt(input.value);
                              if (qty > 0) {
                                addToCart(item, qty);
                                input.value = "";
                              }
                            }}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl border border-transparent transition-all active:scale-[0.98]"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Shopping Cart & Delivery Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden sticky top-8">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <h4 className="text-base font-bold text-gray-800">Shopping Cart</h4>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-xs">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-5 pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.inventory_id}
                        className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-2xl"
                      >
                        <div className="flex-1 pr-2">
                          <div className="font-semibold text-xs text-gray-800">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Tk {item.price.toFixed(2)} × {item.quantity}{" "}
                            {item.unit}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div className="text-xs font-extrabold text-gray-800 pr-1">
                            Tk {item.total.toFixed(0)}
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateCartQuantity(
                                item.inventory_id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-10 px-1 py-1 border border-gray-200 rounded-lg text-center text-[10px] font-semibold bg-white"
                          />
                          <button
                            onClick={() => removeFromCart(item.inventory_id)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <div className="flex justify-between items-center font-bold text-sm text-gray-800">
                      <span>Total Amount:</span>
                      <span className="text-base font-extrabold text-primary-600">
                        Tk {getTotalAmount().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Form */}
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Payment Method
                      </label>
                      <select
                        value={orderData.payment_method}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            payment_method: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
                      >
                        <option value="cash">Cash on Delivery</option>
                        <option value="card">Credit Card</option>
                        <option value="mobile">Mobile Payment (bKash/Nagad)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={orderData.delivery_address}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            delivery_address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
                        rows={2}
                        placeholder="Enter delivery/dispatch destination..."
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Dispatch Notes (Optional)
                      </label>
                      <textarea
                        value={orderData.notes}
                        onChange={(e) =>
                          setOrderData({ ...orderData, notes: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
                        rows={2}
                        placeholder="Instructions for the dispatcher..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || cart.length === 0}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-lg shadow-primary-600/10 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? "Registering Dispatch..." : "Confirm & Place Order"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
