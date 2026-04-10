# NBTI 后端服务架构设计文档

本文档描述 NBTI 测试框架的后端服务设计，作为主架构设计文档的补充。后端服务为可选模块，用于需要数据存储、用户管理、动态配置等功能的场景。

---

## 一、设计定位

### 1.1 核心定位

后端服务作为 NBTI 框架的**可选扩展层**，为运营和商业化场景提供支撑能力。

```
┌─────────────────────────────────────────────────────────────────┐
│                      NBTI 技术架构                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      前端应用层                           │   │
│   │                    (apps/web)                            │   │
│   │                                                          │   │
│   │   ├── 测试引擎（纯前端，数据驱动）                         │   │
│   │   ├── 结果展示（数据驱动）                                 │   │
│   │   └── 图片生成（模板驱动）                                 │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ 可选                            │
│                              ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      后端服务层                           │   │
│   │                    (apps/api)                           │   │
│   │                                                          │   │
│   │   ├── 结果存储与分享                                      │   │
│   │   ├── 配置动态管理                                        │   │
│   │   ├── 数据分析与统计                                      │   │
│   │   └── 访问控制与安全                                      │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      数据存储层                           │   │
│   │                                                          │   │
│   │   ├── PostgreSQL — 结构化数据                            │   │
│   │   ├── Redis — 缓存与会话                                 │   │
│   │   └── 对象存储 — 配置文件与媒体                           │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **渐进式复杂度** | 从最小后端起步，按需扩展 |
| **Serverless 优先** | 优先使用 Serverless 服务，降低运维成本 |
| **前后端分离** | 前端完全独立，后端作为可选依赖 |
| **API 优先** | 所有能力通过 API 暴露，便于扩展 |
| **数据隔离** | 用户数据与业务数据严格分离 |

---

## 二、技术选型

### 2.1 核心技术栈

| 层级 | 技术选型 | 备选方案 | 说明 |
|------|----------|----------|------|
| **运行时** | Node.js 20 | Deno | 与前端统一技术栈 |
| **框架** | Hono | Express / Fastify | 轻量、高性能、兼容性强 |
| **数据库** | PostgreSQL | MySQL | 强大的 JSON 支持 |
| **ORM** | Drizzle | Prisma / Kysely | 类型安全、轻量 |
| **缓存** | Redis | — | 会话、限流、缓存 |
| **文件存储** | S3 兼容 | R2 / MinIO | 配置、媒体文件 |
| **部署** | Vercel / Railway | Docker + Fly.io | Serverless / 容器 |

### 2.2 为什么选择 Hono？

```
┌─────────────────────────────────────────────────────────────────┐
│                      Hono 优势对比                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  对比项          │  Hono      │  Express   │  Fastify           │
│  ────────────────────────────────────────────────────────────── │
│  体积            │  ~14KB     │  ~600KB    │  ~400KB            │
│  性能            │  最快      │  较慢      │  快                │
│  类型安全        │  强        │  弱        │  中                │
│  中间件生态      │  丰富      │  丰富      │  丰富              │
│  Edge 支持       │  ✅        │  ❌        │  ❌                │
│  学习曲线        │  低        │  低        │  中                │
│                                                                  │
│  推荐理由：                                                       │
│  ✅ 极致的性能（比 Express 快 40 倍）                            │
│  ✅ 体积小巧，适合 Serverless                                    │
│  ✅ 原生支持 Edge Runtime（Vercel Edge Functions）              │
│  ✅ 与现有 TypeScript 项目完美集成                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 数据库选型对比

| 方案 | 数据库 | 特点 | 适合场景 |
|------|--------|------|----------|
| **方案一** | Supabase (PostgreSQL) | Serverless、实时订阅、RLS | 快速起步、中小规模 |
| **方案二** | PlanetScale (MySQL) | 分支开发、无服务器less)、高可用 | 更大规模、团队协作 |
| **方案三** | Turso (SQLite) | 边缘部署、超低延迟 | 全球分布、低成本 |
| **方案四** | 自建 PostgreSQL | 完全控制 | 大规模、有 DBA 团队 |

---

## 三、架构设计

### 3.1 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                      NBTI 后端系统架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                        客户端层                           │  │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │
│   │  │ Web App │  │ 小程序  │  │  H5    │  │ App SDK │      │  │
│   │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │  │
│   └───────┼────────────┼────────────┼────────────┼───────────┘  │
│           │            │            │            │              │
│           └────────────┴─────┬──────┴────────────┘              │
│                              │                                   │
│                              ▼                                   │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                      API 网关层                          │  │
│   │                                                          │  │
│   │  ┌─────────────────────────────────────────────────┐    │  │
│   │  │              Vercel Edge Functions               │    │  │
│   │  │                                                  │    │  │
│   │  │  • 全局限流 (Global Rate Limit)                  │    │  │
│   │  │  • IP 信誉检查                                    │    │  │
│   │  │  • CORS 处理                                      │    │  │
│   │  │  • 请求日志                                       │    │  │
│   │  │                                                  │    │  │
│   │  └─────────────────────────────────────────────────┘    │  │
│   └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                      服务层                                │  │
│   │                                                          │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│   │  │  Results    │  │  Configs    │  │  Analytics  │      │  │
│   │  │   Service   │  │   Service   │  │   Service   │      │  │
│   │  │             │  │             │  │             │      │  │
│   │  │ • 创建结果  │  │ • 获取配置  │  │ • 埋点上报  │      │  │
│   │  │ • 查询结果  │  │ • 版本管理  │  │ • 统计分析  │      │  │
│   │  │ • 分享管理  │  │ • 发布回滚  │  │ • 漏斗分析  │      │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│   │                                                          │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│   │  │   Users      │  │   Admin     │  │   Media     │      │  │
│   │  │   Service    │  │   Service   │  │   Service   │      │  │
│   │  │             │  │             │  │             │      │  │
│   │  │ • 认证授权  │  │ • 运营管理  │  │ • 文件上传  │      │  │
│   │  │ • 社交登录  │  │ • 内容审核  │  │ • CDN 分发  │      │  │
│   │  │ • 会话管理  │  │ • 数据看板  │  │ • 压缩优化  │      │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│   │                                                          │  │
│   └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                      数据层                                │  │
│   │                                                          │  │
│   │  ┌───────────────┐  ┌───────────────┐  ┌───────────┐  │  │
│   │  │  PostgreSQL   │  │     Redis     │  │    S3     │  │  │
│   │  │               │  │               │  │           │  │  │
│   │  │ • 结果数据    │  │ • 会话缓存    │  │ • 配置文件 │  │  │
│   │  │ • 用户数据    │  │ • 限流计数    │  │ • 题库文件 │  │  │
│   │  │ • 配置版本    │  │ • 计算缓存    │  │ • 媒体资源 │  │  │
│   │  │ • 统计数据    │  │ • 排行榜      │  │ • 备份     │  │  │
│   │  └───────────────┘  └───────────────┘  └───────────┘  │  │
│   │                                                          │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 服务模块划分

