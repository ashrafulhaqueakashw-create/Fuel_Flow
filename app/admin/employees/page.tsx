import React from "react";
import EmployeeForm from "../../components/EmployeeForm";

export default function AdminEmployeesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Employees</h1>
        <EmployeeForm />
        <div className="mt-8 bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Recent employees</h2>
          <p className="text-sm text-gray-500">
            List view placeholder — hook to /api/employees
          </p>
        </div>
      </div>
    </div>
  );
}
