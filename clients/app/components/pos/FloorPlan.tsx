import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { customFetch, deleteTable, updateTableStatus } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";
import type { TablesProps } from "@/type";
import Loader from "@/components/global/Loader";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import CreateEdit from "@/components/tables/CreateEdit";
import { posCart } from "@/store";
import { useSnapshot } from "valtio";

const FloorPlan = ({
  showHeader = true,
  className,
}: {
  showHeader?: boolean;
  className?: string;
}) => {
  const [activeSection, setActiveSection] = useState("Outdoor");
  const { pathname } = useLocation();
  const tableState = useSnapshot(posCart.state).table;
  const { data } = authClient.useSession();
  const canEdit = data?.user.role === "ADMIN" || "MANAGER";

  // fetch tables
  const {
    data: tables = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: () => customFetch<TablesProps[]>("/tables"),
  });
  // filter tables based on active section(tabs)
  const displayTables = useMemo(() => {
    return tables.filter((t) => t.section === activeSection);
  }, [tables, activeSection]);

  const statusMutation = useMutation({
    mutationFn: updateTableStatus,
    onSuccess: () => {
      refetch();
      toast.success("Table status updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      refetch();
      toast.success("Table deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting table:", error);
      const errorMessage =
        error?.response?.data?.error || "Failed to delete table";
      toast.error(errorMessage);
    },
  });

  const handleTableClick = (table: TablesProps) => {
    if (pathname === "/pos/new-order") {
      if (table.id === tableState?.id) {
        toast.error("This table is already selected for the current order!");
        return;
      }
      // handle unavailable table
      if (table.status !== "AVAILABLE") {
        toast.error("This table is not available!");
        return;
      }
      posCart.actions.setTable(table);
      toast.success(`Table ${table.name} selected for the order!`);
    } else {
      if (statusMutation.isPending) return;
      const newStatus = table.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE";
      statusMutation.mutate({ id: table.id, status: newStatus });
    }
  };

  // handle table deletion - only for admin and manager
  const handleDeleteTable = (table: TablesProps) => {
    if (statusMutation.isPending) return;
    if (table.id === tableState?.id) {
      toast.error("This table is already selected for the current order!");
      return;
    }
    if (table.status !== "AVAILABLE") {
      toast.error("This table is not available!");
      return;
    }

    deleteMutation.mutate({ id: table.id });
  };
  return (
    <div className={cn("", className)}>
      {/* Top Header with Add Table Button */}
      {showHeader && (
        <header className="border-b sticky w-full top-0 z-10 bg-card/80">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex gap-2">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-2xl font-bold text-foreground">
                Floor Plan Management
              </h1>
            </div>
            {canEdit && <CreateEdit isLoading={statusMutation.isPending} />}
          </div>
        </header>
      )}
      <div className="flex flex-col h-[89vh] overflow-hidden p-4">
        {/* Main Floor Plan Card */}
        <div className="flex-1 dark:bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col">
          {/* Tabs */}
          <Tabs
            value={activeSection}
            onValueChange={setActiveSection}
            className="w-full mb-8"
          >
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start border-b border-border w-full rounded-none">
              {["Main Dining Room", "Outdoor", "Terrace"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary mb-4 py-4"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex gap-2 items-center">
            {/* available status color */}
            <div className="bg-primary dark:bg-primary rounded-full w-4 h-4" />{" "}
            Available
            {/* occupied status color */}
            <div className="bg-orange-50 dark:bg-orange-950 rounded-full w-4 h-4" />
            Occupied
            {/* reserved status color */}
            <div className="bg-blue-50 dark:bg-blue-950 rounded-full w-4 h-4" />
            Reserved
          </div>
          {/* Grid Area - Rendering Tables */}
          {isLoading ? (
            <Loader title="Loading Tables..." className="flex-1" />
          ) : (
            <div className="flex-1 overflow-auto flex justify-center items-center">
              <div className="flex flex-wrap gap-8 justify-center max-w-200">
                {displayTables.length === 0 && <h1>No tables available</h1>}
                {displayTables.map((table) => (
                  <div
                    className={cn(
                      "relative p-2 rounded-lg hover:border hover:border-primary group",
                      statusMutation.isPending &&
                        statusMutation.variables?.id === table.id &&
                        "opacity-50 pointer-events-none",
                      deleteMutation.isPending &&
                        "opacity-50 pointer-events-none",
                    )}
                  >
                    {canEdit && (
                      <Button
                        className="absolute -top-4 -right-2 hidden group-hover:block rounded-full size-8 shadow-md z-20"
                        variant="destructive"
                        size="icon"
                        disabled={
                          (statusMutation.isPending &&
                            statusMutation.variables?.id === table.id) ||
                          table.status === "OCCUPIED" ||
                          table.status === "RESERVED" ||
                          deleteMutation.isPending
                        }
                        onClick={() => handleDeleteTable(table)}
                      >
                        <Trash className="size-4 ml-1.5" />
                      </Button>
                    )}
                    {/* edit */}
                    {canEdit && (
                      <CreateEdit
                        table={table}
                        isLoading={
                          (statusMutation.isPending &&
                            statusMutation.variables?.id === table.id) ||
                          table.status === "OCCUPIED" ||
                          table.status === "RESERVED" ||
                          deleteMutation.isPending
                        }
                      />
                    )}
                    <div
                      key={table.id}
                      onClick={() => handleTableClick(table)}
                      className={cn(
                        "relative flex items-center justify-center cursor-pointer group transition-transform hover:scale-105",
                        statusMutation.isPending &&
                          statusMutation.variables?.id === table.id &&
                          "opacity-50 pointer-events-none",
                      )}
                    >
                      <div
                        className={cn(
                          "bg-primary/30 dark:bg-primary/20 border-2 border-primary dark:border-primary shadow-sm transition-colors duration-300",
                          table.shape === "circle"
                            ? "size-20 rounded-full"
                            : "size-18 rounded-xl",
                          table.status === "OCCUPIED" &&
                            "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900",
                          table.status === "RESERVED" &&
                            "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
                        )}
                      >
                        {table.shape === "circle" && (
                          <div className="w-full h-full flex items-center justify-center opacity-30 text-[17px] font-bold text-primary">
                            VIP
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-3 bg-white dark:bg-card border border-primary dark:border-primary rounded-full px-3 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm group-hover:border-primary group-hover:text-primary transition-colors mb-1">
                        {table.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorPlan;
