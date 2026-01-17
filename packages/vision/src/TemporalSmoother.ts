import { LightState } from '@video-light-sync/core';

export class TemporalSmoother {
  private lastState: LightState | null = null;
  private alpha: number;

  /**
   * @param alpha Smoothing factor (0.0 - 1.0).
   * Lower = smoother (slower response). Higher = more responsive (jittery).
   * Default 0.2 means new state contributes 20%, old state keeps 80%.
   */
  constructor(alpha: number = 0.2) {
    this.alpha = alpha;
  }

  smooth(newState: LightState): LightState {
    if (!this.lastState) {
      this.lastState = newState;
      return newState;
    }

    const smoothed: LightState = {
      timestamp: newState.timestamp,
      // LERP RGB
      rgb: [
        this.lerp(this.lastState.rgb[0], newState.rgb[0]),
        this.lerp(this.lastState.rgb[1], newState.rgb[1]),
        this.lerp(this.lastState.rgb[2], newState.rgb[2]),
      ],
      // LERP Brightness/Warmth
      brightness: this.lerp(this.lastState.brightness, newState.brightness),
      warmth: this.lerp(this.lastState.warmth, newState.warmth),
    };

    this.lastState = smoothed;
    return smoothed;
  }

  private lerp(v0: number, v1: number): number {
    return v0 * (1 - this.alpha) + v1 * this.alpha;
  }
}
