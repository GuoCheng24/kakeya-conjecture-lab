// README 里引用的每个 arXiv 编号与 DOI,是不是还真的能解析到它声称的那篇。
//
// 为什么单独一个脚本、而且不在每次推送时跑:arXiv 的 API 有速率限制。写这个仓的
// 检查时我一次查了五个编号,全部返回空,看起来像"README 里的引文全是编的" ——
// 跑一个已知能解析的编号做正对照才发现是 HTTP 429 Rate exceeded。把这种检查放进
// 每次推送,迟早会因为限流亮一次红灯,而一个会无故变红的徽章会教所有人忽略它。
//
// 所以:每周跑一次,查询之间留 20 秒,并且【把限流与"查无此篇"区分开】——
// 限流时报"没查成",不报"引文有问题"。

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const README = readFileSync(join(ROOT, 'README.md'), 'utf8');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 用 curl 而不是 Node 内置的 fetch:fetch 不认 http_proxy/https_proxy,
// 于是这个脚本在需要走代理出网的机器上必然 ENOTFOUND —— 也就是**写它的人无法
// 在本地验证它到底能不能用**,只能指望它在 CI 上碰巧能跑。curl 两边都认。
function get(url) {
  const r = spawnSync('curl', ['-sL', '--max-time', '60', '-w', '\n%{http_code}', url],
                      { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (r.error) return { ok: false, status: 0, body: '', err: String(r.error) };
  const out = r.stdout ?? '';
  const cut = out.lastIndexOf('\n');
  const status = parseInt(out.slice(cut + 1), 10) || 0;
  return { ok: status >= 200 && status < 300, status, body: out.slice(0, cut) };
}

/** README 里出现的所有 arXiv 编号,去重。 */
const arxivIds = [...new Set([...README.matchAll(/arXiv:([0-9]{4}\.[0-9]{4,5})/g)].map((m) => m[1]))];
/** README 里出现的所有 DOI,去重。 */
const dois = [...new Set([...README.matchAll(/doi\.org\/(10\.[^\)\s\]]+)/g)].map((m) => m[1]))];

if (arxivIds.length === 0 && dois.length === 0) {
  console.error('README 里一个引文都没抓到 —— 是格式变了还是正则失配?这不是通过。');
  process.exit(1);
}

let broken = 0;
let unchecked = 0;

for (const id of arxivIds) {
  const res = get(`http://export.arxiv.org/api/query?id_list=${id}`);
  const body = res.body;
  if (!res.ok || /Rate exceeded/i.test(body)) {
    console.log(`  ?  arXiv:${id}  没查成(HTTP ${res.status}${/Rate/i.test(body) ? ',被限流' : ''})`);
    unchecked++;
  } else {
    const total = /<opensearch:totalResults[^>]*>(\d+)</.exec(body);
    const title = /<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/.exec(body);
    if (total && total[1] !== '0' && title) {
      console.log(`  ok arXiv:${id}  ${title[1].replace(/\s+/g, ' ').trim().slice(0, 68)}`);
    } else {
      console.log(`  ✗  arXiv:${id}  解析得到,但里面没有条目 —— 这个编号可能是错的`);
      broken++;
    }
  }
  await sleep(20000);
}

for (const doi of dois) {
  // doi.org 对某些出版社会返回 403(AMS 走 Cloudflare),所以问 Crossref 这个权威接口。
  const res = get(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  if (res.status === 404) {
    console.log(`  ✗  doi:${doi}  Crossref 查无此条`);
    broken++;
  } else if (!res.ok) {
    console.log(`  ?  doi:${doi}  没查成(HTTP ${res.status})`);
    unchecked++;
  } else {
    const j = JSON.parse(res.body);
    console.log(`  ok doi:${doi}  ${(j.message.title?.[0] ?? '(无标题)').slice(0, 68)}`);
  }
  await sleep(2000);
}

console.log(`\n  ${arxivIds.length} 个 arXiv 编号 + ${dois.length} 个 DOI:` +
            ` 失效 ${broken},未查成 ${unchecked}`);
if (broken > 0) {
  console.error('  有引文指向不存在的东西,改掉或换掉。');
  process.exit(1);
}
if (unchecked === arxivIds.length + dois.length) {
  console.error('  一条都没查成 —— 这不算通过,多半是网络或限流,过会儿重跑。');
  process.exit(1);
}
