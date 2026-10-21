// Generates the fixture's photos: flat scenes with a caption, in the sizes a
// dated site typically serves (one oversized hero, thumbnails, a tiny logo).
// Run from this folder with sharp available: node make-images.mjs <path-to-sharp>
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)(process.argv[2] ?? 'sharp');

const photo = (w, h, a, b, label) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${w * 0.7}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.22}" fill="rgba(255,255,255,.18)"/>
<rect x="${w * 0.12}" y="${h * 0.55}" width="${w * 0.45}" height="${h * 0.25}" rx="12" fill="rgba(0,0,0,.18)"/>
<text x="50%" y="${h * 0.9}" font-family="Arial" font-size="${Math.round(h / 14)}" fill="#fff" text-anchor="middle">${label}</text></svg>`));

const images = [
    ['hero-van.jpg', 3000, 1600, '#1f4e79', '#4a90c2', 'Our van on a job in Northbridge'],
    ['team.jpg', 1600, 1067, '#7a4a1f', '#c2904a', 'Sam and Priya, Northbridge Plumbing'],
    ['bathroom-1.jpg', 400, 300, '#2e6b4f', '#63b08a', 'Bathroom refit'],
    ['bathroom-2.jpg', 400, 300, '#3b5f7d', '#7fa8c9', 'Shower install'],
    ['boiler.jpg', 1200, 900, '#6b2e2e', '#b06363', 'Boiler installation'],
    ['radiator.jpg', 400, 300, '#5a5a5a', '#9a9a9a', 'Radiator replacement'],
    ['handshake-stock.jpg', 800, 533, '#444', '#888', 'Stock photo: handshake'],
    ['logo.gif', 160, 60, '#1f4e79', '#1f4e79', 'NORTHBRIDGE'],
];
for (const [name, w, h, a, b, label] of images) {
    const img = photo(w, h, a, b, label);
    const out = `site/img/${name}`;
    if (name.endsWith('.gif')) await img.gif().toFile(out);
    // The hero is saved at full quality on purpose: the oversized image is
    // one of the findings the audit should report.
    else await img.jpeg({ quality: name.startsWith('hero') ? 100 : 92 }).toFile(out);
}
console.log(images.length, 'images');
