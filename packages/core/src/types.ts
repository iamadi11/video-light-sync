export interface LightState {
  timestamp: number;
  /** 0.0 to 1.0 */
  brightness: number;
  /** 0.0 (cool) to 1.0 (warm) */
  warmth: number;
  /** 0.0 to 1.0 (optional) */
  saturation?: number;
  /** 0-360 (optional) */
  hue?: number;
  /** [r, g, b] 0-255 each. Useful for direct color setting. */
  rgb: [number, number, number];
}
