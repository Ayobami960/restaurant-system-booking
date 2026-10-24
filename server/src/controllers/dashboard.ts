import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

import { activitiesLog } from "../lib/activities-log.js";

// I used ai for this based on the design of our dashboard => source code free
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // The current 7-day window
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // The previous 7-day window (for trend calculation)
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // Helper to calculate percentage change
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // 1. Fetch Current 7 Days Orders
    const currentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { not: "CANCELLED" },
      },
    });

    // 2. Fetch Previous 7 Days Orders
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        status: { not: "CANCELLED" },
      },
    });

    // 3. Aggregate Data
    const currentRevenue = currentOrders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const previousRevenue = previousOrders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const currentDineIn = currentOrders.filter(
      (o) => o.orderType === "DINE_IN",
    ).length;
    const previousDineIn = previousOrders.filter(
      (o) => o.orderType === "DINE_IN",
    ).length;

    const currentTakeAway = currentOrders.filter(
      (o) => o.orderType === "TAKEAWAY" || o.orderType === "DELIVERY",
    ).length;
    const previousTakeAway = previousOrders.filter(
      (o) => o.orderType === "TAKEAWAY" || o.orderType === "DELIVERY",
    ).length;

    // 4. Format Response
    res.status(200).json({
      revenue: {
        value: currentRevenue,
        trend: calculateTrend(currentRevenue, previousRevenue),
      },
      orders: {
        value: currentOrders.length,
        trend: calculateTrend(currentOrders.length, previousOrders.length),
      },
      dineIn: {
        value: currentDineIn,
        trend: calculateTrend(currentDineIn, previousDineIn),
      },
      takeAway: {
        value: currentTakeAway,
        trend: calculateTrend(currentTakeAway, previousTakeAway),
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getDashboardCharts = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // Go back 6 days to include today as the 7th day (e.g., Fri to Thu)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch all PAID orders from the last 7 days
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: { notIn: ["CANCELLED"] },
        paymentStatus: "PAID",
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
      },
    });

    // =========================================================
    // 1. Process Daily Sales (For the Area Chart)
    // =========================================================
    const dailySales: Record<string, number> = {};

    // Initialize timeline for the last 7 days so days with $0 still show up on the chart
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      // Format as short weekday (e.g., "Mon", "Tue")
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      dailySales[dayLabel] = 0;
    }

    let totalIncome = 0;

    orders.forEach((order) => {
      totalIncome += order.totalAmount;
      const orderDayLabel = new Date(order.createdAt).toLocaleDateString(
        "en-US",
        { weekday: "short" },
      );

      if (dailySales[orderDayLabel] !== undefined) {
        dailySales[orderDayLabel] += order.totalAmount;
      }
    });

    const salesData = Object.entries(dailySales).map(([time, sales]) => ({
      time, // This maps perfectly to the X-Axis in Recharts
      sales: Number(sales.toFixed(2)),
    }));

    // =========================================================
    // 2. Process Category Income (For the Donut Chart)
    // =========================================================
    const categoryTotals: Record<string, number> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        // Fallback in case category got deleted
        const catName = item.menuItem?.category?.name || "Uncategorized";
        const itemTotal = item.price * item.quantity;

        if (!categoryTotals[catName]) categoryTotals[catName] = 0;
        categoryTotals[catName] += itemTotal;
      });
    });

    // Assign consistent colors for the Donut Chart
    const colors = [
      "#10b981", // Emerald
      "#ef4444", // Red
      "#eab308", // Yellow
      "#3b82f6", // Blue
      "#8b5cf6", // Purple
      "#f97316", // Orange
    ];

    const categoryData = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([name, value], idx) => ({
        name,
        value: Number(value.toFixed(2)),
        color: colors[idx % colors.length],
      }));

    // If no sales this week, provide a placeholder so the chart doesn't crash
    if (categoryData.length === 0) {
      categoryData.push({ name: "No Sales Yet", value: 1, color: "#e2e8f0" });
    }

    res.status(200).json({
      salesData,
      categoryData,
      totalIncome: Number(totalIncome.toFixed(2)),
    });
  } catch (error) {
    console.error("Dashboard Charts Error:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
};

export const getDashboardLists = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // =========================================================
    // 1. Trending Dishes (Past 7 Days)
    // =========================================================
    // Fetch all items from valid orders in the last 7 days
    const recentOrderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: sevenDaysAgo },
          status: { notIn: ["CANCELLED"] },
        },
      },
      include: {
        menuItem: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Aggregate the quantities in JavaScript
    const itemCounts: Record<
      string,
      { name: string; image: string | null; orders: number }
    > = {};

    recentOrderItems.forEach((item) => {
      const id = item.menuItem.id;
      if (!itemCounts[id]) {
        itemCounts[id] = {
          name: item.menuItem.name,
          image: item.menuItem.image,
          orders: 0,
        };
      }
      itemCounts[id].orders += item.quantity;
    });

    // Convert to array, sort by orders descending, and take the top 4
    const trendingDishes = Object.entries(itemCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 4);

    // =========================================================
    // 2. Out of Stock Dishes
    // =========================================================
    const outOfStockItems = await prisma.menuItem.findMany({
      where: { isAvailable: false },
      select: { id: true, name: true, image: true },
      take: 4, // Limit to 4 for the dashboard preview
    });

    res.status(200).json({
      trendingDishes,
      outOfStock: outOfStockItems,
    });
  } catch (error) {
    console.error("Dashboard Lists Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard lists" });
  }
};
