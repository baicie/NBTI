import { describe, expect, it } from 'vitest'
import { cn, deepClone, extend, getNestedValue, omit, pick } from '../src/utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('foo', 'bar')
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toContain('foo')
    expect(result).toContain('baz')
    expect(result).not.toContain('bar')
  })
})

describe('getNestedValue', () => {
  it('should get nested value from object', () => {
    const obj = { a: { b: { c: 'value' } } }
    expect(getNestedValue(obj, 'a.b.c')).toBe('value')
  })

  it('should return default value for missing path', () => {
    const obj = { a: { b: 1 } }
    expect(getNestedValue(obj, 'a.x', 'default')).toBe('default')
  })

  it('should return undefined for null object', () => {
    expect(getNestedValue(null, 'a.b.c')).toBeUndefined()
  })
})

describe('extend', () => {
  it('should extend object with source', () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = extend(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it('should handle multiple sources', () => {
    const target = { a: 1, b: 2 }
    const source1 = { b: 3, c: 3 }
    const source2 = { c: 4, d: 5 }
    const result = extend(target, source1, source2)
    expect(result).toEqual({ a: 1, b: 3, c: 4, d: 5 })
  })

  it('should not overwrite with undefined', () => {
    const target = { a: 1 }
    const source = { a: undefined }
    const result = extend(target, source)
    expect(result.a).toBe(1)
  })
})

describe('deepClone', () => {
  it('should clone primitive', () => {
    expect(deepClone(1)).toBe(1)
    expect(deepClone('hello')).toBe('hello')
    expect(deepClone(true)).toBe(true)
  })

  it('should deep clone object', () => {
    const obj = { a: { b: { c: 1 } } }
    const clone = deepClone(obj)
    expect(clone).toEqual(obj)
    expect(clone).not.toBe(obj)
  })

  it('should deep clone array', () => {
    const arr = [1, [2, 3], { a: 4 }]
    const clone = deepClone(arr)
    expect(clone).toEqual(arr)
    expect(clone).not.toBe(arr)
  })
})

describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = pick(obj, ['a', 'c'] as const)
    expect(result).toEqual({ a: 1, c: 3 })
  })
})

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    const result = omit(obj, ['b'] as const)
    expect(result).toEqual({ a: 1, c: 3 })
  })
})
