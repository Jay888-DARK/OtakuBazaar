/**
 * @file src/infrastructure/security/TokenService.ts
 *
 * Enterprise Authentication & Session Security Service.
 *
 * Responsibilities:
 * 1. Cryptographically sign and verify JSON Web Tokens (JWT).
 * 2. Configure RFC 6265 compliant cookie attributes (HttpOnly, Secure, SameSite=Strict).
 * 3. Enforce token expiration and tamper resistance.
 *
 * Security Invariants:
 * - JWTs are never accessible to client-side JavaScript (mitigating XSS token exfiltration).
 * - SameSite=Strict mitigates Cross-Site Request Forgery (CSRF).
 * - Secure flag ensures tokens are only transmitted over TLS/HTTPS in production.
 */

import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

/** Valid user role permissions across OtakuBazaar */
export type UserRole = 'BUYER' | 'SELLER' | 'MODERATOR' | 'ADMIN';

/** Payload encoded within the authenticated JWT session token */
export interface TokenPayload {
  /** Unique user identifier */
  readonly userId: string;
  /** User email address */
  readonly email: string;
  /** Public display name */
  readonly name: string;
  /** Platform permission role */
  readonly role: UserRole;
  /** Standard JWT issuance time (seconds since epoch) */
  readonly iat?: number;
  /** Standard JWT expiration time (seconds since epoch) */
  readonly exp?: number;
}

/** Cookie configuration options returned for Set-Cookie header */
export interface CookieOptions {
  readonly name: string;
  readonly value: string;
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: 'strict' | 'lax' | 'none';
  readonly path: string;
  readonly maxAge: number; // in seconds
}

// ---------------------------------------------------------------------------
// Constants & Fallbacks
// ---------------------------------------------------------------------------

/** Session cookie name */
export const SESSION_COOKIE_NAME = 'otaku_session';

/** Default token lifespan: 7 days in seconds */
export const DEFAULT_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Secret key for JWT signing; defaults to secure development secret */
const JWT_SECRET: Secret =
  process.env.JWT_SECRET || 'otakubazaar_dev_super_secret_jwt_key_2026_ninja_stream';

export class TokenService {
  /**
   * Signs a secure JWT for an authenticated user.
   *
   * @param payload - User identity and role claims (excluding iat/exp)
   * @param expiresInSeconds - Token validity duration (default: 7 days)
   * @returns Signed JWT string
   */
  public static signToken(
    payload: Omit<TokenPayload, 'iat' | 'exp'>,
    expiresInSeconds: number = DEFAULT_SESSION_MAX_AGE_SECONDS
  ): string {
    const options: SignOptions = {
      algorithm: 'HS256',
      expiresIn: expiresInSeconds,
      issuer: 'otakubazaar.com',
      audience: 'otakubazaar-users',
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }

  /**
   * Verifies and decodes a JWT token string.
   *
   * @param token - Raw JWT string from cookie or Authorization header
   * @returns Decoded TokenPayload if valid, or null if tampered/expired
   */
  public static verifyToken(token: string | null | undefined): TokenPayload | null {
    if (!token || typeof token !== 'string') {
      return null;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'otakubazaar.com',
        audience: 'otakubazaar-users',
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      // In production, log structured security event
      const errorMessage = error instanceof Error ? error.message : 'Unknown JWT verification failure';
      if (process.env.NODE_ENV !== 'test') {
        console.warn(`[TokenService] JWT Verification Failed: ${errorMessage}`);
      }
      return null;
    }
  }

  /**
   * Builds the cookie descriptor for setting the session cookie.
   * Enforces HttpOnly, Secure, and SameSite=Strict.
   *
   * @param token - Signed JWT token string
   * @param maxAgeSeconds - Lifespan in seconds (default: 7 days)
   * @returns CookieOptions object ready for Next.js response cookies
   */
  public static getSessionCookieOptions(
    token: string,
    maxAgeSeconds: number = DEFAULT_SESSION_MAX_AGE_SECONDS
  ): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true, // Prevents document.cookie JavaScript access (XSS mitigation)
      secure: isProduction, // Transmitted only over HTTPS in production
      sameSite: 'strict', // Blocks cross-site request token transmission (CSRF mitigation)
      path: '/',
      maxAge: maxAgeSeconds,
    };
  }

  /**
   * Builds a cookie descriptor to expire and clear the session cookie.
   *
   * @returns CookieOptions with maxAge=0 and empty value
   */
  public static getLogoutCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Immediately expires the cookie in the browser
    };
  }
}
