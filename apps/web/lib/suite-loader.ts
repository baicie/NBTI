/**
 * Suite 加载器
 * 动态加载套件配置，新增套件只需在 configs/suites/ 下创建目录即可
 *
 * 使用静态 import 让 Next.js bundler 正确追踪所有 JSON 文件，
 * standalone 模式下的 JSON 打包由 next.config.mjs 的 outputFileTracingIncludes 保证。
 */

import type { SuiteConfig, SuiteIndex, SuiteTheme } from './types/suite'
import type { TemplatesConfig } from './types/template'

// 静态导入所有已知套件的配置（Next.js bundler 可正确分析）
// templates.json 为可选配置，仅 pr01 套件提供
import mbtiManifest from '../configs/suites/mbti/manifest.json'
import mbtiTheme from '../configs/suites/mbti/theme.json'
import mbtiQuestions from '../configs/suites/mbti/questions.json'
import mbtiTypes from '../configs/suites/mbti/types.json'

import discManifest from '../configs/suites/disc/manifest.json'
import discTheme from '../configs/suites/disc/theme.json'
import discQuestions from '../configs/suites/disc/questions.json'
import discTypes from '../configs/suites/disc/types.json'

import pr01Manifest from '../configs/suites/pr01/manifest.json'
import pr01Theme from '../configs/suites/pr01/theme.json'
import pr01Questions from '../configs/suites/pr01/questions.json'
import pr01Types from '../configs/suites/pr01/types.json'
import pr01Templates from '../configs/suites/pr01/templates.json'

type SuiteData = {
  manifest: Record<string, unknown>
  theme: SuiteTheme
  questions: Record<string, unknown>
  types: Record<string, unknown>
  templates?: TemplatesConfig
}

// 已加载配置的静态注册表（用于运行时按 ID 查找）
const SUITE_CONFIGS: Record<string, SuiteData> = {
  mbti: {
    manifest: mbtiManifest,
    theme: mbtiTheme as SuiteTheme,
    questions: mbtiQuestions,
    types: mbtiTypes,
  },
  disc: {
    manifest: discManifest,
    theme: discTheme as SuiteTheme,
    questions: discQuestions,
    types: discTypes,
  },
  pr01: {
    manifest: pr01Manifest,
    theme: pr01Theme as SuiteTheme,
    questions: pr01Questions,
    types: pr01Types,
    templates: pr01Templates as TemplatesConfig,
  },
}

/**
 * 加载套件索引
 */
export async function getSuiteIndex(): Promise<SuiteIndex> {
  try {
    const indexModule = await import('../configs/suites/index.json')
    return indexModule.default as SuiteIndex
  } catch {
    return { suites: [], updatedAt: '' }
  }
}

/**
 * 获取所有启用的套件列表
 */
export async function getSuites(): Promise<SuiteConfig[]> {
  const index = await getSuiteIndex()
  return index.suites
    .filter(suite => suite.enabled)
    .sort((a, b) => a.order - b.order)
}

// 缓存已加载的套件数据
const suiteDataCache = new Map<string, SuiteData>(
  Object.entries(SUITE_CONFIGS) as [string, SuiteData][],
)

/**
 * 加载套件完整数据
 */
export async function loadSuiteData(
  suiteId: string,
): Promise<SuiteData | null> {
  return suiteDataCache.get(suiteId) ?? null
}

/**
 * 加载套件元信息
 */
export async function loadSuiteConfig(
  suiteId: string,
): Promise<Record<string, unknown> | null> {
  const data = await loadSuiteData(suiteId)
  return data?.manifest ?? null
}

/**
 * 加载套件主题
 */
export async function loadSuiteTheme(
  suiteId: string,
): Promise<SuiteTheme | null> {
  const data = await loadSuiteData(suiteId)
  return data?.theme ?? null
}

/**
 * 加载套件题目
 */
export async function loadSuiteQuestions(
  suiteId: string,
): Promise<Record<string, unknown> | null> {
  const data = await loadSuiteData(suiteId)
  return data?.questions ?? null
}

/**
 * 加载套件类型定义
 */
export async function loadSuiteTypes(
  suiteId: string,
): Promise<Record<string, unknown> | null> {
  const data = await loadSuiteData(suiteId)
  return data?.types ?? null
}

/**
 * 加载套件模板配置
 */
export async function loadSuiteTemplates(
  suiteId: string,
): Promise<TemplatesConfig | null> {
  const data = await loadSuiteData(suiteId)
  return data?.templates ?? null
}

/**
 * 验证套件是否存在
 */
export async function suiteExists(suiteId: string): Promise<boolean> {
  const data = await loadSuiteData(suiteId)
  return data !== null && Object.keys(data.manifest).length > 0
}

/**
 * 加载完整套件数据
 */
export async function loadFullSuite(suiteId: string) {
  const data = await loadSuiteData(suiteId)
  if (!data) {
    throw new Error(`Suite not found: ${suiteId}`)
  }
  return {
    manifest: data.manifest,
    questions: data.questions,
    types: data.types,
    theme: data.theme,
    templates: data.templates,
  }
}

/**
 * 获取所有已加载的套件 ID 列表
 */
export function getLoadedSuiteIds(): string[] {
  return Array.from(suiteDataCache.keys())
}

/**
 * 清除套件缓存（用于开发模式热更新）
 */
export function clearSuiteCache(suiteId?: string): void {
  if (suiteId) {
    suiteDataCache.delete(suiteId)
  } else {
    // 重新从静态注册表恢复（开发热更新时恢复初始状态）
    for (const [id, config] of Object.entries(SUITE_CONFIGS)) {
      suiteDataCache.set(id, config)
    }
  }
}

/**
 * 获取所有可用的套件 ID（从 index.json 运行时获取）
 */
export async function getAvailableSuiteIds(): Promise<string[]> {
  const suites = await getSuites()
  return suites.map(s => s.id)
}
