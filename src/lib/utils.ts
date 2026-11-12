import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ค่าที่ผู้ใช้มักกรอกใน Excel แทน "ไม่มีข้อมูล" เช่น N/A, NA, -, none, null, ไม่มี
 * ให้ถือว่าเป็นค่าว่าง
 */
const EMPTY_PLACEHOLDER_REGEX = /^(n\/?a|-+|none|null|ไม่มี)$/i;

export function cleanOptionalValue(value?: string | null): string {
  const trimmed = (value ?? "").trim();
  return EMPTY_PLACEHOLDER_REGEX.test(trimmed) ? "" : trimmed;
}
