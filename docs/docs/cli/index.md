# CLI 工具

::: info 开发中
CLI 工具正在开发中，以下是预计支持的功能。
:::

## 安装

```bash
npm install -g @nbti/cli
# 或
pnpm add -g @nbti/cli
```

## 命令

### nbti init

创建一个新的套餐配置。

```bash
nbti init my-suite
```

### nbti validate

校验套餐配置的完整性。

```bash
nbti validate ./suites/my-suite
```

### nbti generate

根据描述生成套餐配置。

```bash
nbti generate --description "一个关于职场沟通风格的测试"
```

### nbti serve

本地启动测试服务器。

```bash
nbti serve ./suites/my-suite
```
