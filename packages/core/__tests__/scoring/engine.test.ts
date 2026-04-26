import type { Answer, ManifestScoring } from '../../src/types'
import { describe, expect, it } from 'vitest'
import { calculateScores, ScoringEngine } from '../../src/scoring/engine'

describe('scoringEngine', () => {
  const scoring: ManifestScoring = {
    type: 'dimension',
    dimensions: ['EI', 'NS', 'TF', 'JP'],
    calculateMethod: 'difference',
    normalizeOutput: true,
  }

  const questions: import('../../src/types/question').Question[] = [
    { id: 'q001', dimension: 'EI', content: { zh: '' }, options: [] },
    { id: 'q002', dimension: 'EI', content: { zh: '' }, options: [] },
    { id: 'q003', dimension: 'NS', content: { zh: '' }, options: [] },
    { id: 'q004', dimension: 'NS', content: { zh: '' }, options: [] },
    { id: 'q005', dimension: 'TF', content: { zh: '' }, options: [] },
    { id: 'q006', dimension: 'TF', content: { zh: '' }, options: [] },
    { id: 'q007', dimension: 'JP', content: { zh: '' }, options: [] },
    { id: 'q008', dimension: 'JP', content: { zh: '' }, options: [] },
  ]

  describe('calculate', () => {
    it('should calculate scores correctly for dimension type', () => {
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
          weight: { E: 0, I: 3 },
          timestamp: Date.now(),
        },
        {
          questionId: 'q003',
          optionId: 'opt_c',
          weight: { S: 0, N: 3 },
          timestamp: Date.now(),
        },
        {
          questionId: 'q004',
          optionId: 'opt_d',
          weight: { S: 3, N: 0 },
          timestamp: Date.now(),
        },
        {
          questionId: 'q005',
          optionId: 'opt_e',
          weight: { T: 3, F: 0 },
          timestamp: Date.now(),
        },
        {
          questionId: 'q006',
          optionId: 'opt_f',
          weight: { T: 3, F: 0 },
          timestamp: Date.now(),
        },
        {
          questionId: 'q007',
          optionId: 'opt_g',
          weight: { J: 3, P: 0 },
          timestamp: Date.now(),
        },
        {
          questionId: 'q008',
          optionId: 'opt_h',
          weight: { J: 3, P: 0 },
          timestamp: Date.now(),
        },
      ]

      const engine = new ScoringEngine(scoring, questions)
      const result = engine.calculate(answers)

      expect(result.typeCode).toBe('ENTJ')
      expect(result.dimensions).toHaveLength(4)
    })

    it('should handle percentage scoring type', () => {
      const percentageScoring: ManifestScoring = {
        type: 'percentage',
        dimensions: ['EI', 'NS'],
        normalizeOutput: true,
      }

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
          weight: { E: 0, I: 3 },
          timestamp: Date.now(),
        },
      ]

      const engine = new ScoringEngine(percentageScoring, questions)
      const result = engine.calculate(answers)

      expect(result.dimensions).toHaveLength(2)
    })
  })
})

describe('calculateScores', () => {
  it('should work with shorthand function', () => {
    const scoring: ManifestScoring = {
      type: 'dimension',
      dimensions: ['EI'],
      calculateMethod: 'difference',
    }

    const answers: Answer[] = [
      {
        questionId: 'q001',
        optionId: 'opt_a',
        weight: { E: 3, I: 0 },
        timestamp: Date.now(),
      },
    ]

    const questions = [
      { id: 'q001', dimension: 'EI', content: { zh: '' }, options: [] },
    ]
    const result = calculateScores(answers, scoring, questions)

    expect(result.typeCode).toBe('E')
    expect(result.dimensions).toHaveLength(1)
  })
})
