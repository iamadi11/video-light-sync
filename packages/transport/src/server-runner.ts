import { LightSyncServer } from './server.js';
import { YeelightAdapter } from '@video-light-sync/adapters-yeelight';
import { WledAdapter } from '@video-light-sync/adapters-wled';

// To test with a real bulb, replace null with '192.168.1.x'
const yeelight = new YeelightAdapter(null); 
const wled = new WledAdapter(null);

const server = new LightSyncServer(3001, [yeelight, wled]);

// Keep alive
process.on('SIGINT', () => {
  server.close();
  process.exit();
});
