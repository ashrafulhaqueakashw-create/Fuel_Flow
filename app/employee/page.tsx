"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    } catch (err) {
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
          setAttendanceMessage("Successfully checked in!");
        } else {
          setIsCheckedIn(false);
          setCheckInTime(null);
          setAttendanceMessage("Successfully checked out!");
        }

        setTimeout(() => setAttendanceMessage(""), 3000);
      } else {
        setAttendanceMessage(data.message || "Failed to update attendance");
      }
    } catch (err: any) {
      setAttendanceMessage("Error updating attendance");
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 text-center max-w-sm">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.push("/employee-login")}
            className="w-full py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-slate-900 text-white relative overflow-hidden py-8 px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[150%] rounded-full bg-emerald-600/10 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[40%] h-[150%] rounded-full bg-fuel-orange/5 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">⚡</span>
              <h1 className="text-2xl font-black tracking-tight">
                Fuel<span className="text-fuel-orange font-black">Flow</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/10">
                Staff Dashboard
              </span>
            </div>
            <p className="text-sm text-gray-400">Welcome, {employee.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:shadow-md">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Welcome Back, {employee.name}!
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Role Designation: {employee.role}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {employee.status}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm transition-all duration-300 hover:shadow-md">
            <h3 className="text-base font-bold text-gray-800 mb-5">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Full Name
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{employee.name}</p>
              </div>
              <div className="pb-3 border-b border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{employee.email}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Phone
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {employee.phone || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm transition-all duration-300 hover:shadow-md">
            <h3 className="text-base font-bold text-gray-800 mb-5">
              Work Information
            </h3>
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Position/Role
                </label>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{employee.role}</p>
              </div>
              <div className="pb-3 border-b border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Staff ID
                </label>
                <p className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  EMP-{employee.id.toString().padStart(4, "0")}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Hire Date
                </label>
                <p className="text-xs font-semibold text-gray-500 mt-0.5">
                  {new Date(employee.hire_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Control Panel */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="text-base font-bold text-gray-800 mb-2">
            Shift Registration
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Register your check-in/out timestamp for dispatch assignment records.
          </p>

          {/* Messages */}
          {isCheckedIn && checkInTime && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              <span>Shift Active: Checked In at {new Date(checkInTime).toLocaleTimeString()}</span>
            </div>
          )}

          {attendanceMessage && (
            <div
              className={`mb-5 p-4 rounded-2xl text-xs font-semibold border ${attendanceMessage.includes("Successfully")
                  ? "bg-green-50 border-green-100 text-green-800"
                  : "bg-red-50 border-red-100 text-red-800"
                }`}
            >
              {attendanceMessage}
            </div>
          )}

          <div>
            <button
              onClick={handleAttendanceToggle}
              disabled={attendanceLoading}
              className={`w-full max-w-xs py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 ${isCheckedIn
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/10"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/10"
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

        {/* Order Management Section */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm transition-all duration-300 hover:shadow-md">
          <EmployeeOrderManagement employeeId={employee.id} />
        </div>
      </main>
    </div>
  );
}
