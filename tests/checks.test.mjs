// 把 README 摁在代码上。
//
// 这个仓的 README 报了一串具体数字 —— Cantor 尘真值 1.2619、混合尺度族下测得
// 0.9427、偏差 0.3192、角隙 N=640 约 5°、three@0.160.0。它们全部来自 main.js
// 或 index.html,而在此之前没有任何东西保证它们还对得上:改了 boxCount、换了
// 尺度族、升了 three 的版本,README 不会有任何反应。
//
// 所以每条检查都是【从 README 里解析出那个数】+【从代码里算出/读出那个数】,
// 两边比。哪一边动了都会失败,这才是它存在的意义。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { measureSet } from './measure_from_main.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const README = readFileSync(join(ROOT, 'README.md'), 'utf8');
const INDEX = readFileSync(join(ROOT, 'index.html'), 'utf8');
const MAIN = readFileSync(join(ROOT, 'main.js'), 'utf8');

/** 从 README 里抓一个数;抓不到就失败,而不是悄悄跳过。 */
function fromReadme(re, what) {
  const m = re.exec(README);
  assert.ok(m, `README 里再也找不到${what}了 —— 是删掉了还是改了写法?`);
  return parseFloat(m[1]);
}

test('README 报的 Cantor 尘真值 = 代码里算出来的 log4/log3', () => {
  const said = fromReadme(/真值\s*log4\/log3\s*=\s*([0-9.]+)/, 'Cantor 尘的真值');
  const got = measureSet('cantor', 'p3').truth;
  assert.ok(Math.abs(said - got) < 5e-5, `README 写 ${said},代码算出 ${got.toFixed(4)}`);
});

test('README 报的测量值 0.9427,是混合尺度族下真跑一遍盒计数得到的', () => {
  const said = fromReadme(/在一组与它不共格的尺度上测出\s*([0-9.]+)/, '混合尺度族下的测量值');
  const got = measureSet('cantor', 'mixed').slope;
  assert.ok(Math.abs(said - got) < 5e-5,
    `README 写 ${said},盒计数算出 ${got.toFixed(4)} —— 改了 boxCount 或 SCALE_FAMILIES 就会这样`);
});

test('README 报的偏差 0.3192 = 测量值与真值之差', () => {
  const said = fromReadme(/偏差\s*([0-9.]+)<\/strong>/, '偏差');
  const r = measureSet('cantor', 'mixed');
  assert.ok(Math.abs(said - Math.abs(r.bias)) < 5e-5,
    `README 写 ${said},实算 ${Math.abs(r.bias).toFixed(4)}`);
});

test('共格尺度族下测量值确实吻合真值到小数点后四位', () => {
  // README 正文的那句"网格边长取 3 的幂时测得 1.2619(与真值吻合到小数点后四位)"。
  const r = measureSet('cantor', 'p3');
  assert.ok(Math.abs(r.bias) < 5e-5, `3 的幂下偏差应≈0,实为 ${r.bias.toFixed(6)}`);
});

test('README 说的 three 版本 = index.html 里真正加载的那个', () => {
  const said = /three@([0-9]+\.[0-9]+\.[0-9]+)/.exec(README);
  assert.ok(said, 'README 里找不到 three 的版本号');
  const used = [...INDEX.matchAll(/three@([0-9]+\.[0-9]+\.[0-9]+)/g)].map(m => m[1]);
  assert.ok(used.length > 0, 'index.html 里找不到 three 的版本号');
  for (const v of new Set(used)) {
    assert.equal(v, said[1], `README 写 three@${said[1]},index.html 实际加载 three@${v}`);
  }
});

test('README 说的角隙数字,来自 main.js 里记录的离线实测', () => {
  // main.js:  N=40  Fib 20.66° vs 随机 32.20°;  N=640  Fib 5.22° vs 随机 9.54°
  const m = /N=640\s+Fib\s+([0-9.]+)°\s*vs\s*随机\s*([0-9.]+)°/.exec(MAIN);
  assert.ok(m, 'main.js 里记录角隙实测值的那行注释不见了');
  const fib = parseFloat(m[1]), rnd = parseFloat(m[2]);
  const saidDeg = fromReadme(/N=640 时还有约\s*([0-9.]+)°/, 'N=640 的角隙');
  assert.ok(Math.abs(saidDeg - fib) < 0.5, `README 说约 ${saidDeg}°,实测 ${fib}°`);

  const cut = 1 - fib / rnd;                       // Fibonacci 相对随机的降幅
  const range = /小\s*([0-9]+)–([0-9]+)%/.exec(README);
  assert.ok(range, 'README 里找不到"比随机采样小 X–Y%"这句');
  const lo = +range[1] / 100, hi = +range[2] / 100;
  assert.ok(cut >= lo - 0.01 && cut <= hi + 0.01,
    `N=640 的降幅 ${(cut * 100).toFixed(1)}% 落在 README 说的 ${range[1]}–${range[2]}% 之外`);
});

