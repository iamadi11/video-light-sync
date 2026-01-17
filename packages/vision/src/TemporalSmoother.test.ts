import { describe, it, expect } from 'vitest';
import { TemporalSmoother } from './TemporalSmoother.js';

describe('TemporalSmoother', () => {
  it('initializes with the first state', () => {
    const smoother = new TemporalSmoother();
    const state = {
      timestamp: 1000,
      brightness: 1.0,
      warmth: 0.5,
      rgb: [255, 255, 255] as [number, number, number]
    };
    const result = smoother.smooth(state);
    expect(result).toEqual(state);
  });

  it('smoothes subsequent states', () => {
    const smoother = new TemporalSmoother(0.5); // 50% blend
    const state1 = {
      timestamp: 1000,
      brightness: 0.0,
      warmth: 0.0,
      rgb: [0, 0, 0] as [number, number, number]
    };
    smoother.smooth(state1);

    const state2 = {
      timestamp: 2000,
      brightness: 1.0,
      warmth: 1.0,
      rgb: [100, 100, 100] as [number, number, number]
    };
    const result = smoother.smooth(state2);

    // Expected: 0.5 * 0 + 0.5 * 1 = 0.5 brightness
    expect(result.brightness).toBe(0.5);
    expect(result.warmth).toBe(0.5);
    expect(result.rgb[0]).toBe(50);
  });
});
