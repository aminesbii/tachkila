/**
 * Generates every app icon the PWA needs, with no dependencies and no network:
 * a pure-Node PNG encoder (zlib only) plus a tiny signed-distance rasteriser.
 *
 *   npm run icons
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(import.meta.dirname, "..", "public", "icons");

const BACKGROUND_TOP = [11, 110, 75]; // deep pitch green
const BACKGROUND_BOTTOM = [21, 151, 104]; // emerald
const MARK = [255, 255, 255];

/* ---------------------------------------------------------------- PNG ---- */

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/** rgba: Uint8Array of size width * height * 4 */
function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------ rasteriser -- */

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Signed distance to an axis-aligned box centred at (cx, cy). */
function sdBox(x, y, cx, cy, hw, hh) {
  const dx = Math.abs(x - cx) - hw;
  const dy = Math.abs(y - cy) - hh;
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0);
}

/** Signed distance to a rounded rectangle covering the whole canvas. */
function sdRoundRect(x, y, w, h, r) {
  const dx = Math.abs(x - w / 2) - (w / 2 - r);
  const dy = Math.abs(y - h / 2) - (h / 2 - r);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.hypot(ox, oy) + Math.min(Math.max(dx, dy), 0) - r;
}

function createCanvas(size) {
  return { size, rgba: new Uint8Array(size * size * 4) };
}

/** Paints `colorAt(y)` over the canvas with per-pixel coverage in [0, 1]. */
function paintSolid(canvas, coverageAt, colorAt) {
  const { size, rgba } = canvas;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = clamp(coverageAt(x + 0.5, y + 0.5), 0, 1);
      if (a <= 0) continue;
      const i = (y * size + x) * 4;
      const dst = rgba[i + 3] / 255;
      const out = a + dst * (1 - a);
      if (out <= 0) continue;
      const color = colorAt(y);
      for (let c = 0; c < 3; c++) {
        rgba[i + c] = Math.round((color[c] * a + rgba[i + c] * dst * (1 - a)) / out);
      }
      rgba[i + 3] = Math.round(out * 255);
    }
  }
}

/* ---------------------------------------------------------------- mark ---- */

/**
 * Draws the icon: a pitch-green tile, a white ball outline and a bold "T".
 * `contentScale` shrinks the mark so maskable icons keep a safe zone.
 */
function drawIcon({ size, cornerRadius, contentScale }) {
  const canvas = createCanvas(size);
  const gradient = (y) => mix(BACKGROUND_TOP, BACKGROUND_BOTTOM, y / size);

  paintSolid(canvas, (x, y) => {
    if (cornerRadius > 0) {
      // 0.5px antialiasing band around the rounded tile.
      return 0.5 - sdRoundRect(x, y, size, size, cornerRadius);
    }
    return 1;
  }, gradient);

  const s = size * contentScale;
  const cx = size / 2;
  const cy = size / 2;
  const ringRadius = s * 0.36;
  const ringWidth = s * 0.048;

  const bar = { hw: s * 0.2, hh: s * 0.042, cx, cy: cy - s * 0.105 };
  const stem = { hw: s * 0.042, hh: s * 0.148, cx, cy: cy + s * 0.04 };

  paintSolid(
    canvas,
    (x, y) => {
      const d = Math.abs(Math.hypot(x - cx, y - cy) - ringRadius) - ringWidth / 2;
      const ring = 0.5 - d;
      const t = Math.max(
        0.5 - sdBox(x, y, bar.cx, bar.cy, bar.hw, bar.hh),
        0.5 - sdBox(x, y, stem.cx, stem.cy, stem.hw, stem.hh)
      );
      return Math.max(ring, t);
    },
    () => MARK
  );

  return canvas;
}

/* ---------------------------------------------------------------- write --- */

function write(name, canvas) {
  const file = path.join(OUT_DIR, name);
  writeFileSync(file, encodePng(canvas.size, canvas.size, canvas.rgba));
  console.log(`  ${name} (${canvas.size}×${canvas.size})`);
}

mkdirSync(OUT_DIR, { recursive: true });

console.log("Generating app icons…");
write("icon-192.png", drawIcon({ size: 192, cornerRadius: 42, contentScale: 1 }));
write("icon-512.png", drawIcon({ size: 512, cornerRadius: 112, contentScale: 1 }));
write("icon-maskable-512.png", drawIcon({ size: 512, cornerRadius: 0, contentScale: 0.72 }));
write("apple-touch-icon.png", drawIcon({ size: 180, cornerRadius: 0, contentScale: 0.86 }));
console.log(`Written to ${path.relative(process.cwd(), OUT_DIR)}`);
