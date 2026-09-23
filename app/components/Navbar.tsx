"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Fuel,
  Phone,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  User,
  Truck,
  MapPin,
} from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Live Rates", href: "#rates" },
    { name: "Cost Calculator", href: "#calculator" },
    { name: "Smart Dispatch", href: "#smart-booking" },
    { name: "Services", href: "#services" },
    { name: "Reviews", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              <strong className="text-white">Hotline: 16223</strong> / +880 1800-383535
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              Dhaka Station Hub & Mobile Dispatch
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              BSTI Calibrated & Certified
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <a
              href="#portal-login"
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Sign In to Portal →
            </a>
          </div>
        </div>
      </div>

      {/* Main Clean Header */}
      <nav
        className={`transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/80 py-3"
            : "bg-white border-b border-gray-100 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#c2410c] flex items-center justify-center text-white shadow-sm group-hover:bg-[#9a3412] transition-colors">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Fuel<span className="text-[#c2410c]">Flow</span>
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Station
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium -mt-0.5">
                Fuel Dispatch & Station Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="#portal-login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all hover:border-slate-300"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Portal Login</span>
            </a>

            <a
              href="#calculator"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] shadow-sm transition-all active:scale-95"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Book Fuel Dispatch</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <a
              href="#portal-login"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] sm:hidden"
            >
              Login
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-[#c2410c] hover:bg-slate-50 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </a>
            ))}

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <a
                href="#portal-login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200"
              >
                <User className="w-3.5 h-3.5" />
                Portal
              </a>
              <a
                href="#calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412]"
              >
                <Truck className="w-3.5 h-3.5" />
                Book Delivery
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
