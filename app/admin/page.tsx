/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Fuel,
  Users,
  Briefcase,
  CalendarCheck,
  MessageSquare,
  ShieldCheck,
  LayoutDashboard,
  DollarSign,
  Lock,
  Edit2,
  Trash2,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowRight,
  Clock,
  Package,
  TrendingUp,
  MapPin,
  Phone,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";

import DashboardCharts from "../components/DashboardCharts";
import InventorySnapshot from "../components/InventorySnapshot";
import ReviewManagement from "../components/ReviewManagement";
import BookingManagement from "../components/BookingManagement";

type Summary = {
  staffPresent: number;
  workingHours: number;
  openOrders: number;
  lowStock: number;
};

type FuelPrice = {
  id: number;
  fuel_type: string;
  price_per_liter: number | string;
  effective_date: string;
  is_current: boolean | number;
};

type Employee = {
  id: number;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  salary: number | string | null;
  status: string;
  hire_date: string;
  created_at: string;
};

type Customer = {
  id: number;
  type: "individual" | "commercial";
  name: string;
  company_name: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  // Navigation & Core States
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "prices"
    | "employees"
    | "customers"
    | "bookings"
    | "reviews"
    | "credentials"
  >("dashboard");

  const [summary, setSummary] = useState<Summary>({
    staffPresent: 0,
    workingHours: 0,
    openOrders: 0,
    lowStock: 0,
  });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Global Notification Banner
  const [notifyMsg, setNotifyMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotifyMsg({ type, text });
    setTimeout(() => setNotifyMsg(null), 5000);
  };

  // ──────────────────────────────────────────
  // 1. FUEL PRICES STATE & HANDLERS
  // ──────────────────────────────────────────
  const [prices, setPrices] = useState<FuelPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [tempPriceRate, setTempPriceRate] = useState<string>("");

  const fetchFuelPrices = async () => {
    setLoadingPrices(true);
    try {
      const res = await fetch("/api/fuel-prices", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPrices(data.data);
      }
    } catch (err) {
      console.error("Failed to load fuel prices:", err);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleSavePrice = async (priceId: number, fuelType: string) => {
    const rate = parseFloat(tempPriceRate);
    if (isNaN(rate) || rate <= 0) {
      showNotification("Please enter a valid price greater than 0", "error");
      return;
    }

    try {
      const res = await fetch("/api/fuel-prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: priceId, fuel_type: fuelType, price_per_liter: rate }),
      });
      const data = await res.json();
      if (data.success) {
        setPrices((prev) =>
          prev.map((p) =>
            p.id === priceId
              ? { ...p, price_per_liter: rate, effective_date: new Date().toISOString() }
              : p
          )
        );
        setEditingPriceId(null);
        showNotification(`Price for ${fuelType.toUpperCase()} updated to ৳${rate.toFixed(2)}/L`);
      } else {
        showNotification(data.message || "Failed to update price", "error");
      }
    } catch {
      showNotification("Network error updating price", "error");
    }
  };

  // ──────────────────────────────────────────
  // 2. EMPLOYEES STATE & HANDLERS
  // ──────────────────────────────────────────
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [empSearch, setEmpSearch] = useState("");
  const [empFilterRole, setEmpFilterRole] = useState("all");

  // Employee Modals
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [pwdModalEmp, setPwdModalEmp] = useState<Employee | null>(null);
  const [newPasswordEmp, setNewPasswordEmp] = useState("");
  const [showPwdEmp, setShowPwdEmp] = useState(false);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpData, setNewEmpData] = useState({
    name: "",
    role: "Fuel Dispatcher",
    email: "",
    phone: "",
    salary: "35000",
    password: "",
  });

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await fetch("/api/employees", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

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
        showNotification(`Employee ${editingEmp.name} updated successfully!`);
        setEditingEmp(null);
        fetchEmployees();
      } else {
        showNotification(data.message || "Failed to update employee", "error");
      }
    } catch {
      showNotification("Error updating employee", "error");
    }
  };

  const handleResetEmpPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalEmp || !newPasswordEmp || newPasswordEmp.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return;
    }

    try {
      const res = await fetch(`/api/employees/${pwdModalEmp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPasswordEmp }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Password for ${pwdModalEmp.name} reset successfully!`);
        setPwdModalEmp(null);
        setNewPasswordEmp("");
      } else {
        showNotification(data.message || "Failed to reset password", "error");
      }
    } catch {
      showNotification("Error resetting password", "error");
    }
  };

  const handleDeleteEmployee = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to remove employee ${emp.name}?`)) return;

    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification(`Employee ${emp.name} removed successfully.`);
        fetchEmployees();
      } else {
        showNotification(data.message || "Failed to delete employee", "error");
      }
    } catch {
      showNotification("Error deleting employee", "error");
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpData.name || !newEmpData.password) {
      showNotification("Name and password are required", "error");
      return;
    }

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmpData),
      });
      const data = await res.json();
      if (data.success || data.message?.includes("created")) {
        showNotification(`Employee ${newEmpData.name} registered successfully!`);
        setShowAddEmpModal(false);
        setNewEmpData({
          name: "",
          role: "Fuel Dispatcher",
          email: "",
          phone: "",
          salary: "35000",
          password: "",
        });
        fetchEmployees();
      } else {
        showNotification(data.message || "Failed to register employee", "error");
      }
    } catch {
      showNotification("Error registering employee", "error");
    }
  };

  // ──────────────────────────────────────────
  // 3. CUSTOMERS STATE & HANDLERS
  // ──────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [custSearch, setCustSearch] = useState("");
  const [custFilterType, setCustFilterType] = useState("all");

  // Customer Modals
  const [editingCust, setEditingCust] = useState<Customer | null>(null);
  const [pwdModalCust, setPwdModalCust] = useState<Customer | null>(null);
  const [newPasswordCust, setNewPasswordCust] = useState("");
  const [showPwdCust, setShowPwdCust] = useState(false);
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [newCustData, setNewCustData] = useState({
    type: "individual" as "individual" | "commercial",
    name: "",
    company_name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch("/api/customers", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

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
        showNotification(`Customer ${editingCust.name} updated successfully!`);
        setEditingCust(null);
        fetchCustomers();
      } else {
        showNotification(data.message || "Failed to update customer", "error");
      }
    } catch {
      showNotification("Error updating customer", "error");
    }
  };

  const handleResetCustPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalCust || !newPasswordCust || newPasswordCust.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return;
    }

    try {
      const res = await fetch(`/api/customers/${pwdModalCust.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPasswordCust }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Password for ${pwdModalCust.name} reset successfully!`);
        setPwdModalCust(null);
        setNewPasswordCust("");
      } else {
        showNotification(data.message || "Failed to reset password", "error");
      }
    } catch {
      showNotification("Error resetting password", "error");
    }
  };

  const handleDeleteCustomer = async (cust: Customer) => {
    if (!confirm(`Are you sure you want to remove customer ${cust.name}?`)) return;

    try {
      const res = await fetch(`/api/customers/${cust.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification(`Customer ${cust.name} removed successfully.`);
        fetchCustomers();
      } else {
        showNotification(data.message || "Failed to delete customer", "error");
      }
    } catch {
      showNotification("Error deleting customer", "error");
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustData.name || !newCustData.email || !newCustData.password) {
      showNotification("Name, email, and password are required", "error");
      return;
    }

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustData),
      });
      const data = await res.json();
      if (data.success || data.message?.includes("created")) {
        showNotification(`Customer ${newCustData.name} registered successfully!`);
        setShowAddCustModal(false);
        setNewCustData({
          type: "individual",
          name: "",
          company_name: "",
          phone: "",
          email: "",
          address: "",
          password: "",
        });
        fetchCustomers();
      } else {
        showNotification(data.message || "Failed to register customer", "error");
      }
    } catch {
      showNotification("Error registering customer", "error");
    }
  };

  // ──────────────────────────────────────────
  // 4. ADMIN CREDENTIALS STATE & HANDLERS
  // ──────────────────────────────────────────
  const [adminUsername, setAdminUsername] = useState("admin");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [savingAdminCreds, setSavingAdminCreds] = useState(false);

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (data.success && data.data?.AdminName) {
        setAdminUsername(data.data.AdminName);
      }
    } catch (err) {
      console.error("Failed to load admin profile:", err);
    }
  };

  const handleUpdateAdminCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword && newAdminPassword !== confirmAdminPassword) {
      showNotification("New passwords do not match!", "error");
      return;
    }
    if (newAdminPassword && newAdminPassword.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return;
    }

    setSavingAdminCreds(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          AdminName: adminUsername,
          password: newAdminPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("Admin credentials updated successfully!");
        setNewAdminPassword("");
        setConfirmAdminPassword("");
      } else {
        showNotification(data.message || "Failed to update admin credentials", "error");
      }
    } catch {
      showNotification("Error saving admin credentials", "error");
    } finally {
      setSavingAdminCreds(false);
    }
  };

  // ──────────────────────────────────────────
  // 5. SUMMARY KPIs & AUTO-REFRESH
  // ──────────────────────────────────────────
  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/reports/summary", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchFuelPrices();
    fetchEmployees();
    fetchCustomers();
    fetchAdminProfile();

    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  // Filtered lists
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(empSearch.toLowerCase())) ||
      (emp.phone && emp.phone.includes(empSearch)) ||
      emp.role.toLowerCase().includes(empSearch.toLowerCase());
    const matchesRole = empFilterRole === "all" || emp.role.toLowerCase() === empFilterRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(custSearch.toLowerCase()) ||
      cust.email.toLowerCase().includes(custSearch.toLowerCase()) ||
      (cust.phone && cust.phone.includes(custSearch)) ||
      (cust.company_name && cust.company_name.toLowerCase().includes(custSearch.toLowerCase()));
    const matchesType = custFilterType === "all" || cust.type === custFilterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-700 w-full overflow-x-hidden">
      {/* ─── TOP ANNOUNCEMENT BAR (MATCHES LANDING PAGE) ─── */}
      <div className="bg-slate-900 text-white text-xs py-2 px-3 sm:px-4 border-b border-slate-800 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 text-slate-300 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <strong className="text-white">Hotdesk: 16223</strong>
              <span className="hidden sm:inline text-slate-400">/ +880 1800-383535</span>
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              Dhaka Station Hub & Remote Tank Cloud
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span><span className="hidden xs:inline">Super-Admin</span> Active</span>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-orange-400 font-mono text-[10px] sm:text-[11px]">
              {lastUpdated ? `Synced: ${lastUpdated.toLocaleTimeString()}` : "Syncing..."}
            </span>
          </div>
        </div>
      </div>

      {/* ─── MAIN NAV HEADER (MATCHES LANDING PAGE) ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#c2410c] flex items-center justify-center text-white shadow-sm group-hover:bg-[#9a3412] transition-colors shrink-0">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                    Fuel<span className="text-[#c2410c]">Flow</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#9a3412] border border-orange-200">
                    Admin Suite
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">
                  Full System, Price & Personnel Control
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{adminUsername}</span>
              <span className="text-slate-400">|</span>
              <span className="text-[11px] text-slate-600">Root Administrator</span>
            </div>

            <button
              onClick={() => {
                fetchSummary();
                fetchFuelPrices();
                fetchEmployees();
                fetchCustomers();
                showNotification("All consoles refreshed with live database data");
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ─── TAB NAVIGATION BAR ─── */}
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 border-t border-slate-100 w-full overflow-hidden">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("prices")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === "prices"
                  ? "bg-[#c2410c] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Fuel className="w-4 h-4" />
              <span>Fuel Prices & Rates</span>
            </button>

            <button
              onClick={() => setActiveTab("employees")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === "employees"
                  ? "bg-[#c2410c] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Staff & Salaries ({employees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === "customers"
                  ? "bg-[#c2410c] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === "bookings"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Bookings</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === "reviews"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab("credentials")}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === "credentials"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Admin Security</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ─── NOTIFICATION POPUP ─── */}
      {notifyMsg && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 w-full">
          <div
            className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm border ${
              notifyMsg.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-red-50 text-red-900 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notifyMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="truncate">{notifyMsg.text}</span>
            </div>
            <button
              onClick={() => setNotifyMsg(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2 shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 min-w-0 overflow-hidden">
        {/* ══════════════════════════════════════════════════════════════
            TAB 1: OVERVIEW & ANALYTICS
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Action Navigation Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
                  Station Operational Consoles
                </span>
                <span className="text-xs text-slate-500">Instant Admin Navigation</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("prices")}
                  className="bg-white hover:bg-orange-50/40 text-left border border-slate-200 hover:border-orange-300 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#c2410c] flex items-center justify-center">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#c2410c] transition-colors">
                      Pump Rates
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Change per-liter rates</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("employees")}
                  className="bg-white hover:bg-orange-50/40 text-left border border-slate-200 hover:border-orange-300 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#c2410c] transition-colors">
                      Staff & Salaries
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Manage wages & passwords</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("customers")}
                  className="bg-white hover:bg-orange-50/40 text-left border border-slate-200 hover:border-orange-300 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#c2410c] transition-colors">
                      Customers
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Accounts & passwords</p>
                  </div>
                </button>

                <Link
                  href="/admin/inventory"
                  className="bg-white hover:bg-orange-50/40 text-left border border-slate-200 hover:border-orange-300 p-5 rounded-2xl transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#c2410c] transition-colors">
                      Tank Inventory
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Stock capacity & fluids</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Overview KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Staff Present
                  </h4>
                  <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                    {summary.staffPresent}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium mt-1">Checked in on shift</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-200">
                  ✓
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Working Hours
                  </h4>
                  <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                    {summary.workingHours}h
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Logged this week</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#c2410c] flex items-center justify-center text-xl font-bold border border-orange-200">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Open Orders
                  </h4>
                  <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                    {summary.openOrders}
                  </p>
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">Dispatch in pipeline</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-xl font-bold border border-rose-200">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Low Stock Alerts
                  </h4>
                  <p className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                    {summary.lowStock}
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold mt-1">Refill recommended</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-xl font-bold border border-amber-200">
                  ⚠
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <DashboardCharts />
            </div>

            {/* Operational Insights & Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-base font-bold text-slate-900">
                      Station Operations & Cloud Database Status
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    The FuelFlow station command console is connected to the dual-engine TiDB Cloud
                    database cluster with SSL encryption. Price changes and staff updates committed
                    here are instantly mirrored to the customer booking engine and mobile dispenser fleet.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                  <span className="text-xl">💡</span>
                  <div className="text-xs text-slate-700">
                    <strong>Admin Note:</strong> You have full control to change any fuel price, adjust employee salaries, alter passwords, and approve customer bookings from the navigation tabs above.
                  </div>
                </div>
              </div>

              <InventorySnapshot />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 2: FUEL PRICES CONTROL (USER EXPLICIT REQUEST)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "prices" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-[#9a3412] mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#c2410c]" />
                    Real-Time Fuel Rates Controller
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Fuel Prices & Pump Rate Administration
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Alter per-liter prices directly. Updates are immediately broadcast to the public landing page rates board, cost calculator, and smart booking order forms.
                  </p>
                </div>

                <button
                  onClick={fetchFuelPrices}
                  disabled={loadingPrices}
                  className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPrices ? "animate-spin" : ""}`} />
                  <span>Reload Rates</span>
                </button>
              </div>

              {/* Price Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {prices.map((p) => {
                  const isEditing = editingPriceId === p.id;
                  const fuelName =
                    p.fuel_type === "gasoline"
                      ? "Octane 95 Super"
                      : p.fuel_type === "diesel"
                      ? "Diesel Ultra"
                      : p.fuel_type === "premium"
                      ? "Premium Petrol"
                      : "Station CNG Gas";

                  const unit = p.fuel_type === "cng" ? "m³" : "Liter";

                  return (
                    <div
                      key={p.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between relative shadow-sm hover:border-slate-300 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-900">{fuelName}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                            Active Rate
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                          Fuel Key: {p.fuel_type}
                        </span>

                        <div className="my-4 p-4 bg-white rounded-xl border border-slate-200">
                          {isEditing ? (
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                New Rate (৳ / {unit})
                              </label>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-slate-600">৳</span>
                                <input
                                  type="number"
                                  step="0.10"
                                  autoFocus
                                  value={tempPriceRate}
                                  onChange={(e) => setTempPriceRate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-[#c2410c] rounded-lg text-lg font-bold font-mono text-slate-900 focus:outline-none ring-2 ring-[#c2410c]/20"
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => handleSavePrice(p.id, p.fuel_type)}
                                  className="flex-1 py-1.5 rounded-lg bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPriceId(null)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs text-slate-500">Current Pump Rate:</span>
                              <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-base font-semibold text-slate-500">৳</span>
                                <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                                  {Number(p.price_per_liter).toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500 font-medium ml-1">
                                  / {unit}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500">
                          Effective Date:{" "}
                          <span className="font-semibold text-slate-700">
                            {p.effective_date ? new Date(p.effective_date).toLocaleDateString() : "Today"}
                          </span>
                        </p>
                      </div>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceId(p.id);
                            setTempPriceRate(Number(p.price_per_liter).toString());
                          }}
                          className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Change Price</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 3: EMPLOYEES & SALARIES (USER EXPLICIT REQUEST)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "employees" && (
          <div className="space-y-6 animate-fade-in w-full min-w-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Staff Operations & Wage Console
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Employee & Salary Management
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Manage team member credentials, modify designations, adjust salaries, change employee passwords, and manage shifts.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddEmpModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register New Staff</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search employees by name, email, phone, or role..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20"
                  />
                </div>

                <div className="w-full sm:w-48">
                  <select
                    value={empFilterRole}
                    onChange={(e) => setEmpFilterRole(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-[#c2410c]"
                  >
                    <option value="all">All Roles</option>
                    <option value="Fuel Dispatcher">Fuel Dispatcher</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Shift Supervisor">Shift Supervisor</option>
                  </select>
                </div>
              </div>

              {/* ─── MOBILE CARDS VIEW (md:hidden) ─── */}
              <div className="md:hidden divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {filteredEmployees.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No employee records found matching your query.
                  </div>
                ) : (
                  filteredEmployees.map((emp) => (
                    <div key={emp.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#9a3412] font-bold text-sm flex items-center justify-center shrink-0">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{emp.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-700">{emp.role}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                EMP-{emp.id.toString().padStart(4, "0")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            emp.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === "active" ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          {emp.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Salary</span>
                          <span className="font-bold font-mono text-sm text-[#c2410c]">
                            ৳{emp.salary ? Number(emp.salary).toLocaleString() : "0.00"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact</span>
                          <span className="text-slate-800 text-[11px] font-medium truncate block">
                            {emp.phone || emp.email || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingEmp(emp)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center"
                        >
                          Edit / Salary
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPwdModalEmp(emp);
                            setNewPasswordEmp("");
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmployee(emp)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shrink-0"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ─── DESKTOP TABLE VIEW (hidden md:block) ─── */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Salary (৳ / Mo)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No employee records found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#9a3412] font-bold text-xs flex items-center justify-center">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{emp.name}</p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  EMP-{emp.id.toString().padStart(4, "0")}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {emp.role}
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-slate-800 font-medium">{emp.email || "—"}</p>
                            <p className="text-[11px] text-slate-500">{emp.phone || "—"}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold font-mono text-sm text-[#c2410c]">
                              ৳{emp.salary ? Number(emp.salary).toLocaleString() : "0.00"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                emp.status === "active"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  emp.status === "active" ? "bg-emerald-600" : "bg-slate-400"
                                }`}
                              />
                              {emp.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingEmp(emp)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors"
                                title="Edit Profile & Salary"
                              >
                                Edit / Salary
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPwdModalEmp(emp);
                                  setNewPasswordEmp("");
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Change Password"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Password</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteEmployee(emp)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 4: CUSTOMERS & PASSWORDS (USER EXPLICIT REQUEST)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "customers" && (
          <div className="space-y-6 animate-fade-in w-full min-w-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Customer Database Administration
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Customer Account Management
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Complete administrative oversight over individual and commercial accounts, including password modification and profile credentials.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddCustModal(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register New Customer</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search customers by name, company, email, or phone..."
                    value={custSearch}
                    onChange={(e) => setCustSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20"
                  />
                </div>

                <div className="w-full sm:w-48">
                  <select
                    value={custFilterType}
                    onChange={(e) => setCustFilterType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-[#c2410c]"
                  >
                    <option value="all">All Types</option>
                    <option value="individual">Individual</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>

              {/* ─── MOBILE CUSTOMER CARDS (md:hidden) ─── */}
              <div className="md:hidden divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {filteredCustomers.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No customer records found matching your query.
                  </div>
                ) : (
                  filteredCustomers.map((cust) => (
                    <div key={cust.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{cust.name}</p>
                            {cust.company_name && (
                              <p className="text-[11px] text-[#c2410c] font-semibold truncate">
                                {cust.company_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            cust.type === "commercial"
                              ? "bg-purple-50 text-purple-800 border border-purple-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {cust.type}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Email:</span>
                          <span className="font-medium truncate max-w-[200px]">{cust.email}</span>
                        </div>
                        {cust.phone && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Phone:</span>
                            <span className="font-medium">{cust.phone}</span>
                          </div>
                        )}
                        {cust.address && (
                          <div className="text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Address:</span>
                            <p className="line-clamp-2">{cust.address}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCust(cust)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center"
                        >
                          Edit Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPwdModalCust(cust);
                            setNewPasswordCust("");
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(cust)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors shrink-0"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ─── DESKTOP TABLE VIEW (hidden md:block) ─── */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Account Type</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Delivery Address</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No customer records found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                                {cust.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{cust.name}</p>
                                {cust.company_name && (
                                  <p className="text-[11px] text-[#c2410c] font-semibold">
                                    {cust.company_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                cust.type === "commercial"
                                  ? "bg-purple-50 text-purple-800 border border-purple-200"
                                  : "bg-blue-50 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {cust.type}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="text-slate-800 font-medium">{cust.email}</p>
                            <p className="text-[11px] text-slate-500">{cust.phone || "—"}</p>
                          </td>

                          <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                            {cust.address || "—"}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingCust(cust)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors"
                              >
                                Edit Profile
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPwdModalCust(cust);
                                  setNewPasswordCust("");
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Password</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCustomer(cust)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 5: BOOKINGS MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "bookings" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
            <BookingManagement onUpdate={fetchSummary} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 6: REVIEWS MANAGEMENT
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "reviews" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
            <ReviewManagement onSaved={fetchSummary} />
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB 7: ADMIN SECURITY & CREDENTIALS (USER EXPLICIT REQUEST)
        ══════════════════════════════════════════════════════════════ */}
        {activeTab === "credentials" && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 mb-2">
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  Admin Authority Control
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Update Administrator Credentials
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Change the root admin username and account password used to access this console.
                </p>
              </div>

              <form onSubmit={handleUpdateAdminCreds} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Admin Username
                  </label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new admin password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20"
                  />
                </div>

                {newAdminPassword && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat new admin password"
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c] focus:ring-2 focus:ring-[#c2410c]/20"
                    />
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingAdminCreds}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {savingAdminCreds ? "Updating Credentials..." : "Save Admin Credentials"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EDIT EMPLOYEE & SALARY
      ══════════════════════════════════════════════════════════════ */}
      {editingEmp && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Staff Details & Salary
                </h3>
                <p className="text-xs text-slate-500">EMP-{editingEmp.id} • {editingEmp.name}</p>
              </div>
              <button
                onClick={() => setEditingEmp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmp.name}
                    onChange={(e) => setEditingEmp({ ...editingEmp, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Role / Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmp.role}
                    onChange={(e) => setEditingEmp({ ...editingEmp, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingEmp.email || ""}
                    onChange={(e) => setEditingEmp({ ...editingEmp, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingEmp.phone || ""}
                    onChange={(e) => setEditingEmp({ ...editingEmp, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#c2410c] uppercase tracking-wider block">
                    Monthly Salary (৳ BDT) *
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={editingEmp.salary !== null ? editingEmp.salary : ""}
                    onChange={(e) => setEditingEmp({ ...editingEmp, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c2410c] rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-none ring-2 ring-[#c2410c]/20"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Status
                  </label>
                  <select
                    value={editingEmp.status}
                    onChange={(e) => setEditingEmp({ ...editingEmp, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Save Employee Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: RESET EMPLOYEE PASSWORD (USER EXPLICIT REQUEST)
      ══════════════════════════════════════════════════════════════ */}
      {pwdModalEmp && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#c2410c]" />
                <h3 className="text-base font-bold text-slate-900">
                  Alter Employee Password
                </h3>
              </div>
              <button
                onClick={() => setPwdModalEmp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Set a new direct password for <strong>{pwdModalEmp.name}</strong> ({pwdModalEmp.email || "No email"}). The password will be hashed with bcrypt.
            </p>

            <form onSubmit={handleResetEmpPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPwdEmp ? "text" : "password"}
                    required
                    placeholder="Enter new password..."
                    value={newPasswordEmp}
                    onChange={(e) => setNewPasswordEmp(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdEmp(!showPwdEmp)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPwdEmp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Set New Password
                </button>
                <button
                  type="button"
                  onClick={() => setPwdModalEmp(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD NEW EMPLOYEE
      ══════════════════════════════════════════════════════════════ */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Register New Staff Member
              </h3>
              <button
                onClick={() => setShowAddEmpModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. David Miller"
                    value={newEmpData.name}
                    onChange={(e) => setNewEmpData({ ...newEmpData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Fuel Dispatcher"
                    value={newEmpData.role}
                    onChange={(e) => setNewEmpData({ ...newEmpData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="E.g. staff@fuelflow.com"
                    value={newEmpData.email}
                    onChange={(e) => setNewEmpData({ ...newEmpData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. +880 1800..."
                    value={newEmpData.phone}
                    onChange={(e) => setNewEmpData({ ...newEmpData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#c2410c] uppercase tracking-wider block">
                    Monthly Salary (৳)
                  </label>
                  <input
                    type="number"
                    step="500"
                    placeholder="40000"
                    value={newEmpData.salary}
                    onChange={(e) => setNewEmpData({ ...newEmpData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c2410c] rounded-xl text-xs font-bold font-mono text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newEmpData.password}
                    onChange={(e) => setNewEmpData({ ...newEmpData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Register Employee
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EDIT CUSTOMER
      ══════════════════════════════════════════════════════════════ */}
      {editingCust && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Customer Profile
                </h3>
                <p className="text-xs text-slate-500">{editingCust.name} • {editingCust.email}</p>
              </div>
              <button
                onClick={() => setEditingCust(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Account Type
                  </label>
                  <select
                    value={editingCust.type}
                    onChange={(e) => setEditingCust({ ...editingCust, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
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
                    type="text"
                    required
                    value={editingCust.name}
                    onChange={(e) => setEditingCust({ ...editingCust, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                {editingCust.type === "commercial" && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editingCust.company_name || ""}
                      onChange={(e) => setEditingCust({ ...editingCust, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editingCust.email}
                    onChange={(e) => setEditingCust({ ...editingCust, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingCust.phone || ""}
                    onChange={(e) => setEditingCust({ ...editingCust, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    value={editingCust.address || ""}
                    onChange={(e) => setEditingCust({ ...editingCust, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Save Customer Profile
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCust(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: RESET CUSTOMER PASSWORD (USER EXPLICIT REQUEST)
      ══════════════════════════════════════════════════════════════ */}
      {pwdModalCust && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#c2410c]" />
                <h3 className="text-base font-bold text-slate-900">
                  Alter Customer Password
                </h3>
              </div>
              <button
                onClick={() => setPwdModalCust(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Set a new direct password for <strong>{pwdModalCust.name}</strong> ({pwdModalCust.email}). The password will be hashed with bcrypt.
            </p>

            <form onSubmit={handleResetCustPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <input
                    type={showPwdCust ? "text" : "password"}
                    required
                    placeholder="Enter new password..."
                    value={newPasswordCust}
                    onChange={(e) => setNewPasswordCust(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#c2410c]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdCust(!showPwdCust)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPwdCust ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Set New Password
                </button>
                <button
                  type="button"
                  onClick={() => setPwdModalCust(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD NEW CUSTOMER
      ══════════════════════════════════════════════════════════════ */}
      {showAddCustModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Register New Customer Account
              </h3>
              <button
                onClick={() => setShowAddCustModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Customer Type
                  </label>
                  <select
                    value={newCustData.type}
                    onChange={(e) => setNewCustData({ ...newCustData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    <option value="individual">Individual</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Tariq Ahmed"
                    value={newCustData.name}
                    onChange={(e) => setNewCustData({ ...newCustData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                {newCustData.type === "commercial" && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="E.g. Dhaka Logistics Ltd."
                      value={newCustData.company_name}
                      onChange={(e) => setNewCustData({ ...newCustData, company_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={newCustData.email}
                    onChange={(e) => setNewCustData({ ...newCustData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+880 1700..."
                    value={newCustData.phone}
                    onChange={(e) => setNewCustData({ ...newCustData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newCustData.password}
                    onChange={(e) => setNewCustData({ ...newCustData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Delivery Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter delivery location..."
                    value={newCustData.address}
                    onChange={(e) => setNewCustData({ ...newCustData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs font-bold shadow-sm"
                >
                  Register Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
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
