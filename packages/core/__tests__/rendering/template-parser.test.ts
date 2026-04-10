import { describe, expect, it } from 'vitest'
import {
  containsVariables,
  extractVariables,
  interpolateTemplate,
} from '../../src/rendering/template-parser'

describe('interpolateTemplate', () => {
  const context = {
    type: {
      code: 'INTJ',
      name: { zh: '建筑师', en: 'Architect' },
      subtitle: { zh: '富有想象力的思想家', en: 'Imaginative thinkers' },
      traits: [],
      strengths: [],
      weaknesses: [],
      careers: [],
    },
    dimensions: [
      { id: 'EI', percentage: 70, dominant: 'E' },
      { id: 'NS', percentage: 65, dominant: 'N' },
    ],
    scoring: {
      typeCode: 'INTJ',
      dimensions: [],
    },
    config: {
      appName: 'NBTI Test',
      shareUrl: 'https://nbti.app/result/123',
    },
    locale: 'zh',
    timestamp: Date.now(),
  }

  it('should interpolate type.code', () => {
    const result = interpolateTemplate('{type.code}', context)
    expect(result).toBe('INTJ')
  })

  it('should interpolate type.name', () => {
    const result = interpolateTemplate('{type.name}', context)
    expect(result).toBe('建筑师')
  })

  it('should interpolate dimension percentage', () => {
    const result = interpolateTemplate('{dimension.EI.percentage}', context)
    expect(result).toBe('70')
  })

  it('should interpolate share.url', () => {
    const result = interpolateTemplate('{share.url}', context)
    expect(result).toBe('https://nbti.app/result/123')
  })

  it('should keep unrecognized variables', () => {
    const result = interpolateTemplate('{unknown}', context)
    expect(result).toBe('{unknown}')
  })

  it('should handle multiple variables', () => {
    const template = '我是 {type.code}（{type.name}）'
    const result = interpolateTemplate(template, context)
    expect(result).toBe('我是 INTJ（建筑师）')
  })
})

describe('containsVariables', () => {
  it('should return true for string with variables', () => {
    expect(containsVariables('Hello {name}')).toBe(true)
  })

  it('should return false for string without variables', () => {
    expect(containsVariables('Hello World')).toBe(false)
  })
})

describe('extractVariables', () => {
  it('should extract all variable names', () => {
    const result = extractVariables('{type.code} {type.name} {share.url}')
    expect(result).toEqual(['type.code', 'type.name', 'share.url'])
  })

  it('should return empty array for string without variables', () => {
    expect(extractVariables('No variables here')).toEqual([])
  })
})
