"""Turn a black-on-white line drawing into a coloured drawing for the picture-book
pages on the home page (components/home-sketch/storybook-drawings.ts).

    python3 scripts/storybook/trace.py label drawing.png
        writes drawing-labels.png: every enclosed white area gets a random
        colour and a number, so you can decide what colour each one gets.

    python3 scripts/storybook/trace.py build drawing.png colours.json NAME
        prints `export const NAME: Drawing = {...}` to paste into
        storybook-drawings.ts.

colours.json maps fills to area numbers, plus optional extras:

    {
      "fills": { "#f1b98a": [17], "#6f8299": [35, 36] },
      "clear": [33],
      "under": [["#a3c77e", 0.45, "M80 1030 C300 960 ..."]],
      "cheeks": [[468, 560], [738, 556]]
    }

Areas not listed get the paper colour, so faces and hands stay opaque on a
coloured page. "clear" areas stay see-through (gaps between legs, open sky).
"under" are soft washes painted under the drawing in its own coordinates (y
down), for things the lines don't close off, like a lake or a patch of grass.

Needs potrace (brew install potrace) and numpy, scipy and pillow.
"""

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

PAPER = "#f8f4ea"


def areas(png):
    gray = np.array(Image.open(png).convert("L"))
    ink = gray < 128
    # close tiny gaps in the lines so an area doesn't leak into its neighbour
    white = ~ndi.binary_dilation(ink, iterations=2)
    lab, _ = ndi.label(white)
    return ink, lab


def label(png):
    ink, lab = areas(png)
    sizes = np.bincount(lab.ravel())
    keep = [k for k in range(1, len(sizes)) if sizes[k] > 250]
    rng = np.random.default_rng(1)
    out = np.full((*ink.shape, 3), 255, np.uint8)
    for k in keep:
        out[lab == k] = rng.integers(130, 250, 3)
    out[ink] = 0
    img = Image.fromarray(out)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
    except OSError:
        font = ImageFont.load_default()
    for k in keep:
        ys, xs = np.nonzero(lab == k)
        j = np.argmin((ys - ys.mean()) ** 2 + (xs - xs.mean()) ** 2)
        draw.text((xs[j] - 9, ys[j] - 9), str(k), fill=(0, 0, 0), font=font, stroke_width=2, stroke_fill=(255, 255, 255))
    dest = Path(png).with_name(Path(png).stem + "-labels.png")
    img.save(dest)
    print(f"{dest}  (area {lab[5, 5]} is the background)")


def trace(mask, tmp):
    pbm = Path(tmp) / "m.pbm"
    svg = Path(tmp) / "m.svg"
    Image.fromarray(np.where(mask, 0, 255).astype(np.uint8)).convert("1").save(pbm)
    subprocess.run(
        ["potrace", str(pbm), "-s", "-o", str(svg), "--turdsize", "8", "--alphamax", "1.0", "--opttolerance", "0.4", "-u", "1"],
        check=True,
    )
    return " ".join(" ".join(d.split()) for d in re.findall(r'<path d="([^"]+)"', svg.read_text(), re.S))


def build(png, colours_json, name):
    spec = json.loads(Path(colours_json).read_text())
    ink, lab = areas(png)
    bg = lab[5, 5]
    clear = set(spec.get("clear", [])) | {bg}
    fill_of = {k: fill for fill, ks in spec.get("fills", {}).items() for k in ks}
    groups = {}
    for k in range(1, lab.max() + 1):
        if k not in clear:
            groups.setdefault(fill_of.get(k, PAPER), []).append(k)
    order = [PAPER] + [f for f in groups if f != PAPER] if PAPER in groups else list(groups)
    with tempfile.TemporaryDirectory() as tmp:
        # each wash reaches a little under the ink so no paper shows at the seams
        washes = [(f, trace(ndi.binary_dilation(np.isin(lab, groups[f]), iterations=4) & ~(lab == bg), tmp)) for f in order]
        lines = trace(ink, tmp)
    w, h = Image.open(png).size
    out = [f"export const {name}: Drawing = {{", f"  size: [{w}, {h}],", "  washes: ["]
    out += [f'    ["{f}", "{d}"],' for f, d in washes]
    out += ["  ],", f'  ink: "{lines}",', "  under: ["]
    out += [f'    ["{f}", {o}, "{d}"],' for f, o, d in spec.get("under", [])]
    out += ["  ],", "  cheeks: [" + ", ".join(f"[{x}, {y}]" for x, y in spec.get("cheeks", [])) + "],", "};"]
    print("\n".join(out))


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "label":
        label(sys.argv[2])
    elif len(sys.argv) == 5 and sys.argv[1] == "build":
        build(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        sys.exit(__doc__)
