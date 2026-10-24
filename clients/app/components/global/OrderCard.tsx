import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChefHat,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShoppingBag,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Order } from "@/type";
import { useLocation } from "react-router";

interface OrderCardProps {
  order: Order;
  isAdmin?: boolean;
  onUpdateOrder?: (orderId: string, field: string, value: string) => void;
}

const OrderCard = ({ order, isAdmin, onUpdateOrder }: OrderCardProps) => {
  const { pathname } = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isProfile = pathname.includes("profile");

  // Status mapping for colors and icons
  const getStatusConfig = () => {
    if (order.status === "CANCELLED" || order.paymentStatus === "FAILED") {
      return {
        color: "bg-red-500",
        bg: "bg-red-50",
        icon: XCircle,
        text: "has been cancelled",
      };
    }
    if (order.status === "SERVED" && order.paymentStatus === "PAID") {
      return {
        color: "bg-emerald-500",
        bg: "bg-emerald-50",
        icon: CheckCircle2,
        text: "has been completed successfully",
      };
    }
    if (order.status === "PREPARING" || order.status === "READY") {
      return {
        color: "bg-blue-500",
        bg: "bg-blue-50",
        icon: ChefHat,
        text: `is currently ${order.status.toLowerCase()}`,
      };
    }
    return {
      color: "bg-amber-500",
      bg: "bg-amber-50",
      icon: Clock,
      text: "is pending review",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="rounded-lg p-6 shadow-sm border transition-all mb-4">
      {/* Header Section (Always Visible) */}
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm",
              config.color,
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base tracking-tight">
              Order #{order.id}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {config.text}
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 mt-2 transition-colors uppercase tracking-wider"
            >
              See Detail{" "}
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            {formatDistanceToNow(new Date(order.createdAt), {
              addSuffix: true,
            })}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xl font-black">
              ${order.totalAmount.toFixed(2)}
            </span>
            <Badge
              variant="secondary"
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
            >
              {order.paymentMethod}
            </Badge>
          </div>
        </div>
      </div>
      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="mt-6 pt-6">
          {/* CUSTOMER INFO: Only visible on Admin Dashboard */}
          {isAdmin && !isProfile && (
            <div className="ml-16 mb-6 flex items-center gap-3 p-3 rounded-lg border">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                {order.user?.image ? (
                  <img
                    src={order.user.image}
                    alt={order.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  {order.user ? order.user.name : "Guest Order"}
                </p>
                {order.user?.email && (
                  <p className="text-xs text-muted-foreground">
                    {order.user.email}
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Items List */}
          <div className="space-y-4 mb-6 border rounded-lg ml-16 p-4">
            <h1 className="text-lg font-bold">Order Items</h1>
            {order.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex justify-between items-start border-b pb-1.5",
                  // last item should not have border
                  item.id === order.items[order.items.length - 1].id &&
                    "border-b-0 pb-0",
                )}
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{item.menuItem.name}</h4>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Note: {item.notes}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      ${item.price.toFixed(2)}{" "}
                      <span className="text-slate-300 mx-1">×</span>{" "}
                      {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          {/* ADMIN CONTROLS: Only visible on the Admin Dashboard */}
          {isAdmin && !isProfile && (
            <div className="ml-16 p-4 rounded-lg border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Admin Order
                Controls
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Order Status
                  </label>
                  <Select
                    value={order.status}
                    onValueChange={(val) =>
                      onUpdateOrder?.(order.id, "status", val)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white dark:bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "PENDING",
                        "PREPARING",
                        "READY",
                        "SERVED",
                        "CANCELLED",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Payment Status
                  </label>
                  <Select
                    value={order.paymentStatus}
                    onValueChange={(val) =>
                      onUpdateOrder?.(order.id, "paymentStatus", val)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white dark:bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["PENDING", "PAID", "FAILED"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Order Type
                  </label>
                  <Select
                    value={order.orderType}
                    onValueChange={(val) =>
                      onUpdateOrder?.(order.id, "orderType", val)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white dark:bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["DINE_IN", "TAKEAWAY", "DELIVERY"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Pay Method
                  </label>
                  <Select
                    value={order.paymentMethod}
                    onValueChange={(val) =>
                      onUpdateOrder?.(order.id, "paymentMethod", val)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white dark:bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["CASH", "CARD", "ONLINE"].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
