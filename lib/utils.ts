import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString()
}

export const BASE_URL = "https://meme-gen-api.vercel.app"