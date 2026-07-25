"""
Regenerates public/og.jpg, the social preview image shared by every page.

    OG_LOGO=path/to/3d-tilted-logo.png python3 scripts/generate-og-image.py

Requires Pillow. The 3D render is not kept in the repo, so pass its location via
OG_LOGO or as the first argument. DISC below is fitted to that specific render
and needs refitting if the artwork is replaced.
"""

import os
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

W, H = 1200, 630
SS = 2
CYAN = (36, 229, 223)
VIOLET = (163, 29, 255)
INK = (11, 11, 13)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og.jpg"
LOGO = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("OG_LOGO", "")

FONT_CANDIDATES = [
    "/System/Library/Fonts/Avenir Next.ttc",
    "/System/Library/Fonts/Supplemental/Futura.ttc",
    "/Library/Fonts/Arial Bold.ttf",
]

WORDMARK = "EKCRON"
TAGLINE = "Train your own intelligence."


def radial(size, cx, cy, rx, ry, colour, peak):
    w, h = size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    steps = 46
    for i in range(steps, 0, -1):
        t = i / steps
        a = int(peak * 255 * (1 - t) ** 2.1)
        if a <= 0:
            continue
        d.ellipse([cx - rx * t, cy - ry * t, cx + rx * t, cy + ry * t], fill=a)
    mask = mask.filter(ImageFilter.GaussianBlur(w * 0.02))
    return Image.new("RGB", (w, h), colour), mask


def build_background():
    w, h = W * SS, H * SS
    bg = Image.new("RGB", (w, h), INK)

    grad = Image.new("L", (1, h))
    for y in range(h):
        grad.putpixel((0, y), int(24 * (1 - y / h) ** 1.4))
    bg = Image.composite(Image.new("RGB", (w, h), (58, 58, 74)), bg, grad.resize((w, h)))

    for cx, cy, rx, ry, colour, peak in [
        (w * 0.04, h * 0.02, w * 0.58, h * 0.82, CYAN, 0.26),
        (w * 0.70, h * 0.95, w * 0.58, h * 0.72, VIOLET, 0.26),
    ]:
        layer, mask = radial((w, h), cx, cy, rx, ry, colour, peak)
        bg = Image.composite(layer, bg, mask)

    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    cell = 56 * SS
    for x in range(0, w, cell):
        gd.line([(x, 0), (x, h)], fill=(255, 255, 255, 9), width=SS)
    for y in range(0, h, cell):
        gd.line([(0, y), (w, y)], fill=(255, 255, 255, 9), width=SS)
    bg = Image.alpha_composite(bg.convert("RGBA"), grid).convert("RGB")

    vig = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vig)
    for i in range(40):
        t = i / 40
        vd.rectangle(
            [w * 0.5 * (1 - t), h * 0.5 * (1 - t), w - w * 0.5 * (1 - t), h - h * 0.5 * (1 - t)],
            outline=int(140 * t**2.4),
            width=int(w * 0.02),
        )
    vig = vig.filter(ImageFilter.GaussianBlur(w * 0.03))
    bg = Image.composite(Image.new("RGB", (w, h), (0, 0, 0)), bg, vig)

    return bg.resize((W, H), Image.LANCZOS)


# The tilted disc is a circle under shear. Fitted to the render's own rim: it
# tracks the measured edge within ~4px, which a plain ellipse cannot do.
DISC = {"xc": 717, "yc": 503, "r": 396, "shear": 0.1437, "grow": 9}


def coin_layer():
    """A luminance key cannot work here: the disc's shadow is darker than the
    render's backdrop glow. The disc is masked geometrically instead."""
    src = Image.open(LOGO).convert("RGB")

    mask = Image.new("L", src.size, 0)
    md = ImageDraw.Draw(mask)
    r = DISC["r"] + DISC["grow"]
    for y in range(max(0, DISC["yc"] - r), min(src.height, DISC["yc"] + r + 1)):
        dy = y - DISC["yc"]
        half = (r * r - dy * dy) ** 0.5
        centre = DISC["xc"] + DISC["shear"] * dy
        md.line([(centre - half, y), (centre + half, y)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(1.4))

    box = mask.getbbox()
    coin = src.crop(box)
    coin = ImageEnhance.Brightness(coin).enhance(1.14)
    coin = ImageEnhance.Contrast(coin).enhance(1.05)
    coin.putalpha(mask.crop(box))

    target_h = int(H * 0.78)
    scale = target_h / coin.height
    return coin.resize((int(coin.width * scale), target_h), Image.LANCZOS)


def place_coin(canvas):
    coin = coin_layer()
    cx, cy = int(W * 0.745), int(H * 0.5)
    x = cx - coin.width // 2
    y = cy - coin.height // 2

    for colour, peak, rx in ((VIOLET, 0.20, 0.70), (CYAN, 0.12, 0.46)):
        layer, mask = radial((W, H), cx, cy, coin.width * rx, coin.height * rx, colour, peak)
        canvas = Image.composite(layer, canvas, mask)

    base = canvas.convert("RGBA")
    top = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    top.paste(coin, (x, y), coin)
    return Image.alpha_composite(base, top).convert("RGB")


def tracked(draw, xy, text, font, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking


def pick_font():
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            return path
    sys.exit("No usable font found. Add one to FONT_CANDIDATES.")


def main():
    if not LOGO or not Path(LOGO).exists():
        sys.exit(
            "Source render not found. Pass it as the first argument or set OG_LOGO,\n"
            "pointing at the 3D tilted logo PNG."
        )

    font_path = pick_font()
    canvas = place_coin(build_background())
    draw = ImageDraw.Draw(canvas)

    left = 86
    wordmark = ImageFont.truetype(font_path, 92, index=0)
    tag = ImageFont.truetype(font_path, 31, index=5)

    rule_y = 268
    for i in range(300):
        t = i / 299
        draw.rectangle(
            [left + i, rule_y, left + i + 1, rule_y + 3],
            fill=tuple(int(CYAN[k] + (VIOLET[k] - CYAN[k]) * t) for k in range(3)),
        )

    tracked(draw, (left, rule_y + 40), WORDMARK, wordmark, (255, 255, 255), 7)
    draw.text((left + 2, rule_y + 168), TAGLINE, font=tag, fill=(176, 176, 188))

    canvas.save(OUT, "JPEG", quality=90, optimize=True, progressive=True)
    print("wrote", OUT, canvas.size)


main()
