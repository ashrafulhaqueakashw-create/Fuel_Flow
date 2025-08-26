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

  // Order form data
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
        // Filter out items with 0 quantity
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
          delivery_address: orderData.delivery_address || null,
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

      // Reload inventory to reflect updated quantities
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Place Order</h3>
        <div className="text-sm text-gray-600">
          Cart: {cart.length} items - ${getTotalAmount().toFixed(2)}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-2 rounded">{error}</div>
      )}

      {success && (
        <div className="bg-green-50 text-green-800 px-4 py-2 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded shadow">
            <div className="px-6 py-4 border-b">
              <h4 className="text-lg font-semibold">Available Items</h4>

              {/* Filters */}
              <div className="flex space-x-2 mt-3">
                {["all", "fuel", "product", "service"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat as any)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      filter === cat
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {items.length === 0 ? (
                <div className="text-center text-gray-500">
                  No items available for the selected category.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">
                          {item.name}
                        </h5>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.category === "fuel"
                              ? "bg-blue-100 text-blue-800"
                              : item.category === "product"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-semibold text-gray-900">
                          ${formatPrice(item.price)} / {item.unit}
                        </span>
                        <span className="text-sm text-gray-500">
                          {typeof item.quantity === "string"
                            ? parseInt(item.quantity)
                            : item.quantity}{" "}
                          available
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max={
                            typeof item.quantity === "string"
                              ? parseInt(item.quantity)
                              : item.quantity
                          }
                          placeholder="Qty"
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
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
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart & Order Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded shadow">
            <div className="px-6 py-4 border-b">
              <h4 className="text-lg font-semibold">Shopping Cart</h4>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.inventory_id}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">
                            ${item.price.toFixed(2)} × {item.quantity}{" "}
                            {item.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${item.total.toFixed(2)}
                          </div>
                          <div className="flex items-center space-x-1">
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
                              className="w-12 px-1 py-0 border border-gray-300 rounded text-xs"
                            />
                            <button
                              onClick={() => removeFromCart(item.inventory_id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total:</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>

                  <form onSubmit={handlePlaceOrder} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="mobile">Mobile Payment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address (Optional)
                      </label>
                      <textarea
                        value={orderData.delivery_address}
                        onChange={(e) =>
                          setOrderData({
                            ...orderData,
                            delivery_address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Enter delivery address if needed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={orderData.notes}
                        onChange={(e) =>
                          setOrderData({ ...orderData, notes: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Special instructions or notes"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || cart.length === 0}
                      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Placing Order..." : "Place Order"}
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
