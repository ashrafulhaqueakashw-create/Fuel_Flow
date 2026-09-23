"use client";
import { useState, useEffect } from "react";
import {
  Fuel,
  CheckCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

type FuelRate = {
  id: string;
  name: string;
  grade: string;
  category: "gasoline" | "diesel" | "premium" | "gas";
  price: number;
  unit: string;
  change: string;
  stockStatus: string;
  stockLiters: string;
  specs: string[];
  popular?: boolean;
};

const FUEL_RATES: FuelRate[] = [
  {
    id: "octane-95",
    name: "Octane 95 Super",
    grade: "Euro-IV Grade • RON 95",
    category: "gasoline",
    price: 130.0,
    unit: "Liter",
    change: "Current BPC Rate",
    stockStatus: "In Stock",
    stockLiters: "14,500 L",
    specs: ["Minimum RON 95 Rating", "High anti-knock performance", "Injector cleaning formula"],
    popular: true,
  },
  {
    id: "diesel-euro5",
    name: "Diesel Ultra-Low Sulfur",
    grade: "Euro-V Grade • Cetane 51",
    category: "diesel",
    price: 105.0,
    unit: "Liter",
    change: "Current BPC Rate",
    stockStatus: "In Stock",
    stockLiters: "28,200 L",
    specs: ["Sulfur content < 10 ppm", "Ideal for fleet & generators", "Clean combustion Euro-V"],
    popular: false,
  },
  {
    id: "premium-gas",
    name: "Premium Petrol",
    grade: "Unleaded Regular • RON 90",
    category: "premium",
    price: 125.0,
    unit: "Liter",
    change: "Current BPC Rate",
    stockStatus: "In Stock",
    stockLiters: "11,800 L",
    specs: ["Clean burn unleaded", "Smooth cold-start ignition", "Balanced engine response"],
    popular: false,
  },
  {
    id: "cng-gas",
    name: "Compressed Natural Gas",
    grade: "Station CNG • 200 Bar",
    category: "gas",
    price: 48.5,
    unit: "m³",
    change: "Regulated",
    stockStatus: "Available",
    stockLiters: "4 Active Bays",
    specs: ["High-pressure dispense", "98% methane composition", "Direct station dispenser"],
    popular: false,
  },
];

interface Props {
  onSelectFuel?: (fuelType: "petrol" | "diesel" | "gas") => void;
}

export default function LiveFuelRates({ onSelectFuel }: Props) {
  const [selectedId, setSelectedId] = useState("octane-95");
  const [rates, setRates] = useState<FuelRate[]>(FUEL_RATES);

  // Load real-time fuel prices updated by the Admin
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const res = await fetch("/api/fuel-prices", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setRates((prev) =>
              prev.map((item) => {
                const found = json.data.find(
                  (d: any) =>
                    d.fuel_type?.toLowerCase() === item.category.toLowerCase() ||
                    (item.category === "gasoline" && d.fuel_type === "gasoline") ||
                    (item.category === "gas" && d.fuel_type === "cng")
                );
                if (found && found.price_per_liter) {
                  return {
                    ...item,
                    price: parseFloat(found.price_per_liter),
                    change: "Admin Synchronized",
                  };
                }
                return item;
              })
            );
          }
        }
      } catch (err) {
        console.error("Failed to load live rates:", err);
      }
    };

    fetchLivePrices();
  }, []);

  const handleOrderClick = (fuel: FuelRate) => {
    setSelectedId(fuel.id);
    if (onSelectFuel) {
      if (fuel.category === "diesel") onSelectFuel("diesel");
      else if (fuel.category === "gas") onSelectFuel("gas");
      else onSelectFuel("petrol");
    }
    const el = document.getElementById("calculator");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="rates" className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
              Current Pump & Dispatch Rates
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Live Fuel Prices & Availability
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Officially synchronized with Bangladesh Petroleum Corporation (BPC) price regulations.
              All delivery units use BSTI-calibrated digital flow meters.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Updated Today • Station Tanks Online</span>
          </div>
        </div>

        {/* Rates Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rates.map((fuel) => {
            const isSelected = selectedId === fuel.id;
            return (
              <div
                key={fuel.id}
                onClick={() => setSelectedId(fuel.id)}
                className={`bg-white rounded-2xl p-6 transition-all duration-200 cursor-pointer border flex flex-col justify-between relative ${
                  isSelected
                    ? "border-orange-500 shadow-md ring-2 ring-orange-500/10"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {fuel.popular && (
                  <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-[#c2410c] text-white font-semibold text-[10px] tracking-wide uppercase shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{fuel.name}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{fuel.grade}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-700" />
                      {fuel.stockStatus}
                    </span>
                  </div>

                  {/* Price display */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-semibold text-slate-600">৳</span>
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                        {fuel.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-600 font-medium ml-0.5">
                        / {fuel.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1">
                      <span>{fuel.change}</span>
                      <span>Tank: {fuel.stockLiters}</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <ul className="space-y-2 mb-6 text-xs text-slate-600">
                    {fuel.specs.map((spec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#c2410c] font-bold">✓</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrderClick(fuel);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isSelected
                      ? "bg-[#c2410c] hover:bg-[#9a3412] text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Calculate & Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
