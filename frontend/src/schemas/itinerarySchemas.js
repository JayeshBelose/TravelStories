import { z } from "zod";

/**
 * Itinerary form validtion
 */

export const itinerarySchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required")
            .max(50, "Title must not exceed 50 characters"),

        place: z
            .string()
            .trim()
            .min(1, "Place is required")
            .max(50, "Place must not exceed 50 characters"),

        type: z.string().min(1, "Please select an itinerary type"),

        startDate: z.string().min(1, "Start date ios required"),

        endDate: z.string().min(1, "End date is required"),

        description: z
            .string()
            .trim()
            .max(500, "Description must not exceed 500 characters"),
    })
    .refine((data) => data.endDate >= data.startDate, {
        message: "End date cannot be before start date",
        path: ["endDate"],
    });
