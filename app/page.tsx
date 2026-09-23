"use client";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LiveFuelRates from "./components/LiveFuelRates";
import FuelCostCalculator from "./components/FuelCostCalculator";
import SmartDispatchShowcase from "./components/SmartDispatchShowcase";
import StationServices from "./components/StationServices";
import CustomerTestimonials from "./components/CustomerTestimonials";
import LoginForm from "./components/LoginForm";
import {
  Fuel,
  Truck,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  User,
} from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does doorstep fuel delivery work in Bangladesh?",
      a: "You select your required fuel type (Octane 95, Euro-V Diesel, or Regular Unleaded) and amount. You choose an available 2-hour delivery window. Our calibrated mobile dispenser arrives at your home driveway, office parking, or commercial facility and dispenses fuel with digital meters.",
    },
    {
      q: "How is the fuel volume verified accurately?",
      a: "All FuelFlow mobile tankers use digital flowmeters inspected and sealed by the Bangladesh Standards and Testing Institution (BSTI). Before pumping, our driver shows the zero-meter readout, and you receive an automated printed ticket showing the exact liters dispensed.",
    },
    {
      q: "What are the off-peak delivery discounts?",
      a: "Deliveries scheduled during lower traffic hours (08:00 - 10:00 and 14:00 - 16:00) unlock automated time-slot discounts of 10% to 15% to encourage traffic-balanced dispatch operations.",
    },
    {
      q: "What payment options are available?",
      a: "You can pay when fuel is delivered using Cash on Delivery (COD), instant mobile financial services (bKash and Nagad), or debit/credit card via the driver's POS terminal.",
    },
    {
      q: "Can I set up scheduled recurring diesel deliveries for generators?",
      a: "Yes. We offer commercial accounts for corporate towers, garment factories, data centers, and healthcare clinics with weekly or bi-weekly scheduled refills.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-700">
      {/* Sticky Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* ─── CLEAN, HUMAN HERO SECTION ─── */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading and Value Proposition (7 cols) */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-xs font-bold text-[#9a3412]">
                  <span className="w-2 h-2 rounded-full bg-[#c2410c]" />
                  Gas Station & Mobile Fuel Dispatch
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Reliable Fuel Delivery &{" "}
                  <span className="text-[#c2410c]">Station Management</span>
                </h1>

                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  On-demand doorstep refuelling for private cars, automated generator diesel
                  replenishment for commercial facilities, and unified digital station operations.
                  BSTI-calibrated digital meters and guaranteed fuel purity.
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                  <a
                    href="#calculator"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Calculate & Book Delivery</span>
                  </a>

                  <a
                    href="#portal-login"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Station Portal Login</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">BSTI Certified</p>
                      <p className="text-[11px] text-slate-600">Calibrated flowmeters</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-[#c2410c] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">25–40 Min</p>
                      <p className="text-[11px] text-slate-600">Average urban arrival</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-slate-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">18 Tankers</p>
                      <p className="text-[11px] text-slate-600">Active mobile fleet</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Fuel className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Off-Peak -15%</p>
                      <p className="text-[11px] text-slate-600">Time-slot savings</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Live Summary Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Today&apos;s Pump Rates & Status
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      BPC Aligned
                    </span>
                  </div>

                  {/* Rates Snapshot Table */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Octane 95 Super</span>
                        <p className="text-[11px] text-slate-600">Euro-IV Unleaded</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono text-sm">৳130.00</span>
                        <span className="text-slate-600 font-medium text-[11px] block">/ Liter</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Diesel Ultra</span>
                        <p className="text-[11px] text-slate-600">Euro-V Sulfur &lt;10ppm</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#c2410c] font-mono text-sm">৳105.00</span>
                        <span className="text-slate-600 font-medium text-[11px] block">/ Liter</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">Premium Petrol</span>
                        <p className="text-[11px] text-slate-600">RON 90 Regular</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 font-mono text-sm">৳125.00</span>
                        <span className="text-slate-600 font-medium text-[11px] block">/ Liter</span>
                      </div>
                    </div>
                  </div>

                  {/* Off-peak Callout */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                    <span className="font-bold text-amber-800">💡</span>
                    <span>
                      Schedule during off-peak slots (08:00 - 10:00 or 14:00 - 16:00) to receive an automatic 10% to 15% discount.
                    </span>
                  </div>

                  {/* Action Link */}
                  <a
                    href="#calculator"
                    className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Instant Price Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── LIVE FUEL RATES ─── */}
        <LiveFuelRates />

        {/* ─── FUEL COST CALCULATOR ─── */}
        <FuelCostCalculator />

        {/* ─── HOW SMART DISPATCH WORKS ─── */}
        <SmartDispatchShowcase />

        {/* ─── STATION SERVICES ─── */}
        <StationServices />

        {/* ─── CUSTOMER REVIEWS ─── */}
        <CustomerTestimonials />

        {/* ─── PORTAL LOGIN GATEWAY ─── */}
        <section id="portal-login" className="py-16 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center mb-8">
              <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
                Portal Gateway
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Access FuelFlow System
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Sign in to manage fuel orders, register staff shifts, or oversee
                gas station inventory, deliveries, and reports.
              </p>
            </div>

            {/* Login Card */}
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <LoginForm />
            </div>
          </div>
        </section>

        {/* ─── FAQ SECTION ─── */}
        <section id="faq" className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
                Got Questions?
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-[#c2410c] transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#c2410c] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
