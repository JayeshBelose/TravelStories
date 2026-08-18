import { z } from "zod";

/**
 * Shared email validation
 */
export const emailSchema = z
    .email("Enter a valid email address")
    .trim()
    .min(1, "Email is required");

/**
 * Shared password validtion
 */
export const passwordSchema = z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .max(16, "Password must not exceed 16 characters");

/**
 * Shared username validation
 */
export const usernameSchema = z
    .string()
    .trim()
    .min(4, "Username must be at least 4 charcters");

/**
 * Login form validation
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

/**
 * Signup form validtion
 */
export const signupSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});

/**
 * Forgot password validtion
 */
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

/**
 * Reset password validation
 */
export const resetPasswordSchema = z
    .object({
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });
