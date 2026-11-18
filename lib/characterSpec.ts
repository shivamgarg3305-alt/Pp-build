/**
 * Procedural spec for the voxel character.
 * Pure data (no three.js import) so it can be unit-previewed anywhere.
 * World units: 1 unit ~ 100px of the reference sheet. Origin is between the feet,
 * +y up, character faces +z.
 */

export type Vec3 = [number, number, number];

export type MatKey =
  | "skin"
  | "skinShade"
  | "shirt"
  | "shirtShade"
  | "blue"
  | "pants"
  | "pantsFlap"
  | "pack"
  | "packTrim"
  | "shoe"
  | "sole"
  | "ink"
  | "eyeWhite"
  | "watch"
  | "screen"
  | "hair0"
  | "hair1"
  | "hair2"
  | "hair3";

export interface Part {
  size: Vec3;
  pos: Vec3;
  rot?: Vec3;
  mat: MatKey;
  /** corner radius of the bevel */
  r?: number;
}

export interface PointerState {
  x: number;
  y: number;
}

/* ---------- pivots (world space) ---------- */
export const HEAD_PIVOT: Vec3 = [0, 6.05, 0];
export const SHOULDER_Y = 5.85;
export const SHOULDER_X = 1.43;
export const ELBOW_DROP = 1.55; // shoulder -> elbow
export const HEAD_CENTER_Y = 7.03;

/* ---------- face constants (world space) ---------- */
export const FACE_Z = 0.925; // front plane of the head box
export const EYE_Y = 6.95;
export const EYE_X = 0.47;
export const EYE_W = 0.5;
export const EYE_H = 0.46;
export const PUPIL_W = 0.26;
export const PUPIL_H = 0.3;

/* ---------- helpers ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shift(parts: Part[], pivot: Vec3): Part[] {
  return parts.map((p) => ({
    ...p,
    pos: [p.pos[0] - pivot[0], p.pos[1] - pivot[1], p.pos[2] - pivot[2]] as Vec3,
  }));
}

/* ---------- torso, legs, shoes, backpack (world space, no pivot) ---------- */
export function buildBody(): Part[] {
  const parts: Part[] = [];

  // neck
  parts.push({ size: [0.72, 0.34, 0.72], pos: [0, 6.0, 0], mat: "skinShade", r: 0.05 });

  // shirt body + hem
  parts.push({ size: [1.95, 2.25, 1.2], pos: [0, 4.83, 0], mat: "shirt", r: 0.1 });
  parts.push({ size: [2.0, 0.26, 1.25], pos: [0, 3.64, 0], mat: "shirtShade", r: 0.06 });
  // shoulder caps so the sleeves blend into the torso
  for (const s of [-1, 1]) {
    parts.push({ size: [0.62, 0.34, 1.12], pos: [s * 1.14, 5.8, 0], mat: "shirt", r: 0.1 });
  }

  // collar: back band + two angled flaps + placket
  parts.push({ size: [1.15, 0.24, 0.22], pos: [0, 6.0, -0.5], mat: "blue", r: 0.05 });
  for (const s of [-1, 1]) {
    parts.push({
      size: [0.62, 0.26, 0.5],
      pos: [s * 0.4, 5.93, 0.5],
      rot: [0.25, 0, -s * 0.55],
      mat: "blue",
      r: 0.05,
    });
  }
  parts.push({ size: [0.1, 0.78, 0.05], pos: [0, 5.45, 0.61], mat: "shirtShade", r: 0.02 });
  parts.push({ size: [0.07, 0.07, 0.04], pos: [0, 5.55, 0.64], mat: "ink", r: 0.02 });
  // tiny chest logo (two small strokes, like a bird)
  parts.push({ size: [0.17, 0.045, 0.03], pos: [0.55, 5.33, 0.62], rot: [0, 0, 0.35], mat: "ink", r: 0.01 });
  parts.push({ size: [0.17, 0.045, 0.03], pos: [0.7, 5.33, 0.62], rot: [0, 0, -0.35], mat: "ink", r: 0.01 });

  // backpack straps over shoulders and down the chest
  for (const s of [-1, 1]) {
    parts.push({ size: [0.34, 0.12, 1.34], pos: [s * 0.8, 6.0, 0], mat: "pack", r: 0.04 });
    parts.push({ size: [0.34, 1.75, 0.1], pos: [s * 0.8, 5.05, 0.63], mat: "pack", r: 0.04 });
    parts.push({ size: [0.34, 1.7, 0.1], pos: [s * 0.8, 5.1, -0.63], mat: "pack", r: 0.04 });
  }

  // backpack
  parts.push({ size: [1.75, 2.3, 0.9], pos: [0, 4.65, -1.12], mat: "pack", r: 0.14 });
  parts.push({ size: [1.4, 1.0, 0.32], pos: [0, 4.05, -1.72], mat: "pack", r: 0.1 });
  parts.push({ size: [1.5, 0.1, 0.12], pos: [0, 4.57, -1.78], mat: "packTrim", r: 0.03 });
  parts.push({ size: [0.9, 0.14, 0.16], pos: [0, 5.9, -1.12], mat: "packTrim", r: 0.05 });
  parts.push({ size: [0.14, 0.4, 0.14], pos: [0.45, 5.7, -1.12], mat: "packTrim", r: 0.04 });
  parts.push({ size: [0.14, 0.4, 0.14], pos: [-0.45, 5.7, -1.12], mat: "packTrim", r: 0.04 });
  for (const s of [-1, 1]) {
    parts.push({ size: [0.3, 1.0, 0.6], pos: [s * 1.0, 4.1, -1.1], mat: "pack", r: 0.08 });
    parts.push({ size: [0.08, 0.5, 0.2], pos: [s * 1.17, 4.45, -1.1], mat: "packTrim", r: 0.02 });
  }

  // hips + legs + cargo pockets + cuffs
  parts.push({ size: [1.97, 0.5, 1.1], pos: [0, 3.4, 0], mat: "pants", r: 0.06 });
  for (const s of [-1, 1]) {
    parts.push({ size: [0.96, 2.6, 1.0], pos: [s * 0.49, 2.25, 0], mat: "pants", r: 0.08 });
    parts.push({ size: [1.0, 0.24, 1.04], pos: [s * 0.49, 1.07, 0], mat: "pants", r: 0.06 });
    parts.push({ size: [0.24, 1.1, 0.82], pos: [s * 1.07, 2.2, 0.02], mat: "pantsFlap", r: 0.06 });
    parts.push({ size: [0.26, 0.14, 0.86], pos: [s * 1.08, 2.7, 0.02], mat: "pants", r: 0.04 });
    parts.push({ size: [0.04, 0.5, 0.5], pos: [s * 1.2, 2.15, 0.02], mat: "ink", r: 0.01 });

    // sneakers
    const sx = s * 0.52;
    parts.push({ size: [1.12, 0.2, 1.7], pos: [sx, 0.1, 0.28], mat: "sole", r: 0.07 });
    parts.push({ size: [1.06, 0.5, 0.85], pos: [sx, 0.45, 0.62], mat: "shoe", r: 0.1 });
    parts.push({ size: [1.04, 0.78, 0.8], pos: [sx, 0.62, -0.1], mat: "shoe", r: 0.1 });
    parts.push({ size: [0.84, 0.16, 0.55], pos: [sx, 0.76, 0.45], mat: "shoe", r: 0.06 });
    parts.push({ size: [0.7, 0.05, 0.14], pos: [sx, 0.86, 0.38], mat: "sole", r: 0.02 });
    parts.push({ size: [0.7, 0.05, 0.14], pos: [sx, 0.86, 0.6], mat: "sole", r: 0.02 });
    // blue accents
    parts.push({ size: [0.05, 0.28, 0.3], pos: [s * 1.07, 0.45, 0.58], rot: [0, 0, 0], mat: "blue", r: 0.02 });
    parts.push({ size: [0.16, 0.05, 0.05], pos: [sx - 0.12, 0.34, 1.06], rot: [0, 0, 0.6], mat: "blue", r: 0.01 });
    parts.push({ size: [0.16, 0.05, 0.05], pos: [sx + 0.12, 0.34, 1.06], rot: [0, 0, -0.6], mat: "blue", r: 0.01 });
  }

  return parts;
}

