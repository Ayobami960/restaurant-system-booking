import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/provider/theme-provider";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", icon: Sun, label: "Light theme" },
  { value: "dark", icon: Moon, label: "Dark theme" },
  { value: "system", icon: Monitor, label: "System theme" },
] as const;

const Theme = () => {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-[#241006]/5 dark:bg-white/10 border border-[#241006]/10 dark:border-white/10">
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center justify-center size-7 lg:size-8 rounded-full transition-all",
              isActive
                ? "bg-[#241006] dark:bg-white text-white dark:text-[#241006] shadow-sm scale-105"
                : "text-[#241006]/50 dark:text-white/50 hover:text-[#241006] dark:hover:text-white hover:bg-[#241006]/10 dark:hover:bg-white/10"
            )}
          >
            <Icon className="size-4" strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
};

export default Theme;

// import { useTheme } from "@/components/provider/theme-provider";
// import { Button } from "@/components/ui/button";

// const Theme = () => {
//   const { setTheme, theme } = useTheme();

//   return (
//     <div className="flex gap-2 mb-1">
//       <Button
//         variant={theme === "light" ? "default" : "ghost"}
//         size={"icon-lg"}
//         className="text-xl"
//         onClick={() => setTheme("light")}
//       >
//         🌞
//       </Button>
//       <Button
//         variant={theme === "dark" ? "default" : "ghost"}
//         size={"icon-lg"}
//         className="text-xl"
//         onClick={() => setTheme("dark")}
//       >
//         🌜
//       </Button>
//       <Button
//         variant={theme === "system" ? "default" : "ghost"}
//         size={"icon-lg"}
//         className="text-xl"
//         onClick={() => setTheme("system")}
//       >
//         🖥️
//       </Button>
//     </div>
//   );
// };

// export default Theme;
