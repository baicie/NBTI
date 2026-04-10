/**
 * 计分引擎
 * 核心计分逻辑实现
 */

import type { Answer, ManifestScoring } from '../types'
import type { ScoringOptions, ScoringResult } from './types'
import {
  buildDimensionScores,
  calculateDimensionScores,
  generateTypeCode,
  normalizeScores,
} from './dimensions'

/**
 * 计分引擎类
 */
export class ScoringEngine {
  private scoring: ManifestScoring
  private questions: { id: string; dimension: string; isReverse?: boolean }[]

  constructor(
    scoring: ManifestScoring,
    questions: { id: string; dimension: string; isReverse?: boolean }[] = [],
  ) {
    this.scoring = scoring
    this.questions = questions
  }

  /**
   * 计算分数
   */
  calculate(answers: Answer[], options?: ScoringOptions): ScoringResult {
    const {
      type,
      dimensions: scoringDimensions,
      calculateMethod = 'difference',
      normalizeOutput = true,
    } = this.scoring

    switch (type) {
      case 'dimension':
        return this.calculateDimensionScoring(
          answers,
          scoringDimensions,
          calculateMethod,
          options?.normalizeOutput ?? normalizeOutput,
        )
      case 'percentage':
        return this.calculatePercentageScoring(
          answers,
          scoringDimensions,
          options?.normalizeOutput ?? normalizeOutput,
        )
      case 'weighted-sum':
        return this.calculateWeightedSumScoring(
          answers,
          scoringDimensions,
          options?.normalizeOutput ?? normalizeOutput,
        )
      default:
        throw new Error(`Unknown scoring type: ${type}`)
    }
  }

  /**
   * 维度差值法计分（MBTI）
   */
  private calculateDimensionScoring(
    answers: Answer[],
    dimensions: string[],
    method: 'difference' | 'ratio' | 'absolute',
    normalize: boolean,
  ): ScoringResult {
    // 构建问题映射
    const questionMap = new Map(this.questions.map(q => [q.id, q]))

    // 为答案补充题目信息
    const enrichedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId)
      return {
        ...answer,
        dimension: question?.dimension ?? '',
        isReverse: question?.isReverse ?? false,
      }
    })

    // 计算原始分数
    const rawScores = calculateDimensionScores(
      enrichedAnswers,
      this.questions,
      dimensions,
    )

    // 构建维度分数详情
    const dimensionScores = buildDimensionScores(rawScores, dimensions, method)

    // 生成类型代码
    const typeCode = generateTypeCode(dimensionScores)

    // 归一化
    const normalizedScores = normalize
      ? normalizeScores(rawScores, dimensions)
      : {}

    return {
      typeCode,
      dimensions: dimensionScores,
      rawScores: Object.fromEntries(
        Object.entries(rawScores).map(([dim, scores]) => [
          dim,
          scores.left - scores.right,
        ]),
      ),
      normalizedScores,
    }
  }

  /**
   * 百分比法计分（大五人格）
   */
  private calculatePercentageScoring(
    answers: Answer[],
    dimensions: string[],
    normalize: boolean,
  ): ScoringResult {
    // 初始化分数
    const scores: Record<string, number> = {}
    dimensions.forEach(dim => {
      scores[dim] = 0
    })

    // 汇总答案
    answers.forEach(answer => {
      const question = this.questions.find(q => q.id === answer.questionId)
      if (!question) return

      const dim = question.dimension
      if (!scores[dim] && scores[dim] !== 0) {
        scores[dim] = 0
      }

      // 累加权重
      Object.values(answer.weight).forEach(value => {
        scores[dim] += value
      })
    })

    // 计算百分比
    const dimensionScores = dimensions.map(dim => {
      const total = scores[dim]
      const maxScore = this.questions
        .filter(q => q.dimension === dim)
        .reduce(sum => {
          // 假设每题最大权重为 3
          return sum + 3
        }, 0)

      const percentage =
        maxScore > 0 ? Math.round((total / maxScore) * 100) : 50
      const [leftLetter, rightLetter] = dim.split('')

      return {
        dimensionId: dim,
        leftLetter,
        rightLetter,
        leftScore: scores[dim],
        rightScore: maxScore - scores[dim],
        dominant: percentage >= 50 ? leftLetter : rightLetter,
        percentage,
      }
    })

    // 生成类型代码
    const typeCode = dimensionScores.map(d => d.dominant).join('')

    return {
      typeCode,
      dimensions: dimensionScores,
      rawScores: scores,
      normalizedScores: normalize
        ? Object.fromEntries(dimensions.map(dim => [dim, scores[dim]]))
        : {},
    }
  }

  /**
   * 加权求和法计分
   */
  private calculateWeightedSumScoring(
    answers: Answer[],
    dimensions: string[],
    normalize: boolean,
  ): ScoringResult {
    // 初始化分数
    const scores: Record<string, number> = {}
    dimensions.forEach(dim => {
      scores[dim] = 0
    })

    // 汇总答案
    answers.forEach(answer => {
      Object.entries(answer.weight).forEach(([key, value]) => {
        if (scores[key] !== undefined) {
          scores[key] += value
        }
      })
    })

    // 构建维度分数
    const dimensionScores = dimensions.map(dim => {
      const [leftLetter, rightLetter] = dim.split('')
      const total = scores[dim] ?? 0

      return {
        dimensionId: dim,
        leftLetter,
        rightLetter,
        leftScore: scores[leftLetter] ?? 0,
        rightScore: scores[rightLetter] ?? 0,
        dominant:
          (scores[leftLetter] ?? 0) >= (scores[rightLetter] ?? 0)
            ? leftLetter
            : rightLetter,
        percentage: Math.round(
          ((scores[leftLetter] ?? 0) / (total || 1)) * 100,
        ),
      }
    })

    const typeCode = dimensionScores.map(d => d.dominant).join('')

    return {
      typeCode,
      dimensions: dimensionScores,
      rawScores: scores,
      normalizedScores: normalize ? scores : {},
    }
  }
}

/**
 * 快捷计分函数
 */
export function calculateScores(
  answers: Answer[],
  scoring: ManifestScoring,
  questions: { id: string; dimension: string; isReverse?: boolean }[] = [],
  options?: ScoringOptions,
): ScoringResult {
  const engine = new ScoringEngine(scoring, questions)
  return engine.calculate(answers, options)
}
