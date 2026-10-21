import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const out = [];
for (const f of readdirSync('content/pages')) {
  const p = JSON.parse(readFileSync(`content/pages/${f}`, 'utf8'));
  const to = '/' + p.slug;
  for (const from of p.redirects_from ?? []) out.push({ from, to: p.redirect_targets?.[from] ?? (from === '/testimonials.html' ? '/#testimonials' : to) });
}
writeFileSync('redirects.json', JSON.stringify(out, null, 2));
console.log(out.length, 'redirects');
