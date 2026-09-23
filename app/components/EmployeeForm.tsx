/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import {
  Briefcase,
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

export default function EmployeeForm({ onSaved }: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("Fuel Dispatcher");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [salary, setSalary] = useState<number | string>("35000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals for editing & password
  const [editingEmp, setEditingEmp] = useState<any | null>(null);
  const [pwdModalEmp, setPwdModalEmp] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
      setEmail("");
      setPhone("");
      setPassword("");
      setSalary("35000");
      setSuccess("Employee registered successfully!");
      setTimeout(() => setSuccess(""), 4000);
      onSaved?.();
      await loadEmployees();
    } catch (err: any) {
      setError(err?.message || "Error saving employee");
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const r = await fetch("/api/employees", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        setEmployees(d.data || []);
      }
    } catch {}
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    try {
      const res = await fetch(`/api/employees/${editingEmp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEmp),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Updated ${editingEmp.name} successfully!`);
        setTimeout(() => setSuccess(""), 4000);
        setEditingEmp(null);
        loadEmployees();
      } else {
        setError(data.message || "Failed to update employee");
      }
    } catch {
      setError("Error updating employee");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalEmp || !newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`/api/employees/${pwdModalEmp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Password for ${pwdModalEmp.name} reset successfully!`);
        setTimeout(() => setSuccess(""), 4000);
        setPwdModalEmp(null);
        setNewPassword("");
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch {
      setError("Error resetting password");
    }
  };

  const handleDeleteEmployee = async (emp: any) => {
    if (!confirm(`Are you sure you want to remove ${emp.name}?`)) return;

    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Employee ${emp.name} removed successfully.`);
        setTimeout(() => setSuccess(""), 4000);
        loadEmployees();
      } else {
        setError(data.message || "Failed to delete employee");
      }
    } catch {
      setError("Error deleting employee");
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-[#9a3412] mb-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>New Staff Account</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Register Employee & Assign Salary
            </h3>
            <p className="text-xs text-slate-500">
              Specify role designation, monthly wage, and initial login credentials
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c]"
                value={name}
                placeholder="E.g. David Miller"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Role / Designation *
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c]"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Fuel Dispatcher">Fuel Dispatcher</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Shift Supervisor">Shift Supervisor</option>
                <option value="Maintenance Engineer">Maintenance Engineer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                type="email"
                value={email}
                placeholder="E.g. staff@fuelflow.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#c2410c]"
                value={phone}
                placeholder="E.g. +880 1800..."
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#c2410c] uppercase tracking-wider">
                Monthly Salary (৳ BDT) *
              </label>
              <input
                type="number"
                step="500"
                className="w-full px-3 py-2 border border-[#c2410c] rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none ring-2 ring-[#c2410c]/20"
                value={salary as any}
                placeholder="40000"
                onChange={(e) =>
                  setSalary(e.target.value === "" ? "" : Number(e.target.value))
                }
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
          </div>

          <div className="pt-2">
            <button
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? "Registering..." : "Register Staff Member"}
            </button>
          </div>
        </form>

        {/* Current Staff Register (7 cols) */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Current Staff Registry ({employees.length})
              </h4>
              <p className="text-xs text-slate-500">
                Live staff list with instant salary adjustment and password alteration
              </p>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c2410c]"
              />
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No employee records found.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filteredEmployees.map((e: any) => (
                <div
                  key={e.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#9a3412] font-bold text-xs flex items-center justify-center">
                      {e.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{e.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {e.role} • {e.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Monthly Salary
                      </span>
                      <span className="font-bold font-mono text-xs text-[#c2410c]">
                        ৳{e.salary ? Number(e.salary).toLocaleString() : "0.00"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingEmp(e)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition-colors"
                        title="Edit Details"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPwdModalEmp(e);
                          setNewPassword("");
                        }}
                        className="p-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors"
                        title="Change Password"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteEmployee(e)}
                        className="p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Employee Modal */}
      {editingEmp && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Update {editingEmp.name}
              </h3>
              <button
                onClick={() => setEditingEmp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={editingEmp.name}
                  onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Role
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={editingEmp.role}
                  onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#c2410c] uppercase tracking-wider block">
                  Monthly Salary (৳ BDT) *
                </label>
                <input
                  type="number"
                  step="500"
                  className="w-full px-3 py-2 border border-[#c2410c] rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none ring-2 ring-[#c2410c]/20"
                  value={editingEmp.salary || ""}
                  onChange={(e) => setEditingEmp({ ...editingEmp, salary: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Phone
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={editingEmp.phone || ""}
                  onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
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
                  onClick={() => setEditingEmp(null)}
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
      {pwdModalEmp && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Change Password for {pwdModalEmp.name}
              </h3>
              <button
                onClick={() => setPwdModalEmp(null)}
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
                  onClick={() => setPwdModalEmp(null)}
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
