"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fuel, Users, Phone, MapPin, ShieldCheck, ArrowLeft } from "lucide-react";
import CustomerForm from "../../components/CustomerForm";

export default function AdminCustomersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-700 w-full overflow-x-hidden">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-3 sm:px-4 border-b border-slate-800 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 text-slate-300 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <strong className="text-white">Hotline: 16223</strong>
              <span className="hidden sm:inline text-slate-400">/ +880 1800-383535</span>
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              Dhaka Station Hub & Mobile Dispatch Fleet
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <span className="inline-flex items-center gap-1.5 text-blue-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Customer Accounts Administration</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav Header */}
      <header className="bg-white border-b border-slate-200 w-full">
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
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Customer Portal Accounts
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">
                  Manage individual and commercial clients, alter passwords, and addresses
                </p>
              </div>
            </Link>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all ml-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 min-w-0 overflow-hidden">
        <CustomerForm />
      </main>
    </div>
  );
}