```
apps/
├── api/                          # API 服务
│   ├── src/
│   │   ├── index.ts              # 应用入口
│   │   ├── routes/               # 路由定义
│   │   │   ├── results.ts        # 结果相关
│   │   │   ├── configs.ts        # 配置相关
│   │   │   ├── analytics.ts      # 统计相关
│   │   │   ├── users.ts          # 用户相关
│   │   │   ├── admin.ts          # 管理后台
│   │   │   └── media.ts          # 媒体相关
│   │   ├── services/             # 业务逻辑
│   │   │   ├── result.service.ts
│   │   │   ├── config.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── mail.service.ts
│   │   ├── middleware/           # 中间件
│   │   │   ├── auth.ts           # 认证
│   │   │   ├── rate-limit.ts     # 限流
│   │   │   ├── logger.ts         # 日志
│   │   │   └── validator.ts      # 校验
│   │   ├── db/                   # 数据库
│   │   │   ├── client.ts         # 数据库客户端
│   │   │   ├── schema.ts         # 表结构定义
│   │   │   └── migrations/        # 迁移文件
│   │   ├── cache/                # 缓存
│   │   │   └── redis.ts
│   │   ├── storage/              # 存储
│   │   │   └── s3.ts
│   │   ├── utils/                # 工具函数
│   │   └── types/                # 类型定义
│   └── package.json
│
└── admin/                         # 管理后台（可选）
    └── src/
        └── ...
```

---

## 四、API 设计

### 4.1 API 规范

#### 基础规范

```typescript
// 基础 URL
const BASE_URL = process.env.API_BASE_URL || 'https://api.nbti.app';

// 所有请求使用 HTTPS
// 请求格式：application/json
// 认证方式：Bearer Token 或 API Key
```

#### 响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// HTTP 状态码规范
// 200 OK - 成功
// 201 Created - 创建成功
// 400 Bad Request - 参数错误
// 401 Unauthorized - 未认证
// 403 Forbidden - 无权限
// 404 Not Found - 资源不存在
// 429 Too Many Requests - 请求过于频繁
// 500 Internal Server Error - 服务器错误
```

#### 请求示例

```typescript
// 保存测试结果
const response = await fetch('/api/v1/results', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    packageId: 'nbti-mbti',
    typeCode: 'INTJ',
    answers: [...],
    dimensions: [...],
    duration: 180,
    locale: 'zh'
  })
});
```

### 4.2 结果服务 API

#### 接口列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/results` | 创建结果 | 可选 |
| GET | `/api/v1/results/:shareId` | 获取结果（公开） | 公开 |
| GET | `/api/v1/results` | 列表查询 | 必填 |
| DELETE | `/api/v1/results/:id` | 删除结果 | 必填 |

#### 详细定义

```typescript
// POST /api/v1/results - 创建测试结果

// Request Body
interface CreateResultRequest {
  packageId: string;           // 测试包 ID
  typeCode: string;            // 结果类型代码
  answers: Answer[];          // 用户答案（可选）
  dimensions: DimensionScore[]; // 维度分数
  duration: number;            // 测试时长（秒）
  locale: string;              // 语言
  metadata?: {
    referrer?: string;         // 来源
    utmSource?: string;        // 推广来源
    utmMedium?: string;
    utmCampaign?: string;
  };
}

interface Answer {
  questionId: string;
  optionId: string;
  timeSpent: number;           // 答题耗时（毫秒）
}

interface DimensionScore {
  dimensionId: string;         // 维度 ID，如 "EI"
  leftScore: number;
  rightScore: number;
  dominant: string;            // 主导字母
  percentage: number;          // 百分比 0-100
}

// Response
interface CreateResultResponse {
  id: string;                  // 结果 ID (UUID)
  shareId: string;             // 分享 ID (短码)
  shareUrl: string;            // 分享链接
  typeCode: string;
  createdAt: string;           // ISO 时间
}

// GET /api/v1/results/:shareId - 获取结果（公开接口）

// Response
interface GetResultResponse {
  id: string;
  shareId: string;
  packageId: string;
  type: {
    code: string;
    name: LocalizedString;
    subtitle: LocalizedString;
    description: LocalizedString;
    traits: Trait[];
    strengths: LocalizedString[];
    weaknesses: LocalizedString[];
  };
  dimensions: DimensionScore[];
  createdAt: string;
}

// GET /api/v1/results - 查询结果列表

// Query Parameters
interface ListResultsQuery {
  page?: number;               // 页码，默认 1
  pageSize?: number;           // 每页数量，默认 20
  packageId?: string;          // 筛选测试包
  typeCode?: string;           // 筛选类型
  startDate?: string;          // 开始时间
  endDate?: string;            // 结束时间
}

// Response
interface ListResultsResponse {
  results: GetResultResponse[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

### 4.3 配置服务 API

#### 接口列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/configs/:packageId` | 获取配置 | 公开 |
| GET | `/api/v1/configs/:packageId/versions` | 版本历史 | 管理员 |
| POST | `/api/v1/configs` | 创建配置 | 管理员 |
| PUT | `/api/v1/configs/:packageId` | 更新配置 | 管理员 |
| DELETE | `/api/v1/configs/:packageId` | 删除配置 | 管理员 |

#### 详细定义

