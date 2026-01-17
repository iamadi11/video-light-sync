import * as dgram from 'dgram';
import { LightState } from '@video-light-sync/core';
import { LightAdapter } from '@video-light-sync/adapters-base';

export class WledAdapter implements LightAdapter {
  id: string;
  name: string;
  type: string = 'wled';
  zone: string = 'Desk'; // Example static zone
  
  private ip: string | null;
  private port: number;
  private client: dgram.Socket | null = null;
  private lastUpdate: number = 0;

  constructor(ip: string | null = null, port: number = 21324) {
    this.ip = ip;
    this.port = port;
    this.id = ip ? `wled-${ip}` : `wled-mock-${Math.random().toString(36).substr(2, 9)}`;
    this.name = ip ? `WLED Strip (${ip})` : 'WLED Strip (Mock)';
  }

  async init(): Promise<void> {
    if (!this.ip) {
      console.log(`[${this.name}] Initialized in MOCK MODE.`);
      return;
    }

    this.client = dgram.createSocket('udp4');
    console.log(`[${this.name}] UDP Socket created.`);
  }

  async sync(state: LightState): Promise<void> {
    const now = Date.now();
    // UDP is fast, but let's throttle slightly to 30fps
    if (now - this.lastUpdate < 32) return;
    this.lastUpdate = now;

    const r = state.rgb[0];
    const g = state.rgb[1];
    const b = state.rgb[2];

    if (this.ip && this.client) {
      // WLED WARLS / DRGB Protocol
      // Packet format: 
      // 0: Protocol Type (2 for DRGB)
      // 1: Timeout in seconds (2)
      // 2,3,4: R, G, B of LED 0
      // ...
      
      const buffer = Buffer.from([2, 2, r, g, b]);
      
      try {
        this.client.send(buffer, this.port, this.ip, (err) => {
          if (err) console.error(`[${this.name}] Send error:`, err);
        });
      } catch (e) {
        console.error(`[${this.name}] UDP Exception:`, e);
      }
    } else {
      if (Math.random() < 0.05) {
        console.log(`[${this.name}] Syncing: RGB(${r},${g},${b})`);
      }
    }
  }
}
