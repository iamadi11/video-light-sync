export class ScreenRecorder {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor', // Prefer monitor sharing, but user can choose others
        },
        audio: false,
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
    } catch (error) {
      console.error('Error starting screen capture:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.videoElement.srcObject = null;
    }
  }

  isActive(): boolean {
    return !!this.stream && this.stream.active;
  }
}
