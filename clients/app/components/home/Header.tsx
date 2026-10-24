import { useState } from "react";
import { Utensils, Menu, X } from "lucide-react";
import Theme from "@/components/sidebar/Theme";
import { authClient } from "@/lib/auth-client";
import { Link } from "react-router";
import { CartSheet } from "../global/OrderSummary";
import { smoothScrollTo } from "@/lib/scrollTo";

// const navLinks = [
//   { href: "#items", label: "Menu +" },
//   { href: "#about", label: "About Us" },
//   { href: "#locations", label: "Locations" },
//   { href: "#resources", label: "Resources" },
//   { href: "#contact", label: "Contact Us" },
// ];


const navLinks = [
  { id: "items", label: "Menu +" },
  { id: "about", label: "About Us" },
  { id: "locations", label: "Locations" },
  { id: "resources", label: "Resources" },
  { id: "contact", label: "Contact Us" },
];

const Header = () => {
  const { data } = authClient.useSession();
  // const [mobileOpen, setMobileOpen] = useState(false);

  const isAdminOrManager =
    data?.user.role === "ADMIN" || data?.user.role === "MANAGER";
  const isStaff = data?.user.role === "STAFF" || data?.user.role === "KITCHEN";

  const navigateTo = isAdminOrManager
    ? "/dashboard"
    : isStaff
      ? "/pos/new-order"
      : "/dashboard";

  return (
    <div className="relative z-50 w-full mx-auto px-5 sm:px-8 lg:px-12 py-4 lg:py-8 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
        <div className="size-8 lg:size-10 rounded-full bg-[#241006] dark:bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
          <Utensils className="text-white dark:text-primary size-4 lg:size-6" />
        </div>
        <span className="text-base sm:text-lg lg:text-2xl font-black tracking-tighter uppercase text-[#241006] dark:text-white">
          Dine Flow
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden lg:flex items-center gap-10">
        {navLinks.map((link) => (

          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(link.id);
              // setMobileOpen(false); 
            }}
            className="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Theme />

        {!data?.session && (
          <Link
            to="/signin"
            className="bg-[#241006] dark:bg-white text-white dark:text-primary px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg whitespace-nowrap"
          >
            Sign In
          </Link>
        )}

        {data?.session && (
          <>
            {data?.user.role !== "CUSTOMER" && (
              <Link
                to={navigateTo}
                className="bg-[#241006] dark:bg-white text-white dark:text-primary px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
              >
                {isStaff && "POS"}
                {isAdminOrManager && "Admin"}
              </Link>
            )}

            {data.user.image === "" && (
              <Link
                to={`/profile/${data.user.id}`}
                className="hidden sm:block text-sm font-medium text-[#241006] dark:text-white"
              >
                Welcome, {data.user.name}
              </Link>
            )}

            <CartSheet />

            {data.user.image !== "" && (
              <Link to={`/profile/${data.user.id}`}>
                <img
                  src={data.user.image || ""}
                  alt="Profile"
                  className="size-8 rounded-full border-2 border-[#241006] dark:border-white"
                />
              </Link>
            )}
          </>
        )}

        {/* Mobile menu toggle */}
        {/* <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden flex items-center justify-center size-9 rounded-full border border-[#241006]/20 dark:border-white/20 text-[#241006] dark:text-white"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button> */}
      </div>

      {/* Mobile nav panel */}
      {/* {mobileOpen && (
        <div className="absolute top-full left-0 w-full lg:hidden bg-white dark:bg-[#241006] border-t border-[#241006]/10 dark:border-white/10 shadow-lg px-5 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
              <a key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )} */}
    </div>
  );
};

export default Header;


// import { Utensils } from "lucide-react";
// import Theme from "@/components/sidebar/Theme";
// import { authClient } from "@/lib/auth-client";
// import { Link } from "react-router";
// import { CartSheet } from "../global/OrderSummary";

// const Header = () => {
//   const { data } = authClient.useSession();
//   const isAdminOrManager =
//     data?.user.role === "ADMIN" || data?.user.role === "MANAGER";
//   const isStaff = data?.user.role === "STAFF" || data?.user.role === "KITCHEN";


//   const navigateTo = isAdminOrManager
//     ? "/dashboard"
//     : isStaff
//       ? "/pos/new-order"
//       : "/dashboard";


//   return (
//     <div className="relative z-50 w-full lg:max-w-full mx-auto px- lg:px-12 py-8 flex items-center justify-between">
//       <div className="flex items-center gap-2 group cursor-pointer">
//         <div className="size-6 lg:size-10 rounded-full bg-[#241006] dark:bg-white flex items-center justify-center transition-transform group-hover:rotate-12">
//           <Utensils className="text-white dark:text-primary size-4 lg:size-6" />
//         </div>
//         <span className="text-lg lg:text-2xl font-black tracking-tighter uppercase text-[#241006] dark:text-white">
//           Dine Flow
//         </span>
//       </div>
//       <div className="hidden lg:flex items-center gap-10">
//         <a
//           href="#menu"
//           className="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors"
//         >
//           Menu +
//         </a>
//         <a
//           href="#about"
//           className="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors"
//         >
//           About Us
//         </a>
//         <a
//           href="#locations"
//           className="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors"
//         >
//           Locations
//         </a>
//         <a
//           href="#resources"
//           className="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors"
//         >
//           Resources
//         </a>
//         <a
//           href="#contact"
//           className="text-sm font-bold text-[#241006]/70 dark:text-white/70 hover:text-[#241006] dark:hover:text-white transition-colors"
//         >
//           Contact Us
//         </a>
//       </div>

//       <div className="flex items-center gap-4">
//         <Theme />
//         {!data?.session && (
//           <Link
//             to="/signin"
//             className="bg-[#241006] dark:bg-white text-white dark:text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
//           >
//             Sign In
//           </Link>
//         )}
//         {data?.session && (
//           <>
//             {data?.user.role !== "CUSTOMER" && (
//               <Link
//                 to={navigateTo}
//                 className="bg-[#241006] dark:bg-white text-white dark:text-primary px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
//               >
//                 {isStaff && "POS"}
//                 {isAdminOrManager && "Admin"}
//               </Link>
//             )}
//             {data.user.image === "" && (
//               <Link
//                 to={`/profile/${data.user.id}`}
//                 className="text-sm font-medium text-[#241006] dark:text-white"
//               >
//                 Welcome, {data.user.name}
//               </Link>
//             )}
//             <CartSheet />
//             {data.user.image !== "" && (
//               <Link to={`/profile/${data.user.id}`}>
//                 <img
//                   src={data.user.image || ""}
//                   alt="Profile"
//                   className="size-8 rounded-full border-2 border-[#241006] dark:border-white"
//                 />
//               </Link>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Header;
