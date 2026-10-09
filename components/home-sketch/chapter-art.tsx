import { CRANES, DREAM_SCREEN, KNOWLEDGE_TREE, NIGHT_WINDOW, RIVERSIDE, type Drawing } from "./storybook-drawings";
import styles from "./gallery.module.css";

// A small pen picture above an essay's title, like the one that opens a chapter
// in a picture book. Keyed by the essay's translationKey so both languages share it.
const CHAPTERS: Record<string, { drawing: Drawing; view: string }> = {
  "how-intelligence-accumulates-itself": { drawing: CRANES, view: "10 20 1060 462" },
  "interface-no-longer-fixed": { drawing: DREAM_SCREEN, view: "0 30 1060 420" },
  "knowledge-can-grow-on-its-own": { drawing: KNOWLEDGE_TREE, view: "0 40 1060 443" },
  "when-answers-are-no-longer-scarce": { drawing: RIVERSIDE, view: "0 20 1448 463" },
  "why-i-want-to-keep-living": { drawing: NIGHT_WINDOW, view: "0 0 1060 470" },
};

const INK = "#2a2a2e";

export function hasChapterArt(id?: string) {
  return Boolean(id && CHAPTERS[id]);
}

export function ChapterArt({ id }: { id?: string }) {
  const chapter = id ? CHAPTERS[id] : undefined;
  if (!chapter) return null;
  const { drawing, view } = chapter;
  const flip = `translate(0 ${drawing.size[1]}) scale(1 -1)`;
  // fade out wherever the drawing runs into the edge of the frame (a riverbank, a table)
  const [x, y, w, h] = view.split(" ").map(Number);
  return (
    <svg className={styles.chapterArt} viewBox={view} aria-hidden>
      <filter id={`chapter-wash-${id}`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
      </filter>
      <filter id={`chapter-soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".015" numOctaves="3" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="24" />
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
      <filter id={`chapter-edge-${id}`}>
        <feGaussianBlur stdDeviation="16" />
      </filter>
      <mask id={`chapter-mask-${id}`}>
        <rect x={x + 24} y={y + 24} width={w - 48} height={h - 48} fill="#fff" filter={`url(#chapter-edge-${id})`} />
      </mask>
      <g mask={`url(#chapter-mask-${id})`}>
        {drawing.under.map(([fill, opacity, d]) => (
          <path key={d.length} fill={fill} opacity={opacity} d={d} filter={`url(#chapter-soft-${id})`} />
        ))}
        <g transform={flip} filter={`url(#chapter-wash-${id})`}>
          {drawing.washes.map(([fill, d]) => (
            <path key={fill + d.length} fill={fill} d={d} />
          ))}
        </g>
        {drawing.cheeks.map(([cx, cy]) => (
          <ellipse key={cx} cx={cx} cy={cy} rx="10" ry="6" fill="#f2b731" opacity={0.8} />
        ))}
        <path transform={flip} fill={INK} d={drawing.ink} />
      </g>
    </svg>
  );
}
