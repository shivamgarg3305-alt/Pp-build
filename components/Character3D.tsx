"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { memo, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  ELBOW_DROP,
  EYE_H,
  EYE_W,
  EYE_X,
  EYE_Y,
  FACE_Z,
  HEAD_PIVOT,
  PUPIL_H,
  PUPIL_W,
  SHOULDER_X,
  SHOULDER_Y,
  buildArm,
  buildBody,
  buildHead,
  type MatKey,
  type Part,
  type PointerState,
  type Vec3,
} from "@/lib/characterSpec";

type Mats = Record<MatKey, THREE.Material>;

const ZERO: Vec3 = [0, 0, 0];
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

const WAVE_PERIOD = 0.5;
const WAVE_CYCLES = 4;

/* ------------------------------------------------------------------ */
/* Rounded box geometry (core three only, cached by dimensions)        */
/* ------------------------------------------------------------------ */
function createRoundedBox(w: number, h: number, d: number, r: number, seg: number) {
  const segments = seg * 2 + 1;
  const radius = Math.min(w / 2, h / 2, d / 2, r);
  const geo = new THREE.BoxGeometry(1, 1, 1, segments, segments, segments);
  const half = 0.5 / segments;
  const box = new THREE.Vector3(w / 2 - radius, h / 2 - radius, d / 2 - radius);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  const n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    n.set(x - Math.sign(x) * half, y - Math.sign(y) * half, z - Math.sign(z) * half).normalize();
    pos.setXYZ(
      i,
      box.x * Math.sign(x) + n.x * radius,
      box.y * Math.sign(y) + n.y * radius,
      box.z * Math.sign(z) + n.z * radius
    );
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  pos.needsUpdate = true;
  nor.needsUpdate = true;
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
function getBox(w: number, h: number, d: number, r: number) {
  const key = `${w}|${h}|${d}|${r}`;
  let geo = geoCache.get(key);
  if (!geo) {
    geo = createRoundedBox(w, h, d, r, r >= 0.1 ? 3 : r >= 0.04 ? 2 : 1);
    geoCache.set(key, geo);
  }
  return geo;
}

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */
function makeMaterials(): Mats {
  const std = (color: string, roughness: number, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const fabric = (color: string, roughness = 0.85, sheenColor = "#ffffff") =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness,
      sheen: 0.6,
      sheenRoughness: 0.6,
      sheenColor: new THREE.Color(sheenColor),
    });
  const hair = (color: string) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.48,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
      sheen: 0.7,
      sheenRoughness: 0.45,
      sheenColor: new THREE.Color("#5a4640"),
    });

  return {
    skin: std("#EEB68B", 0.6),
    skinShade: std("#E2A57C", 0.64),
    shirt: fabric("#EFE9EB"),
    shirtShade: fabric("#D9D2D6"),
    blue: fabric("#7FA6E6", 0.75, "#cfe0ff"),
    pants: fabric("#2A2120", 0.9, "#6b5a58"),
    pantsFlap: fabric("#352B2A", 0.9, "#6b5a58"),
    pack: fabric("#2C2625", 0.8, "#7a6a68"),
    packTrim: fabric("#7FA6E6", 0.6, "#cfe0ff"),
    shoe: std("#EDE6EA", 0.5),
    sole: std("#CFC8CD", 0.55),
    ink: std("#1B1210", 0.7),
    eyeWhite: std("#F6F2F4", 0.35),
    watch: std("#151515", 0.35, 0.2),
    screen: std("#050505", 0.12, 0.4),
    hair0: hair("#1B1210"),
    hair1: hair("#241816"),
    hair2: hair("#30221E"),
    hair3: hair("#120C0B"),
  };
}

