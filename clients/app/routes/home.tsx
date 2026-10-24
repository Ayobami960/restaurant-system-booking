import Items from "@/components/global/Items";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Locations from "@/components/home/Locations";
import Resources from "@/components/home/Resources";
import ContactUs from "@/components/home/ContactUs";
import BackToTop from "@/components/global/BackToTop";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Order your favorite meals " },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="space-y-2 p-3">
      <Hero />
      <div
        className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
        id="items"
      >
        <h1 className="font-bold text-xl text-primary mb-4 ml-5 mt-3">
          Choose Any Meal From Here
        </h1>
        <Items />
      </div>

      <About />
      <Locations />
      <Resources />
      <ContactUs />

      <BackToTop />
    </div>
  );
}