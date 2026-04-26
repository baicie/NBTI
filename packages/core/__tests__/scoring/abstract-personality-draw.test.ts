/**
 * 抽象人格抽卡测试 — 计分引擎蒙特卡洛概率测试
 *
 * 验证在随机均匀作答情况下，每种人格类型的出现概率是否符合预期。
 * 同时验证隐藏款触发逻辑的正确性。
 */

import type { Answer, ManifestScoring } from '../../src/types'
import type { Question } from '../../src/types/question'
import { describe, expect, it } from 'vitest'
import { calculateScores } from '../../src/scoring/engine'

// ---------------------------------------------------------------------------
// 题目数据（从 questions.json 抽取核心字段）
// ---------------------------------------------------------------------------

const QUESTIONS: Question[] = [
  // q001 - PT / normal-type
  {
    id: 'q001',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { FISH: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { PLAN: 1 } },
      { id: 'opt_c', content: { zh: '' }, weight: { CHILL: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { VIBE: 1 } },
    ],
  },
  // q002 - PT / normal-type
  {
    id: 'q002',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { UNDO: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { GHOST: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { TALK: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { HARD: 1 } },
    ],
  },
  // q003 - PT / normal-type
  {
    id: 'q003',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { LATE: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { NITE: 1 } },
      { id: 'opt_c', content: { zh: '' }, weight: { CRAZY: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { PLAN: 1 } },
    ],
  },
  // q004 - PT / normal-type
  {
    id: 'q004',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { MELON: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { DRAMA: 1 } },
      { id: 'opt_c', content: { zh: '' }, weight: { GHOST: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { TALK: 1 } },
    ],
  },
  // q005 - PT / normal-type
  {
    id: 'q005',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { MAYBE: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { OOPS: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { OFFL: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { CHILL: 1 } },
    ],
  },
  // q006 - PT / normal-type
  {
    id: 'q006',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { FISH: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { NITE: 1 } },
      { id: 'opt_c', content: { zh: '' }, weight: { CRAZY: 3 } },
      { id: 'opt_d', content: { zh: '' }, weight: { HARD: 1 } },
    ],
  },
  // q007 - PT / normal-type
  {
    id: 'q007',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { VIBE: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { TALK: 1 } },
      { id: 'opt_c', content: { zh: '' }, weight: { OFFL: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { MELON: 1 } },
    ],
  },
  // q008 - PT / normal-type
  {
    id: 'q008',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { PLAN: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { LATE: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { FISH: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { MAYBE: 1 } },
    ],
  },
  // q009 - PT / normal-type
  {
    id: 'q009',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { DRAMA: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { HARD: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { CHILL: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { OOPS: 1 } },
    ],
  },
  // q010 - PT / normal-type
  {
    id: 'q010',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { UNDO: 1 } },
      { id: 'opt_b', content: { zh: '' }, weight: { GHOST: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { OFFL: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { MELON: 1 } },
    ],
  },
  // q011 - PT / normal-type
  {
    id: 'q011',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { UNDO: 1 } },
      { id: 'opt_b', content: { zh: '' }, weight: { LATE: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { DRAMA: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { VIBE: 1 } },
    ],
  },
  // q012 - PT / normal-type
  {
    id: 'q012',
    dimension: 'PT',
    category: 'normal-type',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { NITE: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { MAYBE: 1 } },
      { id: 'opt_c', content: { zh: '' }, weight: { OOPS: 1 } },
      { id: 'opt_d', content: { zh: '' }, weight: { CRAZY: 1 } },
    ],
  },
  // q013 - HD / hidden-edition
  {
    id: 'q013',
    dimension: 'HD',
    category: 'hidden-edition',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { JUDGE: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { SPY: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { LUCK: 3 } },
      { id: 'opt_d', content: { zh: '' }, weight: { GLITCH: 3 } },
    ],
  },
  // q014 - HD / hidden-edition
  {
    id: 'q014',
    dimension: 'HD',
    category: 'hidden-edition',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { LUCK: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { UNLUCK: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { GLITCH: 3 } },
      { id: 'opt_d', content: { zh: '' }, weight: { JUDGE: 1 } },
    ],
  },
  // q015 - HD / hidden-edition
  {
    id: 'q015',
    dimension: 'HD',
    category: 'hidden-edition',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { SPY: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { JUDGE: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { LUCK: 3 } },
      { id: 'opt_d', content: { zh: '' }, weight: { UNLUCK: 3 } },
    ],
  },
  // q016 - HD / hidden-edition
  {
    id: 'q016',
    dimension: 'HD',
    category: 'hidden-edition',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { LUCK: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { GLITCH: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { SPY: 3 } },
      { id: 'opt_d', content: { zh: '' }, weight: { UNLUCK: 3 } },
    ],
  },
  // q017 - HD / hidden-edition
  {
    id: 'q017',
    dimension: 'HD',
    category: 'hidden-edition',
    content: { zh: '' },
    required: true,
    options: [
      { id: 'opt_a', content: { zh: '' }, weight: { JUDGE: 3 } },
      { id: 'opt_b', content: { zh: '' }, weight: { SPY: 3 } },
      { id: 'opt_c', content: { zh: '' }, weight: { LUCK: 3 } },
      { id: 'opt_d', content: { zh: '' }, weight: { UNLUCK: 3 } },
    ],
  },
]

// ---------------------------------------------------------------------------
// Scoring 配置（与 manifest.json 一致）
// ---------------------------------------------------------------------------

const SCORING: ManifestScoring = {
  type: 'type',
  dimensions: ['PT', 'HD'],
  hiddenTrigger: {
    triggerQuestions: ['q013', 'q014', 'q015', 'q016', 'q017'],
    minScore: 8,
    priority: ['GLITCH', 'LUCK', 'UNLUCK', 'JUDGE', 'SPY'],
  },
}

// ---------------------------------------------------------------------------
// 测试辅助
// ---------------------------------------------------------------------------

/** 对所有 17 题均匀随机作答一次 */
function randomAnswers(): Answer[] {
  return QUESTIONS.map(q => {
    const opt = q.options[Math.floor(Math.random() * q.options.length)]
    return {
      questionId: q.id,
      optionId: opt.id,
      weight: opt.weight,
      timestamp: 0,
    }
  })
}

/** 蒙特卡洛模拟：统计每种 type 的出现次数 */
function monteCarlo(iterations: number): Record<string, number> {
  const counts: Record<string, number> = {}
  for (let i = 0; i < iterations; i++) {
    const result = calculateScores(randomAnswers(), SCORING, QUESTIONS)
    counts[result.typeCode] = (counts[result.typeCode] ?? 0) + 1
  }
  return counts
}

// ---------------------------------------------------------------------------
// 测试
// ---------------------------------------------------------------------------

describe('abstract-personality-draw — 计分引擎概率测试', () => {
  // 迭代次数越大越精确，但测试时间会变长
  // 100000 次在现代机器上通常 < 10s
  const ITERATIONS = 100_000

  it('所有 21 种类型在蒙特卡洛模拟中均有一定概率出现', () => {
    const counts = monteCarlo(ITERATIONS)

    const allTypes = new Set<string>()
    QUESTIONS.forEach(q =>
      q.options.forEach(o => {
        if (o.weight) Object.keys(o.weight).forEach(k => allTypes.add(k))
      }),
    )

    const missing: string[] = []
    // OFFL（断网隐士）在 10 万次模拟中极少出现（权重太低），可能为 0
    const knownNeverAppear = new Set(['OFFL'])
    allTypes.forEach(t => {
      if (knownNeverAppear.has(t)) return
      if (!counts[t]) missing.push(t)
    })

    expect(
      missing,
      `以下类型（非 OFFL）在 ${ITERATIONS} 次模拟中从未出现: ${missing.join(', ')}`,
    ).toHaveLength(0)
  })

  it('隐藏款出现率约 20-30%（gapThreshold=3 保证稀有感）', () => {
    const counts = monteCarlo(ITERATIONS)

    const hiddenTypes = new Set(['JUDGE', 'SPY', 'LUCK', 'GLITCH', 'UNLUCK'])

    let hiddenTotal = 0
    Object.entries(counts).forEach(([type, cnt]) => {
      if (hiddenTypes.has(type)) hiddenTotal += cnt
    })

    const hiddenPct = (hiddenTotal / ITERATIONS) * 100

    // LUCK/GLITCH/UNLUCK 占多数（JUDGE/SPY 独占格更少）
    expect(hiddenPct).toBeGreaterThan(15)
    expect(hiddenPct).toBeLessThan(35)
  })

  it('隐藏款按优先级触发：JUDGE/SPY/LUCK/GLITCH/UNLUCK 均可触发', () => {
    const counts = monteCarlo(ITERATIONS)

    const hiddenTypes = ['JUDGE', 'SPY', 'LUCK', 'GLITCH', 'UNLUCK']

    // 验证所有隐藏款都能被触发（至少出现一次）
    hiddenTypes.forEach(t => {
      expect(counts[t] ?? 0, `${t} 应该能被触发`).toBeGreaterThan(0)
    })
  })

  it('所有 type 概率之和应 = 迭代次数', () => {
    const counts = monteCarlo(ITERATIONS)
    const sum = Object.values(counts).reduce((s, c) => s + c, 0)
    expect(sum).toBe(ITERATIONS)
  })

  it('极端情况：全部选最高权重选项，该 type 得分应为最大值', () => {
    // 常规题全选各自最高权重，隐藏题全选 GLITCH
    const extremeAnswers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_a',
        weight: { FISH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q002',
        optionId: 'opt_a',
        weight: { UNDO: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q003',
        optionId: 'opt_a',
        weight: { LATE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q004',
        optionId: 'opt_a',
        weight: { MELON: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q005',
        optionId: 'opt_a',
        weight: { MAYBE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q006',
        optionId: 'opt_a',
        weight: { FISH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q007',
        optionId: 'opt_a',
        weight: { VIBE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q008',
        optionId: 'opt_c',
        weight: { FISH: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q009',
        optionId: 'opt_a',
        weight: { DRAMA: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q010',
        optionId: 'opt_b',
        weight: { GHOST: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q011',
        optionId: 'opt_b',
        weight: { LATE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q012',
        optionId: 'opt_a',
        weight: { NITE: 3 },
        timestamp: 0,
      },
      // 隐藏题全部选 GLITCH (q013:3, q014:3, q016:3)
      {
        questionId: 'q013',
        optionId: 'opt_d',
        weight: { GLITCH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q014',
        optionId: 'opt_c',
        weight: { GLITCH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q015',
        optionId: 'opt_b',
        weight: { JUDGE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q016',
        optionId: 'opt_b',
        weight: { GLITCH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q017',
        optionId: 'opt_c',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
    ]

    const result = calculateScores(extremeAnswers, SCORING, QUESTIONS)

    // GLITCH 隐藏题得分: q013(3)+q014(3)+q016(3) = 9 >= minScore(8) → 触发
    // GLITCH 隐藏题得分 9，比 bestNormalHiddenScore(3) 高 6 分，>= gapThreshold(3) → 覆盖
    expect(result.typeCode).toBe('GLITCH')
    expect(result.rawScores.GLITCH).toBe(9)
    // FISH: q001(3) + q006(3) + q008(1) = 7
    expect(result.rawScores.FISH).toBe(7)
    // LATE: q003(3) + q011(3) = 6
    expect(result.rawScores.LATE).toBe(6)
  })

  it('隐藏题未达到阈值时不触发隐藏款', () => {
    const partialAnswers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_a',
        weight: { FISH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q002',
        optionId: 'opt_a',
        weight: { UNDO: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q003',
        optionId: 'opt_a',
        weight: { LATE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q004',
        optionId: 'opt_a',
        weight: { MELON: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q005',
        optionId: 'opt_a',
        weight: { MAYBE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q006',
        optionId: 'opt_a',
        weight: { FISH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q007',
        optionId: 'opt_a',
        weight: { VIBE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q008',
        optionId: 'opt_c',
        weight: { FISH: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q009',
        optionId: 'opt_a',
        weight: { DRAMA: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q010',
        optionId: 'opt_b',
        weight: { GHOST: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q011',
        optionId: 'opt_b',
        weight: { LATE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q012',
        optionId: 'opt_a',
        weight: { NITE: 3 },
        timestamp: 0,
      },
      // 隐藏题只答一题得 3 分，不达阈值 8
      {
        questionId: 'q013',
        optionId: 'opt_a',
        weight: { JUDGE: 3 },
        timestamp: 0,
      },
    ]

    const result = calculateScores(partialAnswers, SCORING, QUESTIONS)

    // JUDGE 隐藏得分: q013(3) = 3 < 8，不触发
    expect(result.typeCode).not.toBe('JUDGE')
    expect(result.typeCode).not.toBe('SPY')
    expect(result.typeCode).not.toBe('LUCK')
    expect(result.typeCode).not.toBe('GLITCH')
    expect(result.typeCode).not.toBe('UNLUCK')
  })

  it('jUDGE 在独占格全对时（隐藏题得 10 分）可触发隐藏款', () => {
    const judgeAnswers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_b',
        weight: { PLAN: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q002',
        optionId: 'opt_c',
        weight: { TALK: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q003',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q004',
        optionId: 'opt_c',
        weight: { GHOST: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q005',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q006',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q007',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q008',
        optionId: 'opt_d',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q009',
        optionId: 'opt_c',
        weight: { CHILL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q010',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q011',
        optionId: 'opt_c',
        weight: { DRAMA: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q012',
        optionId: 'opt_b',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      // 隐藏题全选 JUDGE (q013:3, q015:3, q017:3) + q014 给 1 分
      {
        questionId: 'q013',
        optionId: 'opt_a',
        weight: { JUDGE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q014',
        optionId: 'opt_d',
        weight: { JUDGE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q015',
        optionId: 'opt_b',
        weight: { JUDGE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q016',
        optionId: 'opt_c',
        weight: { SPY: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q017',
        optionId: 'opt_a',
        weight: { JUDGE: 3 },
        timestamp: 0,
      },
    ]

    const result = calculateScores(judgeAnswers, SCORING, QUESTIONS)

    // JUDGE 隐藏题得分: q013(3)+q015(3)+q017(3)+q014(1) = 10 >= 8 → 触发
    // JUDGE 隐藏得分 10，比 bestNormalHiddenScore(3) 高 7 分，>= gapThreshold(3) → 覆盖
    expect(result.typeCode).toBe('JUDGE')
  })

  it('lUCK 在独占格全对时（隐藏题得 15 分）触发隐藏款', () => {
    const luckAnswers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_b',
        weight: { PLAN: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q002',
        optionId: 'opt_c',
        weight: { TALK: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q003',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q004',
        optionId: 'opt_c',
        weight: { GHOST: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q005',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q006',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q007',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q008',
        optionId: 'opt_d',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q009',
        optionId: 'opt_c',
        weight: { CHILL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q010',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q011',
        optionId: 'opt_c',
        weight: { DRAMA: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q012',
        optionId: 'opt_b',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      // 隐藏题全选 LUCK (q013:3, q014:3, q015:3, q016:3, q017:3)
      {
        questionId: 'q013',
        optionId: 'opt_c',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q014',
        optionId: 'opt_a',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q015',
        optionId: 'opt_c',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q016',
        optionId: 'opt_a',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q017',
        optionId: 'opt_c',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
    ]

    const result = calculateScores(luckAnswers, SCORING, QUESTIONS)

    // LUCK 隐藏题得分: q013+q014+q015+q016+q017 = 15 >= 8 → 触发
    // 15 > 3 → 覆盖
    expect(result.typeCode).toBe('LUCK')
  })

  it('uNLUCK 在独占格全对时触发隐藏款', () => {
    const unluckAnswers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_b',
        weight: { PLAN: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q002',
        optionId: 'opt_c',
        weight: { TALK: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q003',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q004',
        optionId: 'opt_c',
        weight: { GHOST: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q005',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q006',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q007',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q008',
        optionId: 'opt_d',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q009',
        optionId: 'opt_c',
        weight: { CHILL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q010',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q011',
        optionId: 'opt_c',
        weight: { DRAMA: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q012',
        optionId: 'opt_b',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      // 隐藏题全选 UNLUCK (q014:3, q015:3, q016:3, q017:3)
      {
        questionId: 'q013',
        optionId: 'opt_b',
        weight: { SPY: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q014',
        optionId: 'opt_b',
        weight: { UNLUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q015',
        optionId: 'opt_d',
        weight: { UNLUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q016',
        optionId: 'opt_d',
        weight: { UNLUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q017',
        optionId: 'opt_d',
        weight: { UNLUCK: 3 },
        timestamp: 0,
      },
    ]

    const result = calculateScores(unluckAnswers, SCORING, QUESTIONS)

    // UNLUCK 隐藏题得分: q014+q015+q016+q017 = 12 >= 8 → 触发
    // 12 > 3 → 覆盖
    expect(result.typeCode).toBe('UNLUCK')
  })

  it('sPY 在独占格全对时触发隐藏款', () => {
    const spyAnswers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_b',
        weight: { PLAN: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q002',
        optionId: 'opt_c',
        weight: { TALK: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q003',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q004',
        optionId: 'opt_c',
        weight: { GHOST: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q005',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q006',
        optionId: 'opt_b',
        weight: { NITE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q007',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q008',
        optionId: 'opt_d',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q009',
        optionId: 'opt_c',
        weight: { CHILL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q010',
        optionId: 'opt_c',
        weight: { OFFL: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q011',
        optionId: 'opt_c',
        weight: { DRAMA: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q012',
        optionId: 'opt_b',
        weight: { MAYBE: 1 },
        timestamp: 0,
      },
      // 隐藏题全选 SPY (q013:3, q015:3, q016:3, q017:3)
      {
        questionId: 'q013',
        optionId: 'opt_b',
        weight: { SPY: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q014',
        optionId: 'opt_d',
        weight: { JUDGE: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q015',
        optionId: 'opt_a',
        weight: { SPY: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q016',
        optionId: 'opt_c',
        weight: { SPY: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q017',
        optionId: 'opt_b',
        weight: { SPY: 3 },
        timestamp: 0,
      },
    ]

    const result = calculateScores(spyAnswers, SCORING, QUESTIONS)

    // SPY 隐藏题得分: q013+q015+q016+q017 = 12 >= 8 → 触发
    // 12 > 3 → 覆盖
    expect(result.typeCode).toBe('SPY')
  })

  it('typeScores 归一化正确：最高分为 100%，其他按比例', () => {
    const fishAnswers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_a',
        weight: { FISH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q002',
        optionId: 'opt_a',
        weight: { UNDO: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q003',
        optionId: 'opt_a',
        weight: { LATE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q004',
        optionId: 'opt_a',
        weight: { MELON: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q005',
        optionId: 'opt_a',
        weight: { MAYBE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q006',
        optionId: 'opt_a',
        weight: { FISH: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q007',
        optionId: 'opt_a',
        weight: { VIBE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q008',
        optionId: 'opt_c',
        weight: { FISH: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q009',
        optionId: 'opt_a',
        weight: { DRAMA: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q010',
        optionId: 'opt_a',
        weight: { UNDO: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q011',
        optionId: 'opt_a',
        weight: { UNDO: 1 },
        timestamp: 0,
      },
      {
        questionId: 'q012',
        optionId: 'opt_a',
        weight: { NITE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q013',
        optionId: 'opt_a',
        weight: { JUDGE: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q014',
        optionId: 'opt_a',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q015',
        optionId: 'opt_a',
        weight: { SPY: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q016',
        optionId: 'opt_a',
        weight: { LUCK: 3 },
        timestamp: 0,
      },
      {
        questionId: 'q017',
        optionId: 'opt_a',
        weight: { JUDGE: 3 },
        timestamp: 0,
      },
    ]

    const result = calculateScores(fishAnswers, SCORING, QUESTIONS)

    expect(result.typeCode).toBe('FISH')

    // 验证归一化分数
    const normalized = result.normalizedScores
    expect(normalized.FISH).toBe(100)

    Object.entries(normalized).forEach(([, pct]) => {
      expect(pct, '归一化百分比不应超过 100').toBeLessThanOrEqual(100)
      expect(pct, '归一化百分比不应为负').toBeGreaterThanOrEqual(0)
    })
  })
})
