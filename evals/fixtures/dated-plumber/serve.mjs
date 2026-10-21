#!/usr/bin/env node
// Serves the fixture site on localhost. {{ORIGIN}} in robots.txt and
// sitemap.xml becomes the real origin. Usage: node serve.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), 'site');
const port = Number(process.argv[2] ?? 4600);
const TYPES = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.js': 'text/javascript', '.txt': 'text/plain', '.xml': 'application/xml' };

createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    if (path.endsWith('/')) path += 'index.html';
    try {
        let body = await readFile(join(ROOT, path));
        const type = TYPES[extname(path)] ?? 'application/octet-stream';
        if (path.endsWith('.txt') || path.endsWith('.xml')) body = Buffer.from(body.toString().replaceAll('{{ORIGIN}}', `http://127.0.0.1:${port}`));
        res.writeHead(200, { 'content-type': type });
        res.end(body);
    } catch {
        res.writeHead(404, { 'content-type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
}).listen(port, '127.0.0.1', () => console.log(`fixture on http://127.0.0.1:${port}/`));
