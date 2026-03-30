# AI Nav 运营手册（给 AI/人类都能用）

路径：`/Users/wow/dev/book/mengboy/static/ai-nav`

## 1) 页面结构

- `index.html`：总入口（赛道列表）
- `creator/index.html`、`ecommerce/index.html`、`indie-dev/index.html`、`sales/index.html`、`support/index.html`：独立子页
- `assets/styles.css`：样式
- `assets/app.js`：前端逻辑（总入口渲染 + 子页渲染）
- `data/tools.json`：运营核心数据（**高频更新只改这个文件**）

## 2) 最小运营动作（建议周更）

1. 在 `data/tools.json` 新增/删除工具
2. 更新 `meta.lastUpdated`
3. 检查每个工具 `affiliateUrl` 是否有效
4. 若新增赛道，同时新增对应子页目录（如 `new-track/index.html`），并在 `sections` 中加入同名 `id`
5. 本地构建预览：
   ```bash
   cd /Users/wow/dev/book/mengboy
   hugo
   ```
5. 发布：
   ```bash
   cd /Users/wow/dev/book/mengboy
   ./deploy.sh
   ```

## 3) tools.json 字段约定

每条工具必须包含：

- `name`：工具名称
- `section`：归属分类（必须在 `sections.id` 里存在）
- `tags`：标签数组
- `fitFor`：适用人群/场景
- `whyPick`：推荐理由
- `pricing`：定价摘要
- `affiliateLabel`：按钮文案
- `affiliateUrl`：分销链接
- `template`：可复制模板

## 4) AI 可直接执行的运营 prompt（示例）

### Prompt A：新增工具

> 读取 `static/ai-nav/data/tools.json`，在 `chatbot` 分类新增 2 个工具。要求：
> 1) 与现有工具不重复；
> 2) 每个工具补齐 `fitFor/whyPick/pricing/template`；
> 3) 更新 `meta.lastUpdated` 为今天；
> 4) 保持 JSON 合法；
> 5) 输出变更摘要。

### Prompt B：链接健康检查

> 检查 `static/ai-nav/data/tools.json` 的所有 `affiliateUrl`，标记 404 或明显无效链接。仅输出失败项清单，不修改文件。

### Prompt C：转化文案优化

> 读取 `static/ai-nav/data/tools.json`，重写每个工具的 `affiliateLabel`，目标是提升点击率，要求短于 8 个汉字，不夸大承诺。

## 5) 迭代建议（下个版本）

- 增加 UTM 参数自动拼接（来源渠道追踪）
- 增加 `/ai-nav/data/changelog.json` 用于记录每次运营变更
- 增加“本周新增”可视化标识，提升回访率
