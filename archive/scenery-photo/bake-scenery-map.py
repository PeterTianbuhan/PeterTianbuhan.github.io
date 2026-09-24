"""Bake the scene map the homepage shader reads alongside the photo.

  R  parallax weight: 0 at the horizon, rising toward the foreground ridges
     (and gently toward the overhead clouds), so a moving camera separates layers
  G  sky mask: where clouds are allowed to drift
  B  rain mask: the storm curtain on the right, where the image "pours" downward

Usage: python3 scripts/bake-scenery-map.py public/scenery/storm-ridge.webp
Region numbers are tuned by eye for this photo; retune them for a new one.
"""

import sys

import numpy as np
from PIL import Image

src = sys.argv[1] if len(sys.argv) > 1 else "public/scenery/storm-ridge.webp"
dst = src.rsplit(".", 1)[0] + "-map.png"

im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255
H, W, _ = im.shape
r, g, b = im[..., 0], im[..., 1], im[..., 2]
y = (np.arange(H)[:, None] / H) * np.ones((1, W))
x = np.ones((H, 1)) * (np.arange(W)[None, :] / W)


def blur(a, rad):
    # three separable box passes, close enough to a gaussian
    rad = max(1, int(rad * W / 1280))
    for _ in range(3):
        c = np.cumsum(np.pad(a, ((0, 0), (rad + 1, rad)), mode="edge"), axis=1)
        a = (c[:, 2 * rad + 1 :] - c[:, : -2 * rad - 1]) / (2 * rad + 1)
        c = np.cumsum(np.pad(a, ((rad + 1, rad), (0, 0)), mode="edge"), axis=0)
        a = (c[2 * rad + 1 :, :] - c[: -2 * rad - 1, :]) / (2 * rad + 1)
    return a


def smoothstep(e0, e1, v):
    t = np.clip((v - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


HORIZON = 0.505

land = smoothstep(HORIZON - 0.012, HORIZON + 0.02, y)
# atmospheric perspective: the nearer the ridge, the more saturated its green
green = blur(np.clip(g - np.maximum(r, b) * 0.9, 0, 1), 6)
below = np.clip((y - HORIZON) / (1 - HORIZON), 0, 1)
near = np.clip(
    below**1.15 * 0.8 + smoothstep(0.01, 0.12, green) * 0.3 * smoothstep(0.62, 0.72, y),
    0,
    1,
)
overhead = np.clip((HORIZON - y) / HORIZON, 0, 1) * 0.32
depth = blur(land * near + (1 - land) * overhead, 5)

sky = blur(1 - land, 3)

rain = smoothstep(0.50, 0.66, x) * smoothstep(0.08, 0.22, y) * (1 - smoothstep(0.56, 0.70, y))
rain = blur(rain, 20)

out = np.stack([depth, sky, rain], -1)
Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8)).save(dst, optimize=True)
print(f"wrote {dst} ({W}x{H})")
