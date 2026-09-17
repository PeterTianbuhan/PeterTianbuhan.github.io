// A tiny shell for the homepage prompt. It knows a handful of commands and a
// fake filesystem whose "directories" are the site's sections. Pure logic, no
// React, so it can be unit-tested and reused by the click navigation.

export type ShellEntry = {
  name: string; // what `ls` prints, e.g. "writing/" or "context.mdx"
  kind: "dir" | "file";
  target: string; // page id to navigate to
  label?: string; // human title shown in long listings
  meta?: string; // date or number column in long listings
};

export type ShellFs = Record<string, ShellEntry[]>; // keyed by cwd: "~", "~/writing", ...

export type ShellContext = {
  zh: boolean;
  locale: string;
  page: string;
  name: string;
  fs: ShellFs;
  history: string[];
};

export type ShellResult = {
  lines: string[];
  navigate?: string;
  href?: string;
  clear?: boolean;
};

export const COMMANDS = [
  "cd",
  "ls",
  "ll",
  "open",
  "cat",
  "less",
  "pwd",
  "whoami",
  "clear",
  "help",
  "date",
  "echo",
  "lang",
  "history",
  "q",
  "exit",
] as const;

export function cwdOf(page: string) {
  if (page === "home") return "~";
  if (page === "about") return "~/about";
  if (page === "writing" || page.startsWith("read/")) return "~/writing";
  const slash = page.indexOf("/");
  return `~/${slash === -1 ? page : page.slice(0, slash)}`;
}

export function pageOfDir(dir: string) {
  return dir === "~" ? "home" : dir.slice(2);
}

