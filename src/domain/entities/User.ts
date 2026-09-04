/**
 * @file src/domain/entities/User.ts
 *
 * User entity representing a marketplace participant (buyer or seller).
 * Pure domain object — no framework dependencies.
 */

import type { UserId, ISOTimestamp } from '@/domain/types';

// ---------------------------------------------------------------------------
// Construction Props
// ---------------------------------------------------------------------------

/** Properties required to hydrate a User entity. */
export interface UserProps {
  readonly id: UserId;
  readonly displayName: string;
  readonly email: string;
  readonly avatarUrl: string | null;
  readonly rating: number;
  readonly totalSales: number;
  readonly totalPurchases: number;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

/**
 * Domain entity representing a registered user on OtakuBazaar.
 *
 * Users can act as both buyers and sellers. Trust is established through
 * the {@link rating} field (0–5 scale, updated after each completed trade).
 */
export class User {
  public readonly id: UserId;
  public readonly displayName: string;
  public readonly email: string;
  public readonly avatarUrl: string | null;
  public readonly rating: number;
  public readonly totalSales: number;
  public readonly totalPurchases: number;
  public readonly createdAt: ISOTimestamp;
  public readonly updatedAt: ISOTimestamp;

  /**
   * @param props - Hydration properties (typically from a repository).
   */
  constructor(props: UserProps) {
    this.id = props.id;
    this.displayName = props.displayName;
    this.email = props.email;
    this.avatarUrl = props.avatarUrl;
    this.rating = props.rating;
    this.totalSales = props.totalSales;
    this.totalPurchases = props.totalPurchases;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Returns `true` if the user has completed at least one trade,
   * indicating a verified track record.
   *
   * @returns Whether the user has trade history.
   */
  hasTradeHistory(): boolean {
    return this.totalSales + this.totalPurchases > 0;
  }

  /**
   * Returns `true` if the user's rating qualifies them as a "trusted seller"
   * (rating ≥ 4.0 with at least 5 sales).
   *
   * @returns Whether the user is a trusted seller.
   */
  isTrustedSeller(): boolean {
    return this.rating >= 4.0 && this.totalSales >= 5;
  }
}
