import { Award, Clock, Users, Utensils } from "lucide-react";

const stats = [
  { icon: Utensils, value: "50+", label: "Menu Items" },
  { icon: Users, value: "10K+", label: "Happy Customers" },
  { icon: Award, value: "8", label: "Years of Service" },
  { icon: Clock, value: "24/7", label: "Order Support" },
];

const About = () => {
  return (
    <section
      id="about"
      className="w-full px-5 sm:px-8 lg:px-12 py-16 lg:py-24"
    >
      <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        {/* Text side */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#241006]/50 dark:text-white/50">
            About Us
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#241006] dark:text-white">
            Good food, served the way it should be.
          </h2>
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#241006]/70 dark:text-white/70">
            Dine Flow started as a single kitchen with a simple idea: great
            meals shouldn't come with a slow, clunky ordering experience.
            Today we combine fresh, locally-sourced ingredients with a
            streamlined ordering system so you spend less time waiting and
            more time enjoying your food.
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#241006]/70 dark:text-white/70">
            From our kitchen to your table — or your front door — every order
            is prepared fresh and tracked in real time.
          </p>
        </div>

        {/* Stats side */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-[#241006]/10 dark:border-white/10 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col gap-3 hover:-translate-y-1 transition-transform"
            >
              <div className="size-10 rounded-full bg-[#241006] dark:bg-white flex items-center justify-center">
                <Icon className="size-5 text-white dark:text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-[#241006] dark:text-white">
                  {value}
                </p>
                <p className="text-xs font-bold uppercase tracking-wide text-[#241006]/50 dark:text-white/50">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;