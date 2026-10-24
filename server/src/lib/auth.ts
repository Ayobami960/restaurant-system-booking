import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import crypto from "crypto"
import { admin } from "better-auth/plugins";
import { ac, ADMIN, CUSTOMER, KITCHEN, MANAGER, STAFF } from "./permissions";
import { stripe } from "@better-auth/stripe"
import Stripe from "stripe"
import type { itemsProps } from "../controllers/order";
import { getIO } from "./socket";


export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  // so that we can have a uniform id across all models(prisma schema)
  advanced: {
    database: {
        generateId: () => {
            return crypto.randomBytes(16).toString("hex");
        },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in users after they sign up
  },

  account: {
    accountLinking: {
      enabled: true,
    },
  },
  baseURL: "http://localhost:8000",
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:5173"],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
      admin({
        defaultRole: "CUSTOMER",
        ac: ac,
        roles: { ADMIN, MANAGER, STAFF, KITCHEN, CUSTOMER }, // Register all roles with the admin plugin
      }),
      stripe({
        stripeClient,
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
        createCustomerOnSignUp: true,
        onEvent: async (event) => {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;
            // Parse the metadata we passed in Step 2
            const cartItems: itemsProps[] = JSON.parse(
              session.metadata.cartItems,
            );
            const userId: string = session.metadata.userId;
            const orderType: "DINE_IN" | "TAKE-AWAY" = session.metadata.orderType;
            // used when sending receipt email to guest users who don't have a BetterAuth account
            const customerName: string = session.metadata.customerName;
            const customerEmail: string = session.metadata.customerEmail;
  
            // 1. Fetch real prices again to save the receipt accurately
            const dbMenuItems = await prisma.menuItem.findMany({
              where: { id: { in: cartItems.map((i) => i.id) } },
            });
  
            let totalAmount = 0;
            const orderItemsData = cartItems.map((cartItem: any) => {
              const dbItem = dbMenuItems.find((m) => m.id === cartItem.id);
              totalAmount += dbItem!.price * cartItem.quantity;
              return {
                menuItemId: cartItem.id,
                quantity: cartItem.quantity,
                price: dbItem!.price,
              };
            });
  
            // 2. Create the Official Order in Prisma
            const newOrder = await prisma.order.create({
              data: {
                orderType: orderType === "DINE_IN" ? "DINE_IN" : "TAKEAWAY",
                paymentStatus: "PAID", // Already paid via Stripe!
                paymentMethod: "ONLINE",
                status: "PENDING",
                totalAmount: totalAmount,
                userId: userId,
                items: {
                  create: orderItemsData,
                },
              },
            });
  
            const io = getIO();
            io.emit("new-order", {
              orderId: newOrder.id.slice(-6),
              orderType: newOrder.orderType,
              message: `New ${newOrder.orderType} order received!`,
            });
          }
        },
      }),
    ],
   user: {
    additionalFields: {
      gender: {
        type: "string",
        required: false,
      },
      age: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
      },
    },
  },
});