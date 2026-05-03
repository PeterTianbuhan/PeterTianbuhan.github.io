---
title: "把项目管理交给一个可复盘的 Agent 工作流"
excerpt: "一份阶段性记录：我如何尝试把 Linear、Codex CLI、本地 worker、自动化和复盘机制连成一个项目推进系统。"
status: "draft"
createdAt: "2026-05-03"
updatedAt: "2026-05-03"
tags:
  - build
  - agents
  - workflow
  - linear
---

# 把项目管理交给一个可复盘的 Agent 工作流

这是一篇还没有完成的记录。现在系统还没有完全跑顺，很多地方仍然需要第二天继续验证，但我想先把目前已经形成的思路和结构写下来，避免之后只记得结果，忘记中间那些真正有价值的判断。

我想搭建的不是一个普通的待办列表，也不是一个简单的脚本，而是一套可以帮助我管理多个项目进展的工作流：我先和一个 agent 讨论，把模糊想法整理成清晰任务；任务发布到 Linear；本地 worker 从 Linear 领取任务；Codex CLI 进入对应项目工作；执行过程、失败原因和结果再回到 Linear。最后，系统每天复盘这些任务，从失败和偏差中提炼出下一步应该改进的规则。

## 为什么不是只和 Codex 对话

直接在对话里让 Codex 做事当然最快。问题是，当项目变多之后，对话本身很难承担项目管理的职责。

我希望看到的不只是“这一次做完了吗”，而是：

- 每个项目现在有哪些任务；
- 哪些任务正在被 agent 处理；
- 哪些任务失败了，失败原因是什么；
- Codex 经常在哪些地方出错；
- 哪些规则应该进入下一版 worker 或任务模板；
- 一段时间之后，我的项目推进是不是更稳定了。

这就是 Linear 的价值。它不是替代 Codex，而是给 Codex 的工作提供一个外部的、可观察的项目层。

## 当前已经搭起来的闭环

现在的控制项目放在：

```text
D:\projects\symphony-control
```

它不是继续修补官方 Elixir 版 Symphony，而是做了一个 Windows 原生的最小控制层。当前闭环大致是：

1. 我在对话里讨论任务；
2. 通过 `create-task` 把任务写入 Linear；
3. worker 读取 Linear 中的 `Todo` 任务；
4. worker 把任务标记为 `In Progress`；
5. worker 在指定 workspace 中调用 Codex CLI；
6. Codex 完成或失败后，worker 把结果评论回 Linear；
7. 成功任务进入 `In Review`；
8. 本地记录 progress、run summary 和 daily review。

这个闭环的目标不是“让 agent 自己随便行动”，而是让 agent 在明确边界内执行任务，并且留下足够多的证据供我复盘。

## Linear 在这里扮演什么角色

Linear 现在是项目进展的主界面。

每个 issue 代表一个可以交给 worker 的任务。issue title 是任务标题，description 是给 Codex 的具体说明，里面必须写清楚目标 workspace，例如：

```text
Workspace: D:\projects\HomePage
```

worker 会根据状态流转执行任务：

- `Todo`：可以被领取；
- `In Progress`：正在执行；
- `In Review`：完成后等待我检查；
- 失败：保留当前状态或写明失败原因，方便重试。

这比只在聊天记录里找上下文清晰得多。Linear 成为项目的外部记忆，而不是让所有任务都散落在对话窗口里。

## 为什么要有进度日志

我很快发现，只看 Linear 的 `In Progress` 仍然不够。因为当一个任务执行很久时，我无法判断它是在认真工作、卡住了、还是根本没有启动。

所以现在 worker 会写 progress events，可以用命令实时查看：

```powershell
python .\symphony_worker.py progress --issue PET-8 --follow
```

它会显示诸如：

- workspace 是否解析成功；
- 是否成功加锁；
- Linear 状态是否更新；
- Codex CLI 是否启动；
- Codex 输出了什么事件；
- Git 检查和提交结果；
- 最终 completed 或 failed；
- workspace lock 是否释放。

这一步很关键。没有可见进度，所谓“自动执行”就会变成等待黑箱。

## 多项目并行和 workspace lock

我想管理的不只是一个项目。HomePage、课程学习、Library、未来的个人工具，都可能同时推进。

因此 worker 支持多个后台 worker 并行运行：

```powershell
python .\symphony_worker.py start-background --workers 3
```

但同一个 workspace 不能被两个 worker 同时修改。为此系统加入了 workspace lock：不同项目可以并行，同一个项目会串行。

