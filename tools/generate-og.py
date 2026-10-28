#!/usr/bin/env python3
"""Regenerate the Strata social card, favicon, and touch icon.

Run from hub/:
    python3 tools/generate-og.py
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "landing" / "assets"

FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
BOLD = FONT_DIR / "DejaVuSans-Bold.ttf"
REG = FONT_DIR / "DejaVuSans.ttf"
MONO = FONT_DIR / "DejaVuSansMono.ttf"

BG = "#060a14"
INK = "#e5ecf4"
MUTED = "#9bb0cf"
FAINT = "#7d8fa6"
CYAN = "#00ade4"
CYAN_LIGHT = "#7dd3f0"
CYAN_DARK = "#0091bf"
GREEN = "#00c369"
AMBER = "#fcb519"
VIOLET = "#8b7cf6"


def tracked(draw: ImageDraw.ImageDraw, xy, text: str, font, fill, tracking: int = 0):
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=font, fill=fill)
        x += draw.textlength(char, font=font) + tracking
    return x


def hexagon(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float, color, width: int = 2):
    points = []
    for i in range(6):
        angle = math.radians(60 * i - 90)
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.line(points + [points[0]], fill=color, width=width, joint="curve")
    top = points[0]
    left = points[4]
    right = points[5]
    mid = (cx, cy + r * 0.5)
    draw.line([left, (cx, cy), right], fill=color, width=width)
    draw.line([(cx, cy), (cx, cy + r)], fill=color, width=width)
    return points


def gradient_text(base: Image.Image, xy, text, font, top_color, bottom_color):
    d = ImageDraw.Draw(base)
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    mask = Image.new("L", (tw + 8, th + 20), 0)
    ImageDraw.Draw(mask).text((4 - bbox[0], 10 - bbox[1]), text, font=font, fill=255)

    grad = Image.new("RGB", (tw + 8, th + 20))
    for gy in range(th + 20):
        t = gy / max(1, th + 19)
        rgb = tuple(int(a + (b - a) * t) for a, b in zip(top_color, bottom_color))
        for gx in range(tw + 8):
            grad.putpixel((gx, gy), rgb)
    base.paste(grad, xy, mask)


def build_og() -> Image.Image:
    img = Image.new("RGB", (W, H), BG)

    glow = Image.new("RGB", (W, H), BG)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((720, -340, 1500, 440), fill=(0, 44, 68))
    gd.ellipse((-300, 320, 460, 1020), fill=(0, 32, 26))
    gd.ellipse((380, 420, 1200, 1000), fill=(22, 18, 52))
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    img = Image.blend(img, glow, 0.8)

    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdd = ImageDraw.Draw(grid)
    for x in range(0, W, 72):
        gdd.line([(x, 0), (x, H)], fill=(148, 163, 184, 13), width=1)
    for y in range(0, H, 72):
        gdd.line([(0, y), (W, y)], fill=(148, 163, 184, 13), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), grid).convert("RGB")

    orbit = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(orbit)
    for radius, alpha in ((285, 42), (375, 26), (465, 15)):
        od.ellipse(
            (990 - radius, 300 - radius, 990 + radius, 300 + radius),
            outline=(0, 173, 228, alpha),
            width=1,
        )
    angle = math.radians(-56)
    dx = 990 + 285 * math.cos(angle)
    dy = 300 + 285 * math.sin(angle)
    od.ellipse((dx - 4, dy - 4, dx + 4, dy + 4), fill=(0, 195, 105, 230))
    img = Image.alpha_composite(img.convert("RGBA"), orbit).convert("RGB")

    d = ImageDraw.Draw(img)
    hexagon(d, 84, 68, 20, (0, 173, 228), 2)

    f_kicker = ImageFont.truetype(MONO, 17)
    f_tiny = ImageFont.truetype(MONO, 13)
    tracked(d, (118, 54), "STRATA", f_kicker, INK, 4)
    tracked(d, (118, 78), "/ OSS", f_tiny, MUTED, 2)

    f_title = ImageFont.truetype(BOLD, 88)
    d.text((78, 196), "The whole stack.", font=f_title, fill=INK)
    gradient_text(img, (78, 308), "One surface.", f_title, (125, 211, 240), (139, 124, 246))

    d = ImageDraw.Draw(img)
    f_sub = ImageFont.truetype(REG, 28)
    d.text((80, 424), "MonoFS stores it. Guardian ships it. Doctor sees it. Agent answers it.", font=f_sub, fill=MUTED)

    f_note = ImageFont.truetype(MONO, 18)
    tracked(d, (80, 466), "OPEN SOURCE · SELF-HOSTED · BUILT BY @RADRYC", f_note, FAINT, 1)

    d.line([(80, 506), (1120, 506)], fill=(255, 255, 255, 30), width=1)
    f_small = ImageFont.truetype(MONO, 15)
    tracked(d, (80, 534), "STRATASRE.COM", f_small, CYAN, 2)

    chips = (("MONOFS", GREEN), ("GUARDIAN", CYAN), ("DOCTOR", AMBER), ("AGENT", VIOLET))
    widths = [d.textlength(label, font=f_tiny) + 26 for label, _ in chips]
    x = 1120 - (sum(widths) + 9 * (len(chips) - 1))
    for (label, color), width in zip(chips, widths):
        d.rounded_rectangle((x, 528, x + width, 558), radius=15, outline=(255, 255, 255, 42), width=1)
        d.text((x + 13, 535), label, font=f_tiny, fill=color)
        x += width + 9

    for x1, y1, x2, y2 in (
        (40, 40, 40, 70),
        (40, 40, 70, 40),
        (1160, 590, 1160, 560),
        (1160, 590, 1130, 590),
    ):
        d.line([(x1, y1), (x2, y2)], fill=(0, 173, 228, 90), width=1)

    return img


def build_icon(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=BG, outline="#14243a", width=2)
    hexagon(d, size / 2, size / 2, size * 0.29, (0, 173, 228), max(2, size // 60))
    return img


FAVICON = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#060a14"/>
  <g fill="none" stroke="#00ade4" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M32 9 53 21v22L32 55 11 43V21L32 9Z"/>
    <path d="m11 21 21 12 21-12M32 33v22"/>
  </g>
  <circle cx="53" cy="21" r="3" fill="#00c369"/>
</svg>
"""


if __name__ == "__main__":
    ASSETS.mkdir(parents=True, exist_ok=True)
    build_og().save(ASSETS / "og.png", optimize=True)
    build_icon(180).save(ASSETS / "icon-180.png", optimize=True)
    (ASSETS / "favicon.svg").write_text(FAVICON, encoding="utf-8")
    print("wrote og.png, icon-180.png, favicon.svg")
