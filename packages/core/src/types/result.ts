/**
 * Types 类型定义
 * types.json 是结果类型定义配置文件
 */

import type { LocalizedString } from './core'

/**
 * 维度方向定义
 */
export interface DimensionDirection {
  letter: string
  name: LocalizedString
  description?: LocalizedString
}

/**
 * 维度完整定义
 */
export interface DimensionDefinition {
  id: string
  name?: LocalizedString
  left: DimensionDirection
  right: DimensionDirection
}

/**
 * 特质
 */
export interface Trait {
  id: string
  name: LocalizedString
  icon?: string
  level: number
  description?: LocalizedString
}

/**
 * 名言
 */
export interface Quote {
  text: string
  author?: string
}

/**
 * 人格类型
 */
export interface PersonalityType {
  id: string
  name: LocalizedString
  posterImage?: LocalizedString
  posterCaption?: LocalizedString
  subtitle?: LocalizedString
  description?: LocalizedString
  icon?: string
  color?: string
  traits?: Trait[]
  strengths?: LocalizedString[]
  weaknesses?: LocalizedString[]
  compatibleTypes?: string[]
  incompatibleTypes?: string[]
  careers?: LocalizedString[]
  relationships?: LocalizedString
  workStyle?: LocalizedString
  communicationStyle?: LocalizedString
  famousPeople?: string[]
  quotes?: Quote[]
}

/**
 * 类型数据
 */
export interface TypesData {
  meta?: {
    version?: string
    lastUpdated?: string
  }
  dimensions?: DimensionDefinition[]
  types: PersonalityType[]
}
