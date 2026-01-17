import { LightSyncServer } from './server.js';

const server = new LightSyncServer(3001);

// Keep alive
process.on('SIGINT', () => {
  server.close();
  process.exit();
});
