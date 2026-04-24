/**
 * 类型映射器
 * 将多维度分数映射到具体的人格类型
 */

import type { PersonalityType } from '@nbti/core'

/**
 * 维度分数
 */
export interface DimensionScores {
  SA: number // 社交活跃度: 0=独处, 100=社交
  EE: number // 情绪表达度: 0=内敛, 100=外放
  AM: number // 行动模式: 0=计划, 100=随性
}

/**
 * 类型映射规则
 * 定义每种人格类型的特征范围
 */
interface TypeMappingRule {
  typeId: string
  // 各维度的范围 [min, max]，分数落在这个范围内就匹配
  saRange: [number, number]
  eeRange: [number, number]
  amRange: [number, number]
  // 优先级，用于处理重叠情况
  priority: number
}

/**
 * 类型映射规则表
 */
const TYPE_MAPPING_RULES: TypeMappingRule[] = [
  // 独处 + 内敛 + 计划
  {
    typeId: 'OFFL',
    saRange: [0, 25],
    eeRange: [0, 30],
    amRange: [0, 35],
    priority: 1,
  },
  // 独处 + 内敛 + 随性
  {
    typeId: 'FISH',
    saRange: [0, 35],
    eeRange: [0, 40],
    amRange: [50, 100],
    priority: 1,
  },
  // 社交 + 内敛 + 计划
  {
    typeId: 'JUDGE',
    saRange: [50, 100],
    eeRange: [0, 30],
    amRange: [0, 40],
    priority: 1,
  },
  // 社交 + 外放 + 计划
  {
    typeId: 'PLAN',
    saRange: [50, 100],
    eeRange: [40, 70],
    amRange: [0, 40],
    priority: 1,
  },
  // 社交 + 内敛 + 随性
  {
    typeId: 'MELON',
    saRange: [50, 100],
    eeRange: [0, 45],
    amRange: [40, 100],
    priority: 1,
  },
  // 社交 + 外放 + 随性
  {
    typeId: 'TALK',
    saRange: [60, 100],
    eeRange: [60, 100],
    amRange: [40, 100],
    priority: 1,
  },
  // 独处 + 外放 + 计划
  {
    typeId: 'CRAZY',
    saRange: [0, 45],
    eeRange: [60, 100],
    amRange: [0, 50],
    priority: 1,
  },
  // 独处 + 外放 + 随性
  {
    typeId: 'NITE',
    saRange: [0, 40],
    eeRange: [50, 100],
    amRange: [50, 100],
    priority: 1,
  },
  // 社交 + 外放 + 随性 (VIBE)
  {
    typeId: 'VIBE',
    saRange: [65, 100],
    eeRange: [50, 100],
    amRange: [50, 100],
    priority: 2,
  },
  // 社交 + 内敛 + 随性 (GHOST)
  {
    typeId: 'GHOST',
    saRange: [45, 80],
    eeRange: [0, 50],
    amRange: [45, 100],
    priority: 2,
  },
  // 特殊类型
  {
    typeId: 'UNDO',
    saRange: [30, 70],
    eeRange: [50, 100],
    amRange: [30, 70],
    priority: 3,
  },
  {
    typeId: 'HARD',
    saRange: [20, 60],
    eeRange: [40, 80],
    amRange: [20, 60],
    priority: 3,
  },
  {
    typeId: 'LATE',
    saRange: [20, 60],
    eeRange: [30, 70],
    amRange: [70, 100],
    priority: 3,
  },
  {
    typeId: 'DRAMA',
    saRange: [30, 70],
    eeRange: [50, 100],
    amRange: [30, 70],
    priority: 3,
  },
  {
    typeId: 'CHILL',
    saRange: [0, 50],
    eeRange: [20, 60],
    amRange: [30, 70],
    priority: 3,
  },
  {
    typeId: 'MAYBE',
    saRange: [30, 70],
    eeRange: [30, 70],
    amRange: [50, 80],
    priority: 3,
  },
  {
    typeId: 'OOPS',
    saRange: [30, 70],
    eeRange: [30, 70],
    amRange: [30, 70],
    priority: 3,
  },
  {
    typeId: 'SPY',
    saRange: [40, 80],
    eeRange: [40, 80],
    amRange: [40, 80],
    priority: 3,
  },
  // 隐藏款
  {
    typeId: 'LUCK',
    saRange: [0, 100],
    eeRange: [0, 100],
    amRange: [0, 100],
    priority: 4,
  },
  {
    typeId: 'GLITCH',
    saRange: [0, 100],
    eeRange: [0, 100],
    amRange: [0, 100],
    priority: 5,
  },
  {
    typeId: 'UNLUCK',
    saRange: [0, 100],
    eeRange: [0, 100],
    amRange: [0, 100],
    priority: 6,
  },
]

/**
 * 计算分数到百分比
 */
function normalizeToPercentile(
  score: number,
  min: number,
  max: number,
): number {
  if (max === min) return 50
  const percent = ((score - min) / (max - min)) * 100
  return Math.max(0, Math.min(100, Math.round(percent)))
}

/**
 * 检查分数是否在范围内
 */
function isInRange(value: number, range: [number, number]): boolean {
  return value >= range[0] && value <= range[1]
}

/**
 * 计算两个类型之间的匹配度
 */