```typescript
// GET /api/v1/configs/:packageId - 获取配置

// Query Parameters
interface GetConfigQuery {
  version?: string;            // 指定版本，不传则获取最新
  locale?: string;             // 指定语言，不传则返回全部
}

// Response
interface GetConfigResponse {
  packageId: string;
  version: string;
  manifest: Manifest;
  questions?: QuestionsData;    // 懒加载
  types?: TypesData;           // 懒加载
  templates?: TemplatesData;    // 懒加载
  theme?: ThemeData;
  i18n?: Record<string, I18nDict>;
  publishedAt: string;
  expiresAt?: string;          // 缓存过期时间
}

// POST /api/v1/configs - 创建配置

// Request Body
interface CreateConfigRequest {
  packageId: string;
  manifest: Manifest;
  questions?: QuestionsData;
  types?: TypesData;
  templates?: TemplatesData;
  theme?: ThemeData;
  i18n?: Record<string, I18nDict>;
}

// Response
interface CreateConfigResponse {
  packageId: string;
  version: string;
  status: 'draft' | 'published';
  createdAt: string;
}

// PUT /api/v1/configs/:packageId - 更新配置

// Request Body
interface UpdateConfigRequest {
  manifest?: Manifest;
  questions?: QuestionsData;
  types?: TypesData;
  templates?: TemplatesData;
  theme?: ThemeData;
  i18n?: Record<string, I18nDict>;
  action: 'update' | 'publish' | 'rollback';
  targetVersion?: string;      // 回滚目标版本
}

// Response
interface UpdateConfigResponse {
  packageId: string;
  version: string;
  previousVersion?: string;
  status: 'draft' | 'published';
  updatedAt: string;
}
```

### 4.4 统计分析 API

#### 接口列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/analytics/track` | 埋点上报 | 公开 |
| GET | `/api/v1/analytics/types` | 类型分布 | 公开 |
| GET | `/api/v1/analytics/overview` | 数据概览 | 管理员 |
| GET | `/api/v1/analytics/funnel` | 漏斗分析 | 管理员 |

#### 详细定义

```typescript
// POST /api/v1/analytics/track - 埋点上报

// Request Body
interface TrackEventRequest {
  events: AnalyticsEvent[];
}

interface AnalyticsEvent {
  event: string;               // 事件名称
  properties: Record<string, any>; // 事件属性
  timestamp: string;           // 事件时间
  visitorId?: string;           // 访客 ID（用于关联）
}

// 预定义事件
const EVENTS = {
  // 测试事件
  TEST_START: 'test_start',
  TEST_ANSWER: 'test_answer',
  TEST_SUBMIT: 'test_submit',
  TEST_ABANDON: 'test_abandon',

  // 结果事件
  RESULT_VIEW: 'result_view',
  RESULT_SHARE: 'result_share',
  RESULT_EXPORT: 'result_export',

  // 配置事件
  CONFIG_LOAD: 'config_load',
  CONFIG_ERROR: 'config_error',

  // 用户事件
  USER_LOGIN: 'user_login',
  USER_REGISTER: 'user_register',
} as const;

// Response
interface TrackEventResponse {
  tracked: number;
}

// GET /api/v1/analytics/types - 类型分布统计

// Query Parameters
interface TypeStatsQuery {
  packageId: string;
  period?: 'day' | 'week' | 'month' | 'all';
  startDate?: string;
  endDate?: string;
}

// Response
interface TypeStatsResponse {
  packageId: string;
  period: string;
  totalTests: number;
  distribution: {
    typeCode: string;
    typeName: LocalizedString;
    count: number;
    percentage: number;
  }[];
  growth: {
    current: number;           // 本期数量
    previous: number;          // 上期数量
    change: number;            // 变化百分比
  };
}

// GET /api/v1/analytics/overview - 数据概览

// Response
interface OverviewStatsResponse {
  summary: {
    totalTests: number;
    totalUsers: number;
    avgDuration: number;       // 平均测试时长（秒）
    completionRate: number;    // 完成率
  };
  trends: {
    date: string;
    tests: number;
    users: number;
  }[];
  topTypes: {
    typeCode: string;
    count: number;
  }[];
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}
```

### 4.5 用户服务 API

#### 接口列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 注册 | 公开 |
| POST | `/api/v1/auth/login` | 登录 | 公开 |
| POST | `/api/v1/auth/refresh` | 刷新 Token | 必填 |
| POST | `/api/v1/auth/logout` | 登出 | 必填 |
| GET | `/api/v1/users/me` | 当前用户 | 必填 |
| PUT | `/api/v1/users/me` | 更新用户 | 必填 |
| GET | `/api/v1/users/me/results` | 用户结果列表 | 必填 |
| DELETE | `/api/v1/users/me/results/:id` | 删除结果 | 必填 |

#### 详细定义

```typescript
// POST /api/v1/auth/register - 注册

// Request Body
interface RegisterRequest {
  email: string;
  password: string;
  nickname?: string;
}

// Response
interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;          // Token 过期时间（秒）
}

// POST /api/v1/auth/login - 登录

// Request Body
interface LoginRequest {
  email: string;
  password: string;
}

// Response
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// POST /api/v1/auth/refresh - 刷新 Token

// Request Body
interface RefreshTokenRequest {
  refreshToken: string;
}

// Response
interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// GET /api/v1/users/me - 当前用户

// Response
interface User {
  id: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  stats: {
    totalTests: number;
    totalResults: number;
  };
}

// GET /api/v1/users/me/results - 用户结果列表

// Query Parameters
interface UserResultsQuery {
  page?: number;
  pageSize?: number;
  packageId?: string;
}

// Response
interface UserResultsResponse {
  results: {
    id: string;
    shareId: string;
    packageId: string;
    packageName: string;
    typeCode: string;
    typeName: LocalizedString;
    createdAt: string;
  }[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

---

## 五、数据模型

### 5.1 数据库选型

| 存储 | 选型 | 用途 |
|------|------|------|
| 主数据库 | PostgreSQL | 结构化数据、事务 |
| 缓存 | Redis | 会话、限流、热点数据 |
| 文件存储 | S3 / R2 | 配置、媒体文件 |
| 分析数据 | ClickHouse（可选） | 大规模数据分析 |

### 5.2 表结构设计

```sql
-- ================================================
-- NBTI 数据库表结构
-- ================================================

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 用户会话表
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- 测试结果表
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id VARCHAR(20) UNIQUE NOT NULL,  -- 短链接 ID
    user_id UUID REFERENCES users(id),      -- 可为空（匿名结果）
    package_id VARCHAR(100) NOT NULL,
    type_code VARCHAR(20) NOT NULL,
    type_data JSONB NOT NULL,               -- 完整类型数据（冗余存储）
    answers JSONB,                          -- 答案数据（可选）
    dimensions JSONB NOT NULL,               -- 维度分数
    duration INTEGER,                        -- 测试时长（秒）
    locale VARCHAR(10) DEFAULT 'zh',
    metadata JSONB,                          -- referrer, utm 等
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 约束
    CONSTRAINT valid_type_code CHECK (length(type_code) >= 2)
);

