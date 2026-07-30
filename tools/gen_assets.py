# Generate all original placeholder art for the build.
# Everything here is procedurally drawn. No external assets.
import math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = '/home/claude/work/ryderschilling-v2'
IMG = os.path.join(ROOT, 'assets', 'img')
os.makedirs(IMG, exist_ok=True)

YELLOW = (255, 255, 35)
BEIGE = (213, 207, 190)
INK = (12, 12, 10)

FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def grain(img, amount=8):
    w, h = img.size
    noise = Image.effect_noise((w, h), amount).convert('L')
    img = Image.composite(img, ImageOps.autocontrast(img), noise.point(lambda p: 0))
    return img


# ---------------------------------------------------------------- portrait ---
# Stylized figure placeholder: head + shoulders silhouette, studio-ish light.
def portrait():
    w, h = 1300, 1500
    im = Image.new('RGB', (w, h), BEIGE)
    d = ImageDraw.Draw(im)
    # soft vignette light behind figure
    glow = Image.new('L', (w, h), 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([w*0.15, h*0.02, w*0.85, h*0.75], fill=70)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    im = Image.composite(Image.new('RGB', (w, h), (228, 223, 208)), im, glow)
    d = ImageDraw.Draw(im)
    cx = w // 2
    dark = (38, 37, 33)
    darker = (24, 24, 21)
    skin = (150, 122, 96)
    skin_hi = (172, 143, 114)
    hair = (28, 26, 22)
    # torso (tee mass), wide, waist-up crop
    d.polygon([(cx-620, h), (cx-560, h*0.60), (cx-360, h*0.46), (cx-110, h*0.40),
               (cx+110, h*0.40), (cx+360, h*0.46), (cx+560, h*0.60), (cx+620, h)], fill=dark)
    # shoulder shading
    sh = Image.new('L', (w, h), 0)
    sd = ImageDraw.Draw(sh)
    sd.polygon([(cx-620, h), (cx-560, h*0.64), (cx-280, h*0.48), (cx-200, h), ], fill=90)
    sd.polygon([(cx+620, h), (cx+560, h*0.64), (cx+280, h*0.48), (cx+200, h), ], fill=90)
    sh = sh.filter(ImageFilter.GaussianBlur(70))
    im = Image.composite(Image.new('RGB', (w, h), darker), im, sh)
    d = ImageDraw.Draw(im)
    # neck
    d.rounded_rectangle([cx-95, h*0.30, cx+95, h*0.44], 70, fill=skin)
    # head
    d.rounded_rectangle([cx-195, h*0.045, cx+195, h*0.385], 165, fill=skin)
    # face light
    fl = Image.new('L', (w, h), 0)
    fd = ImageDraw.Draw(fl)
    fd.ellipse([cx-160, h*0.08, cx+80, h*0.33], fill=120)
    fl = fl.filter(ImageFilter.GaussianBlur(55))
    im = Image.composite(Image.new('RGB', (w, h), skin_hi), im, fl)
    d = ImageDraw.Draw(im)
    # hair block
    d.rounded_rectangle([cx-198, h*0.03, cx+198, h*0.155], 95, fill=hair)
    d.polygon([(cx-198, h*0.09), (cx-198, h*0.21), (cx-152, h*0.17), (cx-152, h*0.09)], fill=hair)
    d.polygon([(cx+198, h*0.09), (cx+198, h*0.21), (cx+152, h*0.17), (cx+152, h*0.09)], fill=hair)
    # ears
    d.ellipse([cx-222, h*0.17, cx-178, h*0.235], fill=skin)
    d.ellipse([cx+178, h*0.17, cx+222, h*0.235], fill=skin)
    im = im.filter(ImageFilter.GaussianBlur(2))
    im.save(os.path.join(IMG, 'portrait.jpg'), quality=88)


# --------------------------------------------------------------- work art ----
# Abstract dark project covers with device-frame suggestion.
PALETTES = [
    ((96, 78, 205), (30, 18, 64)),    # violet
    ((60, 64, 70), (18, 20, 24)),     # graphite
    ((196, 138, 84), (52, 30, 16)),   # amber
    ((70, 140, 120), (14, 38, 33)),   # jade
    ((160, 160, 150), (40, 40, 38)),  # stone
    ((196, 90, 74), (54, 20, 14)),    # clay
    ((84, 120, 190), (16, 26, 52)),   # cobalt
    ((150, 180, 90), (36, 46, 18)),   # olive
    ((190, 120, 160), (48, 22, 40)),  # orchid
]

def blob_field(d, w, h, base, seed):
    rnd = random.Random(seed)
    for i in range(26):
        x, y = rnd.uniform(-0.2, 1.1) * w, rnd.uniform(-0.2, 1.15) * h
        r = rnd.uniform(0.06, 0.30) * w
        c = tuple(min(255, max(0, int(v * rnd.uniform(0.55, 1.6)))) for v in base)
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)

