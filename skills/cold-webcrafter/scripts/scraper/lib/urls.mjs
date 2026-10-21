/*
 * URL rules shared by page discovery and file naming.
 */

// Links to these are files, not pages.
const FILE_EXTENSIONS = /\.(?:pdf|jpe?g|png|gif|webp|avif|svg|ico|bmp|tiff?|zip|rar|7z|gz|tar|docx?|xlsx?|pptx?|odt|ods|csv|txt|mp[34]|m4a|mov|avi|wmv|webm|ogg|wav|xml|json|js|css|woff2?|ttf|eot|exe|dmg|apk)$/i;

export const bareHost = (host) => host.toLowerCase().replace(/^www\./, '');

/** Normalised page URL if it belongs to the site, otherwise null. */
export function pageUrl(raw, base, siteHost) {
    let url;
    try { url = new URL(raw, base); } catch { return null; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (bareHost(url.hostname) !== bareHost(siteHost)) return null;
    if (FILE_EXTENSIONS.test(url.pathname)) return null;
    url.hash = '';
    return url.href;
}

/** Key for de-duplication: www, protocol and a trailing slash don't make a new page. */
export function pageKey(href) {
    const url = new URL(href);
    // "/index.html" and "/" are the same page.
    const path = url.pathname.replace(/\/index\.(?:html?|php|aspx?)$/i, '/').replace(/\/+$/, '') || '/';
    return `${bareHost(url.hostname)}${path}${url.search}`;
}

/** File-name slug from the URL path: "/services/roofs/" -> "services-roofs", "/" -> "home". */
export function slugFor(href) {
    const { pathname } = new URL(href);
    let path = pathname;
    try { path = decodeURIComponent(pathname); } catch { /* keep encoded */ }
    const slug = path
        .replace(/\.(?:html?|php|aspx?)$/i, '')
        .normalize('NFKD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/^\/+|\/+$/g, '')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]+/g, '_')
        .replace(/^[-_]+|[-_]+$/g, '')
        .slice(0, 60);
    return slug || 'home';
}

/** <loc> entries of a sitemap or sitemap index. */
export function parseSitemap(xml) {
    const locs = [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?\s*<\/loc>/gi)]
        .map((m) => m[1].replace(/&amp;/g, '&').trim());
    return { isIndex: /<sitemapindex[\s>]/i.test(xml), locs };
}
