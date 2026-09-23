import {
  Car,
  Building2,
  Truck,
  Wrench,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function StationServices() {
  const services = [
    {
      title: "Doorstep Vehicle Fueling",
      subtitle: "Cars, SUVs & Motorbikes",
      desc: "Avoid gas station queues. Our mobile dispenser arrives at your home driveway, office garage, or roadside parking.",
      icon: Car,
      badge: "On-Demand",
      points: [
        "Certified fuel density and BSTI-calibrated meter",
        "Printed digital receipt with exact centiliters",
        "Clean, spill-proof dispensing equipment",
      ],
      ctaText: "Order for Vehicle",
    },
    {
      title: "Generator & Backup Fueling",
      subtitle: "Offices, Commercial Towers & Hospitals",
      desc: "Maintain continuous power uptime. High-capacity diesel delivery directly to your ground or rooftop generator reservoirs.",
      icon: Building2,
      badge: "Commercial",
      points: [
        "Euro-V ultra-low sulfur clean diesel",
        "Scheduled recurring weekly deliveries",
        "Rapid emergency refueling for outages",
      ],
      ctaText: "Order for Generator",
    },
    {
      title: "Commercial Fleet Accounts",
      subtitle: "Logistics Vans & Trucking Fleets",
      desc: "Centralized fuel billing and vehicle tracking. Eliminate driver cash handling with consolidated monthly VAT invoices.",
      icon: Truck,
      badge: "Enterprise",
      points: [
        "Vehicle tracking & RFID dispensing authorization",
        "Single consolidated monthly VAT-compliant billing",
        "Volume discounts on scheduled monthly quotas",
      ],
      ctaText: "Fleet Program",
    },
    {
      title: "Station Store & Lubricants",
      subtitle: "Engine Oils & Maintenance Supplies",
      desc: "Order genuine synthetic engine oils, coolants, and maintenance supplies delivered alongside your fuel order.",
      icon: Wrench,
      badge: "Supplies",
      points: [
        "Authentic Mobil, Shell, and Total engine oils",
        "Ready-mixed organic radiator coolants",
        "Complimentary tire pressure check upon request",
      ],
      ctaText: "View Supplies",
    },
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
            Operational Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Fuel Delivery & Station Management Services
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Tailored fuel dispatch solutions designed for individual motorists,
            commercial facilities, and enterprise delivery fleets across Bangladesh.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 sm:p-7 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
                  <p className="text-xs text-[#9a3412] font-medium mb-2">{srv.subtitle}</p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {srv.desc}
                  </p>

                  <ul className="space-y-2 pt-3 border-t border-slate-200/60 mb-6 text-xs text-slate-600">
                    {srv.points.map((pt, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#portal-login"
                  className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <span>{srv.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Realistic Metrics Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">1.4M+ L</p>
            <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-medium">
              Fuel Dispatched
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">99.8%</p>
            <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-medium">
              On-Time Rate
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">18 Units</p>
            <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-medium">
              Mobile Tankers
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">4.9 / 5</p>
            <p className="text-xs text-slate-300 mt-1 uppercase tracking-wider font-medium">
              Customer Rating
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
