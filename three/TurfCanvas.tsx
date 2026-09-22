"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useState, type MutableRefObject } from "react";
import { TurfScene } from "./TurfSurface";

interface TurfCanvasProps {
  /** 0 → 1 progress of the camera path. */
  progress: MutableRefObject<number>;
  /** Only render continuously while the scene is on screen. */
  active: boolean;
}

/**
 * The 3D turf (master prompt P§9). Loaded lazily by the journey, never at page load.
 * Its GPU programs are compiled in the background first (no drawing until that is done, so
 * there is no freeze), it draws one still frame, and after that it only keeps rendering while
 * `active` (on screen). If the device struggles, the pixel ratio drops on its own.
 */
export default function TurfCanvas({ progress, active }: TurfCanvasProps) {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  // Nothing is drawn until the GPU programs have been compiled (off the main thread).
  const [compiled, setCompiled] = useState(false);
  return (
    <Canvas
      frameloop={!compiled ? "never" : active ? "always" : "demand"}
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 32, near: 0.05, far: 60, position: [0.35, 0.42, 1.05] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
      <TurfScene progress={progress} onCompiled={() => setCompiled(true)} />
    </Canvas>
  );
}
