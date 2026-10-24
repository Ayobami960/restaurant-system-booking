import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { activitiesLog } from "../lib/activities-log.js";
import { getIO } from "../lib/socket.js";
import { auth, stripeClient } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export interface itemsProps {
  id: string;
  name: string;
  description?: any[];
  price: number;
  categoryId: string;
  isAvailable: boolean;
  image?: string;
  discount: number;
  quantity: number;
}

export const createPosOrder = async (req: Request, res: Response) => {
  try {
    const items = req.body.items as itemsProps[];
    const orderType = req.body.orderType as "DINE_IN" | "TAKEAWAY";
    const tableId = req.body.tableId as string | null;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (orderType === "DINE_IN" && !tableId) {
      return res
        .status(400)
        .json({ message: "Table ID is required for dine-in orders" });
    }

    // 1. Fetch real prices from the database (Security: Prevent frontend spoofing)
    const menuItemIds = items.map((item) => item.id);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    let calculatedTotal = 0;
    const orderItemsData = items.map((item) => {
      const dbItem = dbMenuItems.find((dbItem) => dbItem.id === item.id);
      if (!dbItem) {
        throw new Error(`Menu item with ID ${item.id} not found`);
      }

      calculatedTotal += dbItem.price * item.quantity;

      return {
        menuItemId: dbItem.id,
        quantity: item.quantity,
        price: dbItem.price, // Snapshot of price at time of order
      };
    });

    // 2. Run the Transaction (Creates Order + Updates Table)
    const result = await prisma.$transaction(async (tx) => {
      // A. Create the Order
      const newOrder = await tx.order.create({
        data: {
          orderType,
          tableId: orderType === "DINE_IN" ? tableId : null,
          totalAmount: calculatedTotal,
          status: "PENDING", // Ready for kitchen
          paymentStatus: "PAID", // Mark as paid since it's POS; can be updated later if needed
          paymentMethod: "CASH", // Default to cash for POS orders; can be updated later
          items: {
            create: orderItemsData,
          },
        },
        include: {
          table: true, // Return table data for the receipt
        },
      });

      if (orderType === "DINE_IN" && tableId) {
        await tx.table.update({
          where: { id: tableId },
          data: { status: "OCCUPIED" },
        });
      }

      return newOrder;
    });

    // Return the created order so the frontend can print the receipt!
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating POS order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    // CHANGE THIS LINE: from req.params to req.query
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const userId = req.query.userId as string | undefined; // Optional filter for customer orders

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        skip: skip,
        take: limit,
        where: userId ? { userId } : {},
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          table: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({
        where: userId ? { userId } : {},
      }),
    ]);
    const totalPages = Math.ceil(totalOrders / limit);
    res.status(200).json({
      data: orders,
      totalOrders,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// UPDATE ORDER STATUSES (Dynamic)
// ==========================================
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;

    // 1. Security: Only allow specific enum fields to be updated via this route
    const allowedFields = [
      "status",
      "paymentStatus",
      "paymentMethod",
      "orderType",
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: "Invalid field update requested" });
    }

    // 2. Perform the dynamic update
    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: {
        [field]: value, // dynamically sets status: "READY" or paymentStatus: "PAID", etc.
      },
    });

    // 3. Optional: If the order is marked as SERVED or CANCELLED, and it's a DINE_IN order,
    // you could automatically free up the table here!
    if (
      (value === "SERVED" || value === "CANCELLED") &&
      field === "status" &&
      updatedOrder.tableId
    ) {
      await prisma.table.update({
        where: { id: updatedOrder.tableId },
        data: { status: "AVAILABLE" },
      });
    }
    // Broadcast if the status changed!
    if (field === "status") {
      getIO().emit("order-status-changed", {
        orderId: updatedOrder.id.slice(-6),
        status: updatedOrder.status,
      });
      //   await triggerNotification({
      //     title: `Order ${updatedOrder.status}`,
      //     body: `Order ${updatedOrder.id.slice(-6)} is now ${updatedOrder.status}`,
      //     userId: updatedOrder.userId || "", // Send to the customer who made the order, if available
      //   });
    }

    await activitiesLog({
      userId: (req as any).user?.id,
      action: "UPDATE_ORDER",
      details: `Order updated: ${updatedOrder.id}, Field: ${field}, New Value: ${value}`,
    });
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOnlineOrderCheckout = async (
  req: Request,
  res: Response,
) => {
  try {
    const items = req.body.items as itemsProps[];
    const orderType = req.body.orderType as "DINE_IN" | "TAKEAWAY";

    // 1. Get the BetterAuth Session
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // 2. Fetch real prices from the DB to prevent frontend spoofing
    const menuItemIds = items.map((item) => item.id);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    // 3. Format Line Items for Stripe
    const lineItems = items.map((cartItem) => {
      const dbItem = dbMenuItems.find((m) => m.id === cartItem.id);
      if (!dbItem) throw new Error("Item not found");

      return {
        price_data: {
          currency: "usd", // Or "kes" if your Stripe account supports it
          product_data: {
            name: dbItem.name,
            images: dbItem.image ? [dbItem.image] : [],
          },
          unit_amount: Math.round(dbItem.price * 100), // Stripe expects cents (e.g. $10.00 = 1000)
        },
        quantity: cartItem.quantity,
      };
    });

    // 4. Create the Stripe Checkout Session
    const stripeSession = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // If the user is logged in, attach their Stripe Customer ID from BetterAuth!
      customer: session?.user?.stripeCustomerId || undefined,
      customer_email: !session?.user?.stripeCustomerId
        ? session?.user?.email
        : undefined,
      line_items: lineItems,
      // Metadata allows us to pass data to the webhook later
      metadata: {
        userId: session?.user?.id || "guest",
        orderType: orderType,
        // Stringify the cart items so the webhook knows what they ordered!
        cartItems: JSON.stringify(
          items.map((i) => ({ id: i.id, quantity: i.quantity })),
        ),
      },
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
    });

    res.status(200).json({ url: stripeSession.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
