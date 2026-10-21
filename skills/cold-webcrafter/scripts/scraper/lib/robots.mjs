/*
 * A small robots.txt reader: groups by user agent, Allow/Disallow with
 * `*` and `$`, longest match wins (as in RFC 9309), Sitemap and
 * Crawl-delay lines.
 *
 * The scraper honours it because it's a stranger's site: a remake pitch
 * that starts by crawling pages the owner asked robots to avoid is a bad
 * first impression.
 */

function toRegExp(pattern) {
    const anchored = pattern.endsWith('$');
    const body = (anchored ? pattern.slice(0, -1) : pattern)
        .replace(/[.+?^{}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
    return new RegExp(`^${body}${anchored ? '$' : ''}`);
}

export function parseRobots(text, agent = 'cold-webcrafter') {
    const groups = [];
    const sitemaps = [];
    let current = null;
    let lastWasAgent = false;

    for (const raw of text.split(/\r?\n/)) {
        const line = raw.replace(/#.*$/, '').trim();
        const match = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
        if (!match) continue;
        const key = match[1].toLowerCase();
        const value = match[2].trim();

        if (key === 'sitemap') {
            if (value) sitemaps.push(value);
            continue;
        }
        if (key === 'user-agent') {
            if (!lastWasAgent) {
                current = { agents: [], rules: [] };
                groups.push(current);
            }
            current.agents.push(value.toLowerCase());
            lastWasAgent = true;
            continue;
        }
        lastWasAgent = false;
        if (current && key === 'crawl-delay') {
            const seconds = Number(value);
            if (seconds > 0) current.crawlDelay = seconds;
            continue;
        }
        if (!current || (key !== 'allow' && key !== 'disallow')) continue;
        // An empty Disallow allows everything; it adds no rule.
        if (value) current.rules.push({ allow: key === 'allow', length: value.length, test: toRegExp(value) });
    }

    const own = agent.toLowerCase();
    const specific = groups.filter((g) => g.agents.some((a) => a !== '*' && own.includes(a)));
    const chosen = specific.length ? specific : groups.filter((g) => g.agents.includes('*'));
    const rules = chosen.flatMap((g) => g.rules);

    // Crawl-delay isn't in RFC 9309, but site owners still use it to ask for
    // slower crawling; honouring it costs only time.
    const delays = chosen.map((g) => g.crawlDelay).filter(Boolean);

    return {
        sitemaps,
        crawlDelaySeconds: delays.length ? Math.max(...delays) : null,
        allowed(url) {
            const { pathname, search } = new URL(url);
            const path = pathname + search;
            let best = null;
            for (const rule of rules) {
                if (!rule.test.test(path)) continue;
                if (!best || rule.length > best.length || (rule.length === best.length && rule.allow)) best = rule;
            }
            return !best || best.allow;
        },
    };
}
