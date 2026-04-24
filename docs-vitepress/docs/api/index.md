# API 参考

::: info 开发中
API 参考文档正在完善中，以下是预计支持的接口。
:::

## REST API

### 获取套餐列表

```
GET /api/suites
```

返回所有可用的测试套餐。

**响应示例：**

```json
{
  "suites": [
    {
      "id": "mbti",
      "name": { "zh": "MBTI 性格测试", "en": "MBTI Personality" },
      "description": {
        "zh": "国际通用的性格评估工具",
        "en": "A comprehensive personality assessment tool"
      },
      "thumbnail": "/thumbnails/mbti.png",
      "enabled": true,
      "order": 1
    }
  ]
}
```

### 获取套餐配置

```
GET /api/suites/{suiteId}
```

返回指定套餐的完整配置。

### 提交测试答案

```
POST /api/suites/{suiteId}/submit
```

提交测试答案并获取结果。

**请求体：**

```json
{
  "answers": [
    { "questionId": "q001", "optionId": "opt_a" },
    { "questionId": "q002", "optionId": "opt_b" }
  ],
  "duration": 180
}
```

### 获取测试结果

```
GET /api/suites/{suiteId}/result/{resultId}
```

获取指定测试结果。

## Webhook

### 结果通知

当用户完成测试并分享结果时，可以触发 webhook 通知：

```
POST {your-webhook-url}
```

**请求体：**

```json
{
  "event": "test.completed",
  "suiteId": "mbti",
  "resultId": "abc123",
  "typeId": "INTJ",
  "timestamp": "2026-04-24T10:30:00Z"
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| `SUITE_NOT_FOUND` | 套餐不存在 |
| `INVALID_ANSWERS` | 答案格式错误 |
| `TEST_NOT_FOUND` | 测试记录不存在 |
| `RESULT_NOT_FOUND` | 结果不存在 |
