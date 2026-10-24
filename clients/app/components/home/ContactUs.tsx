import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactInfo = [
  { icon: Mail, label: "hello@dineflow.com", href: "mailto:hello@dineflow.com" },
  { icon: Phone, label: "+234 800 123 4567", href: "tel:+2348001234567" },
  { icon: MapPin, label: "123 Market Street, Lagos, NG", href: "#locations" },
];

const ContactUs = () => {
  return (
    <section
      id="contact"
      className="w-full px-5 sm:px-8 lg:px-12 py-16 lg:py-24 bg-[#241006]/[0.03] dark:bg-white/[0.03]"
    >
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        {/* Info side */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#241006]/50 dark:text-white/50">
            Contact Us
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#241006] dark:text-white">
            Let's talk.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#241006]/70 dark:text-white/70 max-w-md">
            Questions, feedback, or a catering request — reach out and our
            team will get back to you within 24 hours.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {contactInfo.map(({ icon: Icon, label, href }) => (
              
               <a key={label}
                href={href}
                className="flex items-center gap-3 group w-fit"
              >
                <div className="size-9 rounded-full bg-[#241006] dark:bg-white flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-white dark:text-primary" />
                </div>
                <span className="text-sm font-medium text-[#241006] dark:text-white group-hover:underline">
                  {label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Form side */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="rounded-2xl border border-[#241006]/10 dark:border-white/10 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col gap-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-[#241006]/60 dark:text-white/60">
                Name
              </label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="rounded-lg border border-[#241006]/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm text-[#241006] dark:text-white placeholder:text-[#241006]/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#241006] dark:focus:ring-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-[#241006]/60 dark:text-white/60">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="rounded-lg border border-[#241006]/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm text-[#241006] dark:text-white placeholder:text-[#241006]/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#241006] dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-[#241006]/60 dark:text-white/60">
              Message
            </label>
            <textarea
              required
              rows={5}
              placeholder="How can we help?"
              className="resize-none rounded-lg border border-[#241006]/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm text-[#241006] dark:text-white placeholder:text-[#241006]/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#241006] dark:focus:ring-white"
            />
          </div>

          <Button
            type="submit"
            className="mt-2 rounded-full bg-[#241006] dark:bg-white text-white dark:text-primary font-bold uppercase tracking-widest text-sm py-5 hover:scale-[1.02] transition-transform"
          >
            Send Message
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;