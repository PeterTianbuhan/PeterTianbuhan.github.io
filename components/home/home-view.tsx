"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import type { PostListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { SiteContent } from "@/lib/site";
import type { ShowcaseMeta } from "@/lib/showcases";
import { ShowcaseView } from "@/components/showcases/showcase-view";
import { WeimingScene } from "@/components/terminal/weiming-scene";
import { readableColor } from "@/components/terminal/time-of-day";
import { useLakeTime } from "@/components/terminal/use-lake-time";
import { PromptLine, USER, HOST } from "@/components/terminal/prompt-line";
import {
  completeShell,
  cwdOf,
  runShell,
  type ShellFs,
} from "@/components/terminal/shell";
import styles from "@/components/terminal/terminal.module.css";

export type ShowcaseBundle = Record<
  string,
  {
    meta: ShowcaseMeta;
    chapters: Record<string, ReactNode | null>;
  }
>;

type Props = {
  locale: Locale;
  posts: PostListItem[];
  site: SiteContent;
  articles: Record<string, ReactNode>;
  showcases?: ShowcaseBundle;
};

type Echo = { id: number; path: string; cmd: string; lines: string[] };

const sections = [
  { id: "about", label: { zh: "关于我", en: "About me" } },
  { id: "writing", label: { zh: "文字与笔记", en: "Writing & notes" } },
] as const;

const periodEn: Record<string, string> = {
  夜晚: "night",
  清晨: "dawn",
  白天: "day",
  黄昏: "dusk",
};

