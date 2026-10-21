/*
 * Functions that run inside the browser page (page.evaluate). They must be
 * self-contained: no imports, everything they need comes in `cfg`.
 */

/** Scrolls to the bottom in steps so lazy content loads, then back to the top. */
export async function scrollThrough() {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let last = -1;
    // Infinite feeds keep growing; stop after a generous height.
    for (let y = 0; y < 40000; y += step) {
        window.scrollTo(0, y);
        await wait(120);
        const height = document.documentElement.scrollHeight;
        if (y + window.innerHeight >= height) {
            if (height === last) break;
            last = height;
        }
    }
    window.scrollTo(0, 0);
    await wait(400);
}

/** Clicks the first visible button whose text accepts cookies. Returns its text or null. */
export function acceptCookies(words) {
    const wanted = new Set(words);
    const candidates = document.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]');
    for (const el of candidates) {
        const text = (el.innerText || el.value || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!text || text.length > 40 || !wanted.has(text)) continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        el.click();
        return text;
    }
    return null;
}

// Measured against the layout viewport (clientWidth): mobile browsers zoom
// out to fit wide content, which makes innerWidth grow with the overflow
// and hide it.
export function horizontalOverflow() {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
}

/** Text, images and measurable facts of the page, measured at the top after scrolling. */
export function collect(cfg) {
    const re = (source) => new RegExp(source, 'i');
    const references = re(cfg.references);
    const certifications = re(cfg.certifications);
    const placeholders = re(cfg.placeholders);
    const mapHosts = re(cfg.mapHosts);
    const numberRe = new RegExp(`(?:^|[^\\d])(\\d{1,3}(?:[ \\u00a0.,]\\d{3})*\\s?\\+?\\s?%?)\\s+(?:${cfg.numberUnits})\\b`, 'giu');

    const meta = (selector) => document.querySelector(selector)?.getAttribute('content') ?? null;
    const text = document.body ? document.body.innerText : '';
    const flat = text.replace(/\s+/g, ' ').trim();

    // --- images -------------------------------------------------------
    const images = [];
    const imgs = [...document.images];
    for (const img of imgs) {
        const src = img.currentSrc || img.src;
        if (!src || src.startsWith('data:')) continue;
        images.push({
            url: new URL(src, location.href).href,
            alt: img.getAttribute('alt') ?? '',
            w: img.naturalWidth || null,
            h: img.naturalHeight || null,
            displayed_w: Math.round(img.getBoundingClientRect().width) || 0,
            type: 'img',
        });
    }
    const all = document.querySelectorAll('body *');
    for (let i = 0; i < all.length && i < 6000; i++) {
        const bg = getComputedStyle(all[i]).backgroundImage;
        if (!bg || bg === 'none') continue;
        for (const [, url] of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
            if (url.startsWith('data:')) continue;
            images.push({ url: new URL(url, location.href).href, alt: '', w: null, h: null, type: 'background' });
        }
    }

    // --- calls to action ----------------------------------------------
    const ctaTexts = new Set();
    let ctaAboveFold = false;
    for (const el of document.querySelectorAll('a, button, input[type="submit"], input[type="button"]')) {
        const label = (el.innerText || el.value || '').trim().replace(/\s+/g, ' ');
        if (!label || label.length > 60) continue;
        const lower = label.toLowerCase();
        if (!cfg.cta.some((word) => lower.includes(word))) continue;
        ctaTexts.add(label);
        const box = el.getBoundingClientRect();
        if (box.width > 0 && box.height > 0 && box.top < window.innerHeight && box.bottom > 0) ctaAboveFold = true;
    }

    // --- structured data ----------------------------------------------
    const structured = [];
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        try {
            const data = JSON.parse(script.textContent);
            const items = Array.isArray(data) ? data : data['@graph'] ?? [data];
            for (const item of items) if (item && item['@type']) structured.push([].concat(item['@type']).join(','));
        } catch { structured.push('invalid JSON-LD'); }
    }
    for (const el of document.querySelectorAll('[itemtype]')) structured.push(el.getAttribute('itemtype').split('/').pop());

    const years = [...flat.matchAll(/(?:©|\(c\)|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1]));
    const numbers = [...new Set([...flat.matchAll(numberRe)].map((m) => m[0].trim().replace(/^[^\d]+/, '')))].slice(0, 5);
    const h1 = [...document.querySelectorAll('h1')].map((el) => el.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean);
    const description = meta('meta[name="description" i]');
    const title = document.title?.trim() ?? '';
    const props = (prefix, attr) => [...document.querySelectorAll(`meta[${attr}^="${prefix}"]`)].map((el) => el.getAttribute(attr));

    const audit = {
        // SEO / meta
        title,
        title_length: title.length,
        description,
        description_length: description == null ? null : description.length,
        h1_count: h1.length,
        h1_texts: h1,
        canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
        og_tags: props('og:', 'property'),
        twitter_tags: props('twitter:', 'name'),
        structured_data: [...new Set(structured)],
        lang: document.documentElement.getAttribute('lang') || null,
        favicon: !!document.querySelector('link[rel~="icon"], link[rel="apple-touch-icon"]'),
        viewport_meta: !!document.querySelector('meta[name="viewport"]'),
        // CTA / trust
        cta_texts: [...ctaTexts],
        cta_count: ctaTexts.size,
        cta_above_fold: ctaAboveFold,
        forms: document.forms.length,
        phone_clickable: !!document.querySelector('a[href^="tel:"]'),
        email_clickable: !!document.querySelector('a[href^="mailto:"]'),
        map: [...document.querySelectorAll('iframe')].some((f) => mapHosts.test(f.src || f.dataset.src || '')),
        mentions_references: references.test(flat),
        mentions_certifications: certifications.test(flat),
        numbers_in_text: numbers,
        // speed / images
        images_total: imgs.length,
        images_without_alt: imgs.filter((img) => !img.hasAttribute('alt') || !img.getAttribute('alt').trim()).length,
        images_oversized: imgs.filter((img) => {
            const shown = img.getBoundingClientRect().width;
            return shown > 0 && img.naturalWidth > 2.5 * shown;
        }).length,
        lazy_loading: imgs.some((img) => img.loading === 'lazy' || img.hasAttribute('data-src')),
        // age / technical debt
        generator: meta('meta[name="generator" i]'),
        copyright_year: years.length ? Math.max(...years) : null,
        jquery: typeof window.jQuery === 'function',
        jquery_version: window.jQuery?.fn?.jquery ?? null,
        flash_leftovers: !!document.querySelector('object[type*="flash"], embed[type*="flash"], embed[src$=".swf"], object[data$=".swf"]'),
        inline_styles: document.querySelectorAll('[style]').length,
        placeholder_leftovers: placeholders.test(flat),
        text_length: flat.length,
        // layout (desktop; mobile is measured separately)
        horizontal_overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    };

    return {
        title,
        description,
        h1,
        text: text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(),
        images,
        links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
        audit,
    };
}