/* ------------------------------------------------------------------ */
/* Studio environment (local, no network): soft boxes baked via PMREM  */
/* ------------------------------------------------------------------ */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new THREE.Scene();
    env.background = new THREE.Color(0.015, 0.015, 0.015);

    const panel = (w: number, h: number, intensity: number, x: number, y: number, z: number) => {
      const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
      mat.color.setScalar(intensity);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(x, y, z);
      mesh.lookAt(0, 4.5, 0);
      env.add(mesh);
    };

    panel(14, 10, 6, 8, 10, 14); // key soft box
    panel(10, 10, 2, -12, 5, 8); // fill
    panel(12, 12, 5, 0, 8, -14); // rim / back
    panel(18, 4, 3, 0, 16, 2); // top strip
    panel(20, 20, 0.35, 0, -3, 6); // floor bounce

    const target = pmrem.fromScene(env, 0.02);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.55;
    invalidate();

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      env.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      });
    };
  }, [gl, scene, invalidate]);

  return null;
}

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */
const PartMesh = memo(function PartMesh({ part, mats }: { part: Part; mats: Mats }) {
  const geo = useMemo(
    () => getBox(part.size[0], part.size[1], part.size[2], part.r ?? 0.06),
    [part]
  );
  return (
    <mesh
      geometry={geo}
      material={mats[part.mat]}
      position={part.pos}
      rotation={part.rot ?? ZERO}
      castShadow
      receiveShadow
    />
  );
});

function Parts({ parts, mats }: { parts: Part[]; mats: Mats }) {
  return (
    <>
      {parts.map((p, i) => (
        <PartMesh key={i} part={p} mats={mats} />
      ))}
    </>
  );
}

