/**
 * Questions 类型定义
 * questions.json 是题库数据配置文件
 */

import type { LocalizedString } from './core'

/**
 * 题库元信息
 */
export interface QuestionsMeta {
  totalQuestions?: number
  timeEstimate?: number
  tags?: string[]
  description?: LocalizedString
}

/**
 * 维度定义
 */
export interface Dimension {
  id: string
  name: LocalizedString
  description?: LocalizedString
  leftLabel?: LocalizedString
  rightLabel?: LocalizedString
}

/**
 * 题目分类
 */
export interface Category {
  id: string
  name: LocalizedString
  description?: LocalizedString
  questionIds?: string[]
}

/**
 * 选项权重
 */
export interface OptionWeight {
  [key: string]: number
}

/**
 * 题目选项
 */
export interface QuestionOption {
  id: string
  content: LocalizedString
  image?: string | null
  weight: OptionWeight
  tooltip?: LocalizedString
}

/**
 * 题目
 */
export interface Question {
  id: string
  dimension: string
  category?: string
  content: LocalizedString
  image?: string | null
  isReverse?: boolean
  required?: boolean
  options: QuestionOption[]
}

/**
 * 题库数据
 */
export interface QuestionsData {
  meta: QuestionsMeta
  dimensions?: Dimension[]
  categories?: Category[]
  questions: Question[]
}
