import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { VisualNote } from "@/lib/visual-notes";

export function VisualNoteView({ locale, note }: { locale: Locale; note: VisualNote }) {
  const articleHref = `/${locale}/blog/${note.articleSlug}`;

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[color:var(--ink)]">
      <header className="border-b border-[color:var(--rule)] bg-[#fbfaf7]/95">
        <div className="mx-auto flex max-w-[1540px] flex-col gap-5 px-5 py-6 lg:px-8">
          <div>
            <Link className="mono text-xs uppercase tracking-[0.26em] text-[color:var(--text-muted)]" href={`/${locale}`}>
              Peter Tian / Visual Note
            </Link>
            <h1 className="academic-serif mt-4 max-w-5xl text-4xl font-normal leading-tight tracking-normal text-[color:var(--ink)] sm:text-5xl">
              {note.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--text-soft)]">{note.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="mono inline-flex border border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-white transition hover:bg-[color:var(--accent-strong)]"
              href={articleHref}
            >
              读原文
            </Link>
            <Link
              className="mono inline-flex border border-[color:var(--rule)] bg-white px-5 py-3 text-[10px] uppercase tracking-[0.24em] text-[color:var(--ink-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
              href={`/${locale}/blog`}
            >
              文章列表
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] gap-6 px-5 py-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="border border-[color:var(--rule)] bg-white p-4 shadow-[var(--shadow-panel)]">
            <h2 className="mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Image Sequence</h2>
            <ol className="mt-4 space-y-3">
              {note.images.map((image) => (
                <li key={image.id}>
                  <a
                    className="block border-l-2 border-[color:var(--rule)] py-1 pl-3 text-sm leading-6 text-[color:var(--text-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]"
                    href={`#${image.id}`}
                  >
                    {image.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <section className="space-y-8">
          {note.images.map((image, index) => (
            <figure className="border border-[color:var(--rule)] bg-white shadow-[var(--shadow-panel)]" id={image.id} key={image.id}>
              <Image
                alt={image.alt}
                className="h-auto w-full"
                height={image.height}
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 1250px"
                src={image.src}
                width={image.width}
              />
              <figcaption className="flex flex-col gap-3 border-t border-[color:var(--rule)] bg-[#fbfaf7] px-5 py-4 text-sm leading-7 text-[color:var(--text-soft)] sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <strong className="text-[color:var(--ink)]">{image.title}</strong>
                  <span className="ml-2">{image.caption}</span>
                </span>
                <a className="shrink-0 font-semibold text-[color:var(--accent-strong)] underline underline-offset-4" href={image.src}>
                  打开原图
                </a>
              </figcaption>
            </figure>
          ))}
        </section>
      </div>
    </main>
  );
}