/* ---------- head with hair (local to HEAD_PIVOT) ---------- */
export function buildHead(): Part[] {
  const parts: Part[] = [];
  const rnd = mulberry32(20260);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const hairMats: MatKey[] = ["hair0", "hair0", "hair1", "hair1", "hair2", "hair3"];

  // skull
  parts.push({ size: [1.95, 1.85, 1.85], pos: [0, HEAD_CENTER_Y, 0], mat: "skin", r: 0.14 });

  // eyebrows (slightly slanted)
  for (const s of [-1, 1]) {
    parts.push({
      size: [0.58, 0.15, 0.08],
      pos: [s * 0.48, 7.28, FACE_Z + 0.03],
      rot: [0, 0, s * -0.06],
      mat: "ink",
      r: 0.03,
    });
    // eye whites + upper lid line
    parts.push({ size: [EYE_W, EYE_H, 0.06], pos: [s * EYE_X, EYE_Y, FACE_Z + 0.025], mat: "eyeWhite", r: 0.025 });
    parts.push({ size: [EYE_W + 0.02, 0.06, 0.07], pos: [s * EYE_X, EYE_Y + EYE_H / 2, FACE_Z + 0.03], mat: "ink", r: 0.02 });
  }

  // nose
  parts.push({ size: [0.24, 0.28, 0.2], pos: [0, 6.7, FACE_Z + 0.09], mat: "skinShade", r: 0.06 });

  // smile (small curved row of pixels)
  const smile: [number, number][] = [
    [-0.24, 0.07],
    [-0.14, 0.02],
    [-0.04, -0.015],
    [0.06, -0.015],
    [0.16, 0.02],
    [0.26, 0.07],
  ];
  for (const [dx, dy] of smile) {
    parts.push({ size: [0.11, 0.075, 0.05], pos: [dx, 6.4 + dy, FACE_Z + 0.02], mat: "ink", r: 0.02 });
  }

  /* ----- hair ----- */
  // dark base shells so there are never gaps between slabs
  parts.push({ size: [2.7, 0.9, 2.6], pos: [0, 8.0, -0.06], mat: "hair3", r: 0.25 });
  parts.push({ size: [2.7, 2.1, 0.8], pos: [0, 7.2, -0.95], mat: "hair3", r: 0.22 });
  for (const s of [-1, 1]) {
    parts.push({ size: [0.5, 1.6, 2.0], pos: [s * 1.15, 7.2, -0.2], mat: "hair3", r: 0.16 });
  }

  const slabW = [0.5, 0.7, 0.9, 1.1];
  const slabH = [0.22, 0.28];
  const slabD = [0.4, 0.6];

  // crown: 3 layers of tilted slabs forming a puffy mound
  const layers = [20, 16, 10];
  layers.forEach((count, layer) => {
    for (let i = 0; i < count; i++) {
      const ang = rnd() * Math.PI * 2;
      const rad = Math.sqrt(rnd()) * (layer === 0 ? 1 : 0.86 - layer * 0.14);
      const x = Math.cos(ang) * rad * 1.4;
      const z = Math.sin(ang) * rad * 1.2 - 0.1;
      const y = 8.2 + layer * 0.22 - rad * rad * 0.4 + rnd() * 0.05;
      parts.push({
        size: [pick(slabW), pick(slabH), pick(slabD)],
        pos: [x, y, z],
        rot: [(z / 1.2) * 0.25 + (rnd() - 0.5) * 0.14, (rnd() - 0.5) * 1.3, -(x / 1.4) * 0.3 + (rnd() - 0.5) * 0.16],
        mat: pick(hairMats),
        r: 0.07,
      });
    }
  });

  // fringe swept across the forehead (two rows)
  [8.0, 7.8].forEach((y, row) => {
    for (let x = -1.1; x <= 1.15; x += 0.4) {
      parts.push({
        size: [pick([0.7, 0.9, 1.1]), 0.27, pick([0.45, 0.6])],
        pos: [x + (rnd() - 0.5) * 0.1, y + (rnd() - 0.5) * 0.04, 0.86 + rnd() * 0.1 + row * 0.03],
        rot: [-0.18 + (rnd() - 0.5) * 0.1, (rnd() - 0.5) * 0.2, -0.2 + (rnd() - 0.5) * 0.14],
        mat: pick(hairMats),
        r: 0.07,
      });
    }
  });

  // temples / sides: puffy volume that comes down to the ears
  for (const s of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      parts.push({
        size: [pick([0.34, 0.45]), pick(slabH) + 0.05, pick([0.45, 0.6])],
        pos: [s * (1.2 + rnd() * 0.22), 6.8 + rnd() * 1.5, -0.8 + rnd() * 1.5],
        rot: [(rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.3, s * (rnd() - 0.5) * 0.25],
        mat: pick(hairMats),
        r: 0.07,
      });
    }
  }

  // back of the head
  for (let i = 0; i < 30; i++) {
    parts.push({
      size: [pick([0.55, 0.7, 0.9]), pick(slabH) + 0.02, pick([0.35, 0.5])],
      pos: [-1.3 + rnd() * 2.6, 6.55 + rnd() * 1.7, -1.3 - rnd() * 0.1],
      rot: [(rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.25],
      mat: pick(hairMats),
      r: 0.07,
    });
  }

  return shift(parts, HEAD_PIVOT);
}

/* ---------- arms (local to shoulder / elbow pivots) ---------- */
export function buildArm(side: 1 | -1, withWatch: boolean): { upper: Part[]; lower: Part[] } {
  const sx = side * SHOULDER_X;
  const elbowY = SHOULDER_Y - ELBOW_DROP;

  const upper: Part[] = [
    { size: [1.0, 1.0, 1.0], pos: [sx, 5.4, 0], mat: "shirt", r: 0.1 },
    { size: [1.05, 0.4, 1.05], pos: [sx, 4.68, 0], mat: "blue", r: 0.06 },
    { size: [0.9, 0.24, 0.9], pos: [sx, 4.4, 0], mat: "skin", r: 0.05 },
  ];

  const lower: Part[] = [
    { size: [0.9, 1.4, 0.9], pos: [sx, 3.62, 0], mat: "skin", r: 0.1 },
    // hand
    { size: [0.9, 0.46, 0.92], pos: [sx, 2.98, 0.01], mat: "skin", r: 0.12 },
  ];
  if (withWatch) {
    lower.push({ size: [0.99, 0.46, 0.99], pos: [sx, 3.72, 0], mat: "watch", r: 0.07 });
    lower.push({ size: [0.14, 0.4, 0.56], pos: [sx + side * 0.52, 3.72, 0], mat: "screen", r: 0.04 });
  }

  return {
    upper: shift(upper, [sx, SHOULDER_Y, 0]),
    lower: shift(lower, [sx, elbowY, 0]),
  };
}
