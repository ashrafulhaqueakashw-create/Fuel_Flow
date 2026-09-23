"use client";
import { useState, useId, useEffect } from "react";
import {
  Calculator,
  Truck,
  Clock,
  ArrowRight,
  ShieldCheck,
  Percent,
} from "lucide-react";

type FuelChoice = "petrol" | "diesel" | "premium";

interface Props {
  initialFuel?: FuelChoice;
}

const DEFAULT_PRICES: Record<FuelChoice, { name: string; rate: number }> = {
  petrol: { name: "Octane 95 Super", rate: 130.0 },
  diesel: { name: "Diesel Ultra-Low Sulfur", rate: 105.0 },
  premium: { name: "Premium Petrol", rate: 125.0 },
};

export default function FuelCostCalculator({ initialFuel = "petrol" }: Props) {
  const [fuelType, setFuelType] = useState<FuelChoice>(initialFuel);
  const [quantity, setQuantity] = useState<number>(50);
  const [selectedSlotType, setSelectedSlotType] = useState<"standard" | "offpeak_10" | "offpeak_15">(
    "offpeak_15"
  );
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const sliderId = useId();

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const res = await fetch("/api/fuel-prices", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setPrices((prev) => {
              const updated = { ...prev };
              for (const row of json.data) {
                const rate = parseFloat(row.price_per_liter);
                if (row.fuel_type === "gasoline") {
                  updated.petrol = { ...updated.petrol, rate };
                } else if (row.fuel_type === "diesel") {
                  updated.diesel = { ...updated.diesel, rate };
                } else if (row.fuel_type === "premium") {
                  updated.premium = { ...updated.premium, rate };
                }
              }
              return updated;
            });
          }
        }
      } catch (err) {
        console.error("Failed to load calculator prices:", err);
      }
    };

    fetchLivePrices();
  }, []);

  const currentFuel = prices[fuelType];
  const baseCost = quantity * currentFuel.rate;

  let discountPercent = 0;
  if (selectedSlotType === "offpeak_10") discountPercent = 10;
  if (selectedSlotType === "offpeak_15") discountPercent = 15;

  const discountAmount = (baseCost * discountPercent) / 100;
  const deliveryFee = quantity >= 80 ? 0 : 150;
  const finalTotal = baseCost - discountAmount + deliveryFee;

  const quickVolumes = [25, 50, 80, 120, 250, 500];

  const handleBookNow = () => {
    const portal = document.getElementById("portal-login");
    if (portal) portal.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="calculator" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Fuel Cost & Delivery Savings Calculator
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Calculate your exact fuel delivery cost. Select off-peak delivery hours to take
            advantage of time-slot discounts up to 15%.
          </p>
        </div>

        {/* Clean Calculator Card */}
        <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Fuel Type
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(Object.keys(prices) as FuelChoice[]).map((type) => {
                  const item = prices[type];
                  const active = fuelType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFuelType(type)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? "bg-white border-[#c2410c] shadow-sm ring-1 ring-[#c2410c]"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900 truncate">
                        {type === "petrol"
                          ? "Octane 95"
                          : type === "diesel"
                          ? "Diesel"
                          : "Premium"}
                      </span>
                      <span className="block text-xs font-semibold text-[#c2410c] mt-0.5">
                        ৳{item.rate.toFixed(0)} / L
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Liters Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor={sliderId}
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer"
                >
                  2. Quantity Required (Liters)
                </label>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {quantity} <span className="text-xs font-normal text-slate-600">L</span>
                </span>
              </div>

              <input
                id={sliderId}
                type="range"
                min="10"
                max="500"
                step="5"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#c2410c]"
              />

              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="text-xs text-slate-600 mr-1">Quick Select:</span>
                {quickVolumes.map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setQuantity(vol)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      quantity === vol
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {vol}L
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Slot Discount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Dispatch Time Window
              </label>
              <div className="space-y-2">
                <div
                  onClick={() => setSelectedSlotType("offpeak_15")}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedSlotType === "offpeak_15"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Afternoon Off-Peak (14:00 - 16:00)
                      </p>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Low Station Congestion • 15% Discount
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-300">
                    -15% OFF
                  </span>
                </div>

                <div
                  onClick={() => setSelectedSlotType("offpeak_10")}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedSlotType === "offpeak_10"
                      ? "bg-amber-50 border-amber-500 text-amber-950"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Morning Off-Peak (08:00 - 10:00)
                      </p>
                      <p className="text-[11px] text-amber-900 font-medium">
                        Moderate Congestion • 10% Discount
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300">
                    -10% OFF
                  </span>
                </div>

                <div
                  onClick={() => setSelectedSlotType("standard")}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedSlotType === "standard"
                      ? "bg-slate-100 border-slate-400 text-slate-900"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Standard / Peak Rush Window</p>
                      <p className="text-[11px] text-slate-600">Regular station pump pricing</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600">Regular</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Receipt (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Order Summary
                </span>
                <span className="text-[11px] text-slate-600 font-medium">Estimated</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>
                    {currentFuel.name} ({quantity} L)
                  </span>
                  <span className="font-semibold text-slate-900 font-mono">
                    ৳{baseCost.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>Off-Peak Time-Slot Savings ({discountPercent}%)</span>
                    <span className="font-mono">
                      -৳{discountAmount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery & Dispense Fee</span>
                  <span className="font-semibold font-mono">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-800 font-bold">FREE (80L+)</span>
                    ) : (
                      `৳${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Total Net Amount</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-slate-900">৳</span>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    {finalTotal.toLocaleString("en-BD", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-xs text-slate-600 ml-1">BDT</span>
                </div>

                {discountAmount > 0 && (
                  <p className="text-[11px] text-emerald-800 mt-1 font-medium">
                    You save ৳{discountAmount.toFixed(0)} with this off-peak time slot.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <button
                type="button"
                onClick={handleBookNow}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Book This Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[10px] text-slate-600">
                Pay upon arrival via Cash, bKash, Nagad, or Card
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
