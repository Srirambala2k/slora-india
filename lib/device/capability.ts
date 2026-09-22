"use client";

import { useSyncExternalStore } from "react";

/**
 * What can this device do? Decided once per page load, and shared by every part of the site
 * that has a heavy version and a light one (the scroll journey, the Sports rail).
 *
 *   full   – hardware-accelerated graphics: everything, including the 3D and the sideways rail
 *   video  – no graphics card (software rendering would stutter): no 3D; pinned effects that
 *            move big pictures every frame are replaced by native scrolling
 *   simple – phones, data-saver: the light version, no pinned scrolling
 *
 * Add ?journey=full | video | light to the address to force a tier (for testing and review).
 */
export type Capability = "full" | "video" | "simple";

/** Names browsers give to software (no graphics card) renderers. */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/** True when a WebGL renderer name belongs to a software renderer (no graphics card). */
export function isSoftwareRenderer(name: string): boolean {
  return SOFTWARE_RENDERER.test(name);
}

function webglAvailable(requireHardware: boolean): boolean {
  try {
    const canvas = document.createElement("canvas");
    // failIfMajorPerformanceCaveat makes the browser refuse a software renderer…
    const options = { failIfMajorPerformanceCaveat: requireHardware };
    const gl = (canvas.getContext("webgl2", options) ??
      canvas.getContext("webgl", options)) as WebGLRenderingContext | null;
    if (!gl) return false;
    let hardware = true;
    if (requireHardware) {
      // …but some browsers still hand one over, so also read the renderer's name.
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      hardware = !isSoftwareRenderer(name);
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return hardware;
  } catch {
    return false;
  }
}

let capability: Capability | undefined;

export function detectCapability(): Capability {
  if (capability) return capability;
  const override = new URLSearchParams(window.location.search).get("journey");
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;
  if (override === "light" || saveData === true) capability = "simple";
  else if (override === "video") capability = "video";
  else if (override === "full") capability = webglAvailable(false) ? "full" : "video";
  else capability = webglAvailable(true) ? "full" : "video";
  return capability;
}

const noSubscribe = () => () => {};

/** The device's tier. Renders as "simple" on the server, then the real answer once in the browser. */
export function useCapability(): Capability {
  return useSyncExternalStore(noSubscribe, detectCapability, (): Capability => "simple");
}

/** ?sports=pinned | swipe forces one version of the Sports section (for review and testing). */
function readRailOverride(): "pinned" | "swipe" | null {
  const value = new URLSearchParams(window.location.search).get("sports");
  return value === "pinned" || value === "swipe" ? value : null;
}

export function useRailOverride(): "pinned" | "swipe" | null {
  return useSyncExternalStore(noSubscribe, readRailOverride, () => null);
}