const headLocal = (x: number, y: number, z: number): Vec3 => [
  x - HEAD_PIVOT[0],
  y - HEAD_PIVOT[1],
  z - HEAD_PIVOT[2],
];

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */
function Scene({ pointer, reduced }: { pointer: MutableRefObject<PointerState>; reduced: boolean }) {
  const mats = useMemo(makeMaterials, []);
  const body = useMemo(buildBody, []);
  const head = useMemo(buildHead, []);
  const armL = useMemo(() => buildArm(-1, false), []);
  const armR = useMemo(() => buildArm(1, true), []);

  const pupilGeo = useMemo(() => getBox(PUPIL_W, PUPIL_H, 0.03, 0.01), []);
  const glintGeo = useMemo(() => getBox(0.07, 0.07, 0.03, 0.01), []);
  const lidGeo = useMemo(() => getBox(EYE_W + 0.05, EYE_H + 0.07, 0.05, 0.02), []);

  const root = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const armLU = useRef<THREE.Group>(null);
  const armLL = useRef<THREE.Group>(null);
  const armRU = useRef<THREE.Group>(null);
  const armRL = useRef<THREE.Group>(null);
  const pupilL = useRef<THREE.Group>(null);
  const pupilR = useRef<THREE.Group>(null);
  const lidL = useRef<THREE.Group>(null);
  const lidR = useRef<THREE.Group>(null);

  const look = useRef({ x: 0, y: 0 });
  const wave = useRef({ next: 1.8, start: -1 });
  const blink = useRef({ next: 2.5, start: -1 });

  useFrame((state, delta) => {
    if (reduced) return;
    const r = root.current;
    const h = headRef.current;
    if (!r || !h) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    look.current.x = THREE.MathUtils.damp(look.current.x, clamp(pointer.current.x, -1, 1), 4, dt);
    look.current.y = THREE.MathUtils.damp(look.current.y, clamp(pointer.current.y, -1, 1), 4, dt);
    const lx = look.current.x;
    const ly = look.current.y;

    // body: bob, breathe, subtle turn toward the pointer
    r.position.y = Math.sin(t * 1.6) * 0.035;
    r.scale.y = 1 + Math.sin(t * 1.9) * 0.004;
    r.rotation.y = lx * 0.2 + Math.sin(t * 0.5) * 0.025;

    // head: sway, nod, tilt toward the pointer
    h.rotation.y = lx * 0.45 + Math.sin(t * 0.9 + 0.6) * 0.04;
    h.rotation.x = ly * 0.2 + Math.sin(t * 1.3) * 0.02;
    h.rotation.z = -lx * 0.04 + Math.sin(t * 0.7) * 0.015;

    // pupils follow the pointer, clamped inside the eye sockets
    const px = clamp(lx, -1, 1) * 0.11;
    const py = -clamp(ly, -1, 1) * 0.05;
    if (pupilL.current) pupilL.current.position.set(px, py, 0);
    if (pupilR.current) pupilR.current.position.set(px, py, 0);

    // left arm: gentle swing
    if (armLU.current) {
      armLU.current.rotation.x = Math.sin(t * 1.6) * 0.05;
      armLU.current.rotation.z = -0.04;
    }
    if (armLL.current) armLL.current.rotation.x = -0.06;

    // right arm: swing + wave hello every 7-12 seconds
    const w = wave.current;
    if (w.start < 0 && t >= w.next) w.start = t;

    let k = 0;
    let osc = 0;
    if (w.start >= 0) {
      const e = t - w.start;
      const up = 0.7;
      const hold = WAVE_PERIOD * WAVE_CYCLES;
      const down = 0.7;
      if (e < up) {
        k = ease(e / up);
      } else if (e < up + hold) {
        k = 1;
        osc = Math.sin(((e - up) / WAVE_PERIOD) * Math.PI * 2);
      } else if (e < up + hold + down) {
        k = 1 - ease((e - up - hold) / down);
      } else {
        w.start = -1;
        w.next = t + 7 + Math.random() * 5;
      }
    }
    if (armRU.current) {
      armRU.current.rotation.x = Math.sin(t * 1.6 + 2.8) * 0.05 * (1 - k);
      armRU.current.rotation.z = lerp(0.04, 1.75, k) + osc * 0.03;
    }
    if (armRL.current) {
      armRL.current.rotation.z = lerp(0, 1.2, k) + osc * 0.45;
      armRL.current.rotation.x = lerp(-0.06, 0, k);
    }

    // blink every 2.2-6 seconds with a skin-coloured eyelid
    const b = blink.current;
    if (b.start < 0 && t >= b.next) b.start = t;
    let lid = 0;
    if (b.start >= 0) {
      const p = (t - b.start) / 0.16;
      if (p >= 1) {
        b.start = -1;
        b.next = t + 2.2 + Math.random() * 3.8;
      } else {
        lid = 1 - Math.abs(2 * p - 1);
      }
    }
    if (lidL.current) lidL.current.scale.y = lid;
    if (lidR.current) lidR.current.scale.y = lid;
  });

  const eye = (side: -1 | 1, pupilRef: typeof pupilL, lidRef: typeof lidL) => (
    <group position={headLocal(side * EYE_X, EYE_Y, FACE_Z)}>
      <group ref={pupilRef}>
        <mesh geometry={pupilGeo} material={mats.ink} position={[0, 0, 0.06]} castShadow />
        <mesh geometry={glintGeo} material={mats.eyeWhite} position={[0.065, 0.075, 0.085]} />
      </group>
      <group ref={lidRef} position={[0, EYE_H / 2 + 0.035, 0.1]} scale={[1, 0, 1]}>
        <mesh geometry={lidGeo} material={mats.skin} position={[0, -(EYE_H + 0.07) / 2, 0]} />
      </group>
    </group>
  );

  return (
    <>
      <StudioEnvironment />
      <hemisphereLight args={["#ffffff", "#1a1a1a", 0.35]} />
      <directionalLight
        castShadow
        position={[7, 11, 13]}
        intensity={2.3}
        color="#fff6ee"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={14}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-9, 5, 9]} intensity={0.7} color="#e4ecff" />
      <directionalLight position={[-4, 9, -14]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[8, 6, -12]} intensity={1.4} color="#ffffff" />

      <group ref={root}>
        <Parts parts={body} mats={mats} />

        <group ref={headRef} position={HEAD_PIVOT}>
          <Parts parts={head} mats={mats} />
          {eye(-1, pupilL, lidL)}
          {eye(1, pupilR, lidR)}
        </group>

        <group ref={armLU} position={[-SHOULDER_X, SHOULDER_Y, 0]}>
          <Parts parts={armL.upper} mats={mats} />
          <group ref={armLL} position={[0, -ELBOW_DROP, 0]}>
            <Parts parts={armL.lower} mats={mats} />
          </group>
        </group>

        <group ref={armRU} position={[SHOULDER_X, SHOULDER_Y, 0]}>
          <Parts parts={armR.upper} mats={mats} />
          <group ref={armRL} position={[0, -ELBOW_DROP, 0]}>
            <Parts parts={armR.lower} mats={mats} />
          </group>
        </group>
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */
export default function Character3D({
  pointer,
  reduced,
  active,
  onReady,
}: {
  pointer: MutableRefObject<PointerState>;
  reduced: boolean;
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={[1.5, 2.5]}
      shadows="soft"
      frameloop={reduced ? "demand" : active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 4.62, 26], fov: 21, near: 5, far: 70 }}
      onCreated={() => onReady()}
      style={{ background: "transparent" }}
    >
      <Scene pointer={pointer} reduced={reduced} />
    </Canvas>
  );
}
