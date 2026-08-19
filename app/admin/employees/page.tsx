"use client";
import React from "react";
import { useRouter } from "next/navigation";
import EmployeeForm from "../../components/EmployeeForm";

export default function AdminEmployeesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-slate-900 text-white relative overflow-hidden py-8 px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[50%] -left-[10%] w-[40%] h-[150%] rounded-full bg-emerald-600/10 blur-[100px]" />
          <div className="absolute -bottom-[50%] -right-[10%] w-[40%] h-[150%] rounded-full bg-fuel-orange/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">👔</span>
              <h1 className="text-2xl font-black tracking-tight">
                Employee<span className="text-fuel-orange font-black">s</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/10">
                Staff Control
              </span>
            </div>
            <p className="text-sm text-gray-400">Register new team members and manage current staff records</p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/5 transition-all duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <EmployeeForm />
      </main>
    </div>
  );
}