CREATE INDEX idx_results_share_id ON results(share_id);
CREATE INDEX idx_results_user_id ON results(user_id);
CREATE INDEX idx_results_package ON results(package_id);
CREATE INDEX idx_results_type ON results(type_code);
CREATE INDEX idx_results_created ON results(created_at);
CREATE INDEX idx_results_package_type ON results(package_id, type_code);

-- 结果访问日志表
CREATE TABLE result_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
    visitor_id VARCHAR(100),                -- 匿名访客 ID
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_access_result ON result_access_logs(result_id);
CREATE INDEX idx_access_created ON result_access_logs(created_at);

-- 配置版本表
CREATE TABLE config_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    manifest JSONB NOT NULL,
    questions JSONB,
    types JSONB,
    templates JSONB,
    themes JSONB,
    i18n JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_config_package_version ON config_versions(package_id, version);
CREATE INDEX idx_config_package_status ON config_versions(package_id, status);

-- 埋点事件表
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event VARCHAR(100) NOT NULL,
    visitor_id VARCHAR(100),
    user_id UUID REFERENCES users(id),
    properties JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_event ON analytics_events(event);
CREATE INDEX idx_events_visitor ON analytics_events(visitor_id);
CREATE INDEX idx_events_created ON analytics_events(created_at);
CREATE INDEX idx_events_properties ON analytics_events USING GIN(properties);

-- 配置下载记录表（用于统计）
CREATE TABLE config_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    cached BOOLEAN DEFAULT FALSE,
    duration_ms INTEGER,                     -- 下载耗时
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_downloads_package ON config_downloads(package_id);
CREATE INDEX idx_downloads_created ON config_downloads(created_at);
```

### 5.3 Redis 数据结构

```typescript
// ================================================
// Redis 数据结构设计
// ================================================

// 1. 会话存储
// Key: session:{sessionId}
// TTL: 7 天
interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: string;
}

// 2. 限流计数
// Key: rate_limit:{type}:{identifier}
// TTL: 1 分钟
// type: api | test | export
// identifier: userId | IP

// 3. 结果缓存
// Key: result:{shareId}
// TTL: 1 小时
interface CachedResult {
  id: string;
  typeCode: string;
  typeData: PersonalityType;
  dimensions: DimensionScore[];
}

// 4. 配置缓存
// Key: config:{packageId}:{version}:{locale}
// TTL: 24 小时
interface CachedConfig {
  manifest: Manifest;
  questions?: QuestionsData;
  types?: TypesData;
}

// 5. 类型分布缓存
// Key: stats:types:{packageId}:{period}
// TTL: 5 分钟
interface CachedTypeStats {
  distribution: { typeCode: string; count: number }[];
  total: number;
  updatedAt: string;
}

// 6. 访客追踪
// Key: visitor:{visitorId}
// TTL: 30 天
interface VisitorData {
  firstSeen: string;
  lastSeen: string;
  testCount: number;
  resultIds: string[];
}
```

---

## 六、中间件设计

### 6.1 中间件列表

```typescript
// apps/api/src/middleware/index.ts

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { etag } from 'hono/etag';
import { compress } from 'hono/compress';

import { rateLimitMiddleware } from './rate-limit';
import { authMiddleware } from './auth';
import { errorHandler } from './error-handler';
import { requestId } from './request-id';
import { corsConfig } from './cors';

// 应用中间件
export function applyMiddleware(app: Hono) {
  // 基础中间件
  app.use('*', requestId());
  app.use('*', logger());
  app.use('*', compress());
  app.use('*', etag());

  // CORS
  app.use('*', cors(corsConfig));

  // 错误处理
  app.onError((err, c) => errorHandler(err, c));
}
```

### 6.2 认证中间件

```typescript
// apps/api/src/middleware/auth.ts

import { Context, Next } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// 认证策略
type AuthStrategy = 'required' | 'optional' | 'none';

export async function authMiddleware(c: Context, next: Next) {
  const path = c.req.path;

  // 公开接口跳过认证
  const publicPaths = [
    '/api/v1/results/',        // 获取结果
    '/api/v1/configs/',        // 获取配置
    '/api/v1/analytics/types', // 公开统计
    '/api/v1/analytics/track', // 埋点上报
    '/api/v1/auth/login',
    '/api/v1/auth/register',
  ];

  if (publicPaths.some(p => path.startsWith(p))) {
    c.set('auth', { strategy: 'none' });
    return next();
  }

  // Bearer Token 认证
  const token = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    c.set('auth', { strategy: 'optional', user: null });
    return next();
  }

  try {
    // 验证 Token
    const payload = await verifyAccessToken(token);

    // 获取用户信息
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      c.set('auth', { strategy: 'optional', user: null });
      return next();
    }

    c.set('auth', {
      strategy: 'required',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

    return next();
  } catch (error) {
    c.set('auth', { strategy: 'optional', user: null });
    return next();
  }
}

// Token 验证
async function verifyAccessToken(token: string) {
  // 验证 JWT Token
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as JWTPayload;
}

// 辅助函数：获取当前用户
export function getCurrentUser(c: Context) {
  const auth = c.get('auth');
  return auth?.user ?? null;
}

