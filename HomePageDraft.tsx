import React from "react";

const skills = [
  "React",
  "TypeScript",
  "Next.js",
  "Tailwind",
  "Node.js",
  "Motion",
];

const projects = [
  {
    name: "Neural Grid",
    stack: "React / Tailwind",
    desc: "Cyber-style portfolio shell with animated panels and data overlays.",
  },
  {
    name: "Signal Core",
    stack: "Next.js / API",
    desc: "Fast landing experience with modular sections and performance-first UI.",
  },
  {
    name: "Ghost Terminal",
    stack: "TS / Motion",
    desc: "Interactive command-line inspired profile and project navigator.",
  },
];

const stats = [
  ["Mode", "ONLINE"],
  ["Focus", "Frontend Systems"],
  ["Theme", "Black / White"],
  ["Stack", "React + Tailwind"],
  ["Status", "Available"],
];

export default function HomePageDraft() {
  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <div className="relative isolate">
        <BackgroundEffects />

        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-6 py-6 sm:px-8 lg:px-10">
          <header className="mb-6 flex items-center justify-between border border-white/10 bg-white/[0.02] px-4 py-3 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.35em] text-white/60">
              personal_portfolio.sys
            </div>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-white/50">
              <span>system status</span>
              <span className="inline-flex h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.85)]" />
              <span className="text-white">online</span>
            </div>
          </header>

          <section className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr_0.78fr]">
            <section className="flex flex-col gap-6">
              <Panel className="min-h-[340px]">
                <div className="mb-4 text-xs uppercase tracking-[0.35em] text-white/45">
                  hello_world.exe
                </div>
                <p className="mb-4 text-sm text-white/60">极客风个人展示首页初版</p>
                <h1 className="max-w-[8ch] text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
                  I&apos;M A
                  <br />
                  DEVELOPER_
                </h1>
                <p className="mt-5 text-xs uppercase tracking-[0.32em] text-white/55">
                  code. create. solve.
                </p>
                <p className="mt-8 max-w-xl text-sm leading-8 text-white/72 sm:text-base">
                  Building sleek interfaces, interactive systems, and high-performance
                  products with a minimalist dark-tech aesthetic.
                </p>
              </Panel>

              <Panel>
                <SectionLabel label="skills.exe" />
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className="group border border-white/10 bg-white/[0.03] px-4 py-4 transition duration-300 hover:border-white/25 hover:bg-white/[0.05]"
                    >
                      <div className="text-sm font-medium tracking-wide">{skill}</div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-white/35 group-hover:text-white/50">
                        active
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionLabel label="projects.data" />
                <div className="mt-5 space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.name}
                      className="border border-white/10 bg-white/[0.025] px-4 py-4 transition duration-300 hover:border-white/20"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-base font-medium">{project.name}</div>
                        <div className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                          {project.stack}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-white/65">{project.desc}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="relative min-h-[560px] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_48%)]" />
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:42px_42px]" />
              <div className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 shadow-[0_0_120px_rgba(255,255,255,0.08)]" />
              <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_42%,transparent_60%)] shadow-[0_0_80px_rgba(255,255,255,0.08)]" />
              <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
              <div className="absolute inset-0">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                    style={{
                      left: `${15 + ((i * 37) % 70)}%`,
                      top: `${10 + ((i * 29) % 78)}%`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-x-8 top-8 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/40">
                <span>signal_core</span>
                <span>node map / orbit</span>
              </div>
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-xs text-white/35">
                <span>{"//"} interactive visual center</span>
                <span>data stream ready</span>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <Panel>
                <SectionLabel label="code.snippet" />
                <pre className="mt-5 overflow-x-auto text-sm leading-7 text-white/78">
{`const developer = {
  name: "Your Name",
  role: "Frontend Developer",
  style: ["Geek", "Dark", "Minimal"],
  focus: "Fast, visual, scalable UI"
};

function build() {
  design();
  code();
  refine();
}`}
                </pre>
              </Panel>

              <Panel>
                <SectionLabel label="system.info" />
                <div className="mt-5 space-y-3 text-sm">
                  {stats.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between border-b border-white/8 pb-2 text-white/72"
                    >
                      <span className="uppercase tracking-[0.24em] text-white/38">{k}</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionLabel label="activity.log" />
                <div className="mt-5 space-y-2 text-sm text-white/65">
                  <LogRow time="10:15:23" text="system boot" />
                  <LogRow time="10:15:24" text="loading modules" />
                  <LogRow time="10:15:25" text="syncing portfolio" />
                  <LogRow time="10:15:26" text="rendering interface" />
                  <LogRow time="10:15:27" text="ready to deploy" />
                </div>
              </Panel>

              <Panel className="mt-auto">
                <blockquote className="text-center text-lg leading-8 text-white/88">
                  “Code is not just what I do,<br /> it&apos;s how I shape ideas.”
                </blockquote>
              </Panel>
            </section>
          </section>

          <footer className="mt-6 flex flex-col gap-4 border border-white/10 bg-white/[0.02] px-4 py-4 text-xs uppercase tracking-[0.25em] text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <span>github / yourname</span>
              <span>linkedin / yourname</span>
              <span>email / hello@domain.com</span>
            </div>
            <span>root@portfolio:~#</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_30%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="text-xs uppercase tracking-[0.34em] text-white/45">{"//"} {label}</div>
  );
}

function LogRow({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 pb-2">
      <span className="text-white/38">[{time}]</span>
      <span>{text}</span>
      <span className="text-white/38">ok</span>
    </div>
  );
}

function BackgroundEffects() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen [background-image:repeating-linear-gradient(180deg,rgba(255,255,255,1)_0px,rgba(255,255,255,1)_1px,transparent_2px,transparent_4px)]" />
      <div className="pointer-events-none absolute left-[8%] top-[14%] h-48 w-48 rounded-full bg-white/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[6%] h-56 w-56 rounded-full bg-white/10 blur-[140px]" />
    </>
  );
}
