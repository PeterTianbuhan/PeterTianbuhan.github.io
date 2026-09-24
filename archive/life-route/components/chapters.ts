import type { Locale } from "@/lib/i18n";
import type { Poster } from "./poster-canvas";

type Text = Record<Locale, string>;

export type Chapter = {
  id: string;
  title: Text;
  place: Text;
  span?: Text;
  // painted chapters have a poster; the rest wait for their page
  poster?: Poster;
};

export const chapters: Chapter[] = [
  {
    id: "jiayu-kindergarten",
    title: { zh: "幼儿园", en: "Kindergarten" },
    place: { zh: "咸宁 · 嘉鱼", en: "Jiayu, Xianning" },
  },
  {
    id: "jiayu-primary",
    title: { zh: "小学", en: "Primary school" },
    place: { zh: "咸宁 · 嘉鱼", en: "Jiayu, Xianning" },
    span: { zh: "到九岁", en: "until nine" },
  },
  {
    id: "wuhan-primary",
    title: { zh: "小学", en: "Primary school" },
    place: { zh: "武汉", en: "Wuhan" },
    span: { zh: "九岁转来", en: "from nine" },
  },
  {
    id: "wuhan-middle",
    title: { zh: "初中", en: "Middle school" },
    place: { zh: "武汉", en: "Wuhan" },
  },
  {
    id: "wuhan-high",
    title: { zh: "高中", en: "High school" },
    place: { zh: "武汉", en: "Wuhan" },
  },
  {
    id: "yanyuan",
    title: { zh: "燕园", en: "Yanyuan" },
    place: { zh: "北京 · 北京大学", en: "Peking University, Beijing" },
    span: { zh: "2025 —", en: "2025 —" },
    // 一塔湖图: the pagoda, the lake, the library
    poster: { dir: "yanyuan", focus: [0.5, 0.74], sun: [0.1, 0.02] },
  },
];
