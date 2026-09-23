/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Fuel,
  Briefcase,
  Clock,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  LogOut,
  Calendar,
  User,
  Package,
} from "lucide-react";
import EmployeeOrderManagement from "../components/EmployeeOrderManagement";

type EmployeeData = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: number;
  hire_date: string;
  status: string;
  created_at: string;
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [attendanceMessage, setAttendanceMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/employee/profile");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/employee-login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        setEmployee(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    const fetchAttendanceStatus = async () => {
      try {
        const res = await fetch("/api/employee/attendance");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setIsCheckedIn(data.isCheckedIn);
            setCheckInTime(data.checkInTime);
          }
        }
      } catch (err) {
        console.error("Failed to fetch attendance status:", err);
      }
    };

    fetchProfile();
    fetchAttendanceStatus();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/employee/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
      }
    } catch {
      router.push("/employee-login");
    }
  };

  const handleAttendanceToggle = async () => {
    setAttendanceLoading(true);
    setAttendanceMessage("");

    try {
      const res = await fetch("/api/employee/attendance", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        if (data.action === "checkin") {
          setIsCheckedIn(true);
          setCheckInTime(new Date().toISOString());
          setAttendanceMessage("Successfully checked in for shift!");
        } else {
          setIsCheckedIn(false);
          setCheckInTime(null);
          setAttendanceMessage("Successfully checked out!");
        }

        setTimeout(() => setAttendanceMessage(""), 4000);
      } else {
        setAttendanceMessage(data.message || "Failed to update attendance");
      }
    } catch {
      setAttendanceMessage("Error updating attendance");
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-500 text-xs font-semibold">Verifying staff credentials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <p className="text-rose-600 font-bold text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push("/employee-login")}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-700">
      {/* ─── TOP ANNOUNCEMENT BAR (MATCHES LANDING PAGE) ─── */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <strong className="text-white">Station Dispatch: 16223</strong> / +880 1800-383535
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Dhaka Station Hub Dispatch Line
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              BSTI Calibrated Mobile Dispensers
            </span>
          </div>
        </div>
      </div>

      {/* ─── MAIN NAV HEADER (MATCHES LANDING PAGE) ─── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#c2410c] flex items-center justify-center text-white shadow-sm group-hover:bg-[#9a3412] transition-colors">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">
                    Fuel<span className="text-[#c2410c]">Flow</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Staff Workspace
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Welcome, {employee.name} • {employee.role}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-bold text-[11px]">
                EMP-{employee.id.toString().padStart(4, "0")}
              </span>
              <span className="text-slate-400">|</span>
              <span className="capitalize text-[11px] font-semibold text-emerald-800">
                {employee.status}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Welcome & Shift Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Active Employee Terminal</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {employee.name}!
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Position: <strong className="text-slate-900">{employee.role}</strong> • Status:{" "}
              <span className="text-emerald-800 font-bold uppercase">{employee.status}</span>
            </p>
          </div>

          {/* Shift Registration Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isCheckedIn && checkInTime && (
              <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Shift Active: In at {new Date(checkInTime).toLocaleTimeString()}</span>
              </div>
            )}

            <button
              onClick={handleAttendanceToggle}
              disabled={attendanceLoading}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
                isCheckedIn
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {attendanceLoading
                ? "Recording..."
                : isCheckedIn
                ? "Register Check Out"
                : "Register Check In"}
            </button>
          </div>
        </div>

        {attendanceMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold border ${
              attendanceMessage.includes("Successfully")
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            {attendanceMessage}
          </div>
        )}

        {/* Profile Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#c2410c]" />
              <span>Personal Details</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Full Name
                </span>
                <p className="font-semibold text-slate-900 mt-0.5">{employee.name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email
                </span>
                <p className="font-semibold text-slate-900 mt-0.5">{employee.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Phone
                </span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {employee.phone || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#c2410c]" />
              <span>Employment & Wage Information</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Designation
                </span>
                <p className="font-semibold text-slate-900 mt-0.5">{employee.role}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Salary (Admin Configured)
                </span>
                <p className="font-bold font-mono text-sm text-[#c2410c] mt-0.5">
                  ৳{employee.salary ? Number(employee.salary).toLocaleString() : "0.00"} BDT
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Hire Date
                </span>
                <p className="font-semibold text-slate-700 mt-0.5 text-[11px]">
                  {new Date(employee.hire_date || employee.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Orders Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#c2410c]" />
              <span>Assigned Fuel Dispatch Orders</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fulfill scheduled fuel dispatches, update delivery status, and handle digital slips
            </p>
          </div>
          <EmployeeOrderManagement employeeId={employee.id} />
        </div>
      </main>
    </div>
  );
}