def work_art(idx, name):
    w, h = 860, 1060
    hi, lo = PALETTES[idx % len(PALETTES)]
    im = Image.new('RGB', (w, h), lo)
    d = ImageDraw.Draw(im)
    blob_field(d, w, h, hi, seed=idx * 77 + 5)
    im = im.filter(ImageFilter.GaussianBlur(90))
    d = ImageDraw.Draw(im)
    # phone frame suggestion
    fw, fh = int(w*0.44), int(h*0.62)
    fx, fy = (w - fw)//2, int(h*0.16)
    d.rounded_rectangle([fx-6, fy-6, fx+fw+6, fy+fh+6], 54, fill=(10, 10, 10))
    d.rounded_rectangle([fx, fy, fx+fw, fy+fh], 48, fill=(22, 22, 22))
    # screen content lines
    rnd = random.Random(idx * 13 + 2)
    ty = fy + 60
    fnt = ImageFont.truetype(FONT_BOLD, 26)
    d.text((fx + 34, fy + 26), name, font=fnt, fill=(235, 235, 228))
    ty = fy + 96
    for i in range(7):
        lw = rnd.uniform(0.35, 0.8) * (fw - 68)
        col = (60, 60, 58) if i % 3 else tuple(int(v*0.9) for v in hi)
        d.rounded_rectangle([fx + 34, ty, fx + 34 + lw, ty + 14], 7, fill=col)
        ty += 34
    d.rounded_rectangle([fx + 34, fy + fh - 78, fx + 34 + 150, fy + fh - 34], 22, fill=YELLOW)
    im = grain(im)
    im.save(os.path.join(IMG, f'work-{idx+1}.jpg'), quality=86)


# -------------------------------------------------------------- trail art ----
def trail_tiles():
    for i in range(6):
        w, h = 460, 560
        hi, lo = PALETTES[(i * 2 + 1) % len(PALETTES)]
        im = Image.new('RGB', (w, h), lo)
        d = ImageDraw.Draw(im)
        blob_field(d, w, h, hi, seed=900 + i * 31)
        im = im.filter(ImageFilter.GaussianBlur(60))
        d = ImageDraw.Draw(im)
        rnd = random.Random(i * 7)
        for _ in range(3):
            x, y = rnd.uniform(0.1, 0.7)*w, rnd.uniform(0.1, 0.75)*h
            s = rnd.uniform(0.12, 0.3)*w
            d.rounded_rectangle([x, y, x+s, y+s*0.6], 18, outline=(240, 240, 230), width=6)
        im = grain(im)
        im.save(os.path.join(IMG, f'trail-{i+1}.jpg'), quality=84)


# --------------------------------------------------------------- avatars -----
def avatar(idx, bg, glyph, fg=INK):
    s = 240
    im = Image.new('RGB', (s, s), bg)
    d = ImageDraw.Draw(im)
    fnt = ImageFont.truetype(FONT_BOLD, 108)
    bb = d.textbbox((0, 0), glyph, font=fnt)
    d.text(((s-(bb[2]-bb[0]))/2 - bb[0], (s-(bb[3]-bb[1]))/2 - bb[1]), glyph, font=fnt, fill=fg)
    im.save(os.path.join(IMG, f'avatar-{idx}.png'))

def person_avatar(idx, tone, shirt):
    s = 240
    im = Image.new('RGB', (s, s), (222, 217, 202))
    d = ImageDraw.Draw(im)
    d.ellipse([s*0.30, s*0.16, s*0.70, s*0.56], fill=tone)
    d.rounded_rectangle([s*0.30, s*0.14, s*0.70, s*0.34], 40, fill=(30, 28, 24))
    d.polygon([(s*0.5, s*0.60), (s*0.16, s*1.0), (s*0.84, s*1.0)], fill=shirt)
    d.rounded_rectangle([s*0.20, s*0.62, s*0.80, s*1.0], 40, fill=shirt)
    im.save(os.path.join(IMG, f'person-{idx}.png'))


# --------------------------------------------------------------- favicons ----
def favicons():
    big = 2048
    im = Image.new('RGB', (big, big), YELLOW)
    d = ImageDraw.Draw(im)
    fnt = ImageFont.truetype(FONT_BOLD, 1350)
    bb = d.textbbox((0, 0), 'R', font=fnt)
    d.text(((big-(bb[2]-bb[0]))/2 - bb[0], (big-(bb[3]-bb[1]))/2 - bb[1] - 40), 'R', font=fnt, fill=(0, 0, 0))
    for size, name in [(32, 'favicon-32.png'), (192, 'favicon-192.png'), (512, 'favicon-512.png'), (180, 'apple-touch-icon.png')]:
        im.resize((size, size), Image.LANCZOS).save(os.path.join(ROOT, name))

    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#ffff23"/><text x="32" y="46" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" text-anchor="middle" fill="#000">R</text></svg>'''
    with open(os.path.join(ROOT, 'favicon.svg'), 'w') as f:
        f.write(svg)


NAMES = ['Solstice', 'Fieldnote', 'Harbor & Main', 'Driftline', 'Copperleaf',
         'Northbound', 'Tidewater', 'Summit Supply', 'Lantern Labs']

portrait()
for i, n in enumerate(NAMES):
    work_art(i, n)
trail_tiles()
# journey card avatar pairs (yellow glyph chips + person placeholders)
avatar(1, YELLOW, '✦')        # spark
avatar(2, (223, 222, 206), '▲', INK)
avatar(3, YELLOW, '→')
avatar(4, (223, 222, 206), '●', INK)
avatar(5, YELLOW, '⤡')
avatar(6, (223, 222, 206), '★', INK)
person_avatar(1, (150, 122, 96), (40, 38, 34))
person_avatar(2, (120, 96, 76), (60, 58, 80))
person_avatar(3, (166, 134, 104), (30, 44, 38))
person_avatar(4, (140, 110, 88), (70, 40, 30))
person_avatar(5, (156, 126, 98), (24, 24, 26))
person_avatar(6, (128, 102, 82), (44, 52, 60))
person_avatar(7, (148, 118, 92), (36, 30, 48))
favicons()
print('assets done:', len(os.listdir(IMG)), 'images')
