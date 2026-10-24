import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { activitiesLog } from "../lib/activities-log";
// import { getIO } from "../lib/socket";

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { customerName, date, guests, tableId } = req.body;

    if (!date || !guests || !tableId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: date, guests, tableId" });
    }

    // Prevent double booking on the exact same table within a 2-hour window
    //   let fix date format
    const requestedTime = new Date(date);
    const twoHoursBefore = new Date(
      requestedTime.getTime() - 2 * 60 * 60 * 1000,
    );
    const twoHoursAfter = new Date(
      requestedTime.getTime() + 2 * 60 * 60 * 1000,
    );

    const conflictingBooking = await prisma.reservation.findFirst({
      where: {
        tableId,
        status: { in: ["PENDING", "CONFIRMED"] },
        date: { gte: twoHoursBefore, lte: twoHoursAfter },
      },
    });

    if (conflictingBooking) {
      return res
        .status(400)
        .json({ error: "Table is already booked around this time." });
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerName: customerName || (req as any).user?.name || "Guest",
        date: requestedTime,
        guests: Number(guests),
        tableId,
        userId: (req as any).user?.id, // Associate reservation with the authenticated user
      },
      include: { table: true },
    });
    // getIO().emit("new-reservation", {
    //   name: reservation.customerName,
    //   time: reservation.date,
    // });
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  try {
    // CHANGE THIS LINE: from req.params to req.query
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const userId = req.query.userId as string | undefined; // Optional filter for customer reservations
    const skip = (page - 1) * limit;
    const whereClause = userId ? { userId } : {};

    // Get today's start and end times to only show relevant bookings
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [reservations, totalReservations] = await Promise.all([
      await prisma.reservation.findMany({
        skip: skip,
        take: limit,
        where: whereClause,
        // if we want to show only today's reservations, we can uncomment the date filter below
        // where: {
        // date: {
        //   gte: startOfDay,
        //   lte: endOfDay,
        // },
        // },
        include: { table: true }, // Include table data so we can show table names
        orderBy: { date: "asc" },
      }),
      prisma.reservation.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalReservations / limit);

    res.status(200).json({
      data: reservations,
      totalReservations,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, CONFIRMED, CANCELLED, COMPLETED

    // we use transaction to ensure all operations succeed or fail together
    const updated = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.update({
        where: { id: id as string },
        data: { status },
      });

      if (status === "CANCELLED") {
        await tx.table.update({
          where: { id: reservation.tableId },
          data: { status: "AVAILABLE" },
        });

        // TODO: SEND EMAIL NOTIFICATION TO USER ABOUT CANCELLATION
      }

      // If checking in (COMPLETED), automatically mark the table as OCCUPIED
      if (status === "COMPLETED" || status === "CONFIRMED") {
        await tx.table.update({
          where: { id: reservation.tableId },
          data: { status: "OCCUPIED" },
        });
        // TODO: SEND EMAIL NOTIFICATION TO USER ABOUT CHECK-IN
      }
      return reservation;
    });
    // getIO().emit("status-reservation", {
    //   status,
    //   name: updated.customerName,
    //   time: updated.date,
    // });
    await activitiesLog({
      userId: (req as any).user?.id,
      action: "UPDATE_RESERVATION",
      details: `Reservation updated: ${updated.id}, New Status: ${status}`,
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating reservation status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
