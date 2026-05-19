export type ArticleSeriesId =
  | "ai-workflow"
  | "engineering-practice"
  | "learning-record"
  | "creative-tools";

export type ReadingMode = {
  description: string;
  label: string;
};

export type ArticleProfile = {
  audience: string;
  order: number;
  prerequisites?: string[];
  question: string;
  related: string[];
  seriesId: ArticleSeriesId;
  slug: string;
  thesis: string;
};

export type ArticleSeries = {
  description: string;
  id: ArticleSeriesId;
  title: string;
};

export const readingModes: Record<"skim" | "understand" | "full", ReadingMode> = {
  skim: {
    description: "先看入口卡、总览图和核心结论，适合判断要不要继续读。",
    label: "30 秒速览",
  },
  understand: {
    description: "看可视化展示页，按图像帧和结构索引理解主线。",
    label: "5 分钟理解",
  },
  full: {
    description: "回到完整原文，保留过程、细节、犹豫和反思。",
    label: "完整原文",
  },
};

export const articleSeries: ArticleSeries[] = [
  {
    description: "围绕 Codex、worker、目标保持、记忆和个人工作流，记录如何把 AI 变成可执行、可审计的协作系统。",
    id: "ai-workflow",
    title: "AI 工作流与 agent 系统",
  },
  {
    description: "把软件工程课、网络协议、Git、健壮性和真实开发经验整理成可复用的基础理解。",
    id: "engineering-practice",
    title: "工程实践与基础概念",
  },
  {
    description: "把课程作业、模型训练、学习过程和阶段性理解沉淀下来，重点保留思考路径。",
    id: "learning-record",
    title: "学习记录与课程理解",
  },
  {
    description: "记录 AIGC、音乐、创作工具和个人表达边界，关注工具如何进入真实创作流程。",
    id: "creative-tools",
    title: "创作工具与表达实验",
  },
];

export const articleProfiles: ArticleProfile[] = [
  {
    audience: "想理解我如何把 Codex、Linear、GitHub、HomePage 和复盘串起来的读者。",
    order: 1,
    question: "一个想法如何变成可执行、可审计、可复盘的个人工作流？",
    related: ["native-goal-architecture-evolution", "attention-memory-development-record"],
    seriesId: "ai-workflow",
    slug: "current-workflow",
    thesis: "AI 工作流真正有价值的部分，不是让 agent 自动忙起来，而是让任务、证据、验收和复盘形成闭环。",
  },
  {
    audience: "想理解长任务、/goal、worker 编排和自动化边界的读者。",
    order: 2,
    prerequisites: ["current-workflow"],
    question: "从人工 goal-loop 转向原生 /goal supervisor，架构边界应该怎么重新划分？",
    related: ["current-workflow", "attention-memory-development-record"],
    seriesId: "ai-workflow",
    slug: "native-goal-architecture-evolution",
    thesis: "长期目标应该由更稳定的 supervisor 持有，脚本和 dispatcher 只负责有限、可验证的执行片段。",
  },
  {
    audience: "想看轻量 agent 记忆、prompt-only 记忆约定和项目记忆仓库的读者。",
    order: 3,
    prerequisites: ["current-workflow"],
    question: "不用复杂数据库，agent 记忆能不能先靠注意力和轻量文件约定跑起来？",
    related: ["current-workflow", "native-goal-architecture-evolution"],
    seriesId: "ai-workflow",
    slug: "attention-memory-development-record",
    thesis: "记忆不只是存储更多内容，而是让当前任务能稳定看见最相关的上下文。",
  },
  {
    audience: "想把 Web API、HTTP 报文和 git push 串成一条理解链的读者。",
    order: 1,
    question: "从一次 HTTP 请求到 git push，中间到底发生了什么？",
    related: ["defensive-programming-robustness"],
    seriesId: "engineering-practice",
    slug: "http-api-git-push",
    thesis: "把客户端、服务器、协议和 Git Smart HTTP 放在同一条链上看，很多抽象概念会变得更可操作。",
  },
  {
    audience: "正在学习软件设计、异常处理、鲁棒性和 C++ 资源安全的读者。",
    order: 2,
    question: "程序怎样在异常输入、错误传播和资源释放问题下保持可控？",
    related: ["http-api-git-push"],
    seriesId: "engineering-practice",
    slug: "defensive-programming-robustness",
    thesis: "健壮性不是多写判断，而是在边界、问题链条、异常流和资源管理上建立清晰防线。",
  },
  {
    audience: "想从一次课程作业理解 PyTorch 训练主线、CNN 和实验记录方式的读者。",
    order: 1,
    question: "一次 CIFAR-10 CNN 作业怎样帮助我理解深度学习训练流程？",
    related: [],
    seriesId: "learning-record",
    slug: "ai-foundations-cifar10-cnn-learning-record",
    thesis: "把数据、模型、训练循环和结果复盘放在一起看，比只看代码片段更容易形成可迁移的理解。",
  },
  {
    audience: "想看 AIGC 音乐工具如何进入真实创作流程，以及表达边界在哪里的读者。",
    order: 1,
    question: "AIGC 音乐工具能帮我完成什么，又在哪些表达上仍然不稳定？",
    related: [],
    seriesId: "creative-tools",
    slug: "aigc-music-exploration-record",
    thesis: "AIGC 音乐适合快速探索风格和流程，但复杂私人情绪仍需要更强的人工选择与判断。",
  },
];

export function getArticleProfile(slug: string) {
  return articleProfiles.find((profile) => profile.slug === slug) ?? null;
}

export function getArticleSeries(seriesId: ArticleSeriesId) {
  return articleSeries.find((series) => series.id === seriesId) ?? null;
}

export function getProfilesBySeries(seriesId: ArticleSeriesId) {
  return articleProfiles
    .filter((profile) => profile.seriesId === seriesId)
    .toSorted((left, right) => left.order - right.order);
}
