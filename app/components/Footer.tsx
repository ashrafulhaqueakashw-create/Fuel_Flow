import Link from "next/link";
import {
  Fuel,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c2410c] flex items-center justify-center text-white shadow-sm">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Fuel<span className="text-orange-400">Flow</span>
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 ml-2 border border-slate-700">
                  Station Console
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Gas station operations and on-demand doorstep fuel dispatch logistics.
              Providing guaranteed fuel density, BSTI-calibrated digital flow meters,
              and dedicated commercial fleet refueling.
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Dispatch Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                BSTI Calibrated
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white tracking-wider uppercase">
              Portals & Access
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#portal-login" className="hover:text-white transition-colors">
                  Customer Dashboard
                </a>
              </li>
              <li>
                <a href="#portal-login" className="hover:text-white transition-colors">
                  Staff Shift Terminal
                </a>
              </li>
              <li>
                <a href="#portal-login" className="hover:text-white transition-colors">
                  Admin Operations Console
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  Delivery Cost Calculator
                </a>
              </li>
              <li>
                <a href="#smart-booking" className="hover:text-white transition-colors">
                  Time-Slot Congestion Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Fuel Products */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white tracking-wider uppercase">
              Fuel Products
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#rates" className="hover:text-white transition-colors">
                  Octane 95 Super (Euro-IV)
                </a>
              </li>
              <li>
                <a href="#rates" className="hover:text-white transition-colors">
                  Diesel Ultra-Low Sulfur (Euro-V)
                </a>
              </li>
              <li>
                <a href="#rates" className="hover:text-white transition-colors">
                  Premium Unleaded Petrol
                </a>
              </li>
              <li>
                <a href="#rates" className="hover:text-white transition-colors">
                  Compressed Natural Gas (CNG)
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  Fleet Diesel Quota Contracts
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Hub */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white tracking-wider uppercase">
              Station Location
            </p>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>Plot 42, Station Boulevard, Tejgaon Industrial Area, Dhaka 1208</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hotline: <strong>16223</strong> / +880 1800-383535</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>support@fuelflow.com.bd</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>24/7 Automated Dispatch Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span>© 2026 FuelFlow Bangladesh. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Payment Methods:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">
                Cash
              </span>
              <span className="px-2 py-0.5 rounded bg-pink-950/60 border border-pink-800 text-pink-300 text-[10px] font-bold">
                bKash
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-950/60 border border-orange-800 text-orange-300 text-[10px] font-bold">
                Nagad
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300 text-[10px] font-semibold">
                Card / POS
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
