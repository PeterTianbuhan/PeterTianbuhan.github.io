"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import styles from "./home.module.css";
import geography from "./earth-land.json";

// Land samples use Natural Earth's public-domain 1:110m coastline data.
// The compact mask is bundled locally: the scene needs no network requests.
const land = new Set(geography.land);
const points = Array.from({ length: geography.count }, (_, index) => {
  const y = 1 - 2 * (index + 0.5) / geography.count;
  const radius = Math.sqrt(1 - y * y);
  const longitude = index * Math.PI * (3 - Math.sqrt(5)) - Math.PI;
  return { x: Math.sin(longitude) * radius, y, z: Math.cos(longitude) * radius, land: land.has(index) };
});
const stars = Array.from({ length: 72 }, (_, index) => {
  // A stable, irregular field also stays still when the canvas resizes.
  const random = (seed: number) => { const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
  return { x: 0.04 + random(index + 1) * 0.92, y: 0.04 + random(index + 83) * 0.87, strength: random(index + 163) };
});
const moonPoints = Array.from({ length: 330 }, (_, index) => {
  const y = 1 - 2 * (index + 0.5) / 330;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
});

export function DotSphere({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rotation = useRef(-1.35);
  const orbit = useRef(-0.6);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let size = 0;
    let angle = rotation.current;
    let orbitAngle = orbit.current;
    let previous = 0;
    let frame = 0;
    let visible = true;
    const draw = () => {
      rotation.current = angle;
      orbit.current = orbitAngle;
      context.clearRect(0, 0, size, size);
      context.fillStyle = getComputedStyle(canvas).color;
      const centerX = size * 0.46, centerY = size * 0.55, radius = size * 0.315;
      // A tilted orbit has both a screen position and a front/back depth.
      const orbitX = Math.cos(orbitAngle) * size * 0.405;
      const orbitY = Math.sin(orbitAngle) * size * 0.16;
      const moonX = centerX + orbitX * 0.866 + orbitY * 0.5;
      const moonY = centerY - orbitX * 0.5 + orbitY * 0.866;
      const moonDepth = Math.sin(orbitAngle);
      const moonRadius = size * 0.068;
      for (const star of stars) {
        const x = star.x * size, y = star.y * size;
        if (Math.hypot(x - centerX, y - centerY) < radius + 9 || Math.hypot(x - moonX, y - moonY) < moonRadius + 7) continue;
        const dot = star.strength > 0.9 ? 2 : 1.3;
        context.globalAlpha = 0.38 + star.strength * 0.58;
        context.fillRect(x, y, dot, dot);
        if (star.strength > 0.95) {
          context.globalAlpha = 0.52;
          context.fillRect(x - 2.5, y + 0.3, 6.6, 1);
          context.fillRect(x + 0.3, y - 2.5, 1, 6.6);
        }
      }
      // Hide the Earth behind the moon when it passes in front.
      context.save();
      if (moonDepth >= 0) {
        context.beginPath();
        context.rect(0, 0, size, size);
        context.moveTo(moonX + moonRadius + 1, moonY);
        context.arc(moonX, moonY, moonRadius + 1, 0, Math.PI * 2);
        context.clip("evenodd");
      }
      // Only the visible hemisphere is drawn, so the coastlines stay legible.
      const sin = Math.sin(angle), cos = Math.cos(angle);
      for (const point of points) {
        const x = point.x * cos + point.z * sin;
        const depth = point.z * cos - point.x * sin;
        const y = point.y * 0.978 - x * 0.208;
        const tiltedX = x * 0.978 + point.y * 0.208;
        if (depth <= 0) continue;
        const dot = Math.max(0.85, size / 230) * (point.land ? 1.08 : 0.66);
        const light = Math.max(0, -tiltedX * 0.35 + y * 0.2 + depth * 0.85);
        context.globalAlpha = point.land ? 0.34 + light * 0.64 : 0.045 + depth * 0.1;
        context.fillRect(centerX + tiltedX * radius - dot / 2, centerY - y * radius - dot / 2, dot, dot);
      }
      // A fine atmospheric rim, still in the same terminal ink.
      context.strokeStyle = context.fillStyle;
      context.globalAlpha = 0.16;
      context.lineWidth = 0.6;
      context.beginPath();
      context.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
      context.stroke();
      context.restore();
      for (const point of moonPoints) {
        if (point.z <= 0) continue;
        const x = moonX + point.x * moonRadius;
        const y = moonY - point.y * moonRadius;
        if (moonDepth < 0 && Math.hypot(x - centerX, y - centerY) < radius + 2) continue;
        const light = Math.max(0, -point.x * 0.75 + point.z * 0.62 + point.y * 0.2);
        // Dark maria break up the otherwise uniform dots on the moon.
        const maria = Math.hypot(point.x + 0.28, point.y - 0.22) < 0.4 || Math.hypot(point.x - 0.27, point.y + 0.2) < 0.23;
        const dot = Math.max(0.7, size / 310);
        context.globalAlpha = (0.09 + light * 0.72) * (maria ? 0.38 : 1);
        context.fillRect(x, y, dot, dot);
      }
      context.globalAlpha = 1;
    };
    const tick = (now: number) => {
      if (now - previous >= 50) {
        const elapsed = Math.min(now - previous, 100);
        angle += elapsed * 0.000065;
        orbitAngle += elapsed * 0.00015;
        previous = now;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      draw();
      if (!paused && !motion.matches && !document.hidden && visible) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const resize = new ResizeObserver(() => {
      size = canvas.getBoundingClientRect().width;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      sync();
    });
    resize.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    intersection.observe(canvas);
    const colors = new MutationObserver(draw);
    const main = canvas.closest("main");
    if (main) colors.observe(main, { attributes: true, attributeFilter: ["style"] });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      colors.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [paused]);

  return <div className={styles.dotSphere}>
    <canvas ref={ref} aria-hidden="true" />
    <button className={styles.dotPause} onClick={() => setPaused(!paused)}
      aria-label={locale === "zh" ? (paused ? "播放点阵动画" : "暂停点阵动画") : (paused ? "Play dot animation" : "Pause dot animation")}>
      <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
    </button>
  </div>;
}
