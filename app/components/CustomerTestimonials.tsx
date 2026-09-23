import { Star, CheckCircle, Quote } from "lucide-react";

export default function CustomerTestimonials() {
  const testimonials = [
    {
      name: "Tanvir Ahmed",
      role: "Logistics Manager",
      company: "Apex Parcel Network (35 Delivery Vans)",
      initials: "TA",
      rating: 5,
      fuelType: "Euro-V Diesel",
      comment:
        "FuelFlow eliminated the need for our drivers to waste an hour queuing at congested fuel pumps every morning. Their tanker refuels our entire delivery van fleet at our Tejgaon warehouse each night.",
      date: "September 2026",
    },
    {
      name: "Dr. Farhana Yasmin",
      role: "Facilities Director",
      company: "CareMed Specialist Hospital",
      initials: "FY",
      rating: 5,
      fuelType: "Generator Standby Diesel",
      comment:
        "During grid interruptions, hospital generators require guaranteed clean diesel. FuelFlow's scheduled weekly delivery ensures our tanks never drop below the reserve threshold. The BSTI meter slips give us complete accountability.",
      date: "August 2026",
    },
    {
      name: "Nafis Rahman",
      role: "Vehicle Owner",
      company: "Gulshan Resident",
      initials: "NR",
      rating: 5,
      fuelType: "Octane 95 Super",
      comment:
        "I booked an off-peak slot on Sunday morning through their Smart Booking. Saved 15% on the delivery, and the mobile dispenser arrived right in front of my garage with calibrated digital meters.",
      date: "September 2026",
    },
  ];

  return (
    <section id="reviews" className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-bold text-[#9a3412] tracking-wider uppercase">
            Customer Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Trusted by Daily Drivers & Logistics Fleets
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Read verified reviews from individual vehicle owners, commercial building managers,
            and transport directors who rely on FuelFlow.
          </p>
        </div>

        {/* 3 Clean Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{t.date}</span>
                </div>

                <div className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold mb-3">
                  {t.fuelType}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {t.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <p className="text-[11px] text-slate-600">{t.role}</p>
                  <p className="text-[10px] text-slate-600">{t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
