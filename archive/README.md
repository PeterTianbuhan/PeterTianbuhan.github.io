# archive

不再参与构建，但可能还有价值的东西。tsc 和 eslint 都忽略这个目录。

## seeds/

2026 年 5 月前后写的 9 篇文章草稿和 1 条随想，原来放在 `_seeds/`。它们从未进入 `content/blog/`，但 `lib/article-registry.ts` 里的系列元数据（ai-workflow、learning-record 等）还是按这些 slug 写的。要发布的话，正确路径是回到 vault 里改，再让同步脚本拉进来。

- `blog/agent-memory-survey.mdx` — Agent 记忆机制综述
- `blog/ai-foundations-transformer-learning-record.mdx` — Transformer 学习记录
- `blog/ai-foundations-cifar10-cnn-learning-record.mdx` — CIFAR-10 CNN 学习记录
- `blog/attention-memory-development-record.mdx` — 注意力/记忆开发记录
- `blog/defensive-programming-robustness.mdx` — 防御式编程
- `blog/http-api-git-push.mdx` — HTTP API 与 git push
- `blog/native-goal-architecture-evolution.mdx` — Goal 架构演进
- `blog/aigc-music-exploration-record.mdx` — AIGC 音乐探索
- `blog/current-life.mdx` — 目前的生活（2026-05）
- `thoughts/idea-note-space-2026-05-19.mdx`

## first-homepage-draft/

最早的首页：黑底极客风三栏布局的 `HomePageDraft.tsx`，以及交给 Codex 的交接说明。现在的终端版和它没有代码关系，留作记录。

## legacy-scripts/

只在旧环境里有意义的脚本：

- `preview.ps1`、`deploy-claim.ps1`、`copy-legacy-homepage.ps1` — Windows PowerShell 时期的预览和部署辅助
- `refresh-legacy-homepage.mjs` — 依赖已不存在的 `legacy-homepage/index.html`

对应的 `npm run legacy:refresh` / `preview:open` / `deploy:claim` 已从 package.json 移除。

## design/

- `learning-graph-concept.png` — 学习图谱概念图（1.7MB），和主页无直接关系。

## scenery-photo/

2026-09-22 做的第一版风景首页：同学拍的雷雨群山照片（只拿到 1280 宽的压缩版），用烘焙出来的深度/天空/雨幕贴图在 WebGL 里做视差、云流动和雨幕。后来改成纯代码生成的山景，照片版留在这里；要恢复就把 `components/` 放回 `components/scenery/`、`public/` 放回 `public/scenery/`。
