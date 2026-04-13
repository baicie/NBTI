import { describe, expect, it } from 'vitest'
import {
  buildDimensionScores,
  calculateDimensionScores,
  generateTypeCode,
} from '../../src/scoring/dimensions'
import type { Answer } from '../../src/types'

describe('calculateDimensionScores', () => {
  const questions = [
    { id: 'q001', dimension: 'EI', isReverse: false },
    { id: 'q002', dimension: 'EI', isReverse: false },
    { id: 'q003', dimension: 'NS', isReverse: false },
  ]

  it('should calculate scores for dimension EI', () => {
    const answers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_a',
        weight: { E: 3, I: 0 },
        timestamp: Date.now(),
      },
      {
        questionId: 'q002',
        optionId: 'opt_b',
        weight: { E: 1, I: 2 },
        timestamp: Date.now(),
      },
    ]

    const scores = calculateDimensionScores(answers, questions, ['EI'])
    expect(scores.EI).toEqual({ left: 4, right: 2 })
  })

  it('should handle empty answers', () => {
    const scores = calculateDimensionScores([], questions, ['EI'])
    expect(scores.EI).toEqual({ left: 0, right: 0 })
  })

  it('should handle multiple dimensions', () => {
    const answers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_a',
        weight: { E: 3, I: 0 },
        timestamp: Date.now(),
      },
      {
        questionId: 'q003',
        optionId: 'opt_b',
        weight: { S: 1, N: 2 },
        timestamp: Date.now(),
      },
    ]

    const scores = calculateDimensionScores(answers, questions, ['EI', 'NS'])
    expect(scores.EI).toEqual({ left: 3, right: 0 })
    expect(scores.NS).toEqual({ left: 2, right: 1 })
  })
})

describe('generateTypeCode', () => {
  it('should generate type code from dimension scores', () => {
    const dimensionScores = [
      { dimensionId: 'EI', dominant: 'E', percentage: 70 },
      { dimensionId: 'NS', dominant: 'N', percentage: 60 },
      { dimensionId: 'TF', dominant: 'T', percentage: 75 },
      { dimensionId: 'JP', dominant: 'J', percentage: 55 },
    ]

    const result = generateTypeCode(dimensionScores)
    expect(result).toBe('ENTJ')
  })
})

describe('buildDimensionScores', () => {
  it('should build dimension scores with correct dominant', () => {
    const rawScores = {
      EI: { left: 6, right: 3 },
      NS: { left: 5, right: 2 },
    }

    const result = buildDimensionScores(rawScores, ['EI', 'NS'], 'difference')

    expect(result[0].dominant).toBe('E')
    expect(result[0].percentage).toBeGreaterThan(50)
    expect(result[1].dominant).toBe('N')
    expect(result[1].percentage).toBeGreaterThan(50)
  })

  it('should handle tie by defaulting to first letter', () => {
    const rawScores = { EI: { left: 3, right: 3 } }
    const result = buildDimensionScores(rawScores, ['EI'], 'difference')
    expect(result[0].dominant).toBe('E')
  })
})
