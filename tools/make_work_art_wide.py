# Full-frame landscape card art from the live-site captures (Ryder's own projects).
from PIL import Image, ImageEnhance
import os

SRC = '/tmp/claude-chrome-screenshots-0lxI0P'
OUT = '/home/claude/work/ryderschilling-v2/assets/img'

JOBS = [
    ('screenshot-1785256832236-0.jpg', 1),   # NLH Media
    ('screenshot-1785257316273-12.jpg', 2),  # Elias Collective
    ('screenshot-1785257016495-4.jpg', 3),   # Source A Trade
    ('screenshot-1785257035732-5.jpg', 4),   # Found Community
    ('screenshot-1785257242457-9.jpg', 5),   # CHM
    ('screenshot-1785257165778-6.jpg', 6),   # Fit Flour
    ('screenshot-1785257185781-7.jpg', 7),   # HydroWild
]

for src, idx in JOBS:
    im = Image.open(os.path.join(SRC, src)).convert('RGB')
    w, h = im.size
    nw = 1440
    nh = int(h * nw / w)
    im = im.resize((nw, nh), Image.LANCZOS)
    im = ImageEnhance.Contrast(im).enhance(1.02)
    im.save(os.path.join(OUT, f'work-{idx}.jpg'), quality=86)
    print(f'work-{idx}.jpg {nw}x{nh} from {src}')
print('done')
