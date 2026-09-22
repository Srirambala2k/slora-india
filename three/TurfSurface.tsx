"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { BLOCK, LABEL_Y, LAYERS, SPANS } from "@/data/turf";
import { cameraPose } from "@/lib/journey/camera";
import { labelReveal } from "@/lib/journey/phases";
import { mulberry32, speckleTexture } from "./textures";
import styles from "./turf.module.css";

const HALF_W = BLOCK.width / 2;
const HALF_D = BLOCK.depth / 2;

/* ── The grass: thousands of instanced blades, bent and swayed on the GPU ────────────── */

const VERTEX = /* glsl */ `
  attribute vec3 iOffset;   // where the blade is planted
  attribute vec4 iParams;   // height, lean, yaw, phase
  uniform float uTime;
  uniform float uWidth;
  uniform float uWind;
  uniform vec2 uHalf;       // half the block's width and depth
  varying float vT;
  varying float vRand;
  varying float vDepth;

  void main() {
    float h = iParams.x;
    float lean = iParams.y;
    float yaw = iParams.z;
    float phase = iParams.w;

    vec3 p = position;                 // a flat strip, y from 0 (root) to 1 (tip)
    float t = p.y;
    p.x *= uWidth * (1.0 - 0.9 * t);   // taper to a point
    p.y *= h;

    float sway = sin(uTime * 1.25 + phase + iOffset.x * 0.55) * 0.5
               + sin(uTime * 2.1 + iOffset.z * 0.7 + phase * 1.7) * 0.22;
    // blades near the cut edges stand straighter, so the cross-section stays clean
    float edge = max(smoothstep(uHalf.x - 0.4, uHalf.x - 0.05, abs(iOffset.x)),
                     smoothstep(uHalf.y - 0.4, uHalf.y - 0.05, abs(iOffset.z)));
    float bend = (lean + uWind * sway) * t * t * (1.0 - 0.9 * edge);
    p.z += bend * h;
    p.y -= bend * bend * 0.22 * h;     // bending shortens the blade a little

    float c = cos(yaw);
    float s = sin(yaw);
    p.xz = mat2(c, -s, s, c) * p.xz;

    vec4 mv = modelViewMatrix * vec4(p + iOffset, 1.0);
    vT = t;
    vRand = fract(phase * 7.13);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uTip;
  varying float vT;
  varying float vRand;
  varying float vDepth;

  void main() {
    vec3 col = mix(uBase, uTip, smoothstep(0.0, 1.0, vT));
    col *= 0.82 + 0.36 * vRand;
    col += vec3(0.05, 0.06, 0.02) * pow(vT, 3.0);
    col *= mix(0.3, 1.0, exp(-vDepth * 0.055));   // things far away sink into the dark
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Blades({ count }: { count: number }) {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1, 1, 5);
    geo.translate(0, 0.5, 0);

    const rand = mulberry32(11);
    const offset = new Float32Array(count * 3);
    const params = new Float32Array(count * 4);
    // jittered grid, so blades are evenly spread without bald patches or clumps
    const cols = Math.round(Math.sqrt((count * BLOCK.width) / BLOCK.depth));
    const rows = Math.ceil(count / cols);
    let i = 0;
    for (let r = 0; r < rows && i < count; r++) {
      for (let c = 0; c < cols && i < count; c++, i++) {
        offset[i * 3] = ((c + rand()) / cols - 0.5) * BLOCK.width * 0.97;
        offset[i * 3 + 1] = SPANS.fibres.bottom;
        offset[i * 3 + 2] = ((r + rand()) / rows - 0.5) * BLOCK.depth * 0.97;
        params[i * 4] = 0.86 + rand() * 0.31; // height
        params[i * 4 + 1] = (rand() - 0.5) * 0.7; // lean
        params[i * 4 + 2] = rand() * Math.PI * 2; // yaw
        params[i * 4 + 3] = rand() * 6.2832; // phase
      }
    }
    geo.setAttribute("iOffset", new THREE.InstancedBufferAttribute(offset, 3));
    geo.setAttribute("iParams", new THREE.InstancedBufferAttribute(params, 4));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uWidth: { value: 0.05 },
        uWind: { value: 0.16 },
        uHalf: { value: new THREE.Vector2(HALF_W, HALF_D) },
        uBase: { value: new THREE.Color("#0a2012") },
        uTip: { value: new THREE.Color("#4f8a35") },
      },
    });
    return { geometry: geo, material: mat };
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <instancedMesh args={[geometry, material, count]} frustumCulled={false} />;
}

/* ── The cut-away block: infill, backing, base, drainage, subgrade ───────────────────── */

interface LayerProps {
  bottom: number;
  top: number;
  base: string;
  specks: string[];
  count: number;
  radius: [number, number];
  seed: number;
  repeat: number;
}

function Layer({ bottom, top, base, specks, count, radius, seed, repeat }: LayerProps) {
  const height = top - bottom;
  const map = useMemo(() => {
    const t = speckleTexture({
      base,
      specks,
      count,
      minRadius: radius[0],
      maxRadius: radius[1],
      seed,
    });
    t.repeat.set(BLOCK.width * repeat, Math.max(1, height * repeat));
    return t;
  }, [base, specks, count, radius, seed, repeat, height]);
  useEffect(() => () => map.dispose(), [map]);

  return (
    <mesh position={[0, (bottom + top) / 2, 0]}>
      <boxGeometry args={[BLOCK.width, height, BLOCK.depth]} />
      <meshStandardMaterial map={map} roughness={1} metalness={0} />
    </mesh>
  );
}

const BOUNDARIES = [
  SPANS.infill.top,
  SPANS.infill.bottom,
  SPANS.backing.bottom,
  SPANS.base.bottom,
  SPANS.drainage.bottom,
];

function Block() {
  return (
    <group>
      <Layer
        {...SPANS.infill}
        base="#a08b62"
        specks={["#c4af86", "#8a774f", "#b59c6c", "#d1bd93"]}
        count={1400}
        radius={[0.8, 2.2]}
        seed={3}
        repeat={1.6}
      />
      <Layer
        {...SPANS.backing}
        base="#0c0c0c"
        specks={["#1c1c1c", "#141414", "#252525"]}
        count={900}
        radius={[0.6, 1.4]}
        seed={5}
        repeat={2}
      />
      <Layer
        {...SPANS.base}
        base="#76766e"
        specks={["#9a9a90", "#55554f", "#8a8a80", "#adada2"]}
        count={520}
        radius={[3, 8]}
        seed={9}
        repeat={1.2}
      />
      <Layer
        {...SPANS.drainage}
        base="#474b4b"
        specks={["#6a6f6f", "#343737", "#5b6060"]}
        count={420}
        radius={[3, 9]}
        seed={13}
        repeat={1.2}
      />
      <Layer
        {...SPANS.subgrade}
        base="#3a3125"
        specks={["#4d4232", "#2a2319", "#5b4d39"]}
        count={700}
        radius={[1, 3]}
        seed={17}
        repeat={1.4}
      />

      {/* perforated drainage pipes running away from us, seen end-on in the cut face */}
      {[-1.7, 0, 1.7].map((x) => (
        <group key={x} position={[x, -1.55, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.27, 0.27, BLOCK.depth + 0.03, 40]} />
            <meshStandardMaterial color="#2b2d2d" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, HALF_D + 0.0165]}>
            <circleGeometry args={[0.2, 40]} />
            <meshBasicMaterial color="#050606" />
          </mesh>
        </group>
      ))}

      {/* hairlines marking where one layer ends and the next begins */}
      {BOUNDARIES.map((y) => (
        <mesh key={y} position={[0, y, HALF_D + 0.004]}>
          <boxGeometry args={[BLOCK.width, 0.008, 0.004]} />
          <meshBasicMaterial color="#f5f5f3" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Camera + labels, driven by scroll progress ──────────────────────────────────────── */

interface RigProps {
  progress: MutableRefObject<number>;
  labels: MutableRefObject<Array<HTMLDivElement | null>>;
}

function Rig({ progress, labels }: RigProps) {
  const state = useRef({ q: 0, px: 0, py: 0, fov: 0 });

  useFrame(({ camera, pointer }, delta) => {
    const s = state.current;
    // ease toward the scroll position so the camera glides instead of following every wheel notch
    s.q += (progress.current - s.q) * (1 - Math.exp(-delta * 11));
    s.px += (pointer.x - s.px) * (1 - Math.exp(-delta * 3));
    s.py += (pointer.y - s.py) * (1 - Math.exp(-delta * 3));

    const pose = cameraPose(s.q);
    camera.position.set(
      pose.position[0] + s.px * 0.16,
      pose.position[1] + s.py * 0.09,
      pose.position[2],
    );
    camera.lookAt(pose.target[0], pose.target[1], pose.target[2]);
    const perspective = camera as THREE.PerspectiveCamera;
    if (Math.abs(perspective.fov - pose.fov) > 0.001) {
      perspective.fov = pose.fov;
      perspective.updateProjectionMatrix();
    }

    labels.current.forEach((el, i) => {
      if (!el) return;
      const a = labelReveal(s.q, i, LAYERS.length);
      el.style.opacity = String(a);
      el.style.transform = `translate(${(1 - a) * -14}px, -50%)`;
    });
  });
  return null;
}

function Labels({ refs }: { refs: MutableRefObject<Array<HTMLDivElement | null>> }) {
  return (
    <>
      {LAYERS.map((layer, i) => (
        <Html
          key={layer.id}
          position={[HALF_W + 0.06, LABEL_Y[layer.id], HALF_D]}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={styles.label}
            style={{ opacity: 0 }}
          >
            <span className={styles.dot} />
            <span className={styles.leader} />
            <span className={styles.name}>
              <b>{layer.n}</b>
              {layer.label}
            </span>
          </div>
        </Html>
      ))}
    </>
  );
}

export interface TurfSceneProps {
  /** 0 → 1 progress of the 3D camera path (a ref, so scrolling never re-renders React). */
  progress: MutableRefObject<number>;
  bladeCount?: number;
  /** Called once the GPU programs are compiled and the scene can be drawn without a hitch. */
  onCompiled?: () => void;
}

/** Compile the shaders in the background (the browser does it in parallel, off the main thread). */
function Precompile({ onCompiled }: { onCompiled?: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && onCompiled?.();
    if (typeof gl.compileAsync === "function") gl.compileAsync(scene, camera).then(done, done);
    else done();
    return () => {
      cancelled = true;
    };
    // run once, when the scene first exists
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function TurfScene({ progress, bladeCount = 26000, onCompiled }: TurfSceneProps) {
  const labels = useRef<Array<HTMLDivElement | null>>([]);
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 6]} intensity={2.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#9db4ff" />
      <Blades count={bladeCount} />
      <Block />
      <Labels refs={labels} />
      <Rig progress={progress} labels={labels} />
      <Precompile onCompiled={onCompiled} />
    </>
  );
}