export function HomeView({
  locale,
  posts,
  site,
  articles,
  showcases = {},
}: Props) {
  const zh = locale === "zh";
  const lakeTime = useLakeTime();
  const themeStyle = {
    ...Object.fromEntries(
      Object.entries(lakeTime.palette).map(([key, value]) => [
        `--${key}`,
        value,
      ]),
    ),
    "--chromeText": readableColor(
      lakeTime.palette.muted,
      lakeTime.palette.chrome,
    ),
    "--promptText": readableColor(
      lakeTime.palette.accent,
      lakeTime.palette.prompt,
    ),
    "--codeText": readableColor(lakeTime.palette.accent, lakeTime.palette.code),
    "--selectionText": readableColor(
      lakeTime.palette.text,
      lakeTime.palette.edge,
    ),
  } as CSSProperties;

  // ---- fake filesystem: one directory per section --------------------
  const fs = useMemo<ShellFs>(() => {
    const tree: ShellFs = {
      "~": [
        ...sections.map((s) => ({
          name: `${s.id}/`,
          kind: "dir" as const,
          target: s.id,
          label: s.label[locale],
        })),
        ...Object.values(showcases).map((b) => ({
          name: `${b.meta.slug}/`,
          kind: "dir" as const,
          target: b.meta.slug,
          label: b.meta.label,
        })),
      ],
      "~/about": [
        { name: "README.md", kind: "file", target: "about", label: site.name },
      ],
      "~/writing": posts.map((p) => ({
        name: `${p.slug}.mdx`,
        kind: "file" as const,
        target: `read/${p.slug}`,
        label: p.title,
        meta: p.publishedAt.slice(0, 10),
      })),
    };
    for (const b of Object.values(showcases))
      tree[`~/${b.meta.slug}`] = b.meta.chapters.map((c) => ({
        name: `${c.slug}.mdx`,
        kind: "file" as const,
        target: `${b.meta.slug}/${c.slug}`,
        label: c.title,
        meta: c.number,
      }));
    return tree;
  }, [locale, posts, showcases, site.name]);

  const profileLinks = [
    {
      label: "GitHub",
      href: site.social.github,
      value: site.social.githubLabel.replace(/^github\.com\//, ""),
    },
    {
      label: zh ? "邮箱" : "Email",
      href: `mailto:${site.contactEmail}`,
      value: site.contactEmail,
    },
    ...(site.social.x
      ? [
          {
            label: "X",
            href: site.social.x,
            value:
              site.social.xLabel || site.social.x.replace(/^https?:\/\//, ""),
          },
        ]
      : []),
    ...(site.social.codexProfile
      ? [
          {
            label: "Codex",
            href: site.social.codexProfile,
            value:
              site.social.codexProfileLabel ||
              site.social.codexProfile.replace(/^https?:\/\//, ""),
          },
        ]
      : []),
  ];

  // ---- state ----------------------------------------------------------
  const [page, setPage] = useState("home");
  const [typed, setTyped] = useState(""); // auto-typed command (nav / boot)
  const [input, setInput] = useState(""); // what the visitor typed
  const [typing, setTyping] = useState(false);
  const [bootStep, setBootStep] = useState(2); // 0: banner, 1: +whoami, 2: +ls
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [ambientPaused, setAmbientPaused] = useState(false);
  const [dims, setDims] = useState<{ cols: number; rows: number } | null>(null);
  const [px, setPx] = useState(2);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const locked = useRef(false);
  const reduced = useRef(false);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const echoId = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const showcasePage = (value: string) => {
    if (!value || value === "home") return null;
    const slash = value.indexOf("/");
    const slug = slash === -1 ? value : value.slice(0, slash);
    const chapterSlug = slash === -1 ? undefined : value.slice(slash + 1);
    const bundle = showcases[slug];
    if (!bundle?.meta) return null;
    if (!chapterSlug) return { bundle, chapter: undefined };
    const meta = bundle.meta.chapters.find((c) => c.slug === chapterSlug);
    if (!meta) return null;
    return { bundle, chapter: meta };
  };
  const validPage = (value: string) =>
    value === "home" ||
    sections.some((s) => s.id === value) ||
    (value.startsWith("read/") && Object.hasOwn(articles, value.slice(5))) ||
    showcasePage(value) !== null;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Type a command into the live prompt, then run `done`.
  const typeCommand = (command: string, done: () => void, perChar = 28) => {
    if (reduced.current || !command) {
      done();
      return;
    }
    setTyping(true);
    setTyped("");
    const speed = Math.min(perChar, 320 / command.length);
    for (let i = 1; i <= command.length; i++)
      timers.current.push(
        setTimeout(() => setTyped(command.slice(0, i)), i * speed),
      );
    timers.current.push(
      setTimeout(
        () => {
          setTyping(false);
          setTyped("");
          done();
        },
        command.length * speed + 140,
      ),
    );
  };

  // ---- routing (hash) ---------------------------------------------------
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = media.matches;
    const change = () => {
      reduced.current = media.matches;
    };
    media.addEventListener("change", change);
    const sync = () => {
      clearTimers();
      locked.current = false;
      setTyping(false);
      setTyped("");
      setBootStep(2);
      setEchoes([]);
      let target = "home";
      try {
        target = decodeURIComponent(window.location.hash.slice(1)) || "home";
      } catch {}
      setPage(validPage(target) ? target : "home");
      viewportRef.current?.scrollTo(0, 0);
    };
    const timer = setTimeout(() => {
      sync();
      let seen = false;
      try {
        seen = sessionStorage.getItem("weiming-visited") === "1";
        sessionStorage.setItem("weiming-visited", "1");
      } catch {}
      if (!seen && !media.matches && !window.location.hash) {
        // Login sequence: `whoami`, then `ls`, typed by the machine.
        locked.current = true;
        setBootStep(0);
        timers.current.push(
          setTimeout(() => {
            typeCommand(
              "whoami",
              () => {
                setBootStep(1);
                timers.current.push(
                  setTimeout(() => {
                    typeCommand(
                      "ls -l",
                      () => {
                        setBootStep(2);
                        locked.current = false;
                      },
                      70,
                    );
                  }, 380),
                );
              },
              70,
            );
          }, 500),
        );
      }
    }, 0);
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      clearTimeout(timer);
      clearTimers();
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      media.removeEventListener("change", change);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articles, showcases]);

  useEffect(() => {
    if (page !== "home") headingRef.current?.focus({ preventScroll: true });
  }, [page]);

  // ---- terminal geometry: cols×rows in the title, integer pixel scale --
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const fs = parseFloat(getComputedStyle(viewport).fontSize) || 24;
    const measure = () => {
      setDims({
        cols: Math.floor(viewport.clientWidth / (fs / 2)),
        rows: Math.floor(viewport.clientHeight / (fs * 1.5)),
      });
      const land = landscapeRef.current;
      if (land) {
        // Snap the painting to whole (or half, on HiDPI) CSS pixels per texel
        // so its pixels stay square instead of shimmering at odd ratios.
        const step = window.devicePixelRatio >= 2 ? 0.5 : 1;
        const raw = land.clientWidth / 720;
        setPx(Math.max(step, Math.ceil(raw / step - 0.02) * step));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    if (landscapeRef.current) ro.observe(landscapeRef.current);
    return () => ro.disconnect();
  }, [page]);

  // ---- navigation -----------------------------------------------------
  const commit = (target: string) => {
    setPage(target);
    setEchoes([]);
    setInput("");
    window.history.pushState(
      null,
      "",
      target === "home" ? window.location.pathname : `#${encodeURI(target)}`,
    );
    viewportRef.current?.scrollTo(0, 0);
  };
  const navigate = (target: string, command: string) => {
    if (locked.current || !validPage(target) || target === page) return;
    clearTimers();
    setBootStep(2);
    locked.current = true;
    setInput("");
    typeCommand(command, () => {
      locked.current = false;
      commit(target);
    });
  };

  const cwd = cwdOf(page);
  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      const v = viewportRef.current;
      if (v) v.scrollTop = v.scrollHeight;
    });
  };
  const pushEcho = (cmd: string, lines: string[]) => {
    setEchoes((prev) => [
      ...prev,
      { id: ++echoId.current, path: cwd, cmd, lines },
    ]);
    scrollToEnd();
  };
  const shellContext = () => ({
    zh,
    locale,
    page,
    name: site.name,
    fs,
    history: history.current,
  });
  const execute = (raw: string) => {
    const command = raw.trim();
    if (command) {
      history.current = [...history.current.slice(-49), command];
    }
    historyIndex.current = -1;
    setInput("");
    if (!command) {
      pushEcho("", []);
      return;
    }
    const result = runShell(command, shellContext());
    if (result.href) {
      window.location.assign(result.href);
      return;
    }
    if (result.clear) {
      setEchoes([]);
      viewportRef.current?.scrollTo(0, 0);
      return;
    }
    if (result.navigate) {
      if (result.navigate === page) {
        pushEcho(command, result.lines);
        return;
      }
      if (!validPage(result.navigate)) {
        pushEcho(command, [`${command.split(/\s+/)[0]}: not available`]);
        return;
      }
      if (result.lines.length) pushEcho(command, result.lines);
      commit(result.navigate);
      return;
    }
    pushEcho(command, result.lines);
  };

  // ---- keyboard: the whole page is the prompt ----------------------------
  const focusInput = () => {
    inputRef.current?.focus({ preventScroll: true });
  };
  const handleKey = (e: KeyboardEvent | ReactKeyboardEvent) => {
    if (locked.current || typing) return false;
    const target = e.target as HTMLElement | null;
    const inInput = target === inputRef.current;
    const interactive =
      !inInput &&
      target &&
      (target.closest("a, button, input, textarea, select, [contenteditable]") !==
        null);
    if ("isComposing" in e && e.isComposing) return false;
    if (e.metaKey || e.altKey) return false;
    if (e.ctrlKey) {
      if (e.key === "c" && input && !window.getSelection()?.toString()) {
        pushEcho(`${input}^C`, []);
        setInput("");
        historyIndex.current = -1;
        return true;
      }
      if (e.key === "l") {
        setEchoes([]);
        viewportRef.current?.scrollTo(0, 0);
        return true;
      }
      if (e.key === "u") {
        setInput("");
        return true;
      }
      return false;
    }
    switch (e.key) {
      case "Enter":
        if (interactive) return false;
        execute(input);
        return true;
      case "Tab": {
        if (interactive && !input) return false;
        const { value, candidates } = completeShell(input, shellContext());
        if (candidates.length) pushEcho(input, [candidates.join("  ")]);
        setInput(value);
        return true;
      }
      case "Escape":
        setInput("");
        historyIndex.current = -1;
        return true;
      case "ArrowUp":
      case "ArrowDown": {
        if (interactive) return false;
        const list = history.current;
        if (!list.length) return true;
        let idx = historyIndex.current;
        if (e.key === "ArrowUp") idx = idx === -1 ? list.length - 1 : Math.max(0, idx - 1);
        else idx = idx === -1 ? -1 : idx + 1 >= list.length ? -1 : idx + 1;
        historyIndex.current = idx;
        setInput(idx === -1 ? "" : list[idx]);
        return true;
      }
      case "Backspace":
        if (inInput) return false; // let the input handle it, onChange syncs
        if (interactive) return false;
        setInput((v) => v.slice(0, -1));
        return true;
      default:
        if (inInput) return false;
        if (interactive) return false;
        if (e.key.length === 1) {
          setInput((v) => v + e.key);
          focusInput();
          return true;
        }
        return false;
    }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (handleKey(e)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ---- derived ----------------------------------------------------------
  const post = page.startsWith("read/")
    ? posts.find((p) => p.slug === page.slice(5))
    : undefined;
  const showcaseHit = showcasePage(page);
  const title =
    page === "home"
      ? site.name
      : page === "about"
        ? zh
          ? "关于我"
          : "About me"
        : post
          ? post.title
          : showcaseHit?.chapter
            ? showcaseHit.chapter.title
            : showcaseHit
              ? showcaseHit.bundle.meta.title
              : zh
                ? "文字与笔记"
                : "Writing & notes";
  const hh = Math.floor(lakeTime.hour);
  const mm = Math.floor((lakeTime.hour - hh) * 60);
  const clock = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  const periodLabel = zh ? lakeTime.period : periodEn[lakeTime.period];
  const windowName = page === "home" ? "~" : cwd.slice(2);

  const anchor = (
    target: string,
    command: string,
    label: ReactNode,
    className?: string,
  ) => (
    <a
      className={className}
      href={target === "home" ? `/${locale}/` : `#${encodeURI(target)}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(target, command);
      }}
    >
      {label}
    </a>
  );

  const livePrompt = (
    <PromptLine path={cwd} live onClick={focusInput}>
      {typing ? typed : input}
      <span className={styles.cursor} />
    </PromptLine>
  );

  const echoBlock = echoes.length ? (
    <div className={styles.echo}>
      {echoes.map((e) => (
        <div key={e.id}>
          <PromptLine path={e.path}>{e.cmd}</PromptLine>
          {e.lines.map((l, i) => (
            <p key={i} className={styles.out}>
              {l}
            </p>
          ))}
        </div>
      ))}
    </div>
  ) : null;

  const lsHome = (
    <div className={styles.ls} role="list">
      {fs["~"].map((e) => (
        <div key={e.name} role="listitem">
          {anchor(
            e.target,
            `cd ${e.name.replace(/\/$/, "")}`,
            <>
              <span className={styles.rowMode}>drwxr-xr-x</span>
              <span className={`${styles.rowName} ${styles.dir}`}>
                {e.name.replace(/\/$/, "")}
              </span>
              <span className={styles.rowLabel}>{e.label}</span>
            </>,
            styles.row,
          )}
        </div>
      ))}
    </div>
  );

  return (
    <main
      className={styles.world}
      lang={zh ? "zh-CN" : "en"}
      style={themeStyle}
      data-period={lakeTime.period}
      data-page={page}
    >
      <section
        className={styles.terminal}
        aria-label={zh ? "个人主页终端" : "Personal homepage terminal"}
      >
        <header className={styles.chrome}>
          <div className={styles.lights} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span className={styles.title}>
            {USER}@{HOST}: {cwd} — zsh
          </span>
          <span className={styles.dims} aria-hidden="true">
            {dims ? `${dims.cols}×${dims.rows}` : ""}
          </span>
        </header>

        <div
          ref={viewportRef}
          className={styles.viewport}
          aria-busy={typing}
          onMouseUp={(e) => {
            // Clicking empty space focuses the prompt, but never steal a
            // text selection or a click on a link. Touch devices are
            // excluded so a stray tap doesn't summon the keyboard.
            if (!window.matchMedia("(hover: hover)").matches) return;
            if (window.getSelection()?.toString()) return;
            const t = e.target as HTMLElement;
            if (t.closest("a, button, input")) return;
            focusInput();
          }}
        >
          <div className={styles.feed}>
            {page === "home" ? (
              <div key="home">
                <h1 className={styles.srOnly}>{site.name}</h1>
                <PromptLine path="~">imgcat weiming.png</PromptLine>
                <div
                  ref={landscapeRef}
                  className={styles.landscape}
                  style={{ "--px": px } as CSSProperties}
                >
                  <WeimingScene paused={ambientPaused} time={lakeTime} />
                  <button
                    className={styles.pause}
                    aria-label={
                      ambientPaused
                        ? zh
                          ? "播放湖景动画"
                          : "Play lake animation"
                        : zh
                          ? "暂停湖景动画"
                          : "Pause lake animation"
                    }
                    onClick={() => setAmbientPaused(!ambientPaused)}
                  >
                    {ambientPaused ? "▶" : "■"}
                  </button>
                </div>
                {bootStep >= 1 && (
                  <>
                    <PromptLine path="~">whoami</PromptLine>
                    <p className={styles.out}>
                      {site.name}
                      <span className={styles.dim}>
                        {"  "}
                        {site.role}
                      </span>
                    </p>
                  </>
                )}
                {bootStep >= 2 && (
                  <>
                    <PromptLine path="~">ls -l</PromptLine>
                    <nav aria-label={zh ? "目录" : "Directories"}>{lsHome}</nav>
                  </>
                )}
              </div>
            ) : showcaseHit ? (
              <div key={page}>
                <ShowcaseView
                  locale={locale}
                  showcase={showcaseHit.bundle.meta}
                  headingRef={headingRef}
                  chapter={
                    showcaseHit.chapter
                      ? {
                          ...showcaseHit.chapter,
                          content:
                            showcaseHit.bundle.chapters[
                              showcaseHit.chapter.slug
                            ] ?? undefined,
                        }
                      : undefined
                  }
                  onNavigate={navigate}
                />
              </div>
            ) : page === "about" ? (
              <div key="about">
                <PromptLine path="~">cd about</PromptLine>
                <PromptLine path="~/about">cat README.md</PromptLine>
                <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
                  {site.name}
                </h1>
                <p className={styles.sub}>{site.role}</p>
                <div className={styles.prose}>
                  <p>{site.bio}</p>
                </div>
                <div className={styles.kvList}>
                  {profileLinks.map((link) => (
                    <a
                      key={link.label}
                      className={styles.kv}
                      href={link.href}
                      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={
                        link.href.startsWith("mailto:")
                          ? undefined
                          : "noopener noreferrer"
                      }
                    >
                      <span className={styles.kvKey}>{link.label}</span>
                      <span className={styles.kvVal}>{link.value}</span>
                    </a>
                  ))}
                </div>
                <p className={`${styles.line} ${styles.navLine}`}>
                  {anchor("home", "cd ~", "cd ~")}
                </p>
              </div>
            ) : post ? (
              <div key={page}>
                <PromptLine path="~">cd writing</PromptLine>
                <PromptLine path="~/writing">less {post.slug}.mdx</PromptLine>
                <div className={styles.fileBar}>
                  <span>&quot;~/writing/{post.slug}.mdx&quot;</span>
                  <span>{post.publishedAt.slice(0, 10)}</span>
                </div>
                <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
                  {post.title}
                </h1>
                <article className={styles.prose}>{articles[post.slug]}</article>
                <span className={styles.end}>(END)</span>
                <p className={`${styles.line} ${styles.navLine}`}>
                  {anchor("writing", "q", zh ? "q  退出" : "q  quit")}
                  <span className={styles.navGap} />
                  {anchor("home", "cd ~", "cd ~")}
                </p>
              </div>
            ) : (
              <div key="writing">
                <PromptLine path="~">cd writing</PromptLine>
                <PromptLine path="~/writing">ls -lt</PromptLine>
                <h1 ref={headingRef} tabIndex={-1} className={styles.srOnly}>
                  {title}
                </h1>
                <div className={`${styles.ls} ${styles.ls4}`}>
                  {fs["~/writing"].map((e) => (
                    <div key={e.name}>
                      {anchor(
                        e.target,
                        `less ${e.name}`,
                        <>
                          <span className={styles.rowMode}>-rw-r--r--</span>
                          <span className={styles.rowMeta}>{e.meta}</span>
                          <span className={styles.rowName}>{e.name}</span>
                          <span className={styles.rowLabel}>{e.label}</span>
                        </>,
                        styles.row,
                      )}
                    </div>
                  ))}
                </div>
                {!posts.length && <p className={styles.dim}>total 0</p>}
                <p className={`${styles.line} ${styles.navLine}`}>
                  {anchor("home", "cd ~", "cd ~")}
                </p>
              </div>
            )}

            {echoBlock}
            {livePrompt}
            <input
              ref={inputRef}
              className={styles.hiddenInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Keys that the window listener defers to the input.
                if (e.key === "Backspace" && !input) e.preventDefault();
              }}
              aria-label={zh ? "终端命令输入" : "Terminal command input"}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              tabIndex={-1}
            />
          </div>
        </div>

        <footer className={styles.status}>
          <span className={styles.statusLeft}>
            <span className={styles.statusWin}>0:{windowName}*</span>
            <button
              type="button"
              className={styles.statusHint}
              onClick={() => {
                if (!locked.current && !typing) execute("help");
              }}
            >
              {zh ? "输入 help 查看命令" : "type help for commands"}
            </button>
          </span>
          <span className={styles.statusRight}>
            <a href={`/${zh ? "en" : "zh"}/`} hrefLang={zh ? "en" : "zh"}>
              {zh ? "EN" : "中"}
            </a>
            <span>
              {zh ? "北京" : "Beijing"} {clock} {periodLabel}
            </span>
          </span>
        </footer>
        <span role="status" className={styles.srOnly}>
          {typing ? "" : title}
        </span>
      </section>
    </main>
  );
}
