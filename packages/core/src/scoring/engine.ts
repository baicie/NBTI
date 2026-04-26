/**
 * 计分引擎
 * 核心计分逻辑实现
 */

import type { Answer, ManifestScoring } from '../types'
import type { Question } from '../types/question'
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
  private questions: Question[]

  constructor(scoring: ManifestScoring, questions: Question[] = []) {
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
      case 'type':
        return this.calculateTypeScoring(
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

  /**
   * 人格类型计分（抽卡型测试）
   * - 直接按 typeId 累加权重
   * - 维度 PT = 常规人格题总分 / maxPT
   * - 维度 HD = 隐藏款题总分 / maxHD
   */
  private calculateTypeScoring(
    answers: Answer[],
    dimensions: string[],
    normalize: boolean,
  ): ScoringResult {
    const { hiddenTrigger, dimensionMapping } = this.scoring

    // 构建题目分类映射（normal / hidden）
    const normalQuestionIds = new Set<string>()
    const hiddenQuestionIds = new Set<string>()
    this.questions.forEach(q => {
      if (q.dimension === 'HD') {
        hiddenQuestionIds.add(q.id)
      } else {
        normalQuestionIds.add(q.id)
      }
    })

    // 收集所有 typeId 用于初始化
    const allTypeIds = new Set<string>()
    this.questions.forEach(q => {
      q.options.forEach(o => {
        if (o.weight) {
          Object.keys(o.weight).forEach(k => allTypeIds.add(k))
        }
      })
    })

    // 按 typeId 累加权重
    const typeScores: Record<string, number> = {}
    allTypeIds.forEach(id => {
      typeScores[id] = 0
    })

    answers.forEach(answer => {
      if (answer.weight) {
        Object.entries(answer.weight).forEach(([typeId, value]) => {
          if (typeScores[typeId] !== undefined) {
            typeScores[typeId] += value
          }
        })
      }
    })

    // 计算 PT 和 HD 的原始总分及最大值
    let normalTotal = 0
    let hiddenTotal = 0
    let normalMax = 0
    let hiddenMax = 0

    answers.forEach(answer => {
      const inHidden = hiddenQuestionIds.has(answer.questionId)
      if (answer.weight) {
        Object.values(answer.weight).forEach(v => {
          if (inHidden) {
            hiddenTotal += v
          } else {
            normalTotal += v
          }
        })
      }
    })

    // 最大值：按题目数量 × 权重范围估算
    normalMax = normalQuestionIds.size * 3 // 假设权重上限3
    hiddenMax = hiddenQuestionIds.size * 3

    // 初始化隐藏款 typeId 集合（用于累积隐藏题得分）
    const hiddenTypeScores: Record<string, number> = {}
    this.questions.forEach(q => {
      if (q.dimension === 'HD') {
        q.options.forEach(o => {
          if (o.weight) {
            Object.keys(o.weight).forEach(k => {
              hiddenTypeScores[k] = 0
            })
          }
        })
      }
    })

    // 计算隐藏款触发（按 typeId 累积隐藏题权重）
    let triggeredHiddenType: string | null = null
    if (hiddenTrigger) {
      const triggerQ = new Set(hiddenTrigger.triggerQuestions ?? [])

      // 累积隐藏题答案
      answers.forEach(a => {
        if (triggerQ.has(a.questionId) && a.weight) {
          Object.entries(a.weight).forEach(([typeId, value]) => {
            if (typeId in hiddenTypeScores) {
              hiddenTypeScores[typeId] += value
            }
          })
        }
      })

      // 最高累积分 ≥ 阈值 则触发
      const minScore = hiddenTrigger.minScore ?? 4
      let best = -1
      Object.entries(hiddenTypeScores).forEach(([typeId, score]) => {
        if (score >= minScore && score > best) {
          best = score
          triggeredHiddenType = typeId
        }
      })
    }

    // 计算常规题和隐藏题各自的 typeId 分数（分开计算，用于公平比较）
    const normalTypeScores: Record<string, number> = {}
    allTypeIds.forEach(id => {
      normalTypeScores[id] = 0
    })

    answers.forEach(answer => {
      if (!hiddenQuestionIds.has(answer.questionId) && answer.weight) {
        Object.entries(answer.weight).forEach(([typeId, value]) => {
          if (typeId in normalTypeScores) {
            normalTypeScores[typeId] += value
          }
        })
      }
    })

    // 确定常规题最高分
    let bestNormalTypeId: string | null = null
    let bestNormalScore = -1
    Object.entries(normalTypeScores).forEach(([typeId, score]) => {
      if (score > bestNormalScore) {
        bestNormalScore = score
        bestNormalTypeId = typeId
      }
    })

    // 隐藏款覆盖逻辑：隐藏款只在"隐藏题得分显著高于常规款"时才覆盖
    // 比较规则：(hiddenType 的隐藏题得分) - (常规款最高分的隐藏题得分) >= gapThreshold(3)
    // 效果：隐藏款答满独占格时（9-15分）可覆盖；随机情况下两者隐藏题得分相近则不覆盖
    let finalTypeId = bestNormalTypeId ?? 'FISH'
    if (triggeredHiddenType && hiddenTrigger) {
      const triggeredHiddenScore = hiddenTypeScores[triggeredHiddenType] ?? 0
      const bestNormalHiddenScore =
        hiddenTypeScores[bestNormalTypeId ?? ''] ?? 0
      const gapThreshold = 3
      if (triggeredHiddenScore - bestNormalHiddenScore >= gapThreshold) {
        finalTypeId = triggeredHiddenType
      }
    }

    // 构建维度分数
    const dimensionScores = dimensions.map(dim => {
      const mapping = dimensionMapping?.[dim]
      const total = mapping === 'hidden' ? hiddenTotal : normalTotal
      const max = mapping === 'hidden' ? hiddenMax : normalMax
      const percentage = max > 0 ? Math.round((total / max) * 100) : 0

      // 取维度定义中的 label
      const dimDef = this.questions.find(q => {
        if (mapping === 'hidden') return q.dimension === 'HD'
        return q.dimension === dim
      })
      const dimLabel = dimDef?.dimension ?? dim
      const [leftLetter, rightLetter] =
        dimLabel.length >= 2 ? [dimLabel[0], dimLabel[1]] : [dimLabel, dimLabel]

      return {
        dimensionId: dim,
        leftLetter,
        rightLetter,
        leftScore: total,
        rightScore: max - total,
        dominant: percentage >= 50 ? rightLetter : leftLetter,
        percentage: Math.min(100, Math.max(0, percentage)),
      }
    })

    // 归一化：typeId -> 百分比（最高分类型为100%）
    const normalizedScores: Record<string, number> = {}
    if (normalize) {
      const maxTypeScore = Math.max(...Object.values(typeScores), 1)
      Object.entries(typeScores).forEach(([typeId, score]) => {
        normalizedScores[typeId] = Math.round((score / maxTypeScore) * 100)
      })
    }

    return {
      typeCode: finalTypeId,
      dimensions: dimensionScores,
      rawScores: typeScores,
      normalizedScores,
    }
  }
}

/**
 * 快捷计分函数
 */
export function calculateScores(
  answers: Answer[],
  scoring: ManifestScoring,
  questions: Question[] = [],
  options?: ScoringOptions,
): ScoringResult {
  const engine = new ScoringEngine(scoring, questions)
  return engine.calculate(answers, options)
}
