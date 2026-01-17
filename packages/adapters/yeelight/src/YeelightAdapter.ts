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
  
  // Retry logic
  private retryCount = 0;
  private maxRetries = 5;
  private retryDelayMs = 2000;
  private reconnecting = false;

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
    await this.connect();
  }

  private connect(): Promise<void> {
    if (!this.ip) return Promise.resolve();
    
    return new Promise((resolve) => {
      this.client = new net.Socket();
      
      // Set timeout for initial connection
      this.client.setTimeout(3000);

      this.client.connect(this.port, this.ip!, () => {
        console.log(`[${this.name}] Connected to bulb at ${this.ip}`);
        this.isConnected = true;
        this.retryCount = 0;
        this.reconnecting = false;
        resolve();
      });

      this.client.on('error', (err) => {
        console.error(`[${this.name}] Connection error: ${err.message}`);
        this.handleDisconnect();
        resolve(); // Resolve to not block startup
      });
      
      this.client.on('timeout', () => {
         console.error(`[${this.name}] Connection timeout`);
         this.client?.destroy();
         this.handleDisconnect();
         resolve();
      });

      this.client.on('close', () => {
        if (this.isConnected) {
            console.log(`[${this.name}] Connection closed`);
        }
        this.isConnected = false;
        // If not intentionally closed (logic could be added), try reconnect?
        // For now rely on manual or periodic checks, or just stay disconnected.
        // Actually, let's try auto-reconnect if it was a drop.
        if (!this.reconnecting) {
            this.handleDisconnect();
        }
      });
    });
  }

  private handleDisconnect() {
      this.isConnected = false;
      if (this.retryCount < this.maxRetries) {
          this.reconnecting = true;
          this.retryCount++;
          const delay = this.retryCount * this.retryDelayMs;
          console.log(`[${this.name}] Reconnecting in ${delay}ms (Attempt ${this.retryCount}/${this.maxRetries})...`);
          setTimeout(() => {
              this.connect().catch(e => console.error(e));
          }, delay);
      } else {
          console.warn(`[${this.name}] Max retries reached. Falling back to MOCK MODE or staying offline.`);
          this.reconnecting = false;
          // Could fallback to mock mode here transparently?
          // this.ip = null; 
      }
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

    if (this.ip && this.isConnected && this.client && !this.client.destroyed) {
      const duration = 300; // 300ms smoothing
      const cmd = {
        id: this.requestId++,
        method: 'set_rgb',
        params: [rgbInt, 'smooth', duration]
      };
      
      try {
        const payload = JSON.stringify(cmd) + '\r\n';
        this.client.write(payload, (err) => {
          if (err) {
              console.error(`[${this.name}] Write error:`, err);
              this.handleDisconnect();
          }
        });
      } catch (e) {
        console.error(`[${this.name}] Socket exception:`, e);
        this.handleDisconnect();
      }
      
    } else {
      // Mock log
      if (Math.random() < 0.05) {
         console.log(`[${this.name}] [MOCK/OFFLINE] Syncing: RGB(0x${rgbInt.toString(16)}) Bright(${bright}%)`);
      }
    }
  }
}
