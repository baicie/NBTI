/**
 * 配置加载器
 * 负责加载、验证和管理测试包配置
 */

import type {
  ConfigSource,
  LoadedConfig,
  Manifest,
  QuestionsData,
  TemplatesData,
  ThemeData,
  TypesData,
} from '../types'
import { ConfigCache } from './cache'
import {
  validateManifest,
  validateQuestions,
  validateTemplates,
  validateTheme,
  validateTypes,
} from './validator'

/**
 * 加载器选项
 */
export interface ConfigLoaderOptions {
  source: ConfigSource
  useCache?: boolean
  cacheTtl?: number
}

/**
 * 加载结果
 */
export interface LoadResult<T> {
  success: boolean
  data?: T
  error?: Error
}

/**
 * 配置加载器类
 */
export class ConfigLoader {
  private source: ConfigSource
  private useCache: boolean
  private cacheTtl: number

  constructor(options: ConfigLoaderOptions) {
    this.source = options.source
    this.useCache = options.useCache ?? true
    this.cacheTtl = options.cacheTtl ?? 5 * 60 * 1000
  }

  /**
   * 获取缓存键
   */
  private getCacheKey(): string {
    return ConfigCache.generateKey(this.source)
  }

  /**
   * 检查缓存
   */
  private getFromCache(): LoadedConfig | null {
    if (!this.useCache) return null
    return ConfigCache.get(this.getCacheKey())
  }

  /**
   * 保存到缓存
   */
  private saveToCache(config: LoadedConfig): void {
    if (this.useCache) {
      ConfigCache.set(this.getCacheKey(), config, this.cacheTtl)
    }
  }

  /**
   * 获取基础路径
   */
  private getBasePath(): string {
    const base = this.source.basePath
    if (base.endsWith('/')) {
      return base.slice(0, -1)
    }
    return base
  }

  /**
   * 构建文件 URL
   */
  private buildUrl(filename: string): string {
    return `${this.getBasePath()}/${filename}`
  }

  /**
   * 获取 manifest 路径
   */
  private getManifestPath(): string {
    if (this.source.manifestPath) {
      return this.source.manifestPath
    }
    return this.buildUrl('manifest.json')
  }

