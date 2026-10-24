import { BookOpenText, HelpCircle, Newspaper, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

const resources = [
  {
    icon: HelpCircle,
    title: "FAQs",
    description: "Answers to the most common questions about ordering, payments, and delivery.",
    to: "/faqs",
  },
  {
    icon: BookOpenText,
    title: "Ordering Guide",
    description: "A quick walkthrough of how to place, track, and manage your orders.",
    to: "/guide",
  },
  {
    icon: Newspaper,
    title: "Blog & News",
    description: "Updates on new menu items, promotions, and what's happening at Dine Flow.",
    to: "/blog",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Terms",
    description: "Learn how we handle your data and the terms behind using our platform.",
    to: "/privacy",
  },
];

const Resources = () => {
  return (
    <section
      id="resources"
      className="w-full px-5 sm:px-8 lg:px-12 py-16 lg:py-24"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#241006]/50 dark:text-white/50">
            Resources
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#241006] dark:text-white">
            Helpful Resources
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#241006]/70 dark:text-white/70">
            Everything you need to know, all in one place.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {resources.map(({ icon: Icon, title, description, to }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-2xl border border-[#241006]/10 dark:border-white/10 bg-white dark:bg-slate-900 p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg transition-all"
            >
              <div className="size-10 rounded-full bg-[#241006]/5 dark:bg-white/10 flex items-center justify-center group-hover:bg-[#241006] dark:group-hover:bg-white transition-colors">
                <Icon className="size-5 text-[#241006] dark:text-white group-hover:text-white dark:group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#241006] dark:text-white">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-[#241006]/70 dark:text-white/70">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Resources;