'use client';

/**
 * @file src/presentation/components/listings/ListingCard.tsx
 *
 * Presentational collectible card component matching the Live 3D Collector Card Preview.
 * Consumes SyncProvider for real-time listing status updates across browser tabs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSyncContext } from '@/presentation/components/providers/SyncProvider';
import type { SyncEvent } from '@/presentation/components/providers/SyncProvider';
import type { ListingStatusType } from '@/domain/value-objects/ListingStatus';
import type { ListingId } from '@/domain/types';
import { CurioBox } from '@/presentation/components/CurioBox';

export interface ListingCardProps {
  /** Unique listing identifier. */
  readonly id: ListingId;
  /** Display title. */
  readonly title: string;
  /** Primary image URL. */
  readonly imageUrl: string;
  /** Formatted price string (e.g., "₹4,500"). */
  readonly displayPrice: string;
  /** Seller's display name. */
  readonly sellerName: string;
  /** Current listing status. */
  readonly initialStatus: ListingStatusType;
  /** Item condition. */
  readonly condition: string;
  /** Optional series or category. */
  readonly series?: string;
  /** Optional original price. */
  readonly originalPrice?: string;
  /** Optional click handler to open bargain. */
  readonly onOpenBargain?: () => void;
}

export function ListingCard(props: ListingCardProps): React.JSX.Element {
  const { id, title, imageUrl, displayPrice, sellerName, condition, initialStatus, series, originalPrice, onOpenBargain } = props;
  const [status, setStatus] = useState<ListingStatusType>(initialStatus);
  const { subscribe } = useSyncContext();

  // ---- Real-Time Sync Subscription ----
  const handleSyncEvent = useCallback(
    (syncEvent: SyncEvent) => {
      const payload = syncEvent.event.payload as { listingId?: string };
      if (payload.listingId !== id) return;

      switch (syncEvent.event.type) {
        case 'LISTING_RESERVED':
          setStatus('RESERVED');
          break;
        case 'LISTING_SOLD':
          setStatus('SOLD');
          break;
        case 'LISTING_CANCELLED':
          setStatus('CANCELLED');
          break;
      }
    },
    [id]
  );

  useEffect(() => {
    const unsubs = [
      subscribe('LISTING_RESERVED', handleSyncEvent),
      subscribe('LISTING_SOLD', handleSyncEvent),
      subscribe('LISTING_CANCELLED', handleSyncEvent),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, [subscribe, handleSyncEvent]);

  const isAvailable = status === 'ACTIVE';
  const isLocked = status === 'RESERVED';
  const rankBadge = condition === 'NEW' ? '[S-RANK]' : '[A-RANK]';
  const numericPrice = parseInt(displayPrice.replace(/[^0-9]/g, ''), 10) || 0;
  const numericOriginal = originalPrice ? parseInt(originalPrice.replace(/[^0-9]/g, ''), 10) : undefined;

  return (
    <CurioBox
      id={id}
      title={title}
      imageUrl={imageUrl}
      askingPriceINR={numericPrice}
      originalPriceINR={numericOriginal}
      sellerName={sellerName}
      conditionGrade={rankBadge}
      series={series}
      isLocked={isLocked}
      maxTilt={12}
      onClick={onOpenBargain}
      onBargainClick={onOpenBargain}
    />
  );
}
