/**
 * Suite 加载器
 * 负责加载套件配置、题目、类型和主题
 */

import type { SuiteConfig, SuiteIndex, SuiteTheme } from './types/suite'

// 直接 import JSON 文件（静态分析友好）
import suiteIndexData from '../configs/suites/index.json'
import mbtiManifest from '../configs/suites/mbti/manifest.json'
import mbtiTheme from '../configs/suites/mbti/theme.json'
import mbtiQuestions from '../configs/suites/mbti/questions.json'
import mbtiTypes from '../configs/suites/mbti/types.json'
import discManifest from '../configs/suites/disc/manifest.json'
import discTheme from '../configs/suites/disc/theme.json'
import discQuestions from '../configs/suites/disc/questions.json'
import discTypes from '../configs/suites/disc/types.json'

/**
 * 获取套件索引
 */
export async function getSuiteIndex(): Promise<SuiteIndex> {
  return suiteIndexData as SuiteIndex
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
const suiteDataCache: Map<
  string,
  {
    manifest: Record<string, unknown>
    questions: Record<string, unknown>
    types: Record<string, unknown>
    theme: SuiteTheme
  }
> = new Map()

/**
 * 加载套件元信息
 */
export async function loadSuiteConfig(
  suiteId: string,
): Promise<Record<string, unknown>> {
  const data = await loadSuiteData(suiteId)
  return data.manifest
}

/**
 * 加载套件主题
 */
export async function loadSuiteTheme(suiteId: string): Promise<SuiteTheme> {
  const data = await loadSuiteData(suiteId)
  return data.theme
}

/**
 * 加载套件题目
 */
export async function loadSuiteQuestions(
  suiteId: string,
): Promise<Record<string, unknown>> {
  const data = await loadSuiteData(suiteId)
  return data.questions
}

/**
 * 加载套件类型定义
 */
export async function loadSuiteTypes(
  suiteId: string,
): Promise<Record<string, unknown>> {
  const data = await loadSuiteData(suiteId)
  return data.types
}

/**
 * 加载套件完整数据
 */
async function loadSuiteData(suiteId: string) {
  // 从缓存获取
  if (suiteDataCache.has(suiteId)) {
    return suiteDataCache.get(suiteId)!
  }

  // 根据 suiteId 动态加载对应套件的数据
  let manifest: Record<string, unknown>
  let questions: Record<string, unknown>
  let types: Record<string, unknown>
  let theme: SuiteTheme

  switch (suiteId) {
    case 'mbti':
      manifest = mbtiManifest as Record<string, unknown>
      questions = mbtiQuestions as Record<string, unknown>
      types = mbtiTypes as Record<string, unknown>
      theme = mbtiTheme as SuiteTheme
      break
    case 'disc':
      manifest = discManifest as Record<string, unknown>
      questions = discQuestions as Record<string, unknown>
      types = discTypes as Record<string, unknown>
      theme = discTheme as SuiteTheme
      break
    default:
      throw new Error(`Unknown suite: ${suiteId}`)
  }

  const data = { manifest, questions, types, theme }
  suiteDataCache.set(suiteId, data)
  return data
}

/**
 * 验证套件是否存在
 */
export async function suiteExists(suiteId: string): Promise<boolean> {
  try {
    await loadSuiteData(suiteId)
    return true
  } catch {
    return false
  }
}

/**
 * 加载完整套件数据
 */
export async function loadFullSuite(suiteId: string) {
  const data = await loadSuiteData(suiteId)
  return {
    manifest: data.manifest,
    questions: data.questions,
    types: data.types,
    theme: data.theme,
  }
}
