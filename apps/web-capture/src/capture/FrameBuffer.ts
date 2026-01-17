export class FrameBuffer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number = 300, height: number = 150) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    const context = this.canvas.getContext('2d', {
      willReadFrequently: true, // Optimized for frequent readback (vision phase)
      alpha: false, // We only care about RGB
    });

    if (!context) {
      throw new Error('Could not get 2D context for FrameBuffer');
    }

    this.ctx = context;
  }

  write(video: HTMLVideoElement): void {
    // Draw the current frame from the video element to the canvas
    // We can scale it down here for performance (vision doesn't need 4k)
    this.ctx.drawImage(video, 0, 0, this.width, this.height);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  // Debug method to visualize buffer in DOM
  mountDebug(container: HTMLElement) {
    container.appendChild(this.canvas);
    this.canvas.style.border = '1px solid red';
  }
}
