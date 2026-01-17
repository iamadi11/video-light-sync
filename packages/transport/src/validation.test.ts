import { describe, it, expect } from 'vitest';
import { ZServerMessage } from '@video-light-sync/core';

describe('Transport Validation', () => {
  it('validates a correct ServerMessage', () => {
    const raw = {
      type: 'STATE_UPDATE',
      payload: {
        timestamp: 12345,
        brightness: 1,
        warmth: 0,
        rgb: [255, 0, 0]
      }
    };
    const result = ZServerMessage.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('rejects malformed messages', () => {
    const raw = {
      type: 'UNKNOWN_TYPE', // Invalid enum
      payload: {}
    };
    const result = ZServerMessage.safeParse(raw);
    expect(result.success).toBe(false);
  });
});
