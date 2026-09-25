# homepage

Peter Tian 的个人主页（petertianwork.me）。Next.js 静态站，整站是一本速写本：首页是一幅自己画出来的钢笔水彩北大，下面同一张纸上接着放长文、项目、「我觉得」和关于。换页时橡皮擦把纸擦白，下一页再画出来。

## 目录

```
app/                      路由：/{zh,en}/ 首页，/writing 长文列表，/blog/<slug> 长文，
                          /projects 和 /projects/<slug> 项目，/i-think 「我觉得」；/ 跳到 /zh/，其余走 404「这一页还没画」
components/home-sketch/   速写本的一切：首页、画廊、正文排版、墨线动画、橡皮擦换页
components/pku-sketch/    首屏那幅北大速写（一笔一笔画出来再上水彩）
lib/                      content.ts 长文，exhibits.ts 项目，i-think.ts 「我觉得」，site.ts 个人信息，
                          i18n.ts 中英文案，writing-series.ts 系列
content/                  blog/ 长文（从 vault 同步），projects/ 项目正文，i-think/ 「我觉得」
app/fonts/                像素字体、签名字体
scripts/ templates/       发布链路：publish-from-vault、sync-vault-*、verify-*、prepare-github-pages、*-intake
docs/                     工作流说明；tried.md 记录试过但没用上的方向
.github/                  publish-site.yml：push 到 source → 构建 → 发布到 main
```

没用上的探索（终端首页、未名湖场景、来处、故事短片）不在这个仓库里，在 `../homepage-lab/`，理由见 `docs/tried.md`。

## 日常

```bash
npm run dev            # http://localhost:3000/zh/
npm run build          # 静态导出到 out/
npm run lint
```

## 分支

- `source`：源码和内容。push 到这里会自动构建并上线。
- `main`：GitHub Pages 的静态产物，由 workflow 写入，不要手改。

长文的真实来源是私有的 life vault，`content/blog/**` 是同步出来的副本（`source: homepage` 的几篇是直接写在这里的）。随想的同步链路还在 CI 里跑，但网站目前不展示随想。
