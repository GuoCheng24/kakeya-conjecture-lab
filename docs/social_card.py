"""The 1200x630 card that appears when the link is shared.

Without one, a shared link is a bare URL and nobody can tell what it is. This
uses the site's own palette and its own subject: a measuring grid laid over a
set, which is what the page is actually about.
"""
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

# Liberation Sans has no CJK glyphs; Noto Sans CJK is installed here.
# matplotlib registers the shipped .ttc under its JP name; the Han glyphs
# are the same collection, so this renders 简体 correctly.
CJK = "Noto Sans CJK JP"
plt.rcParams.update({
    "font.family": [CJK, "DejaVu Sans"],
    "pdf.fonttype": 42, "svg.fonttype": "none",
})

GROUND, PANEL, INK, INK2, INK3 = "#14120f", "#1c1a16", "#ece7dd", "#b8b0a2", "#8a8377"
MEASURE, TRUTH = "#d97742", "#6f9068"

W, H = 12.0, 6.3                      # -> 1200x630 at dpi=100
fig = plt.figure(figsize=(W, H), dpi=100)
ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis("off")
ax.add_patch(Rectangle((0, 0), 1, 1, fc=GROUND, ec="none", zorder=0))

# faint measuring grid across the whole card - the page's own motif
for g in np.arange(0, 1.001, 1 / 24):
    ax.plot([g, g], [0, 1], color=MEASURE, lw=.8, alpha=.055, zorder=1)
for g in np.arange(0, 1.001, 1 / 12):
    ax.plot([0, 1], [g, g], color=MEASURE, lw=.8, alpha=.055, zorder=1)

# ---------------- left: the words ----------------
ax.text(.055, .845, "KAKEYA CONJECTURE LAB", fontsize=11.5, color=INK3,
        family="DejaVu Sans", zorder=10)
ax.plot([.055, .140], [.815, .815], color=MEASURE, lw=2.0, zorder=10)

ax.text(.055, .690, "一根针，如何占满三维空间？", fontsize=33, color=INK,
        va="center", zorder=10)
ax.text(.055, .565, "测度为零，维数却是满的。", fontsize=17, color=INK2, va="center", zorder=10)
ax.text(.055, .485, "1917 年的转针问题，2026 年因它颁出一枚菲尔兹奖。",
        fontsize=14.5, color=INK3, va="center", zorder=10)

# the one line that makes this page different from the other explainers
ax.add_patch(Rectangle((.055, .215), .006, .175, fc=MEASURE, ec="none", zorder=10))
ax.text(.078, .350, "亲手量一次维数，", fontsize=15.5, color=INK, va="center", zorder=10)
ax.text(.078, .285, "看看为什么这个猜想", fontsize=15.5, color=INK, va="center", zorder=10)
ax.text(.078, .220, "不可能靠计算机验证。", fontsize=15.5, color=MEASURE, va="center", zorder=10)

ax.text(.055, .085, "guocheng24.github.io/kakeya-conjecture-lab",
        fontsize=12, color=INK3, family="DejaVu Sans", zorder=10)

# ---------------- right: the instrument ----------------
PX, PY, PS = .615, .175, .335
ax.add_patch(Rectangle((PX - .022, PY - .030), PS + .044, PS + .075,
                       fc=PANEL, ec="#38332b", lw=1.2, zorder=4))

# Cantor dust: integer ternary test, the same set the page measures
N = 243                                    # 3^5
def in_cantor(i, levels=5):
    for _ in range(levels):
        if i % 3 == 1:
            return False
        i //= 3
    return True
cols = [i for i in range(N) if in_cantor(i)]
img = np.zeros((N, N))
for y in cols:
    for x in cols:
        img[y, x] = 1
ax.imshow(img, extent=(PX, PX + PS, PY, PY + PS), origin="lower",
          cmap=plt.matplotlib.colors.ListedColormap([GROUND, INK2]),
          interpolation="nearest", zorder=5, aspect="auto")

# the grid that decides whether you measure it right
for k in range(10):
    p = PX + k * PS / 9
    ax.plot([p, p], [PY, PY + PS], color=MEASURE, lw=1.0, alpha=.85, zorder=6)
    q = PY + k * PS / 9
    ax.plot([PX, PX + PS], [q, q], color=MEASURE, lw=1.0, alpha=.85, zorder=6)

ax.text(PX + PS / 2, PY + PS + .030, "同一个集合，换个网格量",
        fontsize=12.5, ha="center", color=INK2, zorder=10)
ax.text(PX + PS / 2, PY - .062, "1.2619", fontsize=15, ha="center",
        color=TRUTH, family="DejaVu Sans", zorder=10)
ax.text(PX + PS / 2, PY - .112, "0.9427", fontsize=15, ha="center",
        color=MEASURE, family="DejaVu Sans", zorder=10)
ax.text(PX + PS / 2 - .075, PY - .062, "真值", fontsize=11, ha="right", color=INK3, zorder=10)
ax.text(PX + PS / 2 - .075, PY - .112, "测得", fontsize=11, ha="right", color=INK3, zorder=10)

out = Path(__file__).parent / "social-card.png"
fig.savefig(out, dpi=100, facecolor=GROUND)
print("saved", out, "->", plt.imread(out).shape)
