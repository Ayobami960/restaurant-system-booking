import { Outlet, useNavigate, useLocation, Navigate } from "react-router";
import toast from "react-hot-toast";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/global/Loader";
import type { roles } from "@/type";
import { useEffect } from "react";
import { data, getRouteConfig } from "@/components/sidebar/nav-data";

const DasboardLayout = () => {
  const {
    data: session,
    isPending, //loading state
    error, //error object
  } = authClient.useSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // instead of the the ealier approach we will be using a useEffect hook and nav-data.ts
  // 1. Get current User Role (default to patient/guest)
  const userRole = (session?.user?.role as roles) || "CUSTOMER";

  useEffect(() => {
    if (isPending) return;

    // 2. Find configuration for current path
    // We combine all arrays to search through everything
    const allNavItems = [...data.adminNav, ...data.posNav];
    const currentRouteConfig = getRouteConfig(pathname, allNavItems);

    // 3. Check Permissions
    if (currentRouteConfig) {
      const hasAccess = currentRouteConfig.allowedRoles.includes(userRole);

      if (!hasAccess) {
        toast.error("Unauthorized Access");
        // Redirect to a safe page based on role, or just dashboard
        navigate("/", { replace: true });
      }
    }
  }, [pathname, userRole, isPending, navigate]);

  if (isPending) {
    return <Loader title="Loading user session..." className="min-h-screen" />;
  }

  if (error) {
    toast.error("Failed to load user session. Please try again.");
  }

  // Redirect if logged in
  if (!session) {
    return <Navigate to="/signin" replace />;
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="bg-card/50">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DasboardLayout;
