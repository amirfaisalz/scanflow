"use client";


const companies = [
  { name: "Shopify", label: "Shopify" },
  { name: "DoorDash", label: "DoorDash" },
  { name: "Uber", label: "Uber" },
  { name: "Vercel", label: "Vercel" },
  { name: "Linear", label: "Linear" },
  { name: "Supabase", label: "Supabase" },
  { name: "Raycast", label: "Raycast" },
  { name: "Retool", label: "Retool" },
  { name: "Stripe", label: "Stripe" },
  { name: "Airbnb", label: "Airbnb" },
];

export function SocialProofTicker() {
  return (
    <section className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-10 sm:py-14 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-8">
          Powering intelligent QR conversion routing for 10,000+ growth teams &amp; enterprises
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12 opacity-80 hover:opacity-100 transition-opacity">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold tracking-tight text-sm sm:text-base grayscale hover:grayscale-0 transition-all duration-200"
            >
              <div className="size-2 rounded-full bg-[#FA5D29]/70" />
              <span>{company.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
