/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Lock,
  Edit2,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

type Props = { onSaved?: () => void };

export default function CustomerForm({ onSaved }: Props) {
  const [type, setType] = useState<"individual" | "commercial">("individual");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals for edit & password reset
  const [editingCust, setEditingCust] = useState<any | null>(null);
  const [pwdModalCust, setPwdModalCust] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!password || password.length < 6)
      return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          company_name: companyName || undefined,
          phone: phone || undefined,
          email,
          password,
          address: address || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create customer");
      setName("");
      setCompanyName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setAddress("");
      setSuccess("Customer registered successfully!");
      setTimeout(() => setSuccess(""), 4000);
      onSaved?.();
      await loadCustomers();
    } catch (err: any) {
      setError(err?.message || "Error saving customer");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const r = await fetch("/api/customers", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        setCustomers(d.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCust) return;

    try {
      const res = await fetch(`/api/customers/${editingCust.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCust),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Updated ${editingCust.name} successfully!`);
        setTimeout(() => setSuccess(""), 4000);
        setEditingCust(null);
        loadCustomers();
      } else {
        setError(data.message || "Failed to update customer");
      }
    } catch {
      setError("Error updating customer");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalCust || !newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`/api/customers/${pwdModalCust.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Password for ${pwdModalCust.name} reset successfully!`);
        setTimeout(() => setSuccess(""), 4000);
        setPwdModalCust(null);
        setNewPassword("");
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch {
      setError("Error resetting password");
    }
  };

  const handleDeleteCustomer = async (cust: any) => {
    if (!confirm(`Are you sure you want to remove customer ${cust.name}?`)) return;

    try {
      const res = await fetch(`/api/customers/${cust.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Customer ${cust.name} removed successfully.`);
        setTimeout(() => setSuccess(""), 4000);
        loadCustomers();
      } else {
        setError(data.message || "Failed to delete customer");
      }
    } catch {
      setError("Error deleting customer");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-3 rounded-2xl border border-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded-2xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Registration Form (5 cols) */}
        <form
          className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-5"
          onSubmit={handleSubmit}
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-800 mb-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>New Customer Account</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Register Customer & Assign Credentials
            </h3>
            <p className="text-xs text-slate-500">
              Configure profile information and security password
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Customer Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c]"
              >
                <option value="individual">Individual Private Car</option>
                <option value="commercial">Commercial Fleet / Generator</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                value={name}
                placeholder="E.g. John Doe"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {type === "commercial" && (
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Company Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                  value={companyName}
                  placeholder="E.g. Nexus Energy Corp"
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                value={phone}
                placeholder="+880 1700..."
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Account Password *
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                value={password}
                placeholder="Min 6 characters"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Delivery Address
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                value={address}
                placeholder="Delivery location..."
                rows={2}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Registering..." : "Register Customer"}
            </button>
          </div>
        </form>

        {/* Current Customers Register (7 cols) */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Customer Registry ({customers.length})
              </h4>
              <p className="text-xs text-slate-500">
                Accounts with instant password alteration and profile management
              </p>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c2410c]"
              />
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No customer records found.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filteredCustomers.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{c.name}</p>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            c.type === "commercial"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {c.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {c.email} • {c.company_name ? `Corp: ${c.company_name}` : c.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setEditingCust(c)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition-colors"
                      title="Edit Details"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPwdModalCust(c);
                        setNewPassword("");
                      }}
                      className="p-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors"
                      title="Change Password"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCustomer(c)}
                      className="p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editingCust && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update {editingCust.name}
              </h3>
              <button
                onClick={() => setEditingCust(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Customer Type
                </label>
                <select
                  value={editingCust.type}
                  onChange={(e) => setEditingCust({ ...editingCust, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="individual">Individual</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={editingCust.name}
                  onChange={(e) => setEditingCust({ ...editingCust, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={editingCust.email}
                  onChange={(e) => setEditingCust({ ...editingCust, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Phone
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={editingCust.phone || ""}
                  onChange={(e) => setEditingCust({ ...editingCust, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Address
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={editingCust.address || ""}
                  onChange={(e) => setEditingCust({ ...editingCust, address: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCust(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {pwdModalCust && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Change Password for {pwdModalCust.name}
              </h3>
              <button
                onClick={() => setPwdModalCust(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Set Password
                </button>
                <button
                  type="button"
                  onClick={() => setPwdModalCust(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
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