这意味着：

- `D:\projects\HomePage` 的两个任务不会同时写同一个仓库；
- `D:\projects\HomePage` 和 `D:\projects\Library` 可以同时推进；
- 如果某个 worker 发现目标 workspace 被锁住，它会跳过这个任务，寻找其他可领取任务。

这是这套系统从“单任务实验”走向“多项目管理”的基础。

## 自动化：让系统定期自己检查任务

目前已经加了两个 Codex App 自动化。

第一个是每半小时运行一次：

```powershell
python .\symphony_worker.py poll --once
```

它每次只从 Linear 领取一个任务，不启动无限循环。这样比较可控，也便于观察失败。

第二个是每天 09:00 生成一次复盘：

```powershell
python .\symphony_worker.py review --since-hours 24 --create-linear-issue
```

它会把过去 24 小时的 worker run summaries 汇总成一个 Linear review issue。

需要注意的是，这些自动化目前依赖本机环境。电脑关机、睡眠或断网后，它们不会继续执行。后续如果这套工作流证明稳定，可能需要迁移到 VPS 或其他常在线环境。

## 复盘机制：让 Codex 的缺陷变成下一版规则

我真正感兴趣的不是“agent 帮我跑命令”本身，而是系统能不能逐渐变好。

现在每日复盘会按工程闭环分类记录 Codex/worker 的问题：

- `task_unclear`：任务描述不够清楚；
- `env_or_permission`：环境、权限、登录、API key 等问题；
- `implementation_failed`：实现失败；
- `validation_missing`：没有足够验证；
- `scope_drift`：范围漂移；
- `git_or_publish`：Git、提交、发布相关问题。

这套分类不追求一开始完美，但它给了复盘一个结构。每天我可以看到：今天的问题主要来自任务不清，还是环境权限，还是验证不足。然后下一步不是泛泛地说“让 Codex 更聪明”，而是修改 worker prompt、任务模板、验收标准或自动检查规则。

## Skill 的作用

我还为这个流程加了一个本地 Codex skill：

```text
C:\Users\19792\.codex\skills\native-symphony-manager\SKILL.md
```

它的目标不是执行任务，而是帮助“发布更好的任务”。

当我想把一个模糊想法交给 Linear 时，它应该提醒我补齐：

- 目标 workspace；
- 清晰标题；
- 有边界的任务描述；
- acceptance criteria；
- 应该如何验证；
- 是否需要启动 worker；
- 如何查看 progress。

也就是说，skill 更像任务进入系统之前的质量门。任务越清楚，后面的 worker 越不容易失败。

## 当前还没有完全跑通的部分

这篇文章现在只能算阶段记录，因为还有一些重要事情没有最终验证：

- 半小时自动化还需要观察真实运行；
- worker 需要重新跑真实任务，产生新的 `logs/runs/<issue>.json`；
- HomePage 前端任务和内容管线任务仍需要完成；
- 每日复盘需要在有真实任务数据后再判断是否有价值；
- 关机后自动化无法运行，未来可能需要 VPS；
- Linear review issue 的格式还需要根据真实使用继续调整。

这些限制并不意味着方向错了。相反，它们说明这个系统已经进入了可以被观察、被修正的阶段。

## 我希望最后得到什么

理想状态下，我每天可以这样工作：

1. 和 Codex 讨论一个想法；
2. 让 Codex 帮我把它整理成 Linear 任务；
3. worker 在后台领取任务；
4. 我通过 Linear 和 progress watcher 看执行过程；
5. 任务完成后，我检查结果；
6. 每天的 review issue 告诉我系统哪里做得不好；
7. 我把反复出现的问题沉淀成新的 worker 规则或 skill。

这比“让 AI 帮我写一次代码”更重要。它更像是在搭建一个项目推进系统：任务从想法进入队列，agent 执行，结果被记录，失败被分类，规则被改进。

现在它还很早期，但已经可以看出方向：真正有价值的不是某个单次 agent 的表现，而是一个能够持续留下痕迹、接受复盘、逐步优化的工作流。

## 后续编辑 TODO

- 补一张 Linear 项目视图截图；
- 补一张 progress watcher 运行截图；
- 补 `PET-10` 每日复盘 issue 的截图或链接；
- 补一次真实 worker 成功完成任务的记录；
- 补一次失败任务如何被分类、如何修改规则；
- 明确哪些部分适合本机运行，哪些部分应该迁移到 VPS；
- 将文章语气从“阶段记录”改成更完整的经验总结。
