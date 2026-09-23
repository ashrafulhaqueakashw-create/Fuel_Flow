import {
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  TrendingDown,
} from "lucide-react";

export default function SmartDispatchShowcase() {
  const steps = [
    {
      step: "1",
      title: "Select Fuel Grade & Amount",
      desc: "Specify your required fuel type (Octane 95, Euro-5 Diesel, or Regular) and volume.",
    },
    {
      step: "2",
      title: "Choose a Delivery Time Slot",
      desc: "Select an available 2-hour window. Off-peak slots automatically include discounts up to 15%.",
    },
    {
      step: "3",
      title: "Metered Delivery & Receipt",
      desc: "Our driver dispenses your fuel with BSTI-certified digital meters and issues an instant receipt.",
    },
  ];

  return (
    <section id="smart-booking" className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
            Congestion-Aware Scheduling
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            How Smart Time-Slot Dispatch Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            By shifting deliveries away from traffic rush hours, FuelFlow reduces urban idle time
            and passes the operational savings directly to you.
          </p>
        </div>

        {/* 3 Congestion Windows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Low */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Low Congestion (0–49%)
              </span>
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                -15% Discount
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Off-Peak Windows</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Station tanks and delivery trucks have ample availability. Best for backup generator refills and scheduled fleet top-ups.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Immediate driver dispatch</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Highest delivery discount applies</span>
              </li>
            </ul>
          </div>

          {/* Medium */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Moderate (50–79%)
              </span>
              <span className="text-xs font-extrabold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded">
                -5% to -10% Off
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Standard Delivery Hours</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Regular demand across the city. Vehicles are batched by localized delivery zones for optimal routing.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Guaranteed 45-minute window</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Batch routing efficiency</span>
              </li>
            </ul>
          </div>

          {/* High */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Peak Rush (&gt;80%)
              </span>
              <span className="text-xs font-semibold text-slate-600">Regular Rate</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Rush Hour Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Peak traffic periods. Deliveries continue with real-time driver tracking for emergency and essential refueling.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Live GPS driver tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>Priority urban routing</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3 Step Process Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {st.step}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{st.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
