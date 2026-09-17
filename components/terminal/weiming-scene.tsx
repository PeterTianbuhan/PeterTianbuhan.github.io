"use client";

import { useEffect, useRef } from "react";
import type { TimeOfDay } from "./time-of-day";

// A deliberately composed, low-resolution painting. Geometry is drawn once;
// only the reflected scanlines and small water highlights move.
export function WeimingScene({
  paused = false,
  time,
}: {
  paused?: boolean;
  time: TimeOfDay;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const p = time.palette;
    const colorMap: Record<string, string> = {
      "#686777": p.distant,
      "#485764": p.farShade,
      "#586975": p.farMid,
      "#72777e": p.farLight,
      "#253e46": p.treeShade,
      "#355551": p.treeMid,
      "#5c7063": p.treeLight,
      "#273e44": p.treeShade,
      "#605c68": p.towerMid,
      "#454956": p.towerShade,
      "#414652": p.towerShade,
      "#b29b92": p.towerLight,
      "#3a414d": p.towerShade,
      "#bba899": p.towerLight,
      "#68616a": p.towerMid,
      "#4e4e5c": p.towerShade,
      "#363e4b": p.towerShade,
      "#303d4b": p.towerShade,
      "#333f4b": p.towerShade,
      "#ab9690": p.towerLight,
      "#5e6b68": p.stone,
      "#79807a": p.stone,
      "#b29b84": p.stoneLight,
      "#3a5553": p.treeMid,
      "#b3a28b": p.stone,
      "#c6b399": p.stoneLight,
      "#c3b297": p.stoneLight,
      "#1c3037": p.nearShade,
      "#263b3e": p.nearShade,
      "#344b48": p.nearMid,
      "#496052": p.nearMid,
      "#5a6d59": p.nearLight,
      "#354e49": p.nearMid,
      "#1a3037": p.nearShade,
      "#1e343a": p.nearShade,
      "#253f40": p.nearShade,
      "#3e5650": p.nearMid,
      "#536152": p.nearLight,
      "#3c5350": p.nearMid,
    };
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = 720,
      height = 280,
      shore = 144;
    canvas.width = width;
    canvas.height = height;
    const land = document.createElement("canvas");
    land.width = width;
    land.height = height;
    const g = land.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    let seed = 73019;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const rect = (
      x: number,
      y: number,
      w: number,
      h: number,
      color: string,
    ) => {
      g.fillStyle = colorMap[color] ?? color;
      g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    };
    const poly = (points: number[][], color: string) => {
      g.fillStyle = colorMap[color] ?? color;
      g.beginPath();
      points.forEach(([x, y], i) =>
        i
          ? g.lineTo(Math.round(x), Math.round(y))
          : g.moveTo(Math.round(x), Math.round(y)),
      );
      g.closePath();
      g.fill();
    };
    // A low opposite shore leaves room for the long tower reflection.
    g.scale(1, shore / 169);
    const sky = g.createLinearGradient(0, 0, 0, 169);
    sky.addColorStop(0, p.skyTop);
    sky.addColorStop(0.5, p.skyMiddle);
    sky.addColorStop(1, p.skyBottom);
    g.fillStyle = sky;
    g.fillRect(0, 0, width, height);
    // Sparse dithering gives the sky a material grain, without a noise overlay.
    for (let i = 0; i < 5400; i++) {
      g.globalAlpha = 0.06;
      rect(
        rnd() * width,
        rnd() * shore,
        1,
        1,
        rnd() > 0.5 ? "#ffe4ba" : "#453b63",
      );
    }
    g.globalAlpha = 1;
    [
      [89, 58, 82],
      [118, 64, 105],
      [286, 29, 95],
      [321, 33, 130],
      [573, 83, 65],
    ].forEach(([x, y, w]) => {
      rect(x, y, w, 2, p.cloud);
      rect(x + 12, y - 2, w * 0.52, 2, p.cloudShade);
      rect(x - 9, y + 3, w + 18, 1, p.cloudLight);
    });
    // Illustrated daylight cycle, intentionally independent of astronomical ephemerides.
    g.globalAlpha = time.daylight;
    g.fillStyle = "#fff1be";
    g.beginPath();
    g.arc(time.sunX, time.sunY, 11, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 1 - time.daylight;
    g.fillStyle = "#e8e8d4";
    g.beginPath();
    g.arc(time.moonX, time.moonY, 10, 0, Math.PI * 2);
    g.fill();
    // Cut a crescent using the sky at the same height.
    g.fillStyle = sky;
    g.beginPath();
    g.arc(time.moonX + 4, time.moonY - 3, 8, 0, Math.PI * 2);
    g.fill();
    // The independent seed keeps the tree geometry identical through the day.
    for (let i = 0; i < 75; i++) {
      const x = (i * 137.51 + 57) % width,
        y = (i * 43.17 + 11) % 110;
      rect(x, y, i % 13 === 0 ? 2 : 1, 1, "#c8d8e5");
      if (i % 13 === 0) rect(x, y - 1, 1, 3, "#c8d8e5");
    }
    g.globalAlpha = 1;
    poly(
      [
        [0, 143],
        [31, 133],
        [61, 137],
        [104, 125],
        [131, 130],
        [166, 119],
        [199, 126],
        [233, 119],
        [271, 130],
        [320, 122],
        [356, 132],
        [410, 116],
        [451, 123],
        [490, 128],
        [531, 116],
        [566, 125],
        [610, 119],
        [650, 131],
        [720, 118],
        [720, 177],
        [0, 177],
      ],
      "#686777",
    );
    const tree = (x: number, y: number, r: number, colors: string[]) => {
      // Three overlapping crown lobes, with a shaded base and lit upper edge.
      [
        [-0.45, 0, 0.68],
        [0.35, -0.07, 0.76],
        [0, -0.52, 0.71],
      ].forEach(([dx, dy, scale]) => {
        const cx = x + dx * r,
          cy = y + dy * r,
          rr = r * scale;
        for (let yy = -rr; yy <= rr; yy += 2) {
          const half = Math.sqrt(Math.max(0, rr * rr - yy * yy));
          rect(cx - half, cy + yy, half * 2 + 2, 2, colors[0]);
        }
        for (let i = 0; i < rr * rr * 0.55; i++) {
          const xx = (rnd() * 2 - 1) * rr,
            yy = (rnd() * 2 - 1) * rr;
          if (xx * xx + yy * yy > rr * rr) continue;
          const light = yy < -rr * 0.16 && rnd() > 0.45;
          rect(
            cx + xx,
            cy + yy,
            2 + rnd() * 3,
            1 + rnd() * 2,
            colors[light ? 2 : 1],
          );
        }
      });
      rect(x - 1, y + r * 0.2, 2, r * 0.7, colors[0]);
    };
    for (let x = -10; x < 745; x += 14 + rnd() * 12)
      tree(x, 145 + rnd() * 8, 12 + rnd() * 9, [
        "#485764",
        "#586975",
        "#72777e",
      ]);
    // Only the library's distant roof peeks above the tree line.
    g.save();
    g.translate(399, 123);
    g.scale(0.65, 0.65);
    g.translate(-399, -123);
    rect(385, 115, 29, 15, p.farLight);
    poly(
      [
        [376, 116],
        [385, 112],
        [395, 102],
        [402, 102],
        [412, 112],
        [423, 116],
      ],
      p.towerShade,
    );
    rect(390, 102, 16, 2, p.towerMid);
    rect(397, 98, 2, 5, p.towerShade);
    rect(381, 116, 37, 1, p.towerLight);
    rect(390, 120, 4, 7, p.farShade);
    rect(400, 120, 4, 7, p.farShade);
    g.restore();
    // Boya Tower: close-spaced thirteen eaves, broad masonry shaft, single roof.
    const tx = 182;
    rect(tx - 11, 67, 23, 84, "#605c68");
    rect(tx + 2, 67, 10, 84, "#454956");
    poly(
      [
        [tx - 20, 67],
        [tx - 12, 63],
        [tx - 4, 54],
        [tx, 48],
        [tx + 4, 54],
        [tx + 12, 63],
        [tx + 20, 67],
      ],
      "#414652",
    );
    rect(tx - 18, 67, 36, 2, "#b29b92");
    rect(tx - 1, 44, 2, 7, "#3a414d");
    rect(tx - 2, 47, 4, 2, "#bba899");
    for (let i = 0; i < 13; i++) {
      const y = 72 + i * 6;
      const half = 17 + i * 0.3;
      rect(tx - half + 3, y - 3, half * 2 - 6, 5, "#68616a");
      rect(tx + 2, y - 3, half - 5, 5, "#4e4e5c");
      rect(tx - 8, y - 2, 2, 3, "#363e4b");
      rect(tx + 6, y - 2, 2, 3, "#303d4b");
      poly(
        [
          [tx - half - 2, y - 1],
          [tx - half + 3, y + 1],
          [tx + half - 3, y + 1],
          [tx + half + 2, y - 1],
          [tx + half, y + 3],
          [tx - half, y + 3],
        ],
        "#333f4b",
      );
      rect(tx - half, y + 1, half * 2, 1, "#ab9690");
    }
    // Midground tree groups partly obscure the base, as on the actual lake shore.
    [
      [14, 151, 24],
      [57, 144, 26],
      [105, 153, 19],
      [138, 148, 24],
      [185, 153, 18],
      [225, 149, 22],
      [263, 153, 19],
      [302, 147, 22],
      [332, 150, 19],
      [377, 140, 15],
      [405, 146, 20],
      [442, 149, 22],
      [481, 154, 17],
      [569, 147, 26],
      [617, 151, 22],
      [660, 141, 31],
      [707, 148, 27],
    ].forEach(([x, y, r]) => tree(x, y, r, ["#253e46", "#355551", "#5c7063"]));
    poly(
      [
        [0, 162],
        [84, 163],
        [139, 159],
        [204, 166],
        [281, 164],
        [309, 160],
        [350, 164],
        [416, 161],
        [463, 165],
        [522, 161],
        [580, 166],
        [642, 162],
        [720, 160],
        [720, 176],
        [0, 174],
      ],
      "#273e44",
    );
    for (let i = 0; i < 260; i++)
      rect(
        rnd() * 720,
        166 + rnd() * 7,
        2 + rnd() * 7,
        1 + rnd() * 2,
        ["#5e6b68", "#79807a", "#b29b84", "#3a5553"][Math.floor(rnd() * 4)],
      );
    // Huashen Temple is a small red arched gate at the water, framed by willows.
    const gate = 365;
    rect(gate - 18, 163, 36, 3, p.stone);
    rect(gate - 14, 160, 28, 3, p.stoneLight);
    rect(gate - 11, 143, 22, 18, p.templeWall);
    rect(gate + 6, 143, 5, 18, p.templeShade);
    rect(gate - 11, 157, 22, 4, p.stoneLight);
    poly(
      [
        [gate - 15, 142],
        [gate - 10, 138],
        [gate - 7, 132],
        [gate + 7, 132],
        [gate + 10, 138],
        [gate + 15, 142],
      ],
      p.towerShade,
    );
    rect(gate - 13, 141, 26, 2, p.towerLight);
    rect(gate - 7, 131, 14, 2, p.towerMid);
    rect(gate - 8, 128, 2, 4, p.towerLight);
    rect(gate + 6, 128, 2, 4, p.towerLight);
    // Stepped arch preserves the pixel grid and the white masonry surround.
    rect(gate - 5, 151, 10, 10, p.stoneLight);
    rect(gate - 3, 148, 6, 4, p.stoneLight);
    rect(gate - 3, 152, 6, 10, p.nearShade);
    rect(gate - 2, 150, 4, 3, p.nearShade);
    rect(gate - 3, 144, 6, 2, p.towerShade);
    const willow = (x: number, y: number, radius: number) => {
      tree(x, y, radius, [p.treeShade, p.treeMid, p.treeLight]);
      for (let i = 0; i < radius * 3; i++) {
        const offset = (rnd() * 2 - 1) * radius;
        const top = y - radius * (0.5 + rnd() * 0.5);
        const length = (169 - top) * (0.6 + rnd() * 0.4);
        for (let j = 0; j < length; j += 2) {
          rect(
            x + offset + Math.sin(j * 0.07 + i) * 2,
            top + j,
            1 + (i % 2),
            2,
            [p.treeShade, p.treeMid, p.treeLight][i % 3],
          );
        }
      }
    };
    willow(83, 136, 27);
    willow(124, 140, 20);
    willow(317, 140, 22);
    willow(414, 139, 23);
    // A few warm shore lights follow the photograph, emerging after sunset.
    g.globalAlpha = 1 - time.daylight;
    [150, 231, 278, 345, 391, 459].forEach((x) => {
      rect(x, 157, 1, 8, p.towerShade);
      rect(x - 1, 155, 2, 3, "#f6ce87");
    });
    g.globalAlpha = 1;
    g.resetTransform();
    const foreground = document.createElement("canvas");
    foreground.width = width;
    foreground.height = height;
    // Save background, then draw near-shore framing on its own transparent layer.
    const fg = foreground.getContext("2d")!;
    const near = document.createElement("canvas");
    near.width = width;
    near.height = height;
    near.getContext("2d")!.drawImage(land, 0, 0);
    g.clearRect(0, 0, width, height);
    // The island sits closer than the opposite shore. Its own waterline keeps
    // its reflection from being folded around the distant bank.
    const island = document.createElement("canvas");
    island.width = width;
    island.height = height;
    g.save();
    g.setTransform(1.1, 0, 0, 0.68, -128, 37);
    poly(
      [
        [593, 166],
        [624, 152],
        [674, 150],
        [720, 145],
        [720, 177],
        [661, 180],
        [617, 176],
      ],
      p.nearShade,
    );
    [
      [619, 145, 24],
      [651, 134, 31],
      [685, 134, 36],
      [718, 143, 27],
    ].forEach(([x, y, r]) =>
      tree(x, y, r, [p.nearShade, p.nearMid, p.nearLight]),
    );
    // Broken rocks and low shrubs make an irregular island edge.
    poly(
      [
        [595, 167],
        [616, 165],
        [626, 169],
        [650, 170],
        [666, 167],
        [688, 171],
        [720, 165],
        [720, 179],
        [676, 182],
        [646, 178],
        [613, 175],
      ],
      p.stone,
    );
    for (let i = 0; i < 49; i++) {
      const x = 606 + rnd() * 114;
      const y = 170 + rnd() * 8;
      poly(
        [
          [x, y],
          [x + 3, y - 3],
          [x + 9, y - 2],
          [x + 12, y + 2],
          [x + 2, y + 3],
        ],
        [p.stoneLight, p.stone, p.nearShade, p.nearMid][i % 4],
      );
    }
    g.restore();
    island.getContext("2d")!.drawImage(land, 0, 0);
    g.clearRect(0, 0, width, height);
    // Across-water view: the boat is a low pale face beside the island.
    // The deck is foreshortened to a narrow strip, with a shallow curved lip.
    const boat = document.createElement("canvas");
    boat.width = width;
    boat.height = height;
    g.save();
    g.translate(-38, 0);
    poly(
      [
        [641, 151],
        [651, 149],
        [684, 150],
        [689, 152],
        [688, 162],
        [642, 162],
      ],
      p.stone,
    );
    poly(
      [
        [642, 152],
        [688, 152],
        [687, 159],
        [643, 159],
      ],
      p.stoneLight,
    );
    rect(644, 159, 43, 3, p.towerMid);
    poly(
      [
        [640, 148],
        [643, 148],
        [645, 151],
        [684, 151],
        [686, 148],
        [689, 148],
        [689, 153],
        [641, 153],
      ],
      p.stoneLight,
    );
    rect(646, 153, 38, 1, p.stone);
    [649, 660, 671].forEach((x) => {
      rect(x, 155, 9, 3, p.stone);
      rect(x + 1, 155, 7, 2, p.stoneLight);
    });
    rect(651, 146, 2, 4, p.towerMid);
    rect(680, 147, 2, 3, p.towerMid);
    g.restore();
    boat.getContext("2d")!.drawImage(land, 0, 0);
    g.clearRect(0, 0, width, height);
    poly(
      [
        [0, 0],
        [21, 0],
        [25, 66],
        [17, 138],
        [11, 218],
        [0, 239],
      ],
      "#1c3037",
    );
    poly(
      [
        [10, 92],
        [47, 44],
        [89, 17],
        [144, 0],
        [127, 0],
        [72, 17],
        [37, 43],
        [14, 62],
      ],
      "#1c3037",
    );
    poly(
      [
        [17, 52],
        [41, 17],
        [39, 0],
        [31, 0],
        [32, 19],
        [9, 51],
      ],
      "#263b3e",
    );
    poly(
      [
        [17, 138],
        [63, 114],
        [96, 83],
        [123, 65],
        [97, 77],
        [58, 104],
        [14, 124],
      ],
      "#263b3e",
    );
    for (let i = 0; i < 92; i++) {
      const x = 8 + rnd() * 166,
        y = 3 + rnd() * 19;
      const len = (1 - x / 200) * (24 + rnd() * 53);
      for (let j = 0; j < len; j += 3) {
        const xx = x + Math.sin(j * 0.09 + i) * 3;
        rect(xx, y + j, 1, 3, "#344b48");
        if (rnd() > 0.28)
          rect(
            xx + (j % 2 ? -2 : 1),
            y + j,
            2,
            3,
            ["#496052", "#5a6d59", "#354e49"][i % 3],
          );
      }
    }
    poly(
      [
        [0, 256],
        [33, 247],
        [53, 250],
        [78, 241],
        [112, 250],
        [155, 266],
        [190, 280],
        [0, 280],
      ],
      "#1a3037",
    );
    poly(
      [
        [609, 280],
        [636, 264],
        [672, 258],
        [683, 248],
        [720, 243],
        [720, 280],
      ],
      "#1e343a",
    );
    for (let i = 0; i < 190; i++) {
      const x = rnd() < 0.6 ? rnd() * 160 : 646 + rnd() * 74;
      const y = 262 + rnd() * 18;
      rect(
        x,
        y,
        2 + rnd() * 7,
        1 + rnd() * 2,
        ["#253f40", "#3e5650", "#536152"][i % 3],
      );
    }
    for (let i = 0; i < 37; i++) {
      const x = rnd() < 0.55 ? rnd() * 115 : 672 + rnd() * 48,
        y = 263 + rnd() * 14,
        h = 6 + rnd() * 18;
      poly(
        [
          [x, y],
          [x - 3, y - h],
          [x + 1, y - 4],
          [x + 4, y - h + 4],
          [x + 2, y],
        ],
        "#3c5350",
      );
    }
    fg.drawImage(land, 0, 0);
    g.clearRect(0, 0, width, height);
    g.drawImage(near, 0, 0);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      previous = 0;
    const draw = (time: number) => {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(land, 0, 0);
      const water = ctx.createLinearGradient(0, shore, 0, height);
      water.addColorStop(0, p.waterTop);
      water.addColorStop(0.55, p.waterMiddle);
      water.addColorStop(1, p.waterBottom);
      ctx.fillStyle = water;
      ctx.fillRect(0, shore, width, height - shore);
      for (let y = shore; y < height; y++) {
        const depth = y - shore;
        const source = Math.max(0, shore - depth * 0.93);
        const shift = Math.round(
          Math.sin(depth * 0.23 + time * 0.0008) * (1 + depth * 0.035) +
            Math.sin(depth * 0.61 - time * 0.0004),
        );
        ctx.globalAlpha = 0.52 - depth * 0.002;
        ctx.drawImage(land, 0, source, width, 1, shift, y, width, 1);
      }
      ctx.globalAlpha = 1;
      const reflectLayer = (
        layer: HTMLCanvasElement,
        waterline: number,
        left: number,
      ) => {
        for (let y = waterline; y < height; y += 2) {
          const depth = y - waterline;
          const shift = Math.round(
            Math.sin(depth * 0.3 + time * 0.0008) * (1 + depth * 0.04),
          );
          ctx.globalAlpha = Math.max(0, 0.4 - depth * 0.004);
          ctx.drawImage(
            layer,
            left,
            waterline - depth - 2,
            width - left,
            2,
            left + shift,
            y,
            width - left,
            2,
          );
        }
        ctx.globalAlpha = 1;
      };
      reflectLayer(island, 161, 515);
      reflectLayer(boat, 162, 600);
      for (let i = 0; i < 95; i++) {
        const x = (i * 137.21) % width,
          y = shore + 3 + ((i * 31.17) % (height - shore - 7));
        const shimmer = 0.1 + 0.07 * Math.sin(time * 0.001 + i);
        ctx.globalAlpha = shimmer;
        ctx.fillStyle = p.stoneLight;
        ctx.fillRect(
          Math.round(x + Math.sin(time * 0.0003 + i) * 3),
          Math.round(y),
          4 + (i % 15),
          1,
        );
      }
      ctx.globalAlpha = 1;
      // Two little silhouettes provide scale without turning the lake into a game.
      const dx = 214 + Math.sin(time * 0.000045) * 24;
      ctx.fillStyle = p.treeShade;
      ctx.fillRect(Math.round(dx), 210, 8, 2);
      ctx.fillRect(Math.round(dx + 6), 207, 3, 3);
      ctx.fillStyle = p.stoneLight;
      ctx.fillRect(Math.round(dx + 9), 209, 2, 1);
      ctx.fillStyle = p.farLight;
      ctx.fillRect(Math.round(dx - 5), 214, 17, 1);
      ctx.drawImage(island, 0, 0);
      ctx.drawImage(boat, 0, 0);
      ctx.drawImage(foreground, 0, 0);
    };
    const loop = (time: number) => {
      if (time - previous > 80) {
        draw(time);
        previous = time;
      }
      frame = requestAnimationFrame(loop);
    };
    const restart = () => {
      cancelAnimationFrame(frame);
      draw(0);
      if (!document.hidden && !motion.matches && !paused)
        frame = requestAnimationFrame(loop);
    };
    restart();
    document.addEventListener("visibilitychange", restart);
    motion.addEventListener("change", restart);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", restart);
      motion.removeEventListener("change", restart);
    };
  }, [paused, time]);
  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`${time.period}的未名湖：左侧博雅塔、柳树间的花神庙、远处图书馆屋顶，右侧湖心岛与石舫，水中波光倒影`}
      style={{ display: "block", imageRendering: "pixelated" }}
    />
  );
}
