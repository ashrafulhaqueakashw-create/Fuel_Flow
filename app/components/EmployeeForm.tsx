/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";

type Props = { onSaved?: () => void };

export default function EmployeeForm({ onSaved }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [salary, setSalary] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !role.trim() || !password)
      return setError("Name, role and password are required");

    setLoading(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          email: email || undefined,
          phone: phone || undefined,
          password,
          salary: salary || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create employee");
      setName("");
      setRole("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSalary("");
      onSaved?.();
      await loadRecent();
    } catch (err: any) {
      setError(err?.message || "Error saving employee");
    } finally {
      setLoading(false);
    }
  };

  const loadRecent = async () => {
    try {
      const r = await fetch("/api/employees");
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
            Register New Staff Account
          </h3>
          <p className="text-xs text-gray-500">Configure profile credentials, role designation, and wage rates</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 px-4 py-2.5 rounded-xl border border-red-200 text-xs animate-shake">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Full Name *</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={name}
              placeholder="E.g. David Miller"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role/Designation *</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={role}
              placeholder="E.g. Dispatcher, Inventory Manager"
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              type="email"
              value={email}
              placeholder="E.g. staff@nexusexp.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={phone}
              placeholder="E.g. +88015..."
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Salary (Tk / Month)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={salary as any}
              placeholder="E.g. 45000"
              onChange={(e) =>
                setSalary(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Password *</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500"
              value={password}
              placeholder="Minimum 6 characters"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
            disabled={loading}
            type="submit"
          >
            {loading ? "Registering..." : "Register Employee"}
          </button>
        </div>
      </form>

      {/* Recent Employees List */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100/80 shadow-sm lg:col-span-1 transition-all duration-300 hover:shadow-md">
        <h4 className="text-base font-bold text-gray-800 mb-4">
          Current Staff Register
        </h4>
        {recent.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No employee records found.</p>
        ) : (
          <ul className="space-y-3">
            {recent.slice(0, 6).map((e: any) => (
              <li
                key={e.id}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl transition-colors hover:bg-gray-100/30"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                  {e.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {e.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {e.role} • {e.email || "No email"}
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
