/*
 * Reads width and height from the header of a PNG, GIF, WebP or JPEG file
 * without decoding it and without dependencies. Returns nulls for other
 * formats (SVG, AVIF) or a truncated file.
 */
export function imageSize(buf) {
    if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
        return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf.length >= 10 && buf.toString('ascii', 0, 3) === 'GIF') {
        return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    if (buf.length >= 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
        const chunk = buf.toString('ascii', 12, 16);
        if (chunk === 'VP8 ') {
            return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
        }
        if (chunk === 'VP8L') {
            const [b0, b1, b2, b3] = buf.subarray(21, 25);
            return {
                width: 1 + (((b1 & 0x3f) << 8) | b0),
                height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
            };
        }
        if (chunk === 'VP8X') {
            return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
        }
    }
    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
        // Walk the JPEG markers to the first start-of-frame.
        let i = 2;
        while (i + 9 < buf.length) {
            if (buf[i] !== 0xff) { i++; continue; }
            const marker = buf[i + 1];
            if (marker === 0xff) { i++; continue; }
            const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
            if (isFrame) {
                return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
            }
            if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
                i += 2;
            } else {
                i += 2 + buf.readUInt16BE(i + 2);
            }
        }
    }
    return { width: null, height: null };
}
