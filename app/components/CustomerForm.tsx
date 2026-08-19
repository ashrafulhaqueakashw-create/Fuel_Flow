/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";

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
  const [recent, setRecent] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      onSaved?.();
      await loadRecent();
    } catch (err: any) {
      setError(err?.message || "Error saving customer");
    } finally {
      setLoading(false);
    }
  };

  const loadRecent = async () => {
    try {
      const r = await fetch("/api/customers");
      if (r.ok) {
        const d = await r.json();
        setRecent(d.data || []);
      }
    } catch { }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Registration Form */}
      <form
        className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm space-y-4 lg:col-span-2 transition-all duration-300 hover:shadow-md"
        onSubmit={handleSubmit}
      >
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Register New Customer Account
          </h3>
          <p className="text-xs text-gray-500">Configure profile credentials and details</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 px-4 py-2.5 rounded-xl border border-red-200 text-xs animate-shake">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
            >
              <option value="individual">Individual</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={name}
              placeholder="E.g. John Doe"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {type === "commercial" && (
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company Name</label>
              <input
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
                value={companyName}
                placeholder="E.g. Nexus Energy Corp"
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={phone}
              placeholder="E.g. +88017..."
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              type="email"
              placeholder="E.g. client@nexusexp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Password</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery/Billing Address</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={address}
              placeholder="Enter customer address..."
              rows={2}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
            disabled={loading}
            type="submit"
          >
            {loading ? "Registering..." : "Register Customer"}
          </button>
        </div>
      </form>

      {/* Recent Accounts List */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm lg:col-span-1 transition-all duration-300 hover:shadow-md">
        <h4 className="text-base font-bold text-gray-800 mb-4">
          Recent Registrations
        </h4>
        {recent.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No customers registered yet.</p>
        ) : (
          <ul className="space-y-3">
            {recent.slice(0, 6).map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl transition-colors hover:bg-gray-100/30"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold text-xs flex items-center justify-center">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {c.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {c.company_name ? `Corp: ${c.company_name}` : `Individual: ${c.email}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
