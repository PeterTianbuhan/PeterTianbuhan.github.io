"use client";

import type { Locale } from "@/lib/i18n";
import type { LocalizedProject } from "@/lib/site";
import { CollectionPicker, useCollectionSelection } from "./collection-picker";
import styles from "./reading.module.css";

export function ProjectBrowser({ locale, projects }: { locale: Locale; projects: LocalizedProject[] }) {
  const zh = locale === "zh";
  const options = [
    { id: "", title: zh ? "全部" : "All projects", description: "" },
    { id: "built-projects", title: zh ? "我做的" : "Projects I build", description: "" },
    { id: "played-projects", title: zh ? "我玩过的" : "Projects I’ve played with", description: "" },
  ];
  const { current, select, step } = useCollectionSelection(options);
  const visibleProjects = current.id ? projects.filter((project) => project.series === current.id) : projects;
  return <>
    <CollectionPicker locale={locale} options={options} current={current} select={select} step={step} />
    <div className={styles.srOnly} aria-live="polite" aria-atomic="true">{current.title} · {visibleProjects.length} {zh ? "个项目" : "projects"}</div>
    <div className={styles.collectionEntries}>
      {visibleProjects.map((project) => <section className={styles.entry} key={project.slug} id={project.slug}>
        <div className={styles.meta}>{project.status}</div>
        <h2>{project.name}</h2>
        <p>{project.summary}</p>
        {project.link && <a className={styles.projectLink} href={project.link} target="_blank" rel="noreferrer">{zh ? "查看项目" : "View project"} ↗</a>}
      </section>)}
      {visibleProjects.length === 0 && <p className={styles.intro}>{zh ? "暂无展示。" : "Nothing featured yet."}</p>}
    </div>
  </>;
}