function normalizeArg(arg: string) {
  return arg
    .replace(/^\.\//, "")
    .replace(/^~\//, "")
    .replace(/\/$/, "");
}

function findDir(ctx: ShellContext, cwd: string, arg: string) {
  const name = normalizeArg(arg);
  if (name === "" || name === "~") return "~";
  if (name === ".") return cwd;
  if (name === "..") return "~";
  const inCwd = ctx.fs[cwd]?.find((e) => e.name === `${name}/`);
  if (inCwd) return `~/${name}`;
  const inHome = ctx.fs["~"]?.find((e) => e.name === `${name}/`);
  if (inHome) return `~/${name}`;
  return null;
}

function findFile(ctx: ShellContext, cwd: string, arg: string) {
  const name = normalizeArg(arg);
  const slash = name.lastIndexOf("/");
  const dirPart = slash === -1 ? cwd : `~/${name.slice(0, slash)}`;
  const filePart = slash === -1 ? name : name.slice(slash + 1);
  const candidates = [dirPart, cwd, "~", ...Object.keys(ctx.fs)];
  for (const dir of candidates) {
    const hit = ctx.fs[dir]?.find(
      (e) =>
        e.name === filePart ||
        e.name === `${filePart}.mdx` ||
        e.name === `${filePart}/` ||
        e.name.replace(/\.mdx$/, "") === filePart.replace(/\.mdx$/, ""),
    );
    if (hit) return hit;
  }
  return null;
}

function pad(text: string, width: number) {
  // Latin names only, so string length equals cell width.
  return text.length >= width ? text + " " : text.padEnd(width);
}

function beijingDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    year: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("month")} ${get("day")} ${get("hour")}:${get("minute")}:${get("second")} CST ${get("year")}`;
}

export function runShell(input: string, ctx: ShellContext): ShellResult {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return { lines: [] };
  const [cmd, ...args] = tokens;
  const cwd = cwdOf(ctx.page);
  const zh = ctx.zh;

  switch (cmd) {
    case "help":
    case "?":
    case "man":
      return {
        lines: zh
          ? [
              "可用命令：",
              "  ls [dir]        列出目录",
              "  cd <dir>        进入目录（cd ~ 回到首页）",
              "  open <file>     打开一篇文字或章节",
              "  cat README.md   关于我",
              "  q               退出当前文件",
              "  date / pwd / whoami / clear / lang en",
              "  Tab 补全，↑↓ 翻历史，Ctrl+C 取消",
            ]
          : [
              "available commands:",
              "  ls [dir]        list a directory",
              "  cd <dir>        enter a directory (cd ~ goes home)",
              "  open <file>     open a note or chapter",
              "  cat README.md   about me",
              "  q               quit the current file",
              "  date / pwd / whoami / clear / lang zh",
              "  Tab completes, ↑↓ browse history, Ctrl+C cancels",
            ],
      };
    case "ls":
    case "ll":
    case "dir": {
      const flagLong = cmd === "ll" || args.some((a) => /^-\w*l/.test(a));
      const target = args.find((a) => !a.startsWith("-"));
      const dir = target ? findDir(ctx, cwd, target) : cwd;
      if (!dir)
        return {
          lines: [`ls: ${target}: No such file or directory`],
        };
      const entries = ctx.fs[dir] ?? [];
      if (!entries.length) return { lines: [] };
      if (!flagLong) return { lines: [entries.map((e) => e.name).join("  ")] };
      const width = Math.max(...entries.map((e) => e.name.length)) + 2;
      return {
        lines: entries.map(
          (e) =>
            `${e.kind === "dir" ? "drwxr-xr-x" : "-rw-r--r--"}  ${pad(e.name, width)}${e.meta ? `${e.meta}  ` : ""}${e.label ?? ""}`,
        ),
      };
    }
    case "cd": {
      if (args.length > 1) return { lines: ["cd: too many arguments"] };
      const arg = args[0] ?? "~";
      const dir = findDir(ctx, cwd, arg);
      if (dir) return { lines: [], navigate: pageOfDir(dir) };
      const file = findFile(ctx, cwd, arg);
      if (file && file.kind === "file")
        return { lines: [`cd: not a directory: ${arg}`] };
      return { lines: [`cd: no such file or directory: ${arg}`] };
    }
    case "pwd":
      return { lines: [`/home/peter${cwd.slice(1)}`] };
    case "whoami":
      return { lines: [ctx.name] };
    case "open":
    case "cat":
    case "less":
    case "more":
    case "vim":
    case "vi":
    case "nano":
    case "code":
    case "bat": {
      if (!args.length) return { lines: [`usage: ${cmd} <file>`] };
      const arg = args[0];
      const dir = findDir(ctx, cwd, arg);
      if (dir && dir !== "~") {
        if (cmd === "open" || cmd === "code")
          return { lines: [], navigate: pageOfDir(dir) };
        return { lines: [`${cmd}: ${arg}: Is a directory`] };
      }
      const file = findFile(ctx, cwd, arg);
      if (!file) return { lines: [`${cmd}: ${arg}: No such file or directory`] };
      return { lines: [], navigate: file.target };
    }
    case "q":
    case ":q":
    case ":q!": {
      if (ctx.page.startsWith("read/")) return { lines: [], navigate: "writing" };
      const slash = ctx.page.indexOf("/");
      if (slash !== -1) return { lines: [], navigate: ctx.page.slice(0, slash) };
      return { lines: [`zsh: command not found: ${cmd}`] };
    }
    case "clear":
    case "cls":
      return { lines: [], clear: true };
    case "date":
      return { lines: [beijingDate()] };
    case "echo":
      return { lines: [args.join(" ")] };
    case "history":
      return {
        lines: ctx.history.map(
          (h, i) => `${String(i + 1).padStart(5)}  ${h}`,
        ),
      };
    case "lang":
    case "locale": {
      const next = args[0];
      if (!next) return { lines: [`LANG=${ctx.locale}`] };
      if (next !== "zh" && next !== "en")
        return { lines: [`lang: unsupported locale: ${next} (zh, en)`] };
      if (next === ctx.locale) return { lines: [`LANG=${ctx.locale}`] };
      return { lines: [], href: `/${next}/` };
    }
    case "uname":
      return { lines: ["weiming 1.0 pixel-terminal (Next.js static export)"] };
    case "sudo":
      return {
        lines: [
          "peter is not in the sudoers file.  This incident will be reported.",
        ],
      };
    case "rm":
    case "mv":
    case "chmod":
      return { lines: [`${cmd}: ${args[0] ?? ""}: Operation not permitted`] };
    case "exit":
    case "logout":
      return { lines: ["logout"], navigate: "home" };
    case "imgcat":
    case "weiming":
      return { lines: [], navigate: "home" };
    default:
      return { lines: [`zsh: command not found: ${cmd}`] };
  }
}

// Tab completion. Returns the new input, plus candidates when ambiguous.
export function completeShell(
  input: string,
  ctx: ShellContext,
): { value: string; candidates: string[] } {
  const endsWithSpace = /\s$/.test(input);
  const tokens = input.trimStart().split(/\s+/);
  const partial = endsWithSpace ? "" : (tokens[tokens.length - 1] ?? "");
  const head = endsWithSpace
    ? input
    : input.slice(0, input.length - partial.length);
  const completingCommand = tokens.length <= 1 && !endsWithSpace;
  let pool: string[];
  if (completingCommand) {
    pool = [...COMMANDS];
  } else {
    const cwd = cwdOf(ctx.page);
    const slash = partial.lastIndexOf("/");
    const dirPart = slash === -1 ? null : partial.slice(0, slash);
    const dir = dirPart === null ? cwd : findDir(ctx, cwd, dirPart);
    const prefix = dirPart === null ? "" : `${dirPart}/`;
    const entries = [
      ...(ctx.fs[dir ?? cwd] ?? []),
      ...(dir === null || dir === cwd ? [] : []),
    ];
    const home = dirPart === null && cwd !== "~" ? (ctx.fs["~"] ?? []) : [];
    pool = [...entries, ...home].map((e) => prefix + e.name);
  }
  const matches = pool.filter((c) => c.startsWith(partial));
  if (!matches.length) return { value: input, candidates: [] };
  let common = matches[0];
  for (const m of matches) {
    let i = 0;
    while (i < common.length && common[i] === m[i]) i++;
    common = common.slice(0, i);
  }
  const done = matches.length === 1;
  const value =
    head + common + (done && !common.endsWith("/") ? " " : "");
  return {
    value,
    candidates: matches.length > 1 && common === partial ? matches : [],
  };
}