// 辅助函数：检查是否已认证
export function isAuthenticated(c: Context) {
  const auth = c.get('auth');
  return auth?.user !== null;
}

// 辅助函数：检查管理员权限
export function isAdmin(c: Context) {
  const auth = c.get('auth');
  return auth?.user?.role === 'admin';
}
```

### 6.3 限流中间件

```typescript
// apps/api/src/middleware/rate-limit.ts

import { Context, Next } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';

import { redis } from '../cache/redis';

// 限流配置
interface RateLimitConfig {
  windowMs: number;        // 时间窗口（毫秒）
  maxRequests: number;     // 最大请求数
  keyGenerator: (c: Context) => string;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // API 通用限流
  api: {
    windowMs: 60 * 1000,  // 1 分钟
    maxRequests: 100,
    keyGenerator: (c) => `ratelimit:api:${c.req.header('x-forwarded-for') || 'unknown'}`,
  },
  // 测试结果创建
  createResult: {
    windowMs: 60 * 1000,  // 1 分钟
    maxRequests: 10,
    keyGenerator: (c) => `ratelimit:result:${c.req.header('x-forwarded-for') || 'unknown'}`,
  },
  // 配置获取（允许频繁访问）
  getConfig: {
    windowMs: 60 * 1000,
    maxRequests: 300,
    keyGenerator: (c) => `ratelimit:config:${c.req.header('x-forwarded-for') || 'unknown'}`,
  },
  // 埋点上报
  track: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyGenerator: (c) => `ratelimit:track:${c.req.header('x-forwarded-for') || 'unknown'}`,
  },
};

// 限流中间件工厂
export function rateLimitMiddleware(name: keyof typeof rateLimitConfigs) {
  return async (c: Context, next: Next) => {
    const config = rateLimitConfigs[name];
    const key = config.keyGenerator(c);

    // 使用 Redis INCR + EXPIRE 实现限流
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, Math.ceil(config.windowMs / 1000));
    }

    const ttl = await redis.ttl(key);

    // 设置响应头
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current).toString());
    c.header('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());

    // 检查是否超限
    if (current > config.maxRequests) {
      return c.json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '请求过于频繁，请稍后再试',
          retryAfter: ttl,
        },
      }, 429);
    }

    await next();
  };
}
```

### 6.4 错误处理中间件

```typescript
// apps/api/src/middleware/error-handler.ts

import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

export function errorHandler(error: Error, c: Context) {
  // HTTP 异常
  if (error instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        code: error.code?.toString() || 'HTTP_ERROR',
        message: error.message,
      },
    }, error.status);
  }

  // 参数校验错误
  if (error instanceof ZodError) {
    const details = error.errors.reduce((acc, e) => {
      acc[e.path.join('.')] = e.message;
      return acc;
    }, {} as Record<string, string>);

    return c.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '参数校验失败',
        details,
      },
    }, 400);
  }

  // 数据库错误
  if (error.name === 'PrismaClientKnownRequestError') {
    console.error('Database error:', error);
    return c.json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: '数据库操作失败',
      },
    }, 500);
  }

  // 未知错误
  console.error('Unhandled error:', error);
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
    },
  }, 500);
}
```

---

## 七、服务设计

### 7.1 结果服务

```typescript
// apps/api/src/services/result.service.ts

import { db } from '../db/client';
import { results } from '../db/schema';
import { redis } from '../cache/redis';
import { nanoid } from 'nanoid';
import type { HonoContext } from '../types';

export class ResultService {
  // 创建结果
  async create(c: HonoContext, data: CreateResultRequest) {
    const shareId = nanoid(8);  // 生成 8 位短 ID
    const userId = c.get('auth')?.user?.id || null;

    // 插入数据库
    const [result] = await db.insert(results).values({
      shareId,
      userId,
      packageId: data.packageId,
      typeCode: data.typeCode,
      typeData: await this.getTypeData(data.packageId, data.typeCode),
      answers: data.answers || null,
      dimensions: data.dimensions,
      duration: data.duration,
      locale: data.locale,
      metadata: data.metadata || {},
    }).returning();

    // 缓存结果
    await this.cacheResult(shareId, result);

    return {
      id: result.id,
      shareId: result.shareId,
      shareUrl: `${process.env.PUBLIC_BASE_URL}/r/${shareId}`,
      typeCode: result.typeCode,
      createdAt: result.createdAt,
    };
  }

