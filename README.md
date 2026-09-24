# homepage

Peter Tian 的个人主页（petertianwork.me）。一个采用终端视觉风格的 Next.js 静态站：像素字体、窗口外框和三个普通导航入口。保留轻量的命令导航（如 writing、cd writing），不模拟文件系统；昼夜配色与内页共用。

## 目录

```
网站本身
  app/          Next.js App Router：/{zh,en}/ 首页，/about 关于，/projects 项目，/writing 统一文字列表，/blog/<slug>、/thoughts/<slug> 共用阅读外框
  components/   home/（终端主视图）terminal/（shell、提示符、湖景、配色）showcases/ blog/ site/ ui/
  lib/          内容加载：content.ts（文章）showcases.ts（札记）thoughts.ts site.ts i18n.ts article-registry.ts
  content/      站点内容：blog/zh/*.mdx 由 vault 同步生成；showcases/agent-notes/ 手写
  public/       静态资源（目前为空，图标在 app/icon.svg）

运行依赖与产物
  scripts/      发布链路：publish-from-vault、sync-vault-*、verify-*、prepare-github-pages、post/thought-intake
                test-lake-time.mjs 是配色与时间逻辑的测试（node --test）
  templates/    post-intake 模板
  docs/         工作流说明（source 分支、自动发布、vault 同步）与 design/ 未名湖参考
  .github/      publish-site.yml：push 到 source → 构建 → 发布到 main
  .claude/      本机 dev server 启动配置（未纳入 git）
  .next/ out/ .publish/ node_modules/   生成物，已 gitignore

归档
  archive/      过去的内容与不再运行的脚本，见 archive/README.md
```

## 日常

```bash
npm run dev            # http://localhost:3000/zh/
npm run build          # 静态导出到 out/
npm run lint
node --test scripts/test-lake-time.mjs
```

开发时可用 `?previewTime=HH:MM` 预览任一时段的配色，例如 `/zh/?previewTime=23:00`。

## 分支

- `source`：源码、内容、文档。所有 PR 的目标分支。
- `main`：GitHub Pages 的静态产物，由 workflow 写入，不要手改。

内容的真实来源是私有的 life vault 仓库，`content/blog/**` 是同步出来的副本，一般不手改；`content/showcases/**` 是直接写在这里的。

## 阅读预览

`/zh/writing/` 是统一文字入口；旧 `/blog/`、`/thoughts/` 列表地址会转到这里，文章原地址保留。
首页保留像素终端，阅读页使用独立正文排版和浏览器整页滚动。

开发模式（`npm run dev`）额外加载 `content/drafts/zh/` 中的 `interface-no-longer-fixed` 和 `knowledge-can-grow-on-its-own` 两篇设计样本，标注“本地预览”。生产构建不读取这些草稿；正式发布仍走原有内容流程。

内容和普通 URL 路由独立于视觉样式。`components/site/site-theme.tsx` 提供全站昼夜色彩变量；首页使用 `components/home/home.module.css`，内页使用 `components/reading/reading.module.css`。旧首页 hash 入口会转到对应普通页面。旧 shell/湖景/札记展示代码保留在源码中，目前没有被页面引用。

开发时可用 `?layout=full` 对比铺满屏幕的首页；默认仍为窗口布局。这个参数不改变生产站点布局。
