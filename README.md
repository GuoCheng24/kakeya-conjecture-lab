# 挂谷猜想实验室 · Kakeya Conjecture Lab

[![checks](https://github.com/GuoCheng24/kakeya-conjecture-lab/actions/workflows/test.yml/badge.svg)](https://github.com/GuoCheng24/kakeya-conjecture-lab/actions/workflows/test.yml) [![citations](https://github.com/GuoCheng24/kakeya-conjecture-lab/actions/workflows/citations.yml/badge.svg)](https://github.com/GuoCheng24/kakeya-conjecture-lab/actions/workflows/citations.yml) [![license](https://img.shields.io/badge/code-MIT-green)](LICENSE) [![text](https://img.shields.io/badge/text%20%26%20figures-CC%20BY%204.0-blue)](https://creativecommons.org/licenses/by/4.0/)

**一根单位长度的针,能否在测度为零的集合里指向所有方向?** 1917 年的一个转针问题,2026 年因它颁出一枚菲尔兹奖。

这是一个交互式科普页面。它不只是把挂谷集合**画出来**给你看,还把它当成一个**可以动手量、并且会量错**的对象:页面里的维数测量仪用真正的盒计数去量维数,只喂真值已知的集合,好让你看见**估计器本身的偏差**有多大——大到足以说明为什么这个猜想不可能靠计算机验证。

<p align="center">
  <img src="docs/screenshot-hero.png" width="100%" alt="维数测量仪的截图:左侧是 Cantor 尘和边长 ε=32 的测量网格,右侧是 log N(ε) 对 log(1/ε) 的散点、拟合线(斜率 0.943)与真值斜率虚线(1.262);下方五个读数依次为真值 1.2619、测量值 0.9427、偏差 −0.3192、斜率标准误 0.1102、R² 0.9015">
</p>

<sub>截图是页面里的<strong>维数测量仪</strong>：用真盒计数去量 Cantor 尘（真值 log4/log3 = 1.2619），在一组与它不共格的尺度上测出 0.9427，<strong>偏差 0.3192</strong>。挂谷猜想需要分辨的差距是 0.01。</sub>

> ⚠️ **页面里的一切动画都不是证明。** 有限根线段、有限细管、像素级覆盖只能建立直觉;真正的证明在下方"来源"里。这一点写在页面首屏,也写在这里。

## 在线试玩

**[guocheng24.github.io/kakeya-conjecture-lab](https://guocheng24.github.io/kakeya-conjecture-lab/)**

拖动旋转、滚轮缩放,切换四种细管排布,调整样本数 `N` 与管半径 `δ`。面板会实时报出**最大角隙**——球面上离最近一根管最远的那个方向差了多少度。挂谷集合的定义要求这个数是 0,而**任何有限根管都做不到**:方向按 Fibonacci 球面采样(同等管数下角隙比随机采样小 35–45%),角隙仍按 `C/√N` 缓慢下降,N=640 时还有约 5°。

## 它讲清楚了什么

**三个常被混为一谈的问题**,页面把它们分开:

| | 年份 | 问的是什么 |
|---|---|---|
| 挂谷针问题 | 1917 | 针连续转过 180° 所需的**最小面积**是多少 |
| Besicovitch 集合 | 1928 | 存在**面积为零**却含所有方向单位线段的集合 |
| 现代挂谷集合猜想 | 至今 | 这类集合的 **Hausdorff 维数是否必须等于 n** |

**猜想的现状**:三维情形由王虹与 Joshua Zahl 于 2025 年证明;**四维及以上仍然开放**。王虹因此获 2026 年菲尔兹奖(2026 年 7 月 23 日,费城,史上第三位女性得主)。

**页面覆盖的内容**:直觉 → 三个问题 → 二维覆盖实验 → 正式定义(挂谷集合 / Lebesgue 测度 / Hausdorff 维数 / Minkowski 维数)→ 证明地图(尺度阶梯 + 黏性/非黏性分岔,含直觉层与数学层)→ 时间线 → **维数测量仪** → 多尺度采样 → 波包分解 → 来源与致谢。

## 数学正确性

页面涉及的每个结论都可追溯到原始论文:

| 结论 | 出处 |
|---|---|
| 三维挂谷集合具有完整维数 | Wang & Zahl, *Volume estimates for unions of convex sets, and the Kakeya set conjecture in three dimensions*, [arXiv:2502.17655](https://arxiv.org/abs/2502.17655) |
| 黏连(sticky)情形 | Wang & Zahl, *Sticky Kakeya sets and the sticky Kakeya conjecture*, [arXiv:2210.09581](https://arxiv.org/abs/2210.09581) |
| 简化证明 | Guth, Wang & Zahl, *A streamlined proof of the Kakeya set conjecture in $\mathbb{R}^3$*, [arXiv:2601.14411](https://arxiv.org/abs/2601.14411) |
| 证明导读 | Guth, *Introduction to the proof of the Kakeya conjecture*, [arXiv:2505.07695](https://arxiv.org/abs/2505.07695) |
| 经典综述 | Wolff, *Recent work connected with the Kakeya problem*, 收入《Lectures on Harmonic Analysis》, AMS University Lecture Series 29 ([doi:10.1090/ulect/029/11](https://doi.org/10.1090/ulect/029/11)) |
| 证明梗概 | Guth, *Outline of the Wang–Zahl proof of the Kakeya conjecture in $\mathbb{R}^3$*, [arXiv:2508.05475](https://arxiv.org/abs/2508.05475) |

上述 arXiv 编号均已逐条核验可解析。

**二维实验里的覆盖率是真实测量的**:按像素与背景色比对得出,随方向数与压缩程度变化。把方向数调到 160、压缩调到 0.15,覆盖率约 0.6% —— 比 12 个方向、不压缩时的 1.1% 还小。**方向可以更多,面积却可以更小**,这正是 Besicovitch 构造的直觉。

**维数测量仪是真的盒计数,而且只量真值已知的集合**:统计边长 ε 的方格中与集合相交者的个数 N(ε),把 log N(ε) 对 log(1/ε) 做最小二乘,取斜率。喂给它线段(1)、实心方块(2)、Cantor 尘(log4/log3)、Sierpiński 三角(log3/log2)和挂谷型细管并(2)——读者随时能拿测量值对照真值。

这台仪器的用途不是"测出挂谷集合的维数",而是**展示它必然测不准**。同一个 Cantor 尘,网格边长取 3 的幂时测得 1.2619(与真值吻合到小数点后四位),换成混合尺度就变成 0.94,**偏差 0.32**;而挂谷猜想需要分辨的是 3.00 与 2.99 之间那 0.01。更要命的是挂谷型集合在三个尺度族下**没有一个准**,因为它不是单一比例的自相似集,"换个尺度族补救"这条路对它不存在。

**页面刻意不做的事**:不宣称任何动画构成证明,不把有限样本的覆盖率当作测度,不把像素计数当作 Hausdorff 维数。

## 本地运行

纯静态页面,Three.js 从 CDN 加载,没有构建也能直接看:

```bash
git clone https://github.com/GuoCheng24/kakeya-conjecture-lab.git
cd kakeya-conjecture-lab
python3 -m http.server 8000     # 然后打开 http://localhost:8000
```

需要开发模式(热更新)或产出 `dist/`:

```bash
npm install
npm run dev        # vite 开发服务器
npm run build      # 产出 dist/
```

⚠️ 页面通过 CDN 加载 `three@0.160.0`。离线环境下三维部分不会渲染,二维实验不受影响。

## 参与改进

欢迎指出:

- **数学表述不准确的地方** —— 请指明是哪一句、正确表述是什么、出处;
- 可视化上看不清或有误导的地方;
- 新增可交互的直觉实验。

数学相关的改动请附出处。这个页面的价值全在于"科普但不失准"。

## 致谢

做这个页面之前看过下面这些公开作品,页面的"来源、致谢与延伸阅读"一节里有更详细的说明:

- **[Terence Tao — tao-web](https://teorth.github.io/tao-web/applets.html)** —— 其中 [The Kakeya needle](https://teorth.github.io/tao-web/apps/kakeya.html) 让针在历代经典构造里真转起来并实时报面积,[A three-dimensional Kakeya set](https://teorth.github.io/tao-web/apps/kakeya3d.html) 用 1×δ×δ 细管演示三维构造、**体积是精确计算的**,渲染器不依赖 WebGL 手写。本站三维模块中「以 δ 为管半径、以 N 控制管数、并提供一个共基发散形态」这套交互思路与之相近,在此致谢;想看精确体积与历代构造的真实动画请直接去那里。
- **[mino.mobi/kakeya](https://mino.mobi/kakeya/)** —— 有限域情形(Dvir 2008)的可点击格子游戏。
- **[Quanta Magazine](https://www.quantamagazine.org/once-in-a-century-proof-settles-maths-kakeya-conjecture-20250314/)** —— 面向大众但不含糊的报道。

若你发现本站任何表述与他人作品雷同而我们未致谢,请开 issue 指出,会立即补上或改写。

## Other things from the same desk

Written while trying to get papers out, so they tend to be useful at the same points in that process:

- [scholarcheck](https://github.com/GuoCheng24/scholarcheck) — verify that a citation actually exists, and audit a whole .bib in CI
- [docxaudit](https://github.com/GuoCheng24/docxaudit) — find what your converter silently dropped from a .docx
- [sciglyph](https://github.com/GuoCheng24/sciglyph) — draw publication figures as code, in pure matplotlib
- [world-model-map](https://github.com/GuoCheng24/world-model-map) — a map of open-source world models and where their authors say they break

## 这些数字是被检查着的

上面每个具体数字都不是抄进 README 的,是 `tests/` 里的 11 项检查每次推送时**从代码里重新算出来**再跟这一页比对的:

| 检查什么 | 怎么查 |
|---|---|
| Cantor 尘的真值、混合尺度族下的测量值与偏差 | 把 `main.js` 里的 `buildSet` / `boxCount` / `measure` 抠出来在 Node 里**真跑一遍盒计数**,跟 README 里解析出的数字比 |
| 共格尺度族下确实吻合真值 | 同上,3 的幂尺度族下偏差须 ≈ 0 |
| 角隙 `N=640 约 5°`、`比随机小 35–45%` | 与 `main.js` 里记录的离线实测值(20000 探针)比对 |
| `three@0.160.0` | README 说的版本 == `index.html` 真正加载的版本 |
| 每张图都有 alt 文本、仓内引用的文件都存在 | 直接扫 |
| `main.js` / `social_card.py` 语法 | `node --check` / `py_compile` |
| `node_modules`、`dist` 没被提交进来 | 这个仓曾经犯过,2026-08-27 改写历史清掉了 186 个文件 |

改了代码没改 README,或者改了 README 没改代码,**两个方向都会失败**——这七种情况各用一次故意写错验证过。

引文(5 个 arXiv 编号 + 1 个 DOI)是否还解析得到,由**每周一次**的单独工作流查,不放在每次推送里:arXiv 有速率限制,查密了会返回 429,那跟"引文是编的"长得一模一样,而一个会无故变红的徽章会教所有人忽略它。

## 许可

代码 MIT。页面文字与图示 CC BY 4.0。引用的论文版权归原作者。
