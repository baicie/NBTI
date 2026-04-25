/**
 * 多维度计分引擎
 * 支持多个维度组合的计分方式
 */

import type { OptionWeight } from '@nbti/core'

/**
 * 维度定义
 */
export interface Dimension {
  id: string
  name: Record<string, string>
  leftLabel: Record<string, string>
  rightLabel: Record<string, string>
}

/**
 * 答案
 */
export interface Answer {
  questionId: string
  optionId: string
  weight: OptionWeight
}

/**
 * 题目
 */
export interface Question {
  id: string
  content: Record<string, string>
  options: Array<{
    id: string
    content: Record<string, string>
    weight: OptionWeight
  }>
}

/**
 * 维度分数
 */
export interface DimensionScore {
  dimensionId: string
  leftScore: number
  rightScore: number
  percentage: number
  dominant: string
}

/**
 * 计分结果
 */
export interface MultiDimensionalResult {
  dimensionScores: DimensionScore[]
  rawScores: Record<string, number>
  typeCode: string
  topMatch: string
  matchPercentage: number
}

/**
 * 计算多维度分数
 */
export function calculateMultiDimensionalScores(
  answers: Answer[],
  questions: Question[],
  dimensions: Dimension[],
): Record<string, { left: number; right: number }> {
  // 初始化分数
  const scores: Record<string, { left: number; right: number }> = {}

  dimensions.forEach(dim => {
    scores[dim.id] = { left: 0, right: 0 }
  })

  // 获取维度的左右字母
  const dimensionLetters: Record<string, { left: string; right: string }> = {}
  dimensions.forEach(dim => {
    const left = dim.leftLabel.zh.charAt(0)
    const right = dim.rightLabel.zh.charAt(0)
    dimensionLetters[dim.id] = { left, right }
  })

  // 汇总答案
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    if (!question) return

    const option = question.options.find(o => o.id === answer.optionId)
    if (!option) return

    const weight = option.weight

    // 遍历所有维度，累加分数
    dimensions.forEach(dim => {
      const letters = dimensionLetters[dim.id]

      // 计算该选项对这个维度的贡献
      Object.entries(weight).forEach(([key, value]) => {
        if (key === letters.left || key === letters.left.toUpperCase()) {
          scores[dim.id].left += value
        } else if (
          key === letters.right ||
          key === letters.right.toUpperCase()
        ) {
          scores[dim.id].right += value
        }
      })
    })
  })

  return scores
}

/**
 * 计算维度百分比
 */
export function calculateDimensionPercentage(
  leftScore: number,
  rightScore: number,
): number {
  const total = leftScore + rightScore
  if (total === 0) return 50
  return Math.round((leftScore / total) * 100)
}

/**
 * 标准化分数到 0-9 范围
 */
export function normalizeToScale9(
  rawScores: Record<string, { left: number; right: number }>,
  dimensions: Dimension[],
): Record<string, number> {
  const normalized: Record<string, number> = {}

  dimensions.forEach(dim => {
    const scores = rawScores[dim.id]
    if (!scores) {
      normalized[dim.id] = 5
      return
    }

    const total = scores.left + scores.right
    const percentage = total > 0 ? (scores.left / total) * 100 : 50

    // 转换为 0-9 范围
    // 0% = 0, 100% = 9
    normalized[dim.id] = Math.round((percentage / 100) * 9)
  })

  return normalized
}

/**
 * 获取完整的计分结果
 */
export function getScoringResult(
  answers: Answer[],
  questions: Question[],
  dimensions: Dimension[],
): MultiDimensionalResult {
  // 计算原始分数
  const rawScores = calculateMultiDimensionalScores(
    answers,
    questions,
    dimensions,
  )

  // 计算维度百分比
  const dimensionScores: DimensionScore[] = dimensions.map(dim => {
    const scores = rawScores[dim.id]
    const percentage = calculateDimensionPercentage(scores.left, scores.right)

    const letters = {
      left: dim.leftLabel.zh.charAt(0),
      right: dim.rightLabel.zh.charAt(0),
    }

    return {
      dimensionId: dim.id,
      leftScore: scores.left,
      rightScore: scores.right,
      percentage,
      dominant: percentage > 50 ? letters.left : letters.right,
    }
  })

  // 标准化分数（保留以支持未来扩展）
  normalizeToScale9(rawScores, dimensions)

  // 生成类型代码
  const typeCode = dimensionScores.map(d => d.dominant).join('')

  // 计算最高匹配度（用于显示）
  const matchPercentage =
    dimensionScores.reduce((sum, d) => {
      const distanceFromCenter = Math.abs(d.percentage - 50)
      return sum + (100 - distanceFromCenter * 2)
    }, 0) / dimensionScores.length

  return {
    dimensionScores,
    rawScores: Object.fromEntries(
      Object.entries(rawScores).map(([key, val]) => [
        key,
        val.left + val.right,
      ]),
    ),
    typeCode,
    topMatch: typeCode,
    matchPercentage: Math.round(matchPercentage),
  }
}
