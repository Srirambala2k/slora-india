/**
 * The layers of an artificial-turf surface, top to bottom, as the 3D cross-section and its
 * phone fallback both show them (master prompt P§9).
 *
 * ILLUSTRATIVE ONLY: names and order, no measurements. Thicknesses here are for drawing,
 * not specifications, and the UI says so ("NOT TO SCALE"). Real build-ups and figures
 * appear only when SLORA supplies verified data.
 */
export const LAYERS = [
  { id: "fibres", n: "01", label: "GRASS FIBRES" },
  { id: "infill", n: "02", label: "INFILL" },
  { id: "backing", n: "03", label: "BACKING" },
  { id: "base", n: "04", label: "BASE" },
  { id: "drainage", n: "05", label: "DRAINAGE" },
] as const;

export type LayerId = (typeof LAYERS)[number]["id"];

/** Drawing units for the 3D block (not real dimensions). */
export const BLOCK = { width: 5.2, depth: 2.6 } as const;

/** Vertical extent of each band, top and bottom, in drawing units. */
export const SPANS = {
  fibres: { bottom: -0.22, top: 0.95 }, // blades stand up out of the backing
  infill: { bottom: -0.22, top: 0.28 },
  backing: { bottom: -0.3, top: -0.22 },
  base: { bottom: -1.25, top: -0.3 },
  drainage: { bottom: -1.85, top: -1.25 },
  subgrade: { bottom: -2.2, top: -1.85 },
} as const;

/** Height at which each label points (middle of its band). */
export const LABEL_Y: Record<LayerId, number> = {
  fibres: 0.62,
  infill: 0.03,
  backing: -0.26,
  base: -0.78,
  drainage: -1.55,
};
