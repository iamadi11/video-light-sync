import { LightState } from '@video-light-sync/core';
import { TemporalSmoother } from './TemporalSmoother';

export interface FrameProcessorOptions {
  sampleStride?: number;
  width?: number;
  height?: number;
  fps?: number; // Used for potential throttling internally if needed
}

export class FrameProcessor {
  private sampleStride: number;
  private width: number;
  private height: number;
  private smoother: TemporalSmoother;
  private lastSentState: LightState | null = null;

  // Thresholds
  private rgbThreshold = 5; 
  private brightnessThreshold = 0.05; 

  constructor(options: FrameProcessorOptions = {}) {
    this.sampleStride = options.sampleStride || 4;
    this.width = options.width || 100;
    this.height = options.height || 50;
    
    // Validate inputs
    if (this.sampleStride < 1) throw new Error('sampleStride must be >= 1');
    if (this.width < 1 || this.height < 1) throw new Error('Invalid frame dimensions');

    this.smoother = new TemporalSmoother(0.15); 
  }

  process(canvas: HTMLCanvasElement | OffscreenCanvas | ImageData): LightState | null {
    let data: Uint8ClampedArray;
    let width: number;
    let height: number;

    // Support flexible inputs
    if (canvas instanceof ImageData) {
      data = canvas.data;
      width = canvas.width;
      height = canvas.height;
    } else {
        width = canvas.width;
        height = canvas.height;
        // Basic validation of incoming frame size to match expected config
        // This acts as a runtime check for the buffer logic upstream
        if (width !== this.width || height !== this.height) {
           console.warn(`[FrameProcessor] Input size ${width}x${height} does not match config ${this.width}x${this.height}. Processing might be slow or incorrect.`);
        }

        const ctx = (canvas as any).getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error('Could not get context for frame processing');
        }
        const imageData = ctx.getImageData(0, 0, width, height);
        data = imageData.data;
    }
    
    let r = 0, g = 0, b = 0;
    let count = 0;

    // Loop through pixels
    for (let i = 0; i < data.length; i += 4 * this.sampleStride) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    if (count === 0) return null;

    // Average
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    // Calculate Brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Calculate Warmth
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

    // Diff Check
    if (this.lastSentState) {
        const dR = Math.abs(smoothedState.rgb[0] - this.lastSentState.rgb[0]);
        const dG = Math.abs(smoothedState.rgb[1] - this.lastSentState.rgb[1]);
        const dB = Math.abs(smoothedState.rgb[2] - this.lastSentState.rgb[2]);
        const dBri = Math.abs(smoothedState.brightness - this.lastSentState.brightness);

        if ((dR + dG + dB) < this.rgbThreshold && dBri < this.brightnessThreshold) {
            return null; 
        }
    }
    
    this.lastSentState = smoothedState;
    return smoothedState;
  }

  dispose(): void {
    this.lastSentState = null;
  }
}
