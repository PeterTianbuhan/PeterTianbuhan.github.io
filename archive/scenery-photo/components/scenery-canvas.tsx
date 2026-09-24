"use client";

import { useEffect, useRef } from "react";
import { fragmentSource, vertexSource } from "./scenery-shader";
import styles from "./scenery.module.css";

export type SceneryMode = "pending" | "live" | "static";

type Props = {
  photo: string;
  map: string;
  onMode: (mode: SceneryMode) => void;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

function texture(gl: WebGLRenderingContext, unit: number, img: HTMLImageElement, raw: boolean) {
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // the map is data, not color: keep the browser from color-managing it
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, raw ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

// Lightning: long quiet stretches, then a flicker of two or three pulses.
function makeLightning() {
  let next = 9 + Math.random() * 10;
  let pulses: { at: number; power: number }[] = [];
  return (t: number) => {
    if (t > next) {
      const count = 2 + Math.floor(Math.random() * 2);
      pulses = Array.from({ length: count }, (_, i) => ({
        at: next + i * (0.09 + Math.random() * 0.14),
        power: i === 0 ? 0.55 : 0.6 + Math.random() * 0.4,
      }));
      next += 16 + Math.random() * 26;
    }
    let flash = 0;
    for (const p of pulses) {
      const dt = t - p.at;
      if (dt >= 0) flash = Math.max(flash, p.power * Math.exp(-dt * 9));
    }
    return flash;
  };
}

export function SceneryCanvas({ photo, map, onMode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(onMode);

  useEffect(() => {
    modeRef.current = onMode;
  }, [onMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      modeRef.current("static");
      return;
    }

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      modeRef.current("static");
      return;
    }

    let raf = 0;
    let disposed = false;
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

    Promise.all([loadImage(photo), loadImage(map)])
      .then(([photoImg, mapImg]) => {
        if (disposed) return;

        const program = gl.createProgram()!;
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(program) ?? "program link failed");
        }
        gl.useProgram(program);

        // one triangle that covers the viewport
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        texture(gl, 0, photoImg, false);
        texture(gl, 1, mapImg, true);

        const u = (name: string) => gl.getUniformLocation(program, name);
        gl.uniform1i(u("u_photo"), 0);
        gl.uniform1i(u("u_map"), 1);
        gl.uniform2f(u("u_img"), photoImg.naturalWidth, photoImg.naturalHeight);
        const uRes = u("u_res");
        const uTime = u("u_time");
        const uIntro = u("u_intro");
        const uFlash = u("u_flash");
        const uPan = u("u_pan");
        const uDolly = u("u_dolly");

        const lightning = makeLightning();
        let start = 0;
        let last = 0;
        let paused = 0;

        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!start) start = now;
          // don't let a hidden tab fast-forward the scene
          if (last && now - last > 250) paused += now - last - 16;
          last = now;
          const t = (now - start - paused) / 1000;

          pointer.sx += (pointer.x - pointer.sx) * 0.025;
          pointer.sy += (pointer.y - pointer.sy) * 0.025;

          // a slow, never-quite-repeating drift, like a camera on a tripod head
          const panX = 0.011 * Math.sin(t * 0.057) + 0.004 * Math.sin(t * 0.131 + 1.3) + pointer.sx * 0.012;
          const panY = 0.004 * Math.sin(t * 0.043 + 0.7) + pointer.sy * 0.006;
          const dolly = 0.5 - 0.5 * Math.cos(t * 0.033);

          gl.uniform2f(uRes, canvas.width, canvas.height);
          gl.uniform1f(uTime, t);
          gl.uniform1f(uIntro, Math.min(1, t / 5));
          gl.uniform1f(uFlash, lightning(t));
          gl.uniform2f(uPan, panX, panY);
          gl.uniform1f(uDolly, dolly);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        resize();
        raf = requestAnimationFrame(frame);
        modeRef.current("live");
      })
      .catch((err) => {
        console.error("[scenery]", err);
        if (!disposed) modeRef.current("static");
      });

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [photo, map]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
