import { z } from 'zod';

export const ZLightState = z.object({
  timestamp: z.number(),
  brightness: z.number().min(0).max(1),
  warmth: z.number().min(0).max(1),
  saturation: z.number().min(0).max(1).optional(),
  hue: z.number().min(0).max(360).optional(),
  rgb: z.tuple([
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255),
    z.number().int().min(0).max(255)
  ])
});

export type LightState = z.infer<typeof ZLightState>;

export const ZLightDevice = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.enum(['online', 'offline']),
  zone: z.string().optional()
});

export type LightDevice = z.infer<typeof ZLightDevice>;

export const ZServerMessageType = z.enum(['STATE_UPDATE', 'DEVICE_LIST']);
export type ServerMessageType = z.infer<typeof ZServerMessageType>;

export const ZServerMessage = z.object({
  type: ZServerMessageType,
  payload: z.any()
});

export type ServerMessage = z.infer<typeof ZServerMessage>;
