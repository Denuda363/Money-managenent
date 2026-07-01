import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for Tailwind class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah (IDR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Generate default categories
 */
export const DEFAULT_CATEGORIES = [
  { id: "cat-1", name: "Gaji", type: "income", color: "#10b981" },
  { id: "cat-2", name: "Bonus", type: "income", color: "#3b82f6" },
  { id: "cat-3", name: "Investasi", type: "income", color: "#8b5cf6" },
  { id: "cat-4", name: "Makanan", type: "expense", color: "#ef4444" },
  { id: "cat-5", name: "Transportasi", type: "expense", color: "#f59e0b" },
  { id: "cat-6", name: "Tagihan", type: "expense", color: "#6366f1" },
  { id: "cat-7", name: "Belanja", type: "expense", color: "#ec4899" },
];
