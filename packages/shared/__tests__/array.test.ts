import { describe, expect, it } from 'vitest'
import { chunk, groupBy, shuffle, unique } from '../src/utils/array'

describe('shuffle', () => {
  it('should return array with same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result).toHaveLength(5)
  })

  it('should contain all original elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffle(arr)
    expect(result.sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('should not modify original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const original = [...arr]
    shuffle(arr)
    expect(arr).toEqual(original)
  })
})

describe('chunk', () => {
  it('should split array into chunks', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = chunk(arr, 2)
    expect(result).toEqual([[1, 2], [3, 4], [5]])
  })

  it('should handle empty array', () => {
    expect(chunk([], 2)).toEqual([])
  })

  it('should handle chunk size larger than array', () => {
    const arr = [1, 2]
    expect(chunk(arr, 5)).toEqual([[1, 2]])
  })
})

describe('unique', () => {
  it('should remove duplicates', () => {
    const arr = [1, 2, 2, 3, 3, 3]
    expect(unique(arr)).toEqual([1, 2, 3])
  })

  it('should preserve order of first occurrence', () => {
    const arr = [3, 1, 2, 1, 3]
    expect(unique(arr)).toEqual([3, 1, 2])
  })
})

describe('groupBy', () => {
  it('should group array by key', () => {
    const arr = [
      { type: 'a', value: 1 },
      { type: 'b', value: 2 },
      { type: 'a', value: 3 },
    ]
    const result = groupBy(arr, 'type')
    expect(result).toEqual({
      a: [
        { type: 'a', value: 1 },
        { type: 'a', value: 3 },
      ],
      b: [{ type: 'b', value: 2 }],
    })
  })

  it('should handle missing key', () => {
    const arr = [{ type: 'a', value: 1 }]
    const result = groupBy(arr, 'missing' as 'type')
    expect(result).toEqual({
      undefined: [{ type: 'a', value: 1 }],
    })
  })
})
