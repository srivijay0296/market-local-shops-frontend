import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  return [];
}

export function normalizeApiResponse<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.shops)) return data.shops;
  if (Array.isArray(data.markets)) return data.markets;
  return [];
}
