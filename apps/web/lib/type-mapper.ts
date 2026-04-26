/**
 * 类型映射器
 * 将答案直接映射到人格类型（基于计分系统）
 */

import type { PersonalityType, Question } from '@nbti/core'

/**
 * 隐藏款触发规则
 */
interface HiddenRule {
  typeId: string
  triggerQuestions: string[] // 需要达到满分的题目ID
  minScore: number // 触发最低分数
}

/**
 * 隐藏款触发配置
 */
const HIDDEN_TRIGGERS: HiddenRule[] = [
  {
    typeId: 'JUDGE',
    triggerQuestions: ['q013', 'q014', 'q015', 'q016', 'q017'],
    minScore: 8,
  },
  {
    typeId: 'SPY',
    triggerQuestions: ['q013', 'q014', 'q015', 'q016', 'q017'],
    minScore: 8,
  },
  {
    typeId: 'LUCK',
    triggerQuestions: ['q013', 'q014', 'q015', 'q016', 'q017'],
    minScore: 8,
  },
  {
    typeId: 'GLITCH',
    triggerQuestions: ['q013', 'q014', 'q015', 'q016', 'q017'],
    minScore: 8,
  },
  {
    typeId: 'UNLUCK',
    triggerQuestions: ['q013', 'q014', 'q015', 'q016', 'q017'],
    minScore: 8,
  },
]

/**
 * 计算人格类型的匹配度分数
 */
function calculateTypeScore(
  rawScores: Record<string, number>,
  typeId: string,
): number {
  return rawScores[typeId] ?? 0
}

/**
 * 检查隐藏款是否触发
 */
function checkHiddenTrigger(
  rawScores: Record<string, number>,
  answeredQuestions: Set<string>,
): string | null {
  for (const rule of HIDDEN_TRIGGERS) {
    // 只有回答了隐藏款题目才检查
    const answeredHidden = rule.triggerQuestions.filter(q =>
      answeredQuestions.has(q),
    )
    if (answeredHidden.length === 0) continue

    // 计算该隐藏款的分数
    const score = rawScores[rule.typeId] ?? 0
    if (score >= rule.minScore) {
      return rule.typeId
    }
  }
  return null
}

/**
 * 映射到人格类型
 */
export function mapToType(
  rawScores: Record<string, number>,
  allTypes: PersonalityType[],
  answeredQuestionIds?: Set<string>,
  /** engine 算出的最高分常规类型，隐藏款覆盖时需要确保得分更高 */
  bestRegularTypeId?: string,
  bestRegularScore?: number,
): PersonalityType | null {
  // 先检查隐藏款触发（仅在隐藏款得分 > 常规最高分时才覆盖）
  if (answeredQuestionIds) {
    const hiddenType = checkHiddenTrigger(rawScores, answeredQuestionIds)
    if (hiddenType) {
      const hiddenScore = rawScores[hiddenType] ?? 0
      // 仅当隐藏款得分严格高于常规最高分时才触发
      if (bestRegularScore !== undefined && hiddenScore > bestRegularScore) {
        const type = allTypes.find(t => t.id === hiddenType)
        if (type) return type
      }
    }
  }

  // 如果没有触发隐藏款，使用 engine 传过来的 typeCode
  if (bestRegularTypeId) {
    const type = allTypes.find(t => t.id === bestRegularTypeId)
    if (type) return type
  }

  // 计算所有常规人格的得分（兜底逻辑）
  const regularTypes = allTypes.filter(t => t.rarity !== 'hidden')
  let bestType: PersonalityType | null = null
  let bestScore = -1

  for (const type of regularTypes) {
    const score = calculateTypeScore(rawScores, type.id)
    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }

  // 如果没有得分，返回第一个常规人格作为默认
  if (!bestType && regularTypes.length > 0) {
    bestType = regularTypes[0]
  }

  return bestType
}

/**
 * 类型匹配结果
 */
export interface TypeMatchResult {
  matchedType: PersonalityType | null
  typeCode: string
  dimensionResults: {
    id: string
    name: string
    leftLetter: string
    rightLetter: string
    percentage: number
    dominant: string
  }[]
  matchScores: Array<{
    typeId: string
    typeName: string
    score: number
    percentage: number
  }>
  answeredQuestionIds?: Set<string>
}

