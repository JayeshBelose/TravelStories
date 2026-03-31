import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Removes conflicting tailwind classes keeps last valid class
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
