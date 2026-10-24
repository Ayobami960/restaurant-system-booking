import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Empty from "@/components/global/Empty";
import OrderCard from "@/components/global/OrderCard";
import { useState } from "react";
import { getOrders, updateOrderDetails } from "@/lib/api";
import Loader from "@/components/global/Loader";
import CustomPagination from "@/components/global/CustomPagination";
import { ShoppingBag } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useLocation } from "react-router";

const Orders = () => {
  const [page, setPage] = useState(1);
  const { pathname } = useLocation();
  const { data: session } = authClient.useSession();
  // Determine if the current viewer is an admin/manager
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "MANAGER";
  const userId = session?.user.id;
  const isProfile = pathname.includes("profile");
  // if it's profile page and is admin use userId, otherwise fetch all reservations for admin dashboard
  const userid = isProfile ? userId : isAdmin ? undefined : userId;

  const queryClient = useQueryClient();
  // fetch orders
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    // FIX 1: Add dynamic variables to the queryKey so it refetches when they change
    queryKey: ["orders", userId, page],
    queryFn: () =>
      getOrders({
        args: {
          userId: userid, // Removed the non-null assertion (!) for safety
          page,
        },
      }),
  });

  // The Mutation to handle updates
  const updateMutation = useMutation({
    mutationFn: updateOrderDetails,
    onSuccess: () => {
      toast.success("Order updated successfully!");
      // Instantly refetch orders so the UI updates
      queryClient.invalidateQueries({ queryKey: ["orders", userId, page] });
      // If we freed a table, invalidate tables too!
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update order");
    },
  });

  //  The exact function you asked for!
  const handleUpdateOrder = (orderId: string, field: string, value: string) => {
    // Prevent spam clicking while already updating
    if (updateMutation.isPending) return;

    // Fire the mutation to the backend
    updateMutation.mutate({ id: orderId, field, value });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader title="Loading Orders" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-20 text-center text-red-500 font-semibold">
        Failed to load reservations. Please try again.
      </div>
    );
  }

  if (orders?.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-slate-50/50 dark:bg-muted/20">
        <div className="bg-white dark:bg-card p-4 rounded-full shadow-sm mb-4 text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">
          No Orders Found
        </h3>
        <p className="text-sm text-muted-foreground">
          {userId
            ? "You have no upcoming table bookings."
            : "There are no reservations in the system."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {isProfile && (
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">
          Order History
        </h3>
      )}
      {!isProfile && isAdmin && (
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              All Orders
            </h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              Manage Orders and statuses
            </p>
          </div>
        </div>
      )}
      {orders?.totalItems === 0 && (
        <Empty title="Orders" description="Order Something!" />
      )}

      {/* Reusing the beautiful Order Card! */}
      {orders?.data?.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          isAdmin={isAdmin}
          onUpdateOrder={handleUpdateOrder}
        />
      ))}
      <CustomPagination
        currentPage={orders?.currentPage || 1}
        totalPages={orders?.totalPages || 1}
        loading={isLoading}
        setPage={setPage}
      />
    </div>
  );
};

export default Orders;
