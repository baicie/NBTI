import { describe, expect, it } from 'vitest'
import {
  camelCase,
  capitalize,
  generateId,
  interpolate,
  kebabCase,
} from '../src/utils/string'

describe('interpolate', () => {
  it('should replace single variable', () => {
    const template = 'Hello {name}'
    const result = interpolate(template, { name: 'World' })
    expect(result).toBe('Hello World')
  })

  it('should replace multiple variables', () => {
    const template = '{greeting} {name}!'
    const result = interpolate(template, { greeting: 'Hello', name: 'World' })
    expect(result).toBe('Hello World!')
  })

  it('should handle nested variables', () => {
    const template = 'User: {user.name}'
    const result = interpolate(template, { user: { name: 'John' } })
    expect(result).toBe('User: John')
  })

  it('should keep unreplaced variables', () => {
    const template = 'Hello {name}'
    const result = interpolate(template, {})
    expect(result).toBe('Hello {name}')
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })
})

describe('camelCase', () => {
  it('should convert kebab-case', () => {
    expect(camelCase('hello-world')).toBe('helloWorld')
  })

  it('should convert snake_case', () => {
    expect(camelCase('hello_world')).toBe('helloWorld')
  })

  it('should convert space separated', () => {
    expect(camelCase('hello world')).toBe('helloWorld')
  })
})

describe('kebabCase', () => {
  it('should convert camelCase', () => {
    expect(kebabCase('helloWorld')).toBe('hello-world')
  })

  it('should convert PascalCase', () => {
    expect(kebabCase('HelloWorld')).toBe('hello-world')
  })

  it('should convert snake_case', () => {
    expect(kebabCase('hello_world')).toBe('hello-world')
  })
})

describe('generateId', () => {
  it('should generate random id', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
  })

  it('should include prefix when provided', () => {
    const id = generateId('user')
    expect(id.startsWith('user-')).toBe(true)
  })
})
