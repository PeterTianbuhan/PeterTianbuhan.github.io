# Codex 交接说明

这个文件夹里的 `HomePageDraft.tsx` 是首页初版，风格按你那张极客风暗色图去做了一个可维护的 React + Tailwind 版本。

## 你怎么交给 Codex
把这两个内容放在同一个文件夹里：

- `HomePageDraft.tsx`
- 你的参考图片（建议文件名保持简单）

## 你可以直接对 Codex 说

```txt
请参考同文件夹中的图片和 HomePageDraft.tsx，把这个首页继续完善成可直接部署的正式版本。

要求：
1. 保留当前页面的整体排版方向：左侧主内容、中间视觉主体、右侧信息面板、底部联系方式
2. 进一步提升和参考图的一致性，包括边框细节、发光感、科技线条、层次感、留白和字体节奏
3. 把文案替换成真实可配置的数据
4. 拆分成可维护组件
5. 补齐响应式布局
6. 补充适度动画，但不要影响性能
7. 如果项目是 Next.js，请改造成适合 Next.js app router 的页面结构
8. 如果需要新增 CSS、组件、资源文件，请直接补全
```

## 接入方式

### 如果你的项目是 React / Next.js + Tailwind
直接把 `HomePageDraft.tsx` 作为首页组件基础，让 Codex 帮你：
- 替换成 `app/page.tsx` 或 `src/pages/index.tsx`
- 抽离子组件
- 接入真实数据

### 如果你还没有项目
可以让 Codex 先创建一个 Vite 或 Next.js 项目。React 官方推荐新项目使用函数组件；Tailwind 官方当前文档也提供了 React / Next.js / Vite 的框架安装指引。citeturn609713search0turn609713search3turn609713search6turn609713search10

## 当前这个初版包含的内容
- 黑底白字的暗色极客风
- 三栏布局
- 左侧标题 / 技能 / 项目
- 中间科技感视觉中心
- 右侧代码片段 / 系统信息 / 日志 / 引言
- 底部社交信息

## 建议下一步
让 Codex 继续做这些增强：
- 替换假数据为你的真实信息
- 接入更高级的 SVG / canvas / 粒子视觉
- 加 hover / entrance 动画
- 优化移动端和超宽屏
- 接入真实图标库
