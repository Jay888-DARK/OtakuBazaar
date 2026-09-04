/**
 * @file src/domain/value-objects/Money.ts
 *
 * Immutable value object representing a monetary amount with a specific currency.
 * Enforces currency-safe arithmetic — you cannot add INR to USD without an
 * explicit conversion step. Amounts are stored in the smallest currency unit
 * (e.g., paise for INR, cents for USD) to avoid floating-point issues.
 */

import type { CurrencyCode } from '@/domain/types';

/**
 * Immutable value object for monetary amounts.
 *
 * Stores the amount in the **smallest indivisible unit** of the currency
 * (paise, cents, etc.) as an integer to eliminate floating-point rounding.
 */
export class Money {
  /** Amount in smallest currency unit (e.g., 50000 = ₹500.00). */
  public readonly amountInSmallestUnit: number;

  /** ISO 4217 currency code. */
  public readonly currency: CurrencyCode;

  /**
   * @param amountInSmallestUnit - Integer amount in smallest unit (paise/cents).
   * @param currency - ISO 4217 currency code.
   * @throws {Error} If amount is not a non-negative integer.
   */
  constructor(amountInSmallestUnit: number, currency: CurrencyCode) {
    if (!Number.isInteger(amountInSmallestUnit) || amountInSmallestUnit < 0) {
      throw new Error(
        `Money amount must be a non-negative integer, received: ${amountInSmallestUnit}`
      );
    }
    this.amountInSmallestUnit = amountInSmallestUnit;
    this.currency = currency;
  }

  // -----------------------------------------------------------------------
  // Factory
  // -----------------------------------------------------------------------

  /**
   * Creates a Money instance from a human-readable major-unit value.
   *
   * @param majorUnits - Amount in major units (e.g., 500 for ₹500.00).
   * @param currency - ISO 4217 currency code.
   * @returns A new Money instance.
   *
   * @example
   * ```ts
   * const price = Money.fromMajorUnits(499.99, 'INR'); // 49999 paise
   * ```
   */
  static fromMajorUnits(majorUnits: number, currency: CurrencyCode): Money {
    const factor = currency === 'JPY' ? 1 : 100; // JPY has no minor unit
    return new Money(Math.round(majorUnits * factor), currency);
  }

  // -----------------------------------------------------------------------
  // Arithmetic
  // -----------------------------------------------------------------------

  /**
   * Adds another Money value of the same currency.
   *
   * @param other - The Money value to add.
   * @returns A new Money instance representing the sum.
   * @throws {Error} If currencies do not match.
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amountInSmallestUnit + other.amountInSmallestUnit, this.currency);
  }

  /**
   * Subtracts another Money value of the same currency.
   *
   * @param other - The Money value to subtract.
   * @returns A new Money instance representing the difference.
   * @throws {Error} If currencies do not match or result would be negative.
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amountInSmallestUnit - other.amountInSmallestUnit;
    if (result < 0) {
      throw new Error('Money subtraction would result in a negative amount');
    }
    return new Money(result, this.currency);
  }

  // -----------------------------------------------------------------------
  // Comparison & Equality
  // -----------------------------------------------------------------------

  /**
   * Value equality — two Money instances are equal if both amount and
   * currency match.
   *
   * @param other - The Money value to compare.
   * @returns `true` if both amount and currency are identical.
   */
  equals(other: Money): boolean {
    return (
      this.amountInSmallestUnit === other.amountInSmallestUnit &&
      this.currency === other.currency
    );
  }

  /**
   * Returns `true` if this amount is strictly greater than `other`.
   *
   * @param other - The Money value to compare.
   * @returns `true` if this > other.
   * @throws {Error} If currencies do not match.
   */
  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amountInSmallestUnit > other.amountInSmallestUnit;
  }

  // -----------------------------------------------------------------------
  // Display
  // -----------------------------------------------------------------------

  /**
   * Formats the amount for display in major units (e.g., "₹500.00").
   *
   * @returns A locale-formatted currency string.
   */
  toDisplayString(): string {
    const factor = this.currency === 'JPY' ? 1 : 100;
    const majorUnits = this.amountInSmallestUnit / factor;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currency,
    }).format(majorUnits);
  }

  // -----------------------------------------------------------------------
  // Private Helpers
  // -----------------------------------------------------------------------

  /**
   * Asserts that two Money instances share the same currency.
   *
   * @param other - The Money value to check against.
   * @throws {Error} If currencies differ.
   */
  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: cannot operate on ${this.currency} and ${other.currency}`
      );
    }
  }
}