  // 获取结果（公开）
  async getByShareId(shareId: string) {
    // 先查缓存
    const cached = await redis.get(`result:${shareId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 查数据库
    const result = await db.query.results.findFirst({
      where: (r, { eq }) => eq(r.shareId, shareId),
    });

    if (!result) {
      return null;
    }

    // 记录访问
    await this.recordAccess(result.id, shareId);

    // 缓存
    await this.cacheResult(shareId, result);

    return this.formatResult(result);
  }

  // 获取用户结果列表
  async getUserResults(userId: string, query: UserResultsQuery) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;

    const [results, total] = await Promise.all([
      db.query.results.findMany({
        where: (r, { eq, and }) => and(
          eq(r.userId, userId),
          query.packageId ? eq(r.packageId, query.packageId) : undefined
        ),
        orderBy: (r, { desc }) => desc(r.createdAt),
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      db.query.results.findMany({
        where: (r, { eq }) => eq(r.userId, userId),
      }).then(r => r.length),
    ]);

    return {
      results: results.map(r => ({
        id: r.id,
        shareId: r.shareId,
        packageId: r.packageId,
        typeCode: r.typeCode,
        createdAt: r.createdAt,
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // 缓存结果
  private async cacheResult(shareId: string, result: any) {
    await redis.setex(
      `result:${shareId}`,
      3600,  // 1 小时
      JSON.stringify(this.formatResult(result))
    );
  }

  // 记录访问
  private async recordAccess(resultId: string, shareId: string) {
    // 异步记录，不阻塞响应
    db.insert(resultAccessLogs).values({
      resultId,
      ipAddress: c.req.header('x-forwarded-for'),
      userAgent: c.req.header('user-agent'),
      referrer: c.req.header('referer'),
    }).catch(console.error);
  }

  // 格式化结果
  private formatResult(result: any) {
    return {
      id: result.id,
      shareId: result.shareId,
      packageId: result.packageId,
      type: result.typeData,
      dimensions: result.dimensions,
      createdAt: result.createdAt,
    };
  }

  // 获取类型数据（从配置服务）
  private async getTypeData(packageId: string, typeCode: string) {
    // 实际从配置服务获取
    // 这里简化处理
    return {};
  }
}

export const resultService = new ResultService();
```

### 7.2 配置服务

```typescript
// apps/api/src/services/config.service.ts

import { db } from '../db/client';
import { configVersions } from '../db/schema';
import { redis } from '../cache/redis';
import { s3 } from '../storage/s3';
import type { HonoContext } from '../types';

export class ConfigService {
  // 获取配置
  async getConfig(packageId: string, query: GetConfigQuery) {
    const { version, locale } = query;

    // 缓存 key
    const cacheKey = `config:${packageId}:${version || 'latest'}:${locale || 'all'}`;

    // 先查缓存
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 查询数据库
    const config = version
      ? await db.query.configVersions.findFirst({
          where: (c, { eq, and }) => and(
            eq(c.packageId, packageId),
            eq(c.version, version)
          ),
        })
      : await db.query.configVersions.findFirst({
          where: (c, { eq }) => eq(c.packageId, packageId),
          orderBy: (c, { desc }) => desc(c.createdAt),
        });

    if (!config || config.status !== 'published') {
      return null;
    }

    // 懒加载：只返回请求的字段
    const result = {
      packageId: config.packageId,
      version: config.version,
      manifest: config.manifest,
      questions: query.includeQuestions !== false ? config.questions : undefined,
      types: query.includeTypes !== false ? config.types : undefined,
      templates: config.templates,
      theme: config.themes,
      i18n: locale ? { [locale]: config.i18n?.[locale] } : config.i18n,
      publishedAt: config.publishedAt,
    };

    // 缓存 24 小时
    await redis.setex(cacheKey, 86400, JSON.stringify(result));

    return result;
  }

  // 创建配置
  async createConfig(c: HonoContext, data: CreateConfigRequest) {
    const version = this.generateVersion();

    const [config] = await db.insert(configVersions).values({
      packageId: data.packageId,
      version,
      manifest: data.manifest,
      questions: data.questions,
      types: data.types,
      templates: data.templates,
      themes: data.theme,
      i18n: data.i18n,
      status: 'draft',
      createdBy: c.get('auth')?.user?.id,
    }).returning();

    return {
      packageId: config.packageId,
      version: config.version,
      status: config.status,
      createdAt: config.createdAt,
    };
  }

  // 更新配置
  async updateConfig(
    c: HonoContext,
    packageId: string,
    data: UpdateConfigRequest
  ) {
    const { action, targetVersion, ...configData } = data;

    if (action === 'rollback' && targetVersion) {
      // 回滚到指定版本
      const targetConfig = await db.query.configVersions.findFirst({
        where: (c, { eq, and }) => and(
          eq(c.packageId, packageId),
          eq(c.version, targetVersion)
        ),
      });

      if (!targetConfig) {
        throw new Error('Target version not found');
      }

      const newVersion = this.generateVersion();
      const [newConfig] = await db.insert(configVersions).values({
        packageId,
        version: newVersion,
        manifest: targetConfig.manifest,
        questions: targetConfig.questions,
        types: targetConfig.types,
        templates: targetConfig.templates,
        themes: targetConfig.themes,
        i18n: targetConfig.i18n,
        status: 'published',
        publishedAt: new Date(),
        createdBy: c.get('auth')?.user?.id,
      }).returning();

      // 清除缓存
      await this.clearConfigCache(packageId);

      return {
        packageId,
        version: newConfig.version,
        previousVersion: targetVersion,
        status: newConfig.status,
        updatedAt: newConfig.createdAt,
      };
    }

    // 更新当前版本
    const latestConfig = await db.query.configVersions.findFirst({
      where: (c, { eq }) => eq(c.packageId, packageId),
      orderBy: (c, { desc }) => desc(c.createdAt),
    });

    if (!latestConfig) {
      throw new Error('Config not found');
    }

    const newVersion = this.generateVersion();
    const [newConfig] = await db.insert(configVersions).values({
      packageId,
      version: newVersion,
      manifest: configData.manifest || latestConfig.manifest,
      questions: configData.questions || latestConfig.questions,
      types: configData.types || latestConfig.types,
      templates: configData.templates || latestConfig.templates,
      themes: configData.theme || latestConfig.themes,
      i18n: configData.i18n || latestConfig.i18n,
      status: action === 'publish' ? 'published' : latestConfig.status,
      publishedAt: action === 'publish' ? new Date() : latestConfig.publishedAt,
      createdBy: c.get('auth')?.user?.id,
    }).returning();

    // 清除缓存
    await this.clearConfigCache(packageId);

    return {
      packageId,
      version: newConfig.version,
      previousVersion: latestConfig.version,
      status: newConfig.status,
      updatedAt: newConfig.createdAt,
    };
  }

  // 获取版本历史
  async getVersionHistory(packageId: string) {
    const configs = await db.query.configVersions.findMany({
      where: (c, { eq }) => eq(c.packageId, packageId),
      orderBy: (c, { desc }) => desc(c.createdAt),
      columns: {
        version: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return configs;
  }

  // 生成版本号
  private generateVersion(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 5);
    return `${dateStr}.${random}`;
  }

  // 清除配置缓存
  private async clearConfigCache(packageId: string) {
    const keys = await redis.keys(`config:${packageId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const configService = new ConfigService();
```

### 7.3 统计分析服务

```typescript
// apps/api/src/services/analytics.service.ts

import { db } from '../db/client';
import { results, analyticsEvents } from '../db/schema';
import { redis } from '../cache/redis';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

export class AnalyticsService {
  // 埋点上报
  async track(events: AnalyticsEvent[]) {
    const records = events.map(event => ({
      event: event.event,
      visitorId: event.visitorId || null,
      properties: event.properties,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    }));

    await db.insert(analyticsEvents).values(records);

    return { tracked: events.length };
  }

  // 类型分布统计
  async getTypeDistribution(query: TypeStatsQuery) {
    const { packageId, period, startDate, endDate } = query;

    // 缓存 key
    const cacheKey = `stats:types:${packageId}:${period || 'all'}:${startDate || ''}:${endDate || ''}`;

    // 查缓存
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 构建时间条件
    const timeCondition = this.buildTimeCondition(period, startDate, endDate);

    // 查询统计
    const stats = await db
      .select({
        typeCode: results.typeCode,
        count: sql<number>`count(*)::int`,
      })
      .from(results)
      .where(
        and(
          eq(results.packageId, packageId),
          timeCondition
        )
      )
      .groupBy(results.typeCode)
      .orderBy(sql`count(*) desc`);

    const total = stats.reduce((sum, s) => sum + s.count, 0);

    const distribution = stats.map(s => ({
      typeCode: s.typeCode,
      count: s.count,
      percentage: total > 0 ? Math.round((s.count / total) * 10000) / 100 : 0,
    }));

    const result = {
      packageId,
      period: period || 'all',
      totalTests: total,
      distribution,
    };

    // 缓存 5 分钟
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  // 数据概览
  async getOverview(packageId?: string) {
    const conditions = packageId ? eq(results.packageId, packageId) : undefined;

    // 并行查询多个指标
    const [totalStats, trendStats, topTypes, deviceStats] = await Promise.all([
      // 汇总统计
      db
        .select({
          totalTests: sql<number>`count(*)::int`,
          avgDuration: sql<number>`round(avg(duration))`,
        })
        .from(results)
        .where(conditions),

      // 趋势数据（最近 30 天）
      db
        .select({
          date: sql<string>`date(created_at)::text`,
          tests: sql<number>`count(*)::int`,
        })
        .from(results)
        .where(
          conditions
            ? and(conditions, gte(results.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
            : gte(results.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        )
        .groupBy(sql`date(created_at)`)
        .orderBy(sql`date(created_at)`),

      // Top 5 类型
      db
        .select({
          typeCode: results.typeCode,
          count: sql<number>`count(*)::int`,
        })
        .from(results)
        .where(conditions)
        .groupBy(results.typeCode)
        .orderBy(sql`count(*) desc`)
        .limit(5),

      // 设备分布
      db
        .select({
          device: sql<string>`COALESCE(
            NULLIF(regexp_replace(
              (metadata->>'userAgent')::text,
              '.*(Mobile|Android|iPhone|iPad).*',
              'mobile'
            ), ''), 'desktop'
          )`,
          count: sql<number>`count(*)::int`,
        })
        .from(results)
        .groupBy(sql`1`),
    ]);

    return {
      summary: {
        totalTests: totalStats[0]?.totalTests || 0,
        avgDuration: totalStats[0]?.avgDuration || 0,
      },
      trends: trendStats.map(t => ({
        date: t.date,
        tests: t.tests,
      })),
      topTypes: topTypes.map(t => ({
        typeCode: t.typeCode,
        count: t.count,
      })),
      deviceStats: {
        desktop: deviceStats.find(d => d.device === 'desktop')?.count || 0,
        mobile: deviceStats.find(d => d.device === 'mobile')?.count || 0,
        tablet: 0,
      },
    };
  }

  // 漏斗分析
  async getFunnel(packageId: string) {
    const events = await db
      .select({
        event: analyticsEvents.event,
        count: sql<number>`count(distinct visitor_id)::int`,
      })
      .from(analyticsEvents)
      .where(eq(sql`metadata->>'packageId'`, packageId))
      .groupBy(analyticsEvents.event);

    // 定义漏斗步骤
    const funnelSteps = [
      { event: 'test_start', name: '开始测试' },
      { event: 'test_answer', name: '答题' },
      { event: 'test_submit', name: '提交测试' },
      { event: 'result_view', name: '查看结果' },
      { event: 'result_share', name: '分享结果' },
    ];

    const eventMap = new Map(events.map(e => [e.event, e.count]));

    return funnelSteps.map(step => ({
      step: step.name,
      event: step.event,
      users: eventMap.get(step.event) || 0,
      conversionRate: 0,  // 计算相对上一步的转化率
    }));
  }

  // 构建时间条件
  private buildTimeCondition(
    period?: string,
    startDate?: string,
    endDate?: string
  ) {
    if (startDate && endDate) {
      return and(
        gte(results.createdAt, new Date(startDate)),
        lte(results.createdAt, new Date(endDate))
      );
    }

    const now = new Date();
    let start: Date;

    switch (period) {
      case 'day':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return undefined;
    }

    return gte(results.createdAt, start);
  }
}

export const analyticsService = new AnalyticsService();
```

---

## 八、部署方案

### 8.1 推荐方案：Vercel + Supabase

```
┌─────────────────────────────────────────────────────────────────┐
│                      部署架构（Vercel + Supabase）               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                        Vercel                            │  │
│   │                                                          │  │
│   │   ┌─────────────────┐    ┌─────────────────┐            │  │
│   │   │   Next.js App   │    │   API Routes    │            │  │
│   │   │   (apps/web)    │    │   (apps/api)    │            │  │
│   │   │                 │    │                 │            │  │
│   │   │  • 前端页面     │    │  • 结果存储     │            │  │
│   │   │  • SSG/SSR     │    │  • 配置管理     │            │  │
│   │   │  • API 路由     │    │  • 统计分析     │            │  │
│   │   └─────────────────┘    └─────────────────┘            │  │
│   │                                                          │  │
│   │   Edge Functions: CORS、限流、IP 检查                     │  │
│   └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │                                   │
│   ┌──────────────────────────┴──────────────────────────┐      │
│   │                        Supabase                       │      │
│   │                                                          │      │
│   │   ┌─────────────────┐    ┌─────────────────┐            │      │
│   │   │   PostgreSQL    │    │      Redis      │            │      │
│   │   │                 │    │                 │            │      │
│   │   │  • 结果数据     │    │  • 会话缓存     │            │      │
│   │   │  • 用户数据     │    │  • 限流计数     │            │  │
│   │   │  • 配置版本     │    │  • API 缓存     │            │  │
│   │   └─────────────────┘    └─────────────────┘            │      │
│   │                                                          │      │
│   │   Storage: 配置文件备份                                   │      │
│   │   Auth: 用户认证（可选）                                   │      │
│   └──────────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 部署配置

```yaml
# vercel.json
{
  "regions": ["hkg1", "sin1"],  # 亚太地区
  "env": {
    "DATABASE_URL": "@database-url",
    "REDIS_URL": "@redis-url",
    "JWT_SECRET": "@jwt-secret"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    },
    {
      "source": "/api/v1/configs/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

```bash
# .env.example
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/nbti

# Redis
REDIS_URL=redis://user:password@host:6379

# 认证
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# 存储
S3_BUCKET=nbti-configs
S3_REGION=ap-east-1
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx

# 公共配置
PUBLIC_BASE_URL=https://nbti.app
API_BASE_URL=https://api.nbti.app
```

### 8.3 成本估算

| 服务 | 方案 | 月费用（估算） | 免费额度 |
|------|------|---------------|----------|
| Vercel | Pro Plan | $20/月 | 100GB 带宽 |
| Supabase | Pro Plan | $25/月 | 500MB 数据库，2GB 传输 |
| Redis | Upstash Free | $0 | 10K 命令/天 |
| **总计** | — | **~$45/月** | — |

---

## 九、安全设计

### 9.1 安全措施

| 层级 | 措施 | 说明 |
|------|------|------|
| **传输层** | HTTPS + HSTS | 全站强制 HTTPS |
| **认证** | JWT + Refresh Token | 双 Token 机制 |
| **授权** | RBAC | 基于角色的权限控制 |
| **限流** | Redis 计数 | API 级别限流 |
| **校验** | Zod Schema | 请求参数严格校验 |
| **SQL注入** | ORM + 参数化查询 | Drizzle ORM |
| **XSS** | CSP + 输出转义 | 内容安全策略 |
| **CSRF** | SameSite Cookie | 防止跨站请求 |
| **敏感数据** | 加密存储 | 密码 bcrypt |

### 9.2 权限控制

```typescript
// 权限定义
export const PERMISSIONS = {
  // 结果权限
  'result:create': ['user', 'admin', 'anonymous'],
  'result:read:own': ['user', 'admin'],
  'result:read:any': ['admin'],
  'result:delete:own': ['user', 'admin'],
  'result:delete:any': ['admin'],

  // 配置权限
  'config:read': ['user', 'admin', 'anonymous'],
  'config:create': ['admin'],
  'config:update': ['admin'],
  'config:delete': ['admin'],

  // 统计权限
  'analytics:track': ['user', 'admin', 'anonymous'],
  'analytics:public': ['user', 'admin', 'anonymous'],
  'analytics:private': ['admin'],
} as const;

// 权限检查中间件
export function requirePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const user = c.get('auth')?.user;

    const allowed = PERMISSIONS[permission as keyof typeof PERMISSIONS];
    if (!allowed) {
      throw new HTTPException(403, { message: 'Permission not found' });
    }

    if (!allowed.includes(user?.role || 'anonymous')) {
      throw new HTTPException(403, { message: 'Permission denied' });
    }

    await next();
  };
}
```

### 9.3 数据安全

```typescript
// 敏感数据处理
export function sanitizeResult(result: Result) {
  return {
    // 公开字段
    id: result.id,
    shareId: result.shareId,
    typeCode: result.typeCode,
    typeData: result.typeData,

    // 隐藏敏感字段
    // email: undefined,
    // ipAddress: undefined,
    // userAgent: undefined,
  };
}

// 日志脱敏
export function sanitizeLogData(data: Record<string, any>) {
  const sensitiveKeys = ['password', 'token', 'secret', 'key'];
  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}
```

---

## 十、监控与日志

### 10.1 日志设计

```typescript
// apps/api/src/utils/logger.ts

import { logger as honoLogger } from 'hono/logger';

interface LogData {
  requestId: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export const requestLogger = honoLogger((str, variables) => {
  const data: LogData = {
    requestId: variables.requestId,
    method: variables.method,
    path: variables.path,
    status: parseInt(variables.status),
    duration: parseInt(variables.duration),
  };

  // 输出到日志系统
  console.log(JSON.stringify({
    ...data,
    timestamp: new Date().toISOString(),
    type: 'access',
  }));
});

// 结构化错误日志
export function logError(error: Error, context: Record<string, any>) {
  console.error(JSON.stringify({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
    type: 'error',
  }));
}
```

### 10.2 监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| API 响应时间 | P50/P95/P99 | P95 > 2s |
| 错误率 | 5xx 占比 | > 1% |
| 可用性 | 成功率 | < 99.9% |
| 数据库连接 | 连接池使用率 | > 80% |
| Redis 内存 | 内存使用率 | > 70% |

---

## 十一、扩展性设计

### 11.1 水平扩展

```
┌─────────────────────────────────────────────────────────────────┐
│                      水平扩展架构                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      ┌─────────────┐                             │
│                      │   Vercel   │                             │
│                      │  (自动扩缩) │                             │
│                      └──────┬──────┘                             │
│                             │                                   │
│              ┌──────────────┼──────────────┐                     │
│              ▼              ▼              ▼                     │
│        ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│        │Instance │    │Instance │    │Instance │                │
│        │    1    │    │    2    │    │    3    │                │
│        └────┬────┘    └────┬────┘    └────┬────┘                │
│             │              │              │                      │
│             └──────────────┼──────────────┘                     │
│                            │                                   │
│                            ▼                                   │
│                      ┌─────────────┐                             │
│                      │  PostgreSQL │                             │
│                      │   (Supabase) │                            │
│                      └─────────────┘                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 微服务拆分（可选）

当系统规模增长到一定程度后，可以考虑拆分微服务：

| 服务 | 职责 | 独立性 |
|------|------|--------|
| API Gateway | 路由、限流、认证 | 高 |
| Results Service | 结果存储与查询 | 高 |
| Configs Service | 配置管理 | 高 |
| Analytics Service | 统计分析 | 中 |
| Users Service | 用户管理 | 中 |
| Media Service | 文件上传 | 低 |

---

*文档版本：1.0*
*最后更新：2026-04-10*
