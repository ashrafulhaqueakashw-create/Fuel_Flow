"use client";
import Link from "next/link";
import { Fuel, Briefcase, ArrowLeft } from "lucide-react";
import LoginForm from "../components/LoginForm";

export default function EmployeeLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-orange-100 selection:text-orange-700">
      {/* Top Header */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
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
                Staff Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">
              Station & Dispatch Operations
            </p>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Home</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Staff & Dispatch Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to record shift attendance and fulfill orders
            </p>
          </div>

          <LoginForm defaultUserType="employee" />
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="py-6 text-center text-xs text-slate-400">
        FuelFlow Petroleum & Logistics System • BSTI Certified Operations
      </div>
    </div>
  );
}
