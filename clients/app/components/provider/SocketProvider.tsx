import { useEffect } from "react";
import toast from "react-hot-toast";
import { BellRing, ChefHat, CalendarClock, BrainCircuit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { OrderStatus, ReservationStatus } from "@/type";
import { socket } from "@/lib/socket";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!socket.connected) socket.connect();

    // ========================================================
    // 1. NEW ORDERS (Loud Alert - For Kitchen/Cashier)
    // ========================================================
    socket.on("new-order", (data) => {
      new Audio("/sounds/notification.mp3").play().catch(() => {});
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-card border border-border shadow-lg rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-full shrink-0">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">
                New Order #{data.orderNumber}
              </h3>
              <p className="text-sm text-muted-foreground">{data.message}</p>
            </div>
          </div>
        ),
        { duration: 5000, position: "top-center" },
      );

      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });

    // ========================================================
    // 2. ORDER STATUS CHANGED (Loud Alert - For Waiters)
    // ========================================================
    socket.on("order-status-changed", (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      // sounds and toasts based on status
      // Only ring if it's ready for pickup!
      const status: OrderStatus = data.status;
      new Audio("/sounds/notification.mp3").play().catch(() => {});
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-card border border-border shadow-lg rounded-2xl p-4 flex items-start gap-4">
            <div className="bg-blue-100 text-primary p-2 rounded-full shrink-0">
              <ChefHat className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">
                Order #{data.orderId} is now {status}!
              </h3>
              <p className="text-sm text-muted-foreground">
                {status === "PENDING"
                  ? "Your order is pending. Please wait."
                  : status === "PREPARING"
                    ? "Your order is being prepared."
                    : status === "READY"
                      ? "Your order is ready for pickup!"
                      : status === "SERVED"
                        ? "Your order has been served. Enjoy your meal!"
                        : status === "CANCELLED"
                          ? "Your order has been cancelled. Please contact staff."
                          : "Order status updated."}
              </p>
            </div>
          </div>
        ),
        { duration: 8000, position: "top-center" },
      );
    });

    // ========================================================
    // 3. NEW RESERVATION (Loud Alert - For Host Desk)
    // ========================================================
    socket.on("new-reservation", (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      new Audio("/sounds/notification.mp3").play().catch(() => {});
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-card border border-border shadow-lg rounded-2xl p-4 flex items-start gap-4">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full shrink-0">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">New Table Booking!</h3>
              <p className="text-sm text-muted-foreground">
                {data.name} just booked a table online.
              </p>
            </div>
          </div>
        ),
        { duration: 6000, position: "top-center" },
      );
    });

    // ========================================================
    // 3. RESERVATION STATUS CHANGED (Loud Alert - For Host Desk)
    // ========================================================
    socket.on("status-reservation", (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      const status: ReservationStatus = data.status;
      new Audio("/sounds/notification.mp3").play().catch(() => {});
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-card border border-border shadow-lg rounded-2xl p-4 flex items-start gap-4">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full shrink-0">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">
                Reservation{" "}
                {status === "PENDING"
                  ? "Pending"
                  : status === "CONFIRMED"
                    ? "Confirmed"
                    : status === "CANCELLED"
                      ? "Cancelled"
                      : status === "COMPLETED"
                        ? "Completed"
                        : "Updated"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {data.name}'s reservation is now {status.toLowerCase()}.
              </p>
            </div>
          </div>
        ),
        { duration: 6000, position: "top-center" },
      );
    });

    // ========================================================
    // 5. SILENT DATA SYNCS (No sounds, just instant UI updates)
    // ========================================================

    // When a table is created, occupied, freed, or deleted
    socket.on("table-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    });

    // menu items updated
    socket.on("menu-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    });

    // real-time ai status updates =>ai-action-updated
    socket.on("ai-action-updated", (data) => {
      const action = data.action;
      toast.custom(
        (t) => (
          <div className="bg-white dark:bg-card border border-border shadow-lg rounded-2xl p-4 flex items-start gap-4">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{action}</h3>
            </div>
          </div>
        ),
        { duration: 6000, position: "top-center" },
      );
    });
  }, [queryClient]);

  return <>{children}</>;
}
