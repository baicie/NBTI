/**
 * 计分引擎类型定义
 */

/**
 * 计分类型
 */
export type ScoringType = 'dimension' | 'percentage' | 'weighted-sum'

/**
 * 计算方法
 */
export type CalculateMethod = 'difference' | 'ratio' | 'absolute'

/**
 * 维度分数
 */
export interface DimensionScore {
  dimensionId: string
  leftLetter: string
  rightLetter: string
  leftScore: number
  rightScore: number
  dominant: string
  percentage: number
}

/**
 * 计分结果
 */
export interface ScoringResult {
  typeCode: string
  dimensions: DimensionScore[]
  rawScores: Record<string, number>
  normalizedScores: Record<string, number>
}

/**
 * 计分选项
 */
export interface ScoringOptions {
  normalizeOutput?: boolean
}
