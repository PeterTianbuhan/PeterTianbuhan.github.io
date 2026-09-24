"""Cut a generated asset out of its background and ready it for the poster.

  art/life/raw/assets/<name>.png  ->  art/life/assets/<name>.webp  (RGBA, 2x, trimmed)

If Codex already returned transparency, that alpha is kept. Otherwise the
anime-tuned IS-Net matting model finds the subject, and the white the
background left in the soft edges is taken back out.

Usage: python3 scripts/cutout-life-asset.py boya-pagoda [--keep-bg] [more names...]
  --keep-bg  for full-bleed pieces (the sky) that need no cutting out
"""

import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

HOME = os.path.expanduser("~")
ESRGAN = f"{HOME}/.local/share/realesrgan/realesrgan-ncnn-vulkan"
MATTE = f"{HOME}/.local/share/depth/isnet-anime.onnx"


def upscale(rgb: Image.Image) -> Image.Image:
    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "in.png")
        out = os.path.join(tmp, "x4.png")
        rgb.save(src)
        subprocess.run(
            [ESRGAN, "-i", src, "-o", out, "-n", "realesrgan-x4plus-anime"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            cwd=os.path.dirname(ESRGAN),
        )
        img = Image.open(out).convert("RGB")
        img.load()
    return img.resize((rgb.width * 2, rgb.height * 2), Image.LANCZOS)


def matte(rgb: Image.Image) -> np.ndarray:
    import onnxruntime as ort

    session = ort.InferenceSession(MATTE, providers=["CPUExecutionProvider"])
    x = np.asarray(rgb.resize((1024, 1024), Image.LANCZOS)).astype(np.float32) / 255
    x = (x - [0.485, 0.456, 0.406]) / [1.0, 1.0, 1.0]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    pred = session.run(None, {session.get_inputs()[0].name: x})[0][0, 0]
    pred = (pred - pred.min()) / (pred.max() - pred.min() + 1e-6)
    alpha = Image.fromarray((pred * 255).astype(np.uint8)).resize(rgb.size, Image.BICUBIC)
    a = np.asarray(alpha).astype(np.float32) / 255
    # firm up the matte: near-solid inside, clean falloff at the edge
    return np.clip((a - 0.08) / 0.84, 0, 1)


def unwhiten(rgb: np.ndarray, a: np.ndarray) -> np.ndarray:
    # C = aF + (1-a)W  ->  F = (C - (1-a)W) / a, only where the edge is soft
    soft = (a > 0.02) & (a < 0.98)
    f = rgb.copy()
    aa = a[..., None]
    f[soft] = np.clip((rgb[soft] - (1 - aa[soft]) * 1.0) / np.maximum(aa[soft], 0.05), 0, 1)
    return f


def process(name: str, keep_bg: bool):
    raw = Image.open(f"art/life/raw/assets/{name}.png")
    rgb = raw.convert("RGB")
    matted = False
    if keep_bg:
        a = np.ones((raw.height, raw.width), np.float32)
    elif raw.mode in ("RGBA", "LA") and np.asarray(raw.getchannel("A")).min() < 250:
        a = np.asarray(raw.getchannel("A")).astype(np.float32) / 255
    else:
        a = matte(rgb)
        matted = True

    big = np.asarray(upscale(rgb)).astype(np.float32) / 255
    a_big = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((big.shape[1], big.shape[0]), Image.BICUBIC)).astype(np.float32) / 255
    if matted:
        big = unwhiten(big, a_big)

    out = np.dstack([big, a_big])
    img = Image.fromarray((out * 255 + 0.5).astype(np.uint8))
    if not keep_bg:
        box = Image.fromarray((a_big > 0.02).astype(np.uint8) * 255).getbbox()
        if box:
            pad = 8
            img = img.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(img.width, box[2] + pad), min(img.height, box[3] + pad)))
    os.makedirs("art/life/assets", exist_ok=True)
    path = f"art/life/assets/{name}.webp"
    img.save(path, quality=88, method=6)
    print(f"{name}: {img.width}x{img.height}, {os.path.getsize(path) / 1e6:.2f} MB")


if __name__ == "__main__":
    args = sys.argv[1:]
    keep = "--keep-bg" in args
    for n in [a for a in args if not a.startswith("--")]:
        process(n, keep)