test('每一张图都有非空的 alt 文本', () => {
  const bad = [];
  for (const [name, text] of [['README.md', README], ['index.html', INDEX]]) {
    for (const m of text.matchAll(/<img\s[^>]*>/g)) {
      const src = /src="([^"]+)"/.exec(m[0]);
      const alt = /alt="([^"]*)"/.exec(m[0]);
      if (src && !(alt && alt[1].trim())) bad.push(`${name}: ${src[1]}`);
    }
    for (const m of text.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
      if (!m[1].trim()) bad.push(`${name}: ${m[2]}`);
    }
  }
  assert.deepEqual(bad, [], `这些图没有 alt 文本,读屏软件和加载失败时都是一片空白:\n  ${bad.join('\n  ')}`);
});

test('仓内引用的每个文件都真的存在', () => {
  const bad = [];
  let n = 0;
  for (const [name, text] of [['README.md', README], ['index.html', INDEX]]) {
    const re = /\[[^\]]*\]\(([^)]+)\)|(?:src|href)="([^"]+)"/g;
    for (const m of text.matchAll(re)) {
      const t = (m[1] || m[2] || '').split('#')[0].split('?')[0].trim();
      if (!t || /^(https?:|mailto:|data:|javascript:|\/\/)/.test(t)) continue;
      n++;
      if (!existsSync(join(ROOT, t))) bad.push(`${name} -> ${t}`);
    }
  }
  assert.ok(n >= 3, `只检查到 ${n} 个仓内引用,少得可疑 —— 是正则失配了吗`);
  assert.deepEqual(bad, [], `失效引用:\n  ${bad.join('\n  ')}`);
});

test('main.js 与 social_card.py 能被各自的解析器读通', () => {
  // 只查语法,不执行 —— 页面代码依赖 DOM,在 Node 里跑不起来。
  //
  // 这条检查的第一版写的是"文件必须以 } 结尾",一跑就失败了:main.js 结尾是
  // `});`。那是我凭想当然编的判据,不是真的语法检查。真的语法检查长这样。
  assert.ok(MAIN.length > 1000, 'main.js 小得可疑');
  const js = spawnSync(process.execPath, ['--check', join(ROOT, 'main.js')], { encoding: 'utf8' });
  assert.equal(js.status, 0, `main.js 语法错误:\n${js.stderr}`);

  const py = spawnSync('python3', ['-m', 'py_compile', join(ROOT, 'docs', 'social_card.py')],
                       { encoding: 'utf8' });
  if (py.error && py.error.code === 'ENOENT') return;   // 没有 python3 就跳过这半条
  assert.equal(py.status, 0, `social_card.py 语法错误:\n${py.stderr}`);
});

test('package.json 里声明的依赖没有被提交进仓库', () => {
  // 这个仓曾经把 node_modules 和 dist 提交进历史(186 个文件, 占了 .git 的 91%),
  // 2026-08-27 改写历史清掉。.gitignore 是防它再进来的那道闸。
  const ig = readFileSync(join(ROOT, '.gitignore'), 'utf8');
  for (const d of ['node_modules', 'dist']) {
    assert.ok(new RegExp(`^${d}/?$`, 'm').test(ig), `.gitignore 里没有排除 ${d}`);
    assert.ok(!existsSync(join(ROOT, d, '.git')), `${d} 不该是个仓库`);
  }
});

test('README 说的检查条数 = 实际跑起来的条数', () => {
  // 这一页刚刚多了一句"tests/ 里的 N 项检查"。N 是散文,散文会漂。
  // 不手工重建这个数(在 worldmodel-from-scratch 里,"这个文件有两个参数化测试,
  // 所以减二再加两倍文档数"那种算式正是 CI 变红的根因),而是真跑一遍数。
  // 护栏:内层那次运行会把这条检查直接跳过,否则会无限递归。
  if (process.env.KAKEYA_COUNT_GUARD) return;
  // NODE_TEST_CONTEXT 必须剔掉:node:test 会设它,子进程继承到之后会改用另一套
  // 输出通道,于是 TAP 里那行 `# tests N` 根本不出现 —— 这条检查第一次就是这样
  // 失败的,而它报的是"数不出来",不是"数字不对",这个区别正是它该说清楚的。
  const env = { ...process.env, KAKEYA_COUNT_GUARD: '1' };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', join(ROOT, 'tests')],
    { encoding: 'utf8', env });
  const m = /^# tests (\d+)$/m.exec(r.stdout ?? '');
  assert.ok(m, `数不出来实际有多少条检查:\n${(r.stdout ?? '').slice(-400)}`);
  const said = fromReadme(/`tests\/` 里的\s*(\d+)\s*项检查/, 'README 里说的检查条数');
  assert.equal(said, Number(m[1]), `README 说 ${said} 项,实际跑起来 ${m[1]} 项`);
});
