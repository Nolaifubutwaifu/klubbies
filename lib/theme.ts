// Per-club accent colour. Settings stores one hex value and every red accent
// in that club's pages follows it.

const DEFAULT_ACCENT = "#ec3013";

export const ACCENT_SWATCHES = [
  "#ec3013",
  "#c2410c",
  "#b45309",
  "#15803d",
  "#0f766e",
  "#1d4ed8",
  "#4338ca",
  "#7e22ce",
  "#be123c",
  "#2d2b2b",
];

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parse(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const int = Number.parseInt(match[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}

function mix(rgb: [number, number, number], target: [number, number, number], amount: number): string {
  return toHex([
    rgb[0] + (target[0] - rgb[0]) * amount,
    rgb[1] + (target[1] - rgb[1]) * amount,
    rgb[2] + (target[2] - rgb[2]) * amount,
  ]);
}

export function isValidAccent(hex: string | null | undefined): boolean {
  return Boolean(hex && parse(hex));
}

/**
 * Builds the accent ramp used by the component classes. Returns null for the
 * default colour so pages fall back to the stylesheet.
 */
export function accentStyle(hex: string | null | undefined): Record<string, string> | undefined {
  if (!hex) return undefined;
  const rgb = parse(hex);
  if (!rgb) return undefined;
  if (toHex(rgb).toLowerCase() === DEFAULT_ACCENT) return undefined;
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [32, 30, 29];
  return {
    "--color-accent": toHex(rgb),
    "--color-accent-100": mix(rgb, white, 0.92),
    "--color-accent-200": mix(rgb, white, 0.84),
    "--color-accent-300": mix(rgb, white, 0.66),
    "--color-accent-400": mix(rgb, white, 0.45),
    "--color-accent-500": mix(rgb, white, 0.12),
    "--color-accent-600": mix(rgb, black, 0.18),
    "--color-accent-700": mix(rgb, black, 0.34),
    "--color-accent-800": mix(rgb, black, 0.52),
    "--color-accent-900": mix(rgb, black, 0.68),
  } as Record<string, string>;
}

export { DEFAULT_ACCENT };
