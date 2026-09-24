"use client";

import { useEffect, useRef } from "react";
import { fragmentSource, vertexSource } from "./poster-shader";
import styles from "./life.module.css";

export type Poster = {
  // public/life/<dir>/ holds the baked group layers and layout.json
  dir: string;
  // board x to centre on: [wide screens, tall screens]
  focus: [number, number];
  sun: [number, number];
};

const GROUPS = ["sky", "far", "tower", "island", "near", "front"] as const;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

export function PosterCanvas({ poster, onReady }: { poster: Poster; onReady: (ok: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef(onReady);

  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      readyRef.current(false);
      return;
    }

    let raf = 0;
    let disposed = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const start = async () => {
      const base = `/life/${poster.dir}`;
      const [layout, ...images] = await Promise.all([
        fetch(`${base}/layout.json`).then((r) => r.json() as Promise<{ waterline: number }>),
        ...GROUPS.map((g) => load(`${base}/${g}.webp`)),
      ]);
      if (disposed) return;

      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
      }
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      images.forEach((img, i) => {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(program, `u_${GROUPS[i]}`), i);
      });

      const u = (name: string) => gl.getUniformLocation(program, name);
      gl.uniform1f(u("u_water"), layout.waterline);
      gl.uniform2fv(u("u_focus"), poster.focus);
      gl.uniform2fv(u("u_sun"), poster.sun);
      const uRes = u("u_res");
      const uTime = u("u_time");
      const uIntro = u("u_intro");
      const uCam = u("u_cam");

      let begin = 0;
      let last = 0;
      let paused = 0;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!begin) begin = now;
        const gap = last ? now - last : 16;
        if (gap > 250) paused += gap - 16;
        last = now;
        const t = (now - begin - paused) / 1000;

        pointer.sx += (pointer.x - pointer.sx) * 0.03;
        pointer.sy += (pointer.y - pointer.sy) * 0.03;
        const camX = still ? 0 : 0.5 * Math.sin(t * 0.05) + 0.18 * Math.sin(t * 0.13 + 1.2) + pointer.sx * 0.5;
        const camY = still ? 0 : 0.3 * Math.sin(t * 0.037 + 0.6) + pointer.sy * 0.4;

        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, still ? 12 : t);
        gl.uniform1f(uIntro, still ? 1 : Math.min(1, t / 3.5));
        gl.uniform2f(uCam, camX, camY);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      resize();
      raf = requestAnimationFrame(frame);
      readyRef.current(true);
    };

    start().catch((err) => {
      console.error("[life]", err);
      if (!disposed) readyRef.current(false);
    });

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [poster]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
