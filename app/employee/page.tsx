"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/employee/logout", { method: "POST" });
      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      // Force redirect even if logout fails
      router.push("/employee-login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/employee-login")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome, {employee.name}!
          </h2>
          <p className="text-gray-600">Role: {employee.role}</p>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Full Name
                </label>
                <p className="text-gray-900">{employee.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">{employee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">
                  {employee.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Employee ID
                </label>
                <p className="text-gray-900">
                  EMP-{employee.id.toString().padStart(4, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Work Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Position
                </label>
                <p className="text-gray-900">{employee.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Hire Date
                </label>
                <p className="text-gray-900">
                  {new Date(employee.hire_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.status.charAt(0).toUpperCase() +
                    employee.status.slice(1)}
                </span>
              </div>
              {employee.salary && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Salary
                  </label>
                  <p className="text-gray-900">
                    ${employee.salary.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors">
              View Schedule
            </button>
            <button className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition-colors">
              Clock In/Out
            </button>
            <button className="bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 transition-colors">
              Request Leave
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