  /**
   * 加载 JSON 文件
   */
  private async loadJson<T>(url: string): Promise<LoadResult<T>> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
        )
      }
      const data = (await response.json()) as T
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }
    }
  }

  /**
   * 加载 manifest
   */
  async loadManifest(): Promise<LoadResult<Manifest>> {
    const result = await this.loadJson<Manifest>(this.getManifestPath())
    if (!result.success || !result.data) {
      return result
    }

    try {
      const validated = validateManifest(result.data)
      return { success: true, data: validated }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error('Manifest validation failed'),
      }
    }
  }

  /**
   * 加载题库数据
   */
  async loadQuestions(): Promise<LoadResult<QuestionsData>> {
    const manifestResult = await this.loadManifest()
    if (!manifestResult.success || !manifestResult.data) {
      return { success: false, error: manifestResult.error }
    }

    const filename = manifestResult.data.config.questions || 'questions.json'
    const result = await this.loadJson<QuestionsData>(this.buildUrl(filename))
    if (!result.success || !result.data) {
      return result
    }

    try {
      const validated = validateQuestions(result.data)
      return { success: true, data: validated }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error('Questions validation failed'),
      }
    }
  }

  /**
   * 加载类型数据
   */
  async loadTypes(): Promise<LoadResult<TypesData>> {
    const manifestResult = await this.loadManifest()
    if (!manifestResult.success || !manifestResult.data) {
      return { success: false, error: manifestResult.error }
    }

    const filename = manifestResult.data.config.types || 'types.json'
    const result = await this.loadJson<TypesData>(this.buildUrl(filename))
    if (!result.success || !result.data) {
      return result
    }

    try {
      const validated = validateTypes(result.data)
      return { success: true, data: validated }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Types validation failed'),
      }
    }
  }

  /**
   * 加载模板数据
   */
  async loadTemplates(): Promise<LoadResult<TemplatesData>> {
    const manifestResult = await this.loadManifest()
    if (!manifestResult.success || !manifestResult.data) {
      return { success: false, error: manifestResult.error }
    }

    const filename = manifestResult.data.config.templates
    if (!filename) {
      // 返回默认模板
      return {
        success: true,
        data: {
          defaultTemplate: 'default',
          templates: [],
        },
      }
    }

    const result = await this.loadJson<TemplatesData>(this.buildUrl(filename))
    if (!result.success || !result.data) {
      return result
    }

    try {
      const validated = validateTemplates(result.data)
      return { success: true, data: validated }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error('Templates validation failed'),
      }
    }
  }

  /**
   * 加载主题数据
   */
  async loadTheme(): Promise<LoadResult<ThemeData>> {
    const manifestResult = await this.loadManifest()
    if (!manifestResult.success || !manifestResult.data) {
      return { success: false, error: manifestResult.error }
    }

    const filename = manifestResult.data.config.themes
    if (!filename) {
      // 返回默认主题
      return {
        success: true,
        data: {
          defaultTheme: 'default',
          themes: {},
        },
      }
    }

    const result = await this.loadJson<ThemeData>(this.buildUrl(filename))
    if (!result.success || !result.data) {
      return result
    }

    try {
      const validated = validateTheme(result.data)
      return { success: true, data: validated }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Theme validation failed'),
      }
    }
  }

  /**
   * 加载国际化数据
   */
  async loadI18n(
    locale: string = 'zh',
  ): Promise<LoadResult<Record<string, unknown>>> {
    const manifestResult = await this.loadManifest()
    if (!manifestResult.success || !manifestResult.data) {
      return { success: false, error: manifestResult.error }
    }

    const i18nPath = manifestResult.data.config.i18n
    if (!i18nPath) {
      return { success: true, data: {} }
    }

    const filename = `${i18nPath}/${locale}.json`
    return this.loadJson<Record<string, unknown>>(this.buildUrl(filename))
  }

  /**
   * 加载完整配置
   */
  async load(): Promise<LoadResult<LoadedConfig>> {
    // 检查缓存
    const cached = this.getFromCache()
    if (cached) {
      return { success: true, data: cached }
    }

    // 并行加载所有配置
    const [
      manifestResult,
      questionsResult,
      typesResult,
      templatesResult,
      themeResult,
    ] = await Promise.all([
      this.loadManifest(),
      this.loadQuestions(),
      this.loadTypes(),
      this.loadTemplates(),
      this.loadTheme(),
    ])

    // 检查是否有错误
    const errors: Error[] = []
    if (!manifestResult.success && manifestResult.error)
      errors.push(manifestResult.error)
    if (!questionsResult.success && questionsResult.error)
      errors.push(questionsResult.error)
    if (!typesResult.success && typesResult.error)
      errors.push(typesResult.error)
    if (!templatesResult.success && templatesResult.error)
      errors.push(templatesResult.error)
    if (!themeResult.success && themeResult.error)
      errors.push(themeResult.error)

    if (errors.length > 0) {
      return {
        success: false,
        error: new Error(
          `Failed to load config: ${errors.map(e => e.message).join('; ')}`,
        ),
      }
    }

    // 构建完整配置
    const config: LoadedConfig = {
      manifest: manifestResult.data!,
      questions: questionsResult.data!,
      types: typesResult.data!,
      templates: templatesResult.data!,
      theme: themeResult.data!,
      i18n: {},
    }

    // 缓存配置
    this.saveToCache(config)

    return { success: true, data: config }
  }

  /**
   * 刷新配置（清除缓存并重新加载）
   */
  async refresh(): Promise<LoadResult<LoadedConfig>> {
    if (this.useCache) {
      ConfigCache.clear(this.getCacheKey())
    }
    return this.load()
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    ConfigCache.clear(this.getCacheKey())
  }

  /**
   * 静态方法：清除所有缓存
   */
  static clearAllCache(): void {
    ConfigCache.clearAll()
  }
}
