/**
 * @file src/infrastructure/services/pusherServer.ts
 *
 * Pusher Server Singleton for OtakuBazaar.
 * Powers real-time post-bid messaging across Escrow Order channels.
 */

import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'app_id_placeholder',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || 'key_placeholder',
  secret: process.env.PUSHER_SECRET || 'secret_placeholder',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
  useTLS: true,
});

export default pusherServer;
