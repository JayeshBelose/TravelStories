import { z } from "zod";

/**
 * Profile form validation
 */
export const profileSchema = z.object({
    username: z
        .string()
        .trim()
        .min(4, "Username must be at leats 4 characters")
        .max(20, "Username must not exceed 20 characters"),

    bio: z.string().trim().max(300, "Bio must not exceed 300 characters"),
});
