import * as net from 'net';
import { LightState } from '@video-light-sync/core';
import { LightAdapter } from '@video-light-sync/adapters-base';

export class YeelightAdapter implements LightAdapter {
  id: string;
  name: string;
  type: string = 'yeelight';
  private ip: string | null;
  private port: number;
  private client: net.Socket | null = null;
  private requestId: number = 1;
  private isConnected: boolean = false;
  private lastUpdate: number = 0;

  constructor(ip: string | null = null, port: number = 55443) {
    this.ip = ip;
    this.id = ip ? `yeelight-${ip}` : `yeelight-mock-${Math.random().toString(36).substr(2, 9)}`;
    this.name = ip ? `Yeelight (${ip})` : 'Yeelight (Mock)';
    this.port = port;
  }

  async init(): Promise<void> {
    if (!this.ip) {
      console.log(`[${this.name}] Initialized in MOCK MODE. Commands will be logged.`);
      return;
    }

    return new Promise((resolve) => {
      this.client = new net.Socket();
      
      this.client.connect(this.port, this.ip!, () => {
        console.log(`[${this.name}] Connected to bulb at ${this.ip}`);
        this.isConnected = true;
        resolve();
      });

      this.client.on('error', (err) => {
        console.error(`[${this.name}] Connection error:`, err.message);
        console.log(`[${this.name}] Falling back to MOCK MODE.`);
        this.isConnected = false;
        this.ip = null; // Fallback
        resolve(); // Resolve anyway so app startup continues
      });

      this.client.on('close', () => {
        console.log(`[${this.name}] Connection closed`);
        this.isConnected = false;
      });
    });
  }

  async sync(state: LightState): Promise<void> {
    // Throttle to max 10 updates / sec to be safe with cheap wifi bulbs
    const now = Date.now();
    if (now - this.lastUpdate < 100) return;
    this.lastUpdate = now;

    // Convert RGB to integer for Yeelight
    // (r << 16) | (g << 8) | b
    const rgbInt = (state.rgb[0] << 16) + (state.rgb[1] << 8) + state.rgb[2];
    
    // Brightness 0-100
    const bright = Math.max(1, Math.min(100, Math.floor(state.brightness * 100)));

    if (this.ip && this.isConnected && this.client) {
      // Send real command
      // We use "set_scene" ["color", rgb, brightness] for smoothest transitions if supported,
      // or set_rgb + set_bright. 
      // "set_rgb" command: [rgb_value, "smooth", duration]
      const cmd = {
        id: this.requestId++,
        method: 'set_rgb',
        params: [rgbInt, 'smooth', 100]
      };
      
      this.client.write(JSON.stringify(cmd) + '\r\n');
      
      // Also set brightness if it changed significantly? 
      // Yeelight set_rgb uses current brightness unless we use set_scene.
      // For simplicity in Phase 4, we just send set_rgb which looks cool.
      
    } else {
      // Mock log
      // Only log occasionally to avoid spam
      if (Math.random() < 0.05) {
         console.log(`[${this.name}] Syncing: RGB(0x${rgbInt.toString(16)}) Bright(${bright}%)`);
      }
    }
  }
}
