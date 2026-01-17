import { LightState } from '@video-light-sync/core';

export class StreamClient {
  private ws: WebSocket | null = null;
  private url: string;
  private isConnected: boolean = false;

  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  connect() {
    console.log(`Connecting to ${this.url}...`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to LightSync Server');
      this.isConnected = true;
    };

    this.ws.onclose = () => {
      console.warn('Disconnected from server. Retrying in 3s...');
      this.isConnected = false;
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }

  sendState(state: LightState) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(state));
    }
  }
}
