# 给 Agent 的说明

先读 `README.md` 了解目录。下面是改这个网站时要守的规矩。

## 网站是什么

一本速写本式的个人主页，主要给面试官和想认识 Peter 的人看。只放长期成立的东西：长文、项目、「我觉得」、关于。短的随想发在 X / QQ 空间 / 朋友圈，这里只留一个 X 链接。

## 风格

- 画面从钢笔线条加淡彩长出来，简洁、留白。新东西沿用 `components/home-sketch/` 里已有的写法（`ink.tsx` 墨线、`prose.tsx` 正文、`gallery.tsx` 的 `PageShell`）。
- 不要用代码去画复杂、写实的场景或人物，这条路试过几次都没成，见 `docs/tried.md`。线条故意画得简单的，可以。
- 不要回到终端 / 像素风。

## 文案

- 平实地说这是什么、发生了什么，像跟朋友讲。不要客套，不要像宣传稿：不写“这是整个平台的底子”这种拔高的话，不用对称的排比，结尾不要收一句漂亮话，也不要写“不是 X 而是 Y”。
- 不写会过时的状态：版本号、上线进度、未合并的 PR、谁还没开始用。
- Peter 的文章观点是他的，文字常是 AI 代写的。改稿时先分清哪些是他说的，不要替他加观点。

## 流程

- 在 `source` 分支工作。push 到 `source` 就会上线，push 前先问 Peter。commit 也等他说了再做。
- 改完跑 `npm run build` 和 `npm run lint`。改到发布脚本的话，再跑 `npm run workflow:check`、`articles:check`、`thoughts:check`。
- 长文正文以 vault 为准，`content/blog/` 一般不要手改。
- 如果 push 之后没有触发 Publish Site（用 `gh run list` 看），运行 `gh workflow run publish-site.yml --ref source`。

## 不要看的地方

`../homepage-lab/` 放着没用上的旧探索。除非 Peter 让你去找，不要去那里找参考或者照着改。想知道某个方向为什么没用，看 `docs/tried.md` 就够了。
