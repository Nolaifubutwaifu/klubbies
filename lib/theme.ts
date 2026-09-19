// Per-club tone. Klubbies' vermillion is fixed brand — it carries headline
// emphasis, tags, eyebrows and the tier-2 button in every club. What a club
// picks is its *quiet* layer: the tier-3 button, the accessory labels and the
// supporting surfaces. Settings stores one hex value and these three tokens
// are mixed from it.

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
 * Builds the supporting tones for a club. Returns undefined when the club has
 * not picked one, so those pages fall back to the neutral lilac in the
 * stylesheet. The club's colour never touches --color-accent: the red is
 * Klubbies' own and stays the same in every club.
 *
 * Each token mixes the club's hue into the lilac rather than into white, which
 * keeps the result calm enough to sit under the fixed vermillion and lands the
 * quiet tier around 1.9:1 against white — better than the flat lilac's 1.45:1.
 */
export function clubToneStyle(hex: string | null | undefined): Record<string, string> | undefined {
  if (!hex) return undefined;
  const rgb = parse(hex);
  if (!rgb) return undefined;
  const lilac: [number, number, number] = [241, 233, 251];
  const lilacDeep: [number, number, number] = [216, 200, 240];
  const lilacInk: [number, number, number] = [67, 51, 92];
  return {
    "--tone-support": mix(rgb, lilac, 0.9),
    "--tone-support-deep": mix(rgb, lilacDeep, 0.84),
    "--tone-support-ink": mix(rgb, lilacInk, 0.78),
  } as Record<string, string>;
}

export { DEFAULT_ACCENT };
