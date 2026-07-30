# Turn live-site screenshots of Ryder's own projects into portrait card art.
from PIL import Image, ImageEnhance
import os

SRC = '/tmp/claude-chrome-screenshots-0lxI0P'
OUT = '/home/claude/work/ryderschilling-v2/assets/img'

# (source file, output index, horizontal anchor 0..1 for the crop window)
JOBS = [
    ('screenshot-1785256832236-0.jpg', 1, 0.5),    # NLH Media
    ('screenshot-1785257316273-12.jpg', 2, 0.10),  # Elias Collective (headline left)
    ('screenshot-1785257016495-4.jpg', 3, 0.5),    # Source A Trade
    ('screenshot-1785257035732-5.jpg', 4, 0.72),   # Found Community (phone right)
    ('screenshot-1785257242457-9.jpg', 5, 0.5),    # CHM
    ('screenshot-1785257165778-6.jpg', 6, 0.5),    # Fit Flour
    ('screenshot-1785257185781-7.jpg', 7, 0.5),    # HydroWild
]

TW, TH = 860, 1060
ratio = TW / TH

for src, idx, anchor in JOBS:
    im = Image.open(os.path.join(SRC, src)).convert('RGB')
    w, h = im.size
    cw = int(h * ratio)
    if cw > w:
        ch = int(w / ratio)
        cw = w
        y0 = 0
        x0 = 0
        im = im.crop((x0, y0, x0 + cw, y0 + ch))
    else:
        x0 = int((w - cw) * anchor)
        im = im.crop((x0, 0, x0 + cw, h))
    im = im.resize((TW, TH), Image.LANCZOS)
    im = ImageEnhance.Contrast(im).enhance(1.03)
    im.save(os.path.join(OUT, f'work-{idx}.jpg'), quality=88)
    print(f'work-{idx}.jpg from {src} ({w}x{h}, anchor {anchor})')

# remove now-unused generated slots 8 and 9
for n in (8, 9):
    p = os.path.join(OUT, f'work-{n}.jpg')
    if os.path.exists(p):
        os.remove(p)
        print(f'removed work-{n}.jpg')
print('done')
