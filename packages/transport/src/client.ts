import { LightState } from '@video-light-sync/core';

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
        const data = JSON.parse(event.data.toString());
        
        // Handle legacy LightState direct broadcast (backward compat if needed, or if server sends raw)
        // Check if it has 'brightness' property directly
        if (data.brightness !== undefined && this.stateCallback) {
          this.stateCallback(data as LightState);
          return;
        }

        // Handle ServerMessage envelope
        if (data.type === 'STATE_UPDATE' && this.stateCallback) {
          this.stateCallback(data.payload);
        } else if (data.type === 'DEVICE_LIST' && this.deviceListCallback) {
          this.deviceListCallback(data.payload);
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
