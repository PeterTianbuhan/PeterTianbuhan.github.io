# Thought Notes

随想是介于聊天记录和正式文章之间的轻量内容层。

## 规则

1. 先判断一个 idea 是否能并入已有文章或阅读地图系列。
2. 能并入时，把随想标记为 `status: "linked"` 并写上 `articleSlug`。
3. 不能并入时，把它作为 `status: "seed"` 留在 `content/thoughts/zh/`。
4. 随想变成熟以后，再整理成 vault source 和正式 HomePage 文章。

## 命令

先看候选文章，不写文件：

```powershell
npm run thoughts:intake -- --title "想法标题" --body "想法内容"
```

确认能并入某篇文章：

```powershell
npm run thoughts:intake -- --title "想法标题" --body "想法内容" --article current-workflow --write
```

确认是新方向：

```powershell
npm run thoughts:intake -- --title "想法标题" --body "想法内容" --new --write
```

校验随想文件：

```powershell
npm run thoughts:check
```
