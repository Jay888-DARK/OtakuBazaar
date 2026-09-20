/**
 * @file src/infrastructure/shipping/ShiprocketProvider.ts
 *
 * Infrastructure adapter implementing the IShippingProvider port using Shiprocket.
 * Isolates all Shiprocket API interactions behind the domain-level contract.
 *
 * NOTE: This is a structural stub. Replace the TODO blocks with actual
 * Shiprocket REST API calls when integrating.
 */

import type {
  IShippingProvider,
  CreateShipmentInput,
  ShipmentInfo,
} from '@/application/ports/IShippingProvider';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Shiprocket API credentials. */
interface ShiprocketConfig {
  readonly apiBaseUrl: string;
  readonly email: string;
  readonly password: string;
}

/**
 * Loads Shiprocket configuration from environment variables.
 *
 * @returns The Shiprocket configuration.
 * @throws {Error} If required environment variables are missing.
 */
function loadShiprocketConfig(): ShiprocketConfig {
  const email = process.env['SHIPROCKET_EMAIL'];
  const password = process.env['SHIPROCKET_PASSWORD'];

  if (!email || !password) {
    throw new Error(
      'Missing Shiprocket credentials: SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set'
    );
  }

  return {
    apiBaseUrl: process.env['SHIPROCKET_API_URL'] ?? 'https://apiv2.shiprocket.in/v1/external',
    email,
    password,
  };
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

/**
 * Shiprocket implementation of the {@link IShippingProvider} port.
 */
export class ShiprocketProvider implements IShippingProvider {
  private readonly config: ShiprocketConfig;

  constructor() {
    this.config = loadShiprocketConfig();
  }

  /**
   * {@inheritDoc IShippingProvider.createShipment}
   */
  async createShipment(input: CreateShipmentInput): Promise<ShipmentInfo> {
    // TODO: Replace with actual Shiprocket API call:
    // 1. Authenticate: POST /auth/login
    // 2. Create order: POST /orders/create/adhoc
    // 3. Generate AWB: POST /courier/assign/awb

    void this.config;
    void input;

    return {
      trackingId: `ship_stub_${Date.now()}`,
      status: 'booked',
      estimatedDelivery: null,
      trackingUrl: 'https://shiprocket.co/tracking/stub',
    };
  }

  /**
   * {@inheritDoc IShippingProvider.getTrackingStatus}
   */
  async getTrackingStatus(trackingId: string): Promise<ShipmentInfo> {
    // TODO: Replace with: GET /courier/track/awb/{trackingId}

    return {
      trackingId,
      status: 'in_transit',
      estimatedDelivery: null,
      trackingUrl: `https://shiprocket.co/tracking/${trackingId}`,
    };
  }

  /**
   * {@inheritDoc IShippingProvider.cancelShipment}
   */
  async cancelShipment(trackingId: string): Promise<boolean> {
    // TODO: Replace with: POST /orders/cancel

    void trackingId;
    return true;
  }
}
