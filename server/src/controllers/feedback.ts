import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { menuItemId } = req.params as { menuItemId: string };
    const { rating, comment } = req.body as {
      rating: number;
      comment?: string;
    };

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment,
        menuItemId,
        userId: (req as any).user?.id || null, // Allow anonymous reviews if you want
      },
    });

    res.status(201).json({ message: "Thank you for your feedback!", feedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
