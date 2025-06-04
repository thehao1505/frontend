import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isEmail = (input: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

export const config = {
  url: process.env.NEXT_PUBLIC_BACKEND_URL,
};
