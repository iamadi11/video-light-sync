import { LightState } from '@video-light-sync/core';

export class StreamClient {
  private ws: WebSocket | null = null;
  private url: string;
  private isConnected: boolean = false;

  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  private stateCallback: ((state: LightState) => void) | null = null;

  connect() {
    console.log(`Connecting to ${this.url}...`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to LightSync Server');
      this.isConnected = true;
    };

    this.ws.onmessage = (event) => {
      if (this.stateCallback) {
        try {
          const state = JSON.parse(event.data.toString()) as LightState;
          this.stateCallback(state);
        } catch (e) {
          console.error('Error parsing incoming state:', e);
        }
      }
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

  onState(callback: (state: LightState) => void) {
    this.stateCallback = callback;
  }

  sendState(state: LightState) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(state));
    }
  }
}
