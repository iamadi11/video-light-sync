import { z } from 'zod';

export const ZVisionConfig = z.object({
  width: z.number().int().min(10).default(100),
  height: z.number().int().min(10).default(50),
  fps: z.number().int().min(1).max(60).default(15),
  sampleStride: z.number().int().min(1).max(32).default(4),
});

export const ZNetworkConfig = z.object({
  port: z.number().int().min(1024).max(65535).default(3001),
  host: z.string().default('localhost'),
});

export const ZAppConfig = z.object({
  vision: ZVisionConfig,
  network: ZNetworkConfig,
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type VisionConfig = z.infer<typeof ZVisionConfig>;
export type NetworkConfig = z.infer<typeof ZNetworkConfig>;
export type AppConfig = z.infer<typeof ZAppConfig>;

/**
 * Helper to parse environment variables into a typed config object.
 * This helper is generic to support both process.env and import.meta.env inputs.
 */
export function parseConfig(env: Record<string, any>): AppConfig {
  const vision = {
    width: Number(env.VITE_VISION_WIDTH || env.VISION_WIDTH),
    height: Number(env.VITE_VISION_HEIGHT || env.VISION_HEIGHT),
    fps: Number(env.VITE_VISION_FPS || env.VISION_FPS),
    sampleStride: Number(env.VITE_VISION_SAMPLE_STRIDE || env.VISION_SAMPLE_STRIDE),
  };

  const network = {
    port: Number(env.VITE_TRANSPORT_PORT || env.TRANSPORT_PORT),
    host: env.VITE_TRANSPORT_HOST || env.TRANSPORT_HOST,
  };

  const config = {
    vision,
    network,
    logLevel: env.LOG_LEVEL || env.VITE_LOG_LEVEL,
  };

  // Strip undefined/NaN values so defaults work if using partial envs
  // (In strict parse they would fail, but we want to allow defaults if missing)
  const cleanObj = (obj: any) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] === undefined || Number.isNaN(obj[key])) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        cleanObj(obj[key]);
      }
    });
  };
  cleanObj(config);

  return ZAppConfig.parse(config);
}
