import { LightSyncServer } from './server.js';
import { YeelightAdapter } from '@video-light-sync/adapters-yeelight';

// To test with a real bulb, replace null with '192.168.1.x'
const yeelight = new YeelightAdapter(null); 

const server = new LightSyncServer(3001, [yeelight]);

// Keep alive
process.on('SIGINT', () => {
  server.close();
  process.exit();
});
