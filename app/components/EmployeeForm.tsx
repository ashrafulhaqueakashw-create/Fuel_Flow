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

  const [recent, setRecent] = useState<any[]>([]);
  const loadRecent = async () => {
    try {
      const r = await fetch("/api/employees");
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
          Register Employee
        </h3>
        {error && <div className="text-red-600">{error}</div>}
        <div>
          <label className="block text-sm text-gray-700">Name</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Role</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Email</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Phone</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Salary</label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded"
            value={salary as any}
            onChange={(e) =>
              setSalary(e.target.value === "" ? "" : Number(e.target.value))
            }
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
          <h4 className="font-semibold">Recent employees</h4>
          <ul className="text-sm text-gray-700 mt-2 space-y-1">
            {recent.slice(0, 6).map((e: any) => (
              <li key={e.id}>
                {e.name} — {e.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
