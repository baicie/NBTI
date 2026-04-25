/**
 * 配置验证器
 * 使用 Zod v4 进行运行时类型校验
 */

import type {
  Manifest,
  QuestionsData,
  TemplatesData,
  ThemeData,
  TypesData,
} from '../types'
import { z } from 'zod'

// 本地化字符串 Schema
export const LocalizedStringSchema: z.ZodType<Record<string, string>>
  = z.record(z.string(), z.string())

// Manifest Schema
export const ManifestConfigSchema = z.object({
  questions: z.string(),
  types: z.string(),
  templates: z.string().optional(),
  themes: z.string().optional(),
  i18n: z.string().optional(),
})

export const ManifestSettingsSchema = z.object({
  allowBack: z.boolean().optional(),
  showTimer: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  requiredAnswer: z.boolean().optional(),
  maxDuration: z.number().nullable().optional(),
})

export const ManifestScoringSchema = z.object({
  type: z.enum(['dimension', 'percentage', 'weighted-sum']),
  dimensions: z.array(z.string()),
  calculateMethod: z.enum(['difference', 'ratio', 'absolute']).optional(),
  normalizeOutput: z.boolean().optional(),
})

export const ManifestSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  version: z.string(),
  description: LocalizedStringSchema.optional(),
  author: z.string().optional(),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  config: ManifestConfigSchema,
  settings: ManifestSettingsSchema.optional(),
  scoring: ManifestScoringSchema,
})

// Questions Schema
export const OptionWeightSchema = z.record(z.string(), z.number())

export const QuestionOptionSchema = z.object({
  id: z.string(),
  content: LocalizedStringSchema,
  image: z.string().nullable().optional(),
  weight: OptionWeightSchema,
  tooltip: LocalizedStringSchema.optional(),
})

export const QuestionSchema = z.object({
  id: z.string(),
  dimension: z.string(),
  category: z.string().optional(),
  content: LocalizedStringSchema,
  image: z.string().nullable().optional(),
  isReverse: z.boolean().optional(),
  required: z.boolean().optional(),
  options: z.array(QuestionOptionSchema).min(2),
})

export const QuestionsDataSchema = z.object({
  meta: z.object({
    totalQuestions: z.number().optional(),
    timeEstimate: z.number().optional(),
    tags: z.array(z.string()).optional(),
    description: LocalizedStringSchema.optional(),
  }),
  dimensions: z
    .array(
      z.object({
        id: z.string(),
        name: LocalizedStringSchema,
        description: LocalizedStringSchema.optional(),
        leftLabel: LocalizedStringSchema.optional(),
        rightLabel: LocalizedStringSchema.optional(),
      }),
    )
    .optional(),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: LocalizedStringSchema,
        description: LocalizedStringSchema.optional(),
        questionIds: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  questions: z.array(QuestionSchema).min(1),
})

// Types Schema
export const TraitSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  icon: z.string().optional(),
  level: z.number().min(1).max(100),
  description: LocalizedStringSchema.optional(),
})

export const PersonalityTypeSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  subtitle: LocalizedStringSchema.optional(),
  description: LocalizedStringSchema.optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  traits: z.array(TraitSchema).optional(),
  strengths: z.array(LocalizedStringSchema).optional(),
  weaknesses: z.array(LocalizedStringSchema).optional(),
  compatibleTypes: z.array(z.string()).optional(),
  incompatibleTypes: z.array(z.string()).optional(),
  careers: z.array(LocalizedStringSchema).optional(),
  relationships: LocalizedStringSchema.optional(),
  workStyle: LocalizedStringSchema.optional(),
  communicationStyle: LocalizedStringSchema.optional(),
  famousPeople: z.array(z.string()).optional(),
  quotes: z
    .array(
      z.object({
        text: z.string(),
        author: z.string().optional(),
      }),
    )
    .optional(),
})

export const TypesDataSchema = z.object({
  meta: z
    .object({
      version: z.string().optional(),
      lastUpdated: z.string().optional(),
    })
    .optional(),
  dimensions: z
    .array(
      z.object({
        id: z.string(),
        name: LocalizedStringSchema.optional(),
        left: z.object({
          letter: z.string(),
          name: LocalizedStringSchema,
          description: LocalizedStringSchema.optional(),
        }),
        right: z.object({
          letter: z.string(),
          name: LocalizedStringSchema,
          description: LocalizedStringSchema.optional(),
        }),
      }),
    )
    .optional(),
  types: z.array(PersonalityTypeSchema).min(1),
})

// Templates Schema
export const TemplateDimensionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  unit: z.enum(['px']).optional(),
})

export const TemplateBackgroundSchema = z.object({
  type: z.enum(['color', 'gradient', 'image']),
  value: z.union([
    z.string(),
    z.array(
      z.object({
        color: z.string(),
        position: z.number(),
      }),
    ),
  ]),
  direction: z.string().optional(),
  overlay: z
    .object({
      color: z.string(),
      opacity: z.number().optional(),
    })
    .optional(),
})

