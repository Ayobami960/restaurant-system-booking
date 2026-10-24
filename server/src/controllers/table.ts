import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { activitiesLog } from "../lib/activities-log";
// import { getIO } from "../lib/socket";

// create a new table
export const create = async (req: Request, res: Response) => {
  try {
    const { name, seats, section, shape } = req.body;

    if (!name || !seats || !section || !shape) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingTable = await prisma.table.findFirst({
      where: {
        name,
      },
    });

    if (existingTable) {
      return res
        .status(400)
        .json({ error: "Table with this name and section already exists" });
    }

    const table = await prisma.table.create({
      data: {
        name,
        seats,
        section,
        shape,
      },
    });
    // getIO().emit("table-updated");
    await activitiesLog({
      userId: (req as any).user?.id,
      action: "CREATE_TABLE",
      details: `Table created: ${table.name}`,
    });

    res.status(201).json(table);
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({ error: "Failed to create table" });
  }
};

// update a table
export const update = async (req: Request, res: Response) => {
  try {
    const { name, seats, section, shape, status } = req.body;
    const { id } = req.params as { id: string };

    //   let test these way and see what happens
    if (name) {
      const existingTable = await prisma.table.findFirst({
        where: {
          name,
        },
      });

      if (existingTable && existingTable.id !== id) {
        return res
          .status(400)
          .json({ error: "Table with this name and section already exists" });
      }
    }

    const table = await prisma.table.update({
      where: {
        id: id,
      },
      data: {
        name,
        seats,
        section,
        shape,
        status, 
      },
    });
    // getIO().emit("table-updated");
    await activitiesLog({
      userId: (req as any).user?.id,
      action: "UPDATE_TABLE",
      details: `Table updated: ${table.name}`,
    });

    res.status(200).json(table);
  } catch (error) {
    console.error("Error updating table:", error);
    res.status(500).json({ error: "Failed to update table" });
  }
};

// ============================================================================
// UPDATE TABLE STATUS (E.g., Waiter marks table as OCCUPIED)
// ============================================================================
export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status against enum
    if (!["AVAILABLE", "OCCUPIED", "RESERVED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status provided." });
    }

    const updatedTable = await prisma.table.update({
      where: { id: id as string },
      data: { status },
    });
    // getIO().emit("table-updated");
    await activitiesLog({
      userId: (req as any).user?.id,
      action: "UPDATE_TABLE",
      details: `Table updated: ${updatedTable.name}, New Status: ${status}`,
    });
    // getIO().emit("table-updated");
    res
      .status(200)
      .json({ message: "Table status updated", table: updatedTable });
  } catch (error) {
    console.error("Update table status error:", error);
    res.status(500).json({ error: "Failed to update table status" });
  }
};

// delete a table
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const reservations = await prisma.reservation.findMany({
      where: {
        tableId: id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (reservations.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete table with active reservations" });
    }

    const table = await prisma.table.delete({
      where: {
        id: id,
      },
    });
    // getIO().emit("table-updated");
    await activitiesLog({
      userId: (req as any).user?.id,
      action: "DELETE_TABLE",
      details: `Table deleted: ${table.name}`,
    });
    res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    console.error("Error deleting table:", error);
    res.status(500).json({ error: "Failed to delete table" });
  }
};

// get all tables
export const getAll = async (req: Request, res: Response) => {
  try {
    // Get today's start and end for reservation filtering
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // later we will add reservations and orders
    const tables = await prisma.table.findMany({
      include: {
        //     // Include any active reservations for today to populate the sidebar
        reservations: {
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
            status: { in: ["PENDING", "CONFIRMED"] },
          },
          orderBy: { date: "asc" },
        },
            // Include active orders to know if a table is currently dining
            orders: {
              where: {
                status: { notIn: ["SERVED", "CANCELLED"] },
              },
            },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
};

// get table by id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    if (!id) {
      return res.status(400).json({ error: "Table ID is required" });
    }

    const table = await prisma.table.findUnique({
      where: {
        id: id,
      },
    });
    res.status(200).json(table);
  } catch (error) {
    console.error("Error fetching table by id:", error);
    res.status(500).json({ error: "Failed to fetch table by id" });
  }
};
