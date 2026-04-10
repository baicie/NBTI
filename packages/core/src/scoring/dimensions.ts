/**
 * 维度计算模块
 * 负责计算各维度的分数
 */

import type { Answer } from '../types'
import type { DimensionScore } from './types'

/**
 * 问题简略信息（用于计分）
 */
interface QuestionInfo {
  id: string
  dimension: string
  isReverse?: boolean
}

/**
 * 计算维度分数
 */
export function calculateDimensionScores(
  answers: Answer[],
  questions: QuestionInfo[],
  dimensions: string[],
): Record<string, { left: number; right: number }> {
  // 初始化维度分数
  const scores: Record<string, { left: number; right: number }> = {}

  dimensions.forEach(dim => {
    scores[dim] = { left: 0, right: 0 }
  })

  // 汇总答案权重
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId)
    if (!question) return

    const weight = answer.weight
    const isReverse = question.isReverse ?? false

    // 获取该题所属维度
    const dim = question.dimension
    const [leftLetter, rightLetter] = dim.split('')

    Object.entries(weight).forEach(([key, value]) => {
      // 如果是反向计分，取反权重
      const adjustedValue = isReverse ? -value : value

      if (key === leftLetter) {
        scores[dim].left += Math.abs(adjustedValue)
      } else if (key === rightLetter) {
        scores[dim].right += Math.abs(adjustedValue)
      }
    })
  })

  return scores
}

/**
 * 确定维度主导字母
 */
export function determineDominant(
  leftScore: number,
  rightScore: number,
  leftLetter: string,
  rightLetter: string,
): string {
  if (leftScore > rightScore) {
    return leftLetter
  } else if (rightScore > leftScore) {
    return rightLetter
  }
  // 平局时返回第一个字母
  return leftLetter
}

/**
 * 计算维度百分比
 */
export function calculatePercentage(
  leftScore: number,
  rightScore: number,
  method: 'difference' | 'ratio' | 'absolute' = 'difference',
): number {
  const total = leftScore + rightScore

  if (total === 0) {
    return 50 // 默认 50%
  }

  const dominant = Math.max(leftScore, rightScore)

  switch (method) {
    case 'difference': {
      // 差值法：计算主导方向占总和的百分比
      return Math.round((dominant / total) * 100)
    }
    case 'ratio': {
      // 比值法：计算比值（0-100 范围）
      const ratio = dominant / (total - dominant + 1) // +1 避免除零
      return Math.round(Math.min(100, (ratio / 2) * 100))
    }
    case 'absolute': {
      // 绝对值法：直接使用主导方向分数
      return Math.round(Math.min(100, dominant))
    }
    default:
      return 50
  }
}

/**
 * 构建维度分数详情
 */
export function buildDimensionScores(
  rawScores: Record<string, { left: number; right: number }>,
  dimensions: string[],
  method: 'difference' | 'ratio' | 'absolute' = 'difference',
): DimensionScore[] {
  return dimensions.map(dim => {
    const [leftLetter, rightLetter] = dim.split('')
    const { left, right } = rawScores[dim]
    const dominant = determineDominant(left, right, leftLetter, rightLetter)
    const percentage = calculatePercentage(left, right, method)

    return {
      dimensionId: dim,
      leftLetter,
      rightLetter,
      leftScore: left,
      rightScore: right,
      dominant,
      percentage,
    }
  })
}

/**
 * 生成类型代码
 */
export function generateTypeCode(
  dimensionScores: Array<{ dominant: string }>,
): string {
  return dimensionScores.map(d => d.dominant).join('')
}

/**
 * 归一化分数到 0-100 范围
 */
export function normalizeScores(
  rawScores: Record<string, { left: number; right: number }>,
  dimensions: string[],
): Record<string, number> {
  const normalized: Record<string, number> = {}

  dimensions.forEach(dim => {
    const { left, right } = rawScores[dim]
    const total = left + right
    if (total === 0) {
      normalized[dim] = 50
    } else {
      normalized[dim] = Math.round((left / total) * 100)
    }
  })

  return normalized
}
