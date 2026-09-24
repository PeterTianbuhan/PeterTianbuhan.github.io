"""Compose a 来处 poster from its cut-out assets, one image per depth group.

  art/life/posters/<name>.json + art/life/assets/*.webp
    ->  public/life/<name>/<group>.webp

Each group becomes a board-sized layer the page parallaxes on its own, so the
page loads a handful of images instead of every asset at full size.

Usage: python3 scripts/bake-life-poster.py yanyuan [--width 2560]
"""

import json
import os
import sys

from PIL import Image

name = sys.argv[1]
width = int(sys.argv[sys.argv.index("--width") + 1]) if "--width" in sys.argv else 2560

spec = json.load(open(f"art/life/posters/{name}.json"))
bw, bh = spec["board"]
scale = width / bw
out_dir = f"public/life/{name}"
os.makedirs(out_dir, exist_ok=True)

for group, items in spec["groups"].items():
    layer = Image.new("RGBA", (round(bw * scale), round(bh * scale)), (0, 0, 0, 0))
    for it in items:
        img = Image.open(f"art/life/assets/{it['asset']}.webp").convert("RGBA")
        if it.get("cover"):
            k = max(bw / img.width, bh / img.height)
        elif "height" in it:
            k = it["height"] / img.height
        else:
            k = it["width"] / img.width
        w, h = round(img.width * k * scale), round(img.height * k * scale)
        img = img.resize((w, h), Image.LANCZOS)
        if it.get("flip"):
            img = img.transpose(Image.FLIP_LEFT_RIGHT)
        if "fade" in it:
            # let a painted puddle of water melt into the page's live lake
            import numpy as np
            a = np.asarray(img.getchannel("A")).astype(np.float32)
            y = np.linspace(0, 1, img.height)[:, None]
            f0, f1 = it["fade"]
            ramp = np.clip((y - f0) / (f1 - f0), 0, 1)
            a *= 1 - ramp * ramp * (3 - 2 * ramp)
            img.putalpha(Image.fromarray(a.astype(np.uint8)))
        if it.get("cover"):
            x, y = (layer.width - w) // 2, (layer.height - h) // 2
        elif it.get("anchor") == "top-left":
            x, y = round(it["x"] * scale), round(it["y"] * scale)
        else:
            x, y = round(it["x"] * scale - w / 2), round(it["bottom"] * scale - h)
        layer.alpha_composite(img, (x, y))
    path = f"{out_dir}/{group}.webp"
    if group == "sky":
        layer.convert("RGB").save(path, quality=84, method=6)
    else:
        layer.save(path, quality=86, method=6)
    print(f"{group}: {os.path.getsize(path) / 1e6:.2f} MB")

json.dump({"waterline": spec["waterline"] / bh, "groups": list(spec["groups"])}, open(f"{out_dir}/layout.json", "w"))
