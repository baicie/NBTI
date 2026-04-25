import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名，支持条件类和冲突解决
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
