import { Clock, MapPin, Phone } from "lucide-react";

const locations = [
  {
    name: "Dine Flow — Downtown",
    address: "123 Market Street, Lagos, NG",
    phone: "+234 800 123 4567",
    hours: "Mon – Sun: 9:00 AM – 11:00 PM",
  },
  {
    name: "Dine Flow — Lekki",
    address: "45 Admiralty Way, Lekki, Lagos, NG",
    phone: "+234 800 765 4321",
    hours: "Mon – Sun: 10:00 AM – 10:00 PM",
  },
  {
    name: "Dine Flow — Ikeja",
    address: "12 Allen Avenue, Ikeja, Lagos, NG",
    phone: "+234 800 999 8888",
    hours: "Mon – Sun: 9:00 AM – 11:00 PM",
  },
];

const Locations = () => {
  return (
    <section
      id="locations"
      className="w-full px-5 sm:px-8 lg:px-12 py-16 lg:py-24 bg-[#241006]/3 dark:bg-white/3"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#241006]/50 dark:text-white/50">
            Find Us
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#241006] dark:text-white">
            Our Locations
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#241006]/70 dark:text-white/70">
            Stop by one of our branches or order online for delivery.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className="rounded-2xl border border-[#241006]/10 dark:border-white/10 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-black text-lg text-[#241006] dark:text-white">
                {loc.name}
              </h3>

              <div className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 shrink-0 text-[#241006]/50 dark:text-white/50" />
                <p className="text-sm text-[#241006]/70 dark:text-white/70">
                  {loc.address}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="size-4 mt-0.5 shrink-0 text-[#241006]/50 dark:text-white/50" />
                <p className="text-sm text-[#241006]/70 dark:text-white/70">
                  {loc.phone}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="size-4 mt-0.5 shrink-0 text-[#241006]/50 dark:text-white/50" />
                <p className="text-sm text-[#241006]/70 dark:text-white/70">
                  {loc.hours}
                </p>
              </div>

              
                <a href={`https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs font-bold uppercase tracking-widest text-[#241006] dark:text-white hover:underline"
              >
                Get Directions →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Locations;