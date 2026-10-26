from pathlib import Path
from PIL import Image

USER_DATA = Path.home() / '.ydsz-worker/portable/packages/ydsz/dashboard'

print('最终验证 (.ydsz-worker 运行时):')
print('=' * 65)

print()
print('【吉祥物 (品牌绿 008055)】')
for f in ['ydsz-mascot-empty.png', 'ydsz-mascot-peek.webp', 'ydsz-mascot-type.webp', 'ydsz-mascot-tasks.png']:
    p = USER_DATA / f
    img = Image.open(p)
    colors = {}
    n = getattr(img, 'n_frames', 1)
    anim = getattr(img, 'is_animated', False)
    frm_range = min(n, 5) if anim else 1
    for i in range(frm_range):
        if anim:
            img.seek(i)
        w, h = img.size
        for y in range(0, h, 15):
            for x in range(0, w, 15):
                px = img.getpixel((x, y))
                if px[3] >= 128 and max(px[:3]) > 40:
                    key = (px[0] // 25 * 25, px[1] // 25 * 25, px[2] // 25 * 25)
                    colors[key] = colors.get(key, 0) + 1
    top = sorted(colors.items(), key=lambda v: -v[1])[0][0]
    brand = (top[0] <= 30 and 100 <= top[1] <= 160)
    mark = 'OK' if brand else '???'
    print(' [%s] %-30s top=RGB%s' % (mark, f, top))

print()
print('【Web 图标 (亮绿原始)】')
for f in ['apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png', 'favicon.ico']:
    p = USER_DATA / f
    if not p.exists():
        print(' [MISS] %s' % f)
        continue
    img = Image.open(p).convert('RGBA')
    colors = {}
    w, h = img.size
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            px = img.getpixel((x, y))
            if px[3] >= 128 and max(px[:3]) > 40:
                key = (px[0] // 25 * 25, px[1] // 25 * 25, px[2] // 25 * 25)
                colors[key] = colors.get(key, 0) + 1
    top = sorted(colors.items(), key=lambda v: -v[1])[0][0]
    mark = 'OK'
    print(' [%s] %-30s top=RGB%s' % (mark, f, top))

p = USER_DATA / 'ydsz-favico.svg'
t = p.read_text()
has_brand = '#008055' in t
has_old = '#2D9128' in t
mark = 'OK' if has_old and not has_brand else 'BRAND'
print(' [%s] ydsz-favico.svg              brand=%s old=%s' % (mark, has_brand, has_old))

print()
print('=' * 65)
print('请退出并重启桌面应用查看新颜色')
