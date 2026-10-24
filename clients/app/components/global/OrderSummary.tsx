import { homeCart, posCart } from "@/store";
import { useLocation } from "react-router";
import { useSnapshot } from "valtio";
import Empty from "./Empty";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Printer,
  ShoppingCart,
  Trash,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { itemsProps } from "@/type";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { customFetch, submitOrder } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import FloorPlan from "@/components/pos/FloorPlan";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useReactToPrint } from "react-to-print";

const OrderSummary = () => {
  const [isSelectingTable, setIsSelectingTable] = useState(false);
  const [completedOrderData, setCompletedOrderData] =
    useState<itemsProps | null>(null); // Holds the DB response for the receipt
  const [isLoading, setIsLoading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const canAddToCart = pathname.includes("new-order");

  // 1. Safe Snapshot Access
  const snap = useSnapshot(canAddToCart ? posCart.state : homeCart.state);
  const items = snap.items ?? [];
  const total = snap.total ?? 0;
  const type = snap.type ?? "dine-in";
  const table = snap.table ?? null;

  //  Multi-version compatible Print Hook => react-to-print
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    // in case data doesn't load in time, we can set a fallback title
    documentTitle: completedOrderData
      ? `Order-${completedOrderData?.id || "Receipt"}`
      : `Receipt-DineFlow-${new Date().getTime()}`,
    onAfterPrint: () => {
      // 🚀 Reset the POS Cart for the next customer AFTER printing dialog closes!
      if (canAddToCart) {
        posCart.actions.reset();
      } else {
        homeCart.actions.reset();
      }
      setCompletedOrderData(null); // Clear the receipt data
    },
  });

  // 3. Fallback Order Number (Used before DB assigns a real one)
  const fallbackOrderNumber = useMemo(
    () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    [],
  );

  // =====================================================================
  // MUTATION: Submit Order to Backend
  // =====================================================================
  const orderMutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: (data: any) => {
      toast.success("Order placed successfully!");
      // Save the real DB data (like the Order ID) to print on the receipt
      setCompletedOrderData(data);

      // Trigger the Print Dialog!
      // setTimeout gives React a fraction of a second to render the DB Order ID into the hidden receipt
      setTimeout(() => {
        handlePrint();
      }, 100);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  // =====================================================================
  // Type of order (Dine-in or Takeaway)
  // =====================================================================
  const orderType = (selectedType: "dine-in" | "take-away") => {
    if (canAddToCart) {
      posCart.actions.setType(selectedType);
    } else {
      homeCart.actions.setType(selectedType);
    }
  };

  // =====================================================================
  // HANDLER: Quantity update
  // =====================================================================
  const handleQuantityUpdate = (id: string, amount: number) => {
    if (canAddToCart) {
      posCart.actions.updateQuantity(id, amount);
    } else {
      homeCart.actions.updateQuantity(id, amount);
    }
  };

  const removeItem = (index: number) => {
    if (canAddToCart) {
      posCart.actions.removeItem(index);
    } else {
      homeCart.actions.removeItem(index);
    }
  };

  const handlePlaceOrder = () => {
    // Validation: Dine-in requires a table
    if (type === "dine-in" && !table) {
      toast.error("Please select a table for Dine-in orders.");
      setIsSelectingTable(true);
      return;
    }

    // Format data for backend
    const payload = {
      orderType: type === "dine-in" ? "DINE_IN" : "TAKEAWAY",
      tableId: table?.id || null,
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    };

    orderMutation.mutate(payload);
  };

  const handleStripeCheckout = async () => {
    if (items.length === 0) return toast.error("Cart is empty");
    setIsLoading(true);

    try {
      // 1. Call your Express backend
      const response = await customFetch<{ url: string }>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          orderType: type === "dine-in" ? "TAKEAWAY" : type.toUpperCase(), // Default online orders to Takeaway/Delivery
        }),
      });

      // 2. Redirect the user to Stripe's securely hosted checkout page!
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate checkout");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mt-2 flex flex-col h-full">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-primary px-2">
        Order Summary
      </h1>
      {items.length === 0 ? (
        <Empty title="Order is empty" description="Add some items to start" />
      ) : (
        <>
          {/* Order Type Toggle */}
          <div className="flex gap-2 mt-4 justify-end px-2">
            <Button
              variant={type === "dine-in" ? "default" : "outline"}
              onClick={() => orderType("dine-in")}
              className="rounded-full uppercase font-bold text-xs"
            >
              Dine In
            </Button>
            <Button
              variant={type === "take-away" ? "default" : "outline"}
              onClick={() => orderType("take-away")}
              className="rounded-full uppercase font-bold text-xs"
            >
              Take Away
            </Button>
          </div>
          {/* Scrollable Items List */}
          <div className="mt-4 flex-1 overflow-y-auto px-2 space-y-2">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex justify-between items-center border rounded-lg p-3 bg-card shadow-sm border-border/50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    className="size-14 rounded-xl object-cover"
                    alt=""
                  />
                  <div>
                    <p className="font-bold text-sm uppercase leading-tight line-clamp-1">
                      {item.name}
                    </p>
                    <p className="font-bold text-primary text-xs">
                      ${(item.price || 0).toFixed(2)}
                    </p>
                    <div className="flex gap-3 items-center mt-2">
                      <button
                        onClick={() => handleQuantityUpdate(item.id, -1)}
                        className="p-1 bg-accent rounded-md hover:bg-primary hover:text-white transition-colors"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-black text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityUpdate(item.id, 1)}
                        className="p-1 bg-accent rounded-md hover:bg-primary hover:text-white transition-colors"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => removeItem(index)}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Footer Totals & Actions */}
          <div className="border-t border-border p-4 bg-background mt-auto">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold uppercase opacity-50">Total</p>
              <p className="text-3xl font-black text-primary">
                ${(total || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                {canAddToCart && (
                  <>
                    {type === "dine-in" && (
                      <Button
                        variant="secondary"
                        onClick={() => setIsSelectingTable(true)}
                        disabled={orderMutation.isPending || items.length === 0}
                        className="h-14 w-fit rounded-2xl font-bold uppercase tracking-widest text-xs"
                      >
                        {table?.name ? `Table: ${table.name}` : "Select Table"}
                      </Button>
                    )}
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={orderMutation.isPending || items.length === 0}
                      className={cn(
                        "h-14 w-fit rounded-2xl font-bold uppercase tracking-widest text-xs gap-2",
                        type !== "dine-in" && "w-full",
                      )}
                    >
                      {orderMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Printer className="w-4 h-4" /> Place Order
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
              <Button
                onClick={handleStripeCheckout}
                disabled={
                  isLoading || items.length === 0 || orderMutation.isPending
                }
                className="h-14 rounded-2xl font-bold uppercase tracking-widest text-xs gap-2"
              >
                {orderMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Pay Securely with Stripe
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ================================================== */}
      {/* HIDDEN PRINT UI */}
      {/* ================================================== */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div
          ref={receiptRef}
          className="w-[80mm] bg-white text-black p-6 font-mono text-[12px] leading-tight"
        >
          <div className="text-center mb-4 border-b-2 border-black pb-4">
            <h1 className="text-xl font-bold uppercase">Dine Flow</h1>
            <p>Order Receipt</p>
          </div>

          <div className="space-y-1 mb-4 text-[10px]">
            <div className="flex justify-between">
              <span className="font-semibold">Order #:</span>
              {/* Prioritize the real Database ID, otherwise use the fallback */}
              <span>{completedOrderData?.id || fallbackOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>
                {new Date().toLocaleString("en-US", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="uppercase">
                {String(type || "").replace("-", " ")}
              </span>
            </div>
            {table && (
              <div className="flex justify-between">
                <span>Table:</span>
                <span className="uppercase font-bold">{table.name}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-black mb-2" />

          <table className="w-full text-[10px] mb-4">
            <thead>
              <tr className="border-b border-gray-400">
                <th className="text-left py-1 w-8">Qty</th>
                <th className="text-left py-1">Item</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`print-${item.id}`} className="align-top">
                  <td className="py-1.5 font-semibold">{item.quantity}x</td>
                  <td className="py-1.5 pr-2">{item.name}</td>
                  <td className="text-right py-1.5">
                    ${((item.price || 0) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-black mt-4 pt-2 font-bold flex justify-between text-sm">
            <span>TOTAL</span>
            <span>${(total || 0).toFixed(2)}</span>
          </div>

          <div className="text-center mt-8 space-y-2">
            <p className="text-[10px] font-semibold">
              Thank you for dining with us!
            </p>
            {/* Fake Barcode representation */}
            <p className="font-mono text-lg tracking-[0.3em]">
              *${completedOrderData?.id || fallbackOrderNumber}*
            </p>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* MODALS */}
      {/* ================================================== */}
      <Dialog open={isSelectingTable} onOpenChange={setIsSelectingTable}>
        <DialogContent className="max-w-[95vw] lg:max-w-5xl h-[90vh] p-0 overflow-hidden border-none shadow-none">
          <div className="h-full w-full">
            <FloorPlan showHeader={false} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderSummary;

export const CartSheet = () => {
  const { pathname } = useLocation();
  const canAddToCart = pathname.includes("new-order");

  // 1. Safe Snapshot Access
  const { items } = useSnapshot(canAddToCart ? posCart.state : homeCart.state);

  return (
    <Sheet>
      <SheetTrigger className="flex gap-2 items-center">
        <div className="relative">
          <ShoppingCart className="size-8" />
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full px-1.5 py-0.5">
            {items.length}
          </span>
        </div>
      </SheetTrigger>
      <SheetContent>
        <OrderSummary />
      </SheetContent>
    </Sheet>
  );
};
