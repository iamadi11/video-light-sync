import { LightState } from '@video-light-sync/core';
import { TemporalSmoother } from './TemporalSmoother';

export class FrameProcessor {
  // Optimization: Only process every Nth pixel to save CPU
  private sampleStride: number;
  private smoother: TemporalSmoother;
  private lastSentState: LightState | null = null;

  // Thresholds
  private rgbThreshold = 5; // cumulative RGB difference required
  private brightnessThreshold = 0.05; // 5% brightness diff required

  constructor(options: { sampleStride?: number } = {}) {
    this.sampleStride = options.sampleStride || 4;
    this.smoother = new TemporalSmoother(0.15); // Fairly smooth
  }

  process(canvas: HTMLCanvasElement | OffscreenCanvas): LightState | null {
    const width = canvas.width;
    const height = canvas.height;
    
    // In a real optimized scenario, we might caching the context or use WebGL.
    // For now, getting 2d context is fine for 10-20Hz on reasonably small buffers (e.g. 300x150).
    // Note: OffscreenCanvas and HTMLCanvasElement have getContext but typing can be tricky.
    // We assume the upstream FrameBuffer provided a canvas that can return a 2D context.
    const ctx = (canvas as any).getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
      throw new Error('Could not get context for frame processing');
    }

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0;
    let count = 0;

    // Loop through pixels
    for (let i = 0; i < data.length; i += 4 * this.sampleStride) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    // Average
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    // Calculate Brightness (Simple max component or luminance)
    // Using perceived luminance: 0.299R + 0.587G + 0.114B
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Calculate Warmth (Simplified)
    // High Red + Low Blue = Warm. High Blue = Cool.
    // Let's normalize R and B balance to 0-1.
    // 0.5 is neutral. > 0.5 is warm, < 0.5 is cool.
    // This is a heuristic.
    let warmth = 0.5;
    if (r + b > 0) {
      warmth = r / (r + b); 
    }

    const rawState: LightState = {
      timestamp: Date.now(),
      rgb: [r, g, b],
      brightness: parseFloat(luminance.toFixed(3)),
      warmth: parseFloat(warmth.toFixed(3)),
    };

    // Smooth
    const smoothedState = this.smoother.smooth(rawState);

    // Diff Check (Optimization)
    if (this.lastSentState) {
        const dR = Math.abs(smoothedState.rgb[0] - this.lastSentState.rgb[0]);
        const dG = Math.abs(smoothedState.rgb[1] - this.lastSentState.rgb[1]);
        const dB = Math.abs(smoothedState.rgb[2] - this.lastSentState.rgb[2]);
        const dBri = Math.abs(smoothedState.brightness - this.lastSentState.brightness);

        if ((dR + dG + dB) < this.rgbThreshold && dBri < this.brightnessThreshold) {
            // Change is too small, ignore
            return null; 
        }
    }

    this.lastSentState = smoothedState;
    return smoothedState;
  }
}