export const ElementStyleSchema = z.object({
  fontSize: z.number().optional(),
  fontWeight: z.union([z.number(), z.string()]).optional(),
  fontFamily: z.string().optional(),
  fontStyle: z.enum(['normal', 'italic']).optional(),
  color: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  textAlignVertical: z.enum(['top', 'center', 'bottom']).optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.union([z.number(), z.string()]).optional(),
  border: z.string().optional(),
  padding: z.union([z.number(), z.record(z.string(), z.number())]).optional(),
  margin: z.union([z.number(), z.record(z.string(), z.number())]).optional(),
  opacity: z.number().optional(),
  textShadow: z.string().optional(),
  boxShadow: z.string().optional(),
  lineHeight: z.union([z.number(), z.string()]).optional(),
  letterSpacing: z.number().optional(),
  lineColor: z.string().optional(),
  lineWidth: z.number().optional(),
  fillColor: z.string().optional(),
  gridColumns: z.number().optional(),
})

export const TemplateElementSchema = z.object({
  id: z.string(),
  type: z.enum([
    'text',
    'shape',
    'image',
    'qrcode',
    'radar',
    'trait-badges',
    'dimension-bar',
    'divider',
  ]),
  position: z.union([
    z.object({
      x: z.union([z.number(), z.string()]),
      y: z.union([z.number(), z.string()]),
      width: z.union([z.number(), z.string()]).optional(),
      height: z.union([z.number(), z.string()]).optional(),
    }),
    z.string(),
  ]),
  size: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      unit: z.enum(['px', '%']).optional(),
    })
    .optional(),
  content: z.union([z.string(), LocalizedStringSchema]).optional(),
  image: z.string().nullable().optional(),
  shape: z
    .enum(['circle', 'rectangle', 'line', 'triangle', 'polygon'])
    .optional(),
  layout: z.enum(['horizontal', 'vertical', 'grid', 'flow']).optional(),
  spacing: z.number().optional(),
  style: ElementStyleSchema.optional(),
  animation: z
    .object({
      type: z.enum(['fadeIn', 'slideUp', 'scale', 'none']).optional(),
      delay: z.number().optional(),
      duration: z.number().optional(),
    })
    .optional(),
  visible: z.boolean().optional(),
  responsive: z
    .object({
      mobile: ElementStyleSchema.optional(),
      tablet: ElementStyleSchema.optional(),
    })
    .optional(),
})

export const ShareCardTemplateSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  thumbnail: z.string().nullable().optional(),
  description: LocalizedStringSchema.optional(),
  dimensions: TemplateDimensionsSchema,
  background: TemplateBackgroundSchema,
  elements: z.array(TemplateElementSchema).min(1),
})

export const TemplatesDataSchema = z.object({
  defaultTemplate: z.string().optional(),
  templates: z.array(ShareCardTemplateSchema).min(1),
})

// Theme Schema
export const ThemeColorsSchema = z.object({
  primary: z.string(),
  primaryForeground: z.string().optional(),
  secondary: z.string().optional(),
  secondaryForeground: z.string().optional(),
  background: z.string(),
  foreground: z.string(),
  muted: z.string().optional(),
  mutedForeground: z.string().optional(),
  accent: z.string().optional(),
  accentForeground: z.string().optional(),
  destructive: z.string().optional(),
  destructiveForeground: z.string().optional(),
  success: z.string().optional(),
  successForeground: z.string().optional(),
  warning: z.string().optional(),
  warningForeground: z.string().optional(),
  border: z.string().optional(),
  input: z.string().optional(),
  ring: z.string().optional(),
  card: z.string().optional(),
  cardForeground: z.string().optional(),
  popover: z.string().optional(),
  popoverForeground: z.string().optional(),
})

export const ThemeDataSchema = z.object({
  defaultTheme: z.string().optional(),
  themes: z.record(
    z.string(),
    z.object({
      name: LocalizedStringSchema,
      extends: z.string().optional(),
      colors: ThemeColorsSchema,
    }),
  ),
})

// 验证函数
export function validateManifest(data: unknown): Manifest {
  return ManifestSchema.parse(data)
}

export function validateQuestions(data: unknown): QuestionsData {
  return QuestionsDataSchema.parse(data)
}

export function validateTypes(data: unknown): TypesData {
  return TypesDataSchema.parse(data)
}

export function validateTemplates(data: unknown): TemplatesData {
  return TemplatesDataSchema.parse(data)
}

export function validateTheme(data: unknown): ThemeData {
  return ThemeDataSchema.parse(data)
}

// 安全解析（不抛出错误）
export function safeParseManifest(data: unknown) {
  return ManifestSchema.safeParse(data)
}

export function safeParseQuestions(data: unknown) {
  return QuestionsDataSchema.safeParse(data)
}

export function safeParseTypes(data: unknown) {
  return TypesDataSchema.safeParse(data)
}

export function safeParseTemplates(data: unknown) {
  return TemplatesDataSchema.safeParse(data)
}

export function safeParseTheme(data: unknown) {
  return ThemeDataSchema.safeParse(data)
}
