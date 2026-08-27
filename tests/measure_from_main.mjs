// 把 main.js 里【纯计算】的那几个函数抠出来,在 Node 里跑一遍真正的盒计数。
//
// 为什么要这样做而不是把数字抄进测试里:README 的头号数字(Cantor 尘真值 1.2619、
// 混合尺度族下测得 0.9427、偏差 0.3192)是页面**运行时算出来的**。把它们硬编码进
// 测试,测的就只是"我抄得对不对",而不是"页面还算不算得出这个数"。改了 boxCount
// 或 SCALE_FAMILIES 而忘了改 README,硬编码的测试一声不吭。
//
// 抠取靠函数名 + 花括号配对,不靠行号(行号会随每次编辑漂移)。抠不到就抛错,
// 不静默跳过 —— 一个抠不到东西的检查不是通过的检查。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'main.js'), 'utf8');

/** 从源码里取出 `function NAME(...) { ... }` 的完整定义,按花括号配对。 */
function grabFunction(src, name) {
  const head = new RegExp(`function\\s+${name}\\s*\\(`);
  const m = head.exec(src);
  if (!m) throw new Error(`main.js 里找不到 function ${name}`);
  let i = src.indexOf('{', m.index);
  if (i < 0) throw new Error(`function ${name} 后面没有函数体`);
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(m.index, j + 1);
    }
  }
  throw new Error(`function ${name} 的花括号没有闭合`);
}

/** 取出 `const NAME = {...};` 这样的字面量常量。 */
function grabObject(src, name) {
  const head = new RegExp(`const\\s+${name}\\s*=\\s*\\{`);
  const m = head.exec(src);
  if (!m) throw new Error(`main.js 里找不到 const ${name}`);
  let i = src.indexOf('{', m.index);
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(m.index, j + 1) + ';';
    }
  }
  throw new Error(`const ${name} 的花括号没有闭合`);
}

function grabConst(src, name) {
  const m = new RegExp(`const\\s+${name}\\s*=\\s*([^;]+);`).exec(src);
  if (!m) throw new Error(`main.js 里找不到 const ${name}`);
  return `const ${name} = ${m[1]};`;
}

const pieces = [
  grabConst(SRC, 'GRID_N'),
  grabObject(SRC, 'SCALE_FAMILIES'),
  grabObject(SRC, 'SET_DEFS'),
  grabFunction(SRC, 'buildSet'),
  grabFunction(SRC, 'boxCount'),
  grabFunction(SRC, 'lsq'),
  grabFunction(SRC, 'measure'),
];

const mod = await import(
  'data:text/javascript,' +
  encodeURIComponent(pieces.join('\n\n') +
    '\nexport { GRID_N, SCALE_FAMILIES, SET_DEFS, buildSet, boxCount, lsq, measure };')
);

export const { GRID_N, SCALE_FAMILIES, SET_DEFS, buildSet, boxCount, lsq, measure } = mod;

/** 在给定尺度族下量一个集合,返回 README 引用的那几个量。 */
export function measureSet(setName, family) {
  const occ = buildSet(setName);
  const r = measure(occ, GRID_N, SCALE_FAMILIES[family]);
  const truth = SET_DEFS[setName].truth;
  // lsq 返回的斜率字段叫 b,标准误叫 seB —— 不是 slope/se。
  return { truth, slope: r.b, bias: r.b - truth, r2: r.r2, se: r.seB, pts: r.pts.length };
}
