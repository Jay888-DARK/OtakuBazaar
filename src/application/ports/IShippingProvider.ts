/**
 * @file src/application/ports/IShippingProvider.ts
 *
 * Port interface for shipping/logistics operations.
 * Abstracts Shiprocket (or any shipping provider) behind a domain-level
 * contract so the application layer is provider-agnostic.
 */

// ---------------------------------------------------------------------------
// DTOs for the Shipping Port
// ---------------------------------------------------------------------------

/** Address structure for shipment origin/destination. */
export interface ShippingAddress {
  readonly name: string;
  readonly line1: string;
  readonly line2?: string | undefined;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly phone: string;
}

/** Input for creating a shipment order. */
export interface CreateShipmentInput {
  /** Internal order/listing reference ID. */
  readonly referenceId: string;
  /** Pickup (seller) address. */
  readonly origin: ShippingAddress;
  /** Delivery (buyer) address. */
  readonly destination: ShippingAddress;
  /** Package weight in kilograms. */
  readonly weightKg: number;
  /** Package dimensions in centimetres. */
  readonly dimensions: {
    readonly lengthCm: number;
    readonly widthCm: number;
    readonly heightCm: number;
  };
}

/** Shipment tracking information. */
export interface ShipmentInfo {
  /** Provider-assigned shipment/AWB tracking ID. */
  readonly trackingId: string;
  /** Current shipment status. */
  readonly status: 'booked' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  /** Estimated delivery date (ISO-8601). */
  readonly estimatedDelivery: string | null;
  /** Provider-specific tracking URL. */
  readonly trackingUrl: string;
}

/**
 * Port for shipping/logistics operations.
 *
 * Infrastructure adapters implement this for specific providers
 * (e.g., Shiprocket, Delhivery).
 */
export interface IShippingProvider {
  /**
   * Creates a shipment order with the logistics provider.
   *
   * @param input - Shipment creation parameters.
   * @returns The created shipment's tracking info.
   * @throws {Error} If the provider rejects the shipment (e.g., unserviceable pin code).
   */
  createShipment(input: CreateShipmentInput): Promise<ShipmentInfo>;

  /**
   * Retrieves the current tracking status for a shipment.
   *
   * @param trackingId - The provider-assigned tracking ID.
   * @returns Updated shipment info.
   * @throws {Error} If the tracking ID is invalid or the provider is unreachable.
   */
  getTrackingStatus(trackingId: string): Promise<ShipmentInfo>;

  /**
   * Cancels a shipment that has not yet been picked up.
   *
   * @param trackingId - The provider-assigned tracking ID.
   * @returns `true` if the cancellation was successful.
   * @throws {Error} If the shipment cannot be cancelled (already picked up).
   */
  cancelShipment(trackingId: string): Promise<boolean>;
}