/**
 * 计算类型相对于自身的匹配度百分比
 * 隐藏款类型只出现在部分题目中，需要按实际出现题目计算
 */
function calculateTypeMatchPercentage(
  rawScores: Record<string, number>,
  questions: Question[],
  typeId: string,
): number {
  const score = rawScores[typeId] ?? 0
  if (score === 0) return 0

  // 计算该类型的最大可能分数（仅统计实际有权重的题目）
  let maxPossibleScore = 0
  for (const q of questions) {
    const hasType = q.options.some(o => {
      const w = o.weight?.[typeId]
      return typeof w === 'number' && w > 0
    })
    if (!hasType) continue
    const maxWeight = Math.max(
      ...q.options.map(o => {
        const w = o.weight?.[typeId]
        return typeof w === 'number' ? w : 0
      }),
    )
    maxPossibleScore += maxWeight
  }

  if (maxPossibleScore === 0) return 0
  return Math.round((score / maxPossibleScore) * 100)
}

export function getTypeMatchResult(
  rawScores: Record<string, number>,
  allTypes: PersonalityType[],
  dimensionDefinitions?: Array<{
    id: string
    name: Record<string, string>
    leftLabel: Record<string, string>
    rightLabel: Record<string, string>
  }>,
  answeredQuestionIds?: Set<string>,
  /** engine 算出的最高分常规类型和分数，用于隐藏款覆盖判断 */
  bestRegularTypeId?: string,
  bestRegularScore?: number,
  /** 用于计算类型匹配度百分比的题目列表 */
  questions?: Question[],
): TypeMatchResult {
  // 获取匹配的人格类型（传入 engine 结果，避免重复计算）
  const matchedType = mapToType(
    rawScores,
    allTypes,
    answeredQuestionIds,
    bestRegularTypeId,
    bestRegularScore,
  )

  // 构建维度结果（用于显示）
  const defaultDimensions = [
    {
      id: 'PT',
      name: { zh: '常规人格', en: 'Personality Type' },
      leftLabel: { zh: '普通款', en: 'Normal' },
      rightLabel: { zh: '抽象款', en: 'Absurd' },
    },
  ]

  const dims = dimensionDefinitions || defaultDimensions

  // 计算 matchedType 自身的最大可能分数，用于维度百分比
  const matchedTypeMaxScore =
    matchedType && questions !== undefined
      ? (() => {
          let max = 0
          for (const q of questions) {
            const hasType = q.options.some(o => {
              const w = o.weight?.[matchedType.id]
              return typeof w === 'number' && w > 0
            })
            if (!hasType) continue
            const maxWeight = Math.max(
              ...q.options.map(o => {
                const w = o.weight?.[matchedType.id]
                return typeof w === 'number' ? w : 0
              }),
            )
            max += maxWeight
          }
          return max
        })()
      : 0

  const dimensionResults = dims.map(dim => {
    const matchedScore = matchedType ? (rawScores[matchedType.id] ?? 0) : 0
    const percentage =
      matchedTypeMaxScore > 0
        ? Math.round((matchedScore / matchedTypeMaxScore) * 100)
        : 50
    const dominant = matchedType?.name?.zh || '未知'

    return {
      id: dim.id,
      name: dim.name.zh,
      leftLetter: dim.leftLabel.zh.charAt(0),
      rightLetter: dim.rightLabel.zh.charAt(0),
      percentage,
      dominant,
    }
  })

  // 计算所有类型的匹配度（使用相对于自身最大可能分数的百分比）
  const matchScores = allTypes
    .map(type => ({
      typeId: type.id,
      typeName: type.name?.zh || type.id,
      score: rawScores[type.id] ?? 0,
      percentage:
        questions !== undefined
          ? calculateTypeMatchPercentage(rawScores, questions, type.id)
          : // 兜底：使用相对排名
            Math.round(
              ((rawScores[type.id] ?? 0) /
                Math.max(...allTypes.map(t => rawScores[t.id] ?? 0), 1)) *
                100,
            ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return {
    matchedType,
    typeCode: matchedType?.id || 'FISH',
    dimensionResults,
    matchScores,
    answeredQuestionIds,
  }
}