function calculateMatchScore(
  dimensionScores: DimensionScores,
  rule: TypeMappingRule,
): number {
  const scoreMap: DimensionScores = {
    SA: normalizeToPercentile(dimensionScores.SA, 0, 9),
    EE: normalizeToPercentile(dimensionScores.EE, 0, 9),
    AM: normalizeToPercentile(dimensionScores.AM, 0, 9),
  }

  let totalScore = 0
  let matchCount = 0

  // 计算各维度匹配度
  const saMatch = isInRange(scoreMap.SA, rule.saRange)
  const eeMatch = isInRange(scoreMap.EE, rule.eeRange)
  const amMatch = isInRange(scoreMap.AM, rule.amRange)

  if (saMatch) {
    const center = (rule.saRange[0] + rule.saRange[1]) / 2
    const distance = Math.abs(scoreMap.SA - center)
    totalScore += 100 - distance
    matchCount++
  }

  if (eeMatch) {
    const center = (rule.eeRange[0] + rule.eeRange[1]) / 2
    const distance = Math.abs(scoreMap.EE - center)
    totalScore += 100 - distance
    matchCount++
  }

  if (amMatch) {
    const center = (rule.amRange[0] + rule.amRange[1]) / 2
    const distance = Math.abs(scoreMap.AM - center)
    totalScore += 100 - distance
    matchCount++
  }

  return matchCount > 0 ? totalScore / matchCount : 0
}

/**
 * 将原始分数转换为维度分数对象
 */
export function normalizeDimensionScores(
  rawScores: Record<string, number>,
): DimensionScores {
  const saScore = rawScores['SA'] ?? rawScores['S'] ?? 5
  const eeScore = rawScores['EE'] ?? rawScores['E'] ?? 5
  const amScore = rawScores['AM'] ?? rawScores['A'] ?? 5

  return {
    SA: normalizeToPercentile(saScore, 0, 9),
    EE: normalizeToPercentile(eeScore, 0, 9),
    AM: normalizeToPercentile(amScore, 0, 9),
  }
}

/**
 * 映射到人格类型
 */
export function mapToType(
  dimensionScores: DimensionScores,
  allTypes: PersonalityType[],
): PersonalityType | null {
  // 计算每个类型的匹配度
  const matches: Array<{
    typeId: string
    score: number
    priority: number
  }> = []

  for (const rule of TYPE_MAPPING_RULES) {
    const score = calculateMatchScore(dimensionScores, rule)
    if (score > 30) {
      // 最低匹配阈值
      matches.push({
        typeId: rule.typeId,
        score,
        priority: rule.priority,
      })
    }
  }

  if (matches.length === 0) {
    // 默认返回 FISH
    return allTypes.find(t => t.id === 'FISH') || null
  }

  // 按分数和优先级排序
  matches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return a.priority - b.priority
  })

  const bestMatch = matches[0]
  return allTypes.find(t => t.id === bestMatch.typeId) || null
}

/**
 * 获取类型匹配结果详情
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
  }>
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
): TypeMatchResult {
  // 标准化维度分数
  const normalizedScores = normalizeDimensionScores(rawScores)

  // 获取匹配类型
  const matchedType = mapToType(normalizedScores, allTypes)

  // 构建维度结果
  const defaultDimensions = [
    {
      id: 'SA',
      name: { zh: '社交活跃度', en: 'Social Activity' },
      leftLabel: { zh: '独处', en: 'Solitary' },
      rightLabel: { zh: '社交', en: 'Social' },
    },
    {
      id: 'EE',
      name: { zh: '情绪表达度', en: 'Emotional Expression' },
      leftLabel: { zh: '内敛', en: 'Reserved' },
      rightLabel: { zh: '外放', en: 'Expressive' },
    },
    {
      id: 'AM',
      name: { zh: '行动模式', en: 'Action Mode' },
      leftLabel: { zh: '计划', en: 'Planned' },
      rightLabel: { zh: '随性', en: 'Spontaneous' },
    },
  ]

  const dims = dimensionDefinitions || defaultDimensions

  const dimensionResults = dims.map(dim => {
    const scoreMap: Record<string, number> = {
      SA: normalizedScores.SA,
      EE: normalizedScores.EE,
      AM: normalizedScores.AM,
    }

    const percentage = scoreMap[dim.id] ?? 50
    const dominant = percentage > 50 ? dim.rightLabel.zh : dim.leftLabel.zh

    return {
      id: dim.id,
      name: dim.name.zh,
      leftLetter: dim.leftLabel.zh.charAt(0),
      rightLetter: dim.rightLabel.zh.charAt(0),
      percentage,
      dominant,
    }
  })

  // 计算所有类型的匹配度
  const matchScores = allTypes.map(type => {
    const rule = TYPE_MAPPING_RULES.find(r => r.typeId === type.id)
    if (!rule) {
      return { typeId: type.id, typeName: type.name.zh, score: 0 }
    }
    const score = calculateMatchScore(normalizedScores, rule)
    return { typeId: type.id, typeName: type.name.zh, score }
  })

  matchScores.sort((a, b) => b.score - a.score)

  return {
    matchedType,
    typeCode: matchedType?.id || 'FISH',
    dimensionResults,
    matchScores: matchScores.slice(0, 5),
  }
}
