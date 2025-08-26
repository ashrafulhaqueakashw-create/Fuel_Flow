"use client";
import { useState, useEffect } from "react";

type InventoryItem = {
  id: number;
  name: string;
  category: "fuel" | "product" | "service";
  price: number | string;
  quantity: number | string;
  unit: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  onSaved?: () => void;
};

export default function InventoryForm({ onSaved }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "fuel" | "product" | "service">(
    "all"
  );

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "fuel" as "fuel" | "product" | "service",
    price: "",
    quantity: "",
    unit: "piece",
    description: "",
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
        setItems(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.price) {
      return setError("Name and price are required");
    }

    setLoading(true);
    try {
      const url = editingItem
        ? `/api/inventory/${editingItem.id}`
        : "/api/inventory";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity) || 0,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to save item");
      }

      // Reset form
      setFormData({
        name: "",
        category: "fuel",
        price: "",
        quantity: "",
        unit: "piece",
        description: "",
      });
      setEditingItem(null);
      setShowForm(false);

      await loadInventory();
      onSaved?.();
    } catch (err: any) {
      setError(err?.message || "Error saving item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      unit: item.unit,
      description: item.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        await loadInventory();
      } else {
        setError(data.message || "Failed to delete item");
      }
    } catch (err: any) {
      setError("Error deleting item");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "fuel",
      price: "",
      quantity: "",
      unit: "piece",
      description: "",
    });
    setEditingItem(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Inventory Management
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancel" : "Add New Item"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {["all", "fuel", "product", "service"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filter === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          <h4 className="text-lg font-semibold">
            {editingItem ? "Edit Item" : "Add New Item"}
          </h4>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fuel">Fuel</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price * ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="piece">Piece</option>
                <option value="gallon">Gallon</option>
                <option value="liter">Liter</option>
                <option value="bottle">Bottle</option>
                <option value="service">Service</option>
                <option value="kg">Kilogram</option>
                <option value="box">Box</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : editingItem ? "Update" : "Add Item"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="text-lg font-semibold">
            Current Inventory ({items.length} items)
          </h4>
        </div>

        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No inventory items found. Add some items to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      $
                      {typeof item.price === "string"
                        ? parseFloat(item.price).toFixed(2)
                        : item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof item.quantity === "string"
                        ? parseInt(item.quantity)
                        : item.quantity}{" "}
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
