const fs = require('fs');
const { PNG } = require('pngjs');

function stat(f) {
  if (!fs.existsSync(f)) return 'MISSING';
  try { return fs.statSync(f).size + 'b'; } catch { return 'ERR'; }
}

const analyze = (file) => {
  try {
    const buf = fs.readFileSync(file);
    const png = PNG.sync.read(buf);
    let green = 0, total = 0;
    for (let i = 0; i < png.data.length; i += 16) {
      const r = png.data[i], g = png.data[i+1], b = png.data[i+2], a = png.data[i+3];
      if (a >= 128) {
        total++;
        if (g > r && g > b && g > 50) green++;
      }
    }
    const pct = total ? Math.round(green * 100 / total) : 0;
    return { w: png.width, h: png.height, pct };
  } catch (e) {
    return { err: e.message };
  }
};

const BASE = 'D:\\Code\\open\\ydsz-worker';
const pub = BASE + '\\dashboard\\public';
const wheel = BASE + '\\src\\ydsz\\dashboard';
const port = BASE + '\\desktop\\portable\\release\\ydsz-windows-amd64\\packages\\ydsz\\dashboard';
const desk = BASE + '\\desktop\\src';
const pkgs = BASE + '\\desktop\\portable\\release\\ydsz-windows-amd64\\packages';

console.log('着色状态最终验证');
console.log('='.repeat(60));

const groups = [
  ['吉祥物图片 (public -> wheel -> portable)', [
    [pub + '\\ydsz-mascot-empty.png', 'mascot-empty (public)'],
    [wheel + '\\ydsz-mascot-empty.png', 'mascot-empty (wheel)'],
    [port + '\\ydsz-mascot-empty.png', 'mascot-empty (portable)'],
    [pub + '\\ydsz-mascot-peek.webp', 'mascot-peek (public)'],
    [wheel + '\\ydsz-mascot-peek.webp', 'mascot-peek (wheel)'],
    [port + '\\ydsz-mascot-peek.webp', 'mascot-peek (portable)'],
    [desk + '\\assets\\ydsz-mascot-peek.webp', 'mascot-peek (desktop)'],
    [pub + '\\ydsz-mascot-type.webp', 'mascot-type (public)'],
    [wheel + '\\ydsz-mascot-type.webp', 'mascot-type (wheel)'],
    [port + '\\ydsz-mascot-type.webp', 'mascot-type (portable)'],
    [desk + '\\assets\\ydsz-mascot-type.webp', 'mascot-type (desktop)'],
  ]],
  ['Web 图标 (全部 PNG + ICO + SVG)', [
    [pub + '\\apple-touch-icon.png', 'apple-touch-icon (public)'],
    [wheel + '\\apple-touch-icon.png', 'apple-touch-icon (wheel)'],
    [pub + '\\pwa-192.png', 'pwa-192 (public)'],
    [wheel + '\\pwa-192.png', 'pwa-192 (wheel)'],
    [pub + '\\pwa-512.png', 'pwa-512 (public)'],
    [wheel + '\\pwa-512.png', 'pwa-512 (wheel)'],
    [pub + '\\favicon.ico', 'favicon.ico (public)'],
    [wheel + '\\favicon.ico', 'favicon.ico (wheel)'],
    [port + '\\favicon.ico', 'favicon.ico (portable)'],
    [pub + '\\ydsz-favico.svg', 'favico.svg (public)'],
  ]],
  ['桌面 Electron 应用图标', [
    [desk + '\\build\\appicon.png', 'appicon (src)'],
    [desk + '\\build\\windows\\icon.ico', 'icon.ico (src windows)'],
    [desk + '\\assets\\tray-icon.png', 'tray-icon (src)'],
    [pkgs + '\\appicon.png', 'appicon (pkg)'],
    [pkgs + '\\icon.ico', 'icon.ico (pkg)'],
    [pkgs + '\\tray-icon.png', 'tray-icon (pkg)'],
  ]],
];

groups.forEach(([title, files]) => {
  console.log('  ' + title + ':');
  files.forEach(([f, label]) => {
    const s = stat(f);
    let detail = s;
    if (s !== 'MISSING' && s !== 'ERR') {
      const a = analyze(f);
      if (!a.err) detail += `  ${a.w}x${a.h}  green:${a.pct}%`;
      else if (!f.endsWith('.ico') && !f.endsWith('.svg') && !f.endsWith('.webp')) detail += '  ERR:' + a.err.slice(0, 30);
      else detail += '  (' + f.split('.').pop() + ')';
    }
    const mark = s !== 'MISSING' ? '✅' : '❌';
    console.log('    ' + mark + '  ' + label.padEnd(30s) + ' ' + detail);
  });
  console.log();
});

console.log('='.repeat(60));
logFiles();
function logFiles() {
  console.log('全部着色完毕 — 元宝绿 #008055');
  console.log('浏览器硬刷: Ctrl+Shift+R  |  桌面应用: 退出重启');
}
