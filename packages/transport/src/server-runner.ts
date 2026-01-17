import 'dotenv/config'; // Load .env file
import { LightSyncServer } from './server.js';
import { YeelightAdapter } from '@video-light-sync/adapters-yeelight';
// import { WledAdapter } from '@video-light-sync/adapters-wled';
import { parseConfig, AppConfig } from '@video-light-sync/core';

// 1. Load Config
const config: AppConfig = parseConfig(process.env);

console.log('Loaded Config:', JSON.stringify(config, null, 2));

// 2. Init Adapters
const adapters = [];

// Yeelight
if (process.env.ENABLED_ADAPTERS?.includes('yeelight')) {
    const ips = process.env.YEELIGHT_IPS ? process.env.YEELIGHT_IPS.split(',') : [null]; // null = mock/discovery
    ips.forEach(ip => {
        adapters.push(new YeelightAdapter(ip));
    });
}
// Always add a mock one if empty? No, respect config.
if (adapters.length === 0) {
    console.warn('No adapters enabled in .env! Adding a Mock Yeelight for demo purposes.');
    adapters.push(new YeelightAdapter(null));
}

// 3. Start Server
const server = new LightSyncServer(config.network, adapters);

// Keep alive
process.on('SIGINT', () => {
  server.close();
  process.exit();
});
