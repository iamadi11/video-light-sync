import { describe, it, expect } from 'vitest';
import { ZLightState, ZLightDevice } from './types.js';

describe('Core Types', () => {
  it('validates a correct LightState', () => {
    const valid = {
      timestamp: Date.now(),
      brightness: 0.5,
      warmth: 0.2,
      rgb: [255, 128, 0]
    };
    const result = ZLightState.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid RGB values', () => {
    const invalid = {
      timestamp: Date.now(),
      brightness: 0.5,
      warmth: 0.2,
      rgb: [300, -10, 0] // Invalid
    };
    const result = ZLightState.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
