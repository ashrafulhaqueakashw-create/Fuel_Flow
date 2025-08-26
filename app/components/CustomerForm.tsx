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

  const [recent, setRecent] = useState<any[]>([]);
  const loadRecent = async () => {
    try {
      const r = await fetch("/api/customers");
      if (r.ok) {
        const d = await r.json();
        setRecent(d.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    loadRecent();
  }, []);

  return (
    <>
      <form
        className="bg-white p-6 rounded shadow space-y-4"
        onSubmit={handleSubmit}
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Register Customer
        </h3>
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex gap-2 items-center">
          <label className="text-sm">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="ml-2 px-2 py-1 border rounded"
          >
            <option value="individual">Individual</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Name</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {type === "commercial" && (
          <div>
            <label className="block text-sm text-gray-700">Company Name</label>
            <input
              className="w-full px-3 py-2 border rounded"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-700">Phone</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Email *</label>
          <input
            className="w-full px-3 py-2 border rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Password *</label>
          <input
            className="w-full px-3 py-2 border rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Address</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
            type="submit"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
      {recent.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h4 className="font-semibold">Recent customers</h4>
          <ul className="text-sm text-gray-700 mt-2 space-y-1">
            {recent.slice(0, 6).map((c) => (
              <li key={c.id}>
                {c.name} {c.company_name ? `(${c.company_name})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
