/**
 * 配置缓存模块
 */

import type { LoadedConfig } from '../types'

interface CacheEntry {
  config: LoadedConfig
  timestamp: number
  ttl: number
}

const cache = new Map<string, CacheEntry>()

const DEFAULT_TTL = 5 * 60 * 1000 // 5 分钟

/**
 * 缓存管理器
 */
export class ConfigCache {
  /**
   * 获取缓存
   */
  static get(key: string): LoadedConfig | null {
    const entry = cache.get(key)
    if (!entry)
      return null

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key)
      return null
    }

    return entry.config
  }

  /**
   * 设置缓存
   */
  static set(
    key: string,
    config: LoadedConfig,
    ttl: number = DEFAULT_TTL,
  ): void {
    cache.set(key, {
      config,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * 清除指定缓存
   */
  static clear(key: string): void {
    cache.delete(key)
  }

  /**
   * 清除所有缓存
   */
  static clearAll(): void {
    cache.clear()
  }

  /**
   * 获取缓存大小
   */
  static size(): number {
    return cache.size
  }

  /**
   * 生成缓存键
   */
  static generateKey(source: { type: string, basePath: string }): string {
    return `${source.type}:${source.basePath}`
  }
}
