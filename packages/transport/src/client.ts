import { LightState, ZLightState, ZServerMessage } from '@video-light-sync/core';

export class StreamClient {
  private ws: WebSocket | null = null;
  private url: string;
  private isConnected: boolean = false;

  constructor(url: string = 'ws://localhost:3001') {
    this.url = url;
  }

  private stateCallback: ((state: LightState) => void) | null = null;
  private deviceListCallback: ((devices: any[]) => void) | null = null;

  connect() {
    console.log(`Connecting to ${this.url}...`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('Connected to LightSync Server');
      this.isConnected = true;
    };

    this.ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data.toString());

        // 1. Envelope
        const envelope = ZServerMessage.safeParse(raw);
        if (envelope.success) {
           const { type, payload } = envelope.data;
           if (type === 'STATE_UPDATE' && this.stateCallback) {
             this.stateCallback(payload);
           } else if (type === 'DEVICE_LIST' && this.deviceListCallback) {
             this.deviceListCallback(payload);
           }
           return;
        }

        // 2. Fallback raw
        const state = ZLightState.safeParse(raw);
        if (state.success && this.stateCallback) {
          this.stateCallback(state.data);
          return;
        }
      } catch (e) {
        console.error('Error parsing incoming message:', e);
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
  
  onDeviceList(callback: (devices: any[]) => void) {
    this.deviceListCallback = callback;
  }

  sendState(state: LightState) {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(state));
    }
  }
}
