import * as THREE from "three";

/** Small deterministic random generator, so the scene looks the same on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SpeckleOptions {
  base: string;
  specks: string[];
  count: number;
  minRadius: number;
  maxRadius: number;
  seed: number;
  size?: number;
}

/**
 * A tileable speckled surface drawn on the fly (sand, stone, soil …), so the cross-section
 * needs no image downloads. Colours are illustrative, not product colours.
 */
export function speckleTexture(options: SpeckleOptions): THREE.CanvasTexture {
  const size = options.size ?? 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = options.base;
  ctx.fillRect(0, 0, size, size);

  const rand = mulberry32(options.seed);
  for (let i = 0; i < options.count; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = options.minRadius + rand() * (options.maxRadius - options.minRadius);
    ctx.fillStyle = options.specks[Math.floor(rand() * options.specks.length)];
    // draw each speck at the edges too, so the texture tiles without seams
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        if (x + dx < -r || x + dx > size + r || y + dy < -r || y + dy > size + r) continue;
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
