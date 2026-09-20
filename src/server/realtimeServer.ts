/**
 * @file src/server/realtimeServer.ts
 *
 * Single Responsibility: Entry point for booting the standalone real-time
 * bargaining and multi-window synchronization service.
 *
 * Configures Redis connections, mounts BargainingWebSocketServer,
 * and handles graceful process termination.
 */

import http from 'http';
import { RedisSyncManager } from '../infrastructure/realtime/RedisSyncManager';
import { BargainingWebSocketServer } from '../infrastructure/realtime/BargainingWebSocketServer';

async function bootstrap(): Promise<void> {
  const PORT = parseInt(process.env.WS_PORT || '8080', 10);
  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const JWT_SECRET = process.env.JWT_SECRET || 'otaku-bazaar-dev-secret-key-32ch';

  console.info('====================================================');
  console.info('🎌 OtakuBazaar Real-Time Bargaining Service booting');
  console.info('====================================================');

  // 1. Initialize Redis Sync Manager
  const redisSync = new RedisSyncManager({
    redisUrl: REDIS_URL,
    keyPrefix: 'otaku:',
    allowFallback: true, // In-memory fallback if Redis is not started locally
  });

  await redisSync.initialize();

  // 2. Create HTTP server for WebSocket upgrade
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'healthy',
        service: 'OtakuBazaar Real-Time Bargaining Service',
        timestamp: new Date().toISOString(),
      })
    );
  });

  // 3. Mount WebSocket Server
  const wss = new BargainingWebSocketServer({
    server,
    redisSync,
    jwtSecret: JWT_SECRET,
  });

  server.listen(PORT, () => {
    console.info(`[RealtimeServer] HTTP & WS listening on port ${PORT}`);
    console.info(`[RealtimeServer] WebSocket endpoint: ws://localhost:${PORT}?token=<jwt>`);
  });

  // 4. Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.info(`[RealtimeServer] Received ${signal}. Shutting down gracefully...`);
    await wss.close();
    await redisSync.shutdown();
    server.close(() => {
      console.info('[RealtimeServer] HTTP server stopped. Exit complete.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[RealtimeServer] Fatal error during bootstrap:', err);
  process.exit(1);
});
