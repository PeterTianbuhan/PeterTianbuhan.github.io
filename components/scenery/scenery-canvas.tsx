"use client";

import { useEffect, useRef, type RefObject } from "react";
import { fragmentSource, vertexSource } from "./scenery-shader";
import type { SkyTargets } from "./sky";
import styles from "./scenery.module.css";

type Props = {
  targets: RefObject<SkyTargets | null>;
  onLive: (live: boolean) => void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

// Long quiet stretches, then a flicker of two or three pulses somewhere in the deck.
function makeLightning() {
  let next = 4 + Math.random() * 6;
  let x = 0;
  let pulses: { at: number; power: number }[] = [];
  return (t: number, storm: number) => {
    if (t > next) {
      if (storm > 0.5) {
        x = (Math.random() - 0.5) * 1.6;
        const count = 2 + Math.floor(Math.random() * 2);
        pulses = Array.from({ length: count }, (_, i) => ({
          at: next + i * (0.08 + Math.random() * 0.14),
          power: i === 0 ? 0.5 : 0.6 + Math.random() * 0.4,
        }));
      }
      next = t + 7 + Math.random() * 16;
    }
    let flash = 0;
    for (const p of pulses) {
      const dt = t - p.at;
      if (dt >= 0) flash = Math.max(flash, p.power * Math.exp(-dt * 9));
    }
    return { flash: flash * storm, x };
  };
}

export function SceneryCanvas({ targets, onLive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef(onLive);

  useEffect(() => {
    liveRef.current = onLive;
  }, [onLive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      liveRef.current(false);
      return;
    }

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
      }
    } catch (err) {
      console.error("[scenery]", err);
      liveRef.current(false);
      return;
    }
    gl.useProgram(program);

    // one triangle that covers the viewport
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const locations = new Map<string, WebGLUniformLocation | null>();
    const uniform = (name: string, value: number | number[]) => {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
      const loc = locations.get(name)!;
      if (!loc) return;
      if (typeof value === "number") gl.uniform1f(loc, value);
      else if (value.length === 2) gl.uniform2fv(loc, value);
      else gl.uniform3fv(loc, value);
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    // eased copies of the targets, so weather and time roll in
    const current: SkyTargets = {};
    const lightning = makeLightning();
    let raf = 0;
    let start = 0;
    let last = 0;
    let paused = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!start) start = now;
      const gap = last ? now - last : 16;
      // a hidden tab shouldn't fast-forward the scene
      if (gap > 250) paused += gap - 16;
      last = now;
      const t = (now - start - paused) / 1000;
      const ease = 1 - Math.exp(-Math.min(gap, 100) / 1000 / 1.4);

      const goal = targets.current;
      if (goal) {
        for (const [key, value] of Object.entries(goal)) {
          const prev = current[key];
          if (prev === undefined) current[key] = Array.isArray(value) ? [...value] : value;
          else if (typeof prev === "number") current[key] = prev + ((value as number) - prev) * ease;
          else (prev as number[]).forEach((v, i, arr) => (arr[i] = v + ((value as number[])[i] - v) * ease));
          uniform(key, current[key]);
        }
      }

      pointer.sx += (pointer.x - pointer.sx) * 0.03;
      pointer.sy += (pointer.y - pointer.sy) * 0.03;

      const clock = still ? 20 : t;
      const intro = still ? 1 : Math.min(1, t / 5.5);
      const rise = 1 - Math.pow(1 - intro, 3);
      // a slow truck along the range, with a little sway and the pointer's lean
      const camX = still ? 0 : t * 0.004 + 0.04 * Math.sin(t * 0.031) + pointer.sx * 0.03;
      const camY = -0.08 * (1 - rise) + (still ? 0 : 0.006 * Math.sin(t * 0.045) - pointer.sy * 0.01);
      const bolt = lightning(clock, (current.u_storm as number) ?? 0);

      uniform("u_res", [canvas.width, canvas.height]);
      uniform("u_time", clock);
      uniform("u_intro", intro);
      uniform("u_cam", [camX, camY]);
      uniform("u_flash", still ? 0 : bolt.flash);
      uniform("u_flashX", bolt.x);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    raf = requestAnimationFrame(frame);
    liveRef.current(true);

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [targets]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
