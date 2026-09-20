/**
 * @file src/infrastructure/security/RBACGuard.ts
 *
 * Role-Based Access Control (RBAC) & Request Authentication Middleware.
 *
 * Responsibilities:
 * 1. Extract session token from HttpOnly cookies (with Bearer Authorization header fallback).
 * 2. Validate token integrity and decode caller claims (userId, email, role).
 * 3. Enforce granular permissions against defined roles: BUYER, SELLER, MODERATOR, ADMIN.
 * 4. Generate standardized RFC 7807 compliant error responses for unauthenticated or forbidden requests.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { TokenService, SESSION_COOKIE_NAME, type TokenPayload, type UserRole } from './TokenService';

// ---------------------------------------------------------------------------
// Role Definitions & Hierarchy
// ---------------------------------------------------------------------------

/** Role priority hierarchy for privilege escalation checks */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  BUYER: 1,
  SELLER: 2,
  MODERATOR: 3,
  ADMIN: 4,
};

export class RBACGuard {
  /**
   * Extracts the raw JWT token from incoming NextRequest.
   * Priority:
   * 1. HttpOnly Cookie (`otaku_session`) — Primary OWASP compliant mechanism.
   * 2. `Authorization: Bearer <token>` Header — Secondary for API clients/mobile apps.
   *
   * @param request - Incoming Next.js HTTP request
   * @returns Raw token string or null if not provided
   */
  public static extractToken(request: NextRequest): string | null {
    // 1. Check HttpOnly cookie
    const cookieToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (cookieToken && cookieToken.trim().length > 0) {
      return cookieToken.trim();
    }

    // 2. Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken.length > 0) {
        return bearerToken;
      }
    }

    return null;
  }

  /**
   * Authenticates the request without throwing or returning early error responses.
   * Useful for routes that have optional authentication or public read with personalized state.
   *
   * @param request - Incoming Next.js HTTP request
   * @returns Authenticated TokenPayload or null
   */
  public static authenticate(request: NextRequest): TokenPayload | null {
    const token = this.extractToken(request);
    if (!token) {
      return null;
    }

    return TokenService.verifyToken(token);
  }

  /**
   * Enforces that the request is authenticated.
   * If valid, returns the decoded user token payload.
   * If invalid, returns a ready-to-return 401 Unauthorized NextResponse.
   *
   * @param request - Incoming Next.js HTTP request
   * @returns Discriminated union: `{ success: true, user: TokenPayload }` or `{ success: false, response: NextResponse }`
   */
  public static requireAuth(
    request: NextRequest
  ): { success: true; user: TokenPayload } | { success: false; response: NextResponse } {
    const user = this.authenticate(request);

    if (!user) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: {
              code: 'UNAUTHENTICATED',
              message: 'Authentication required. Please log in to proceed.',
            },
          },
          { status: 401 }
        ),
      };
    }

    return { success: true, user };
  }

  /**
   * Enforces that the request is authenticated AND possesses at least one of the allowed roles.
   *
   * @param request - Incoming Next.js HTTP request
   * @param allowedRoles - Array of roles permitted to access this resource
   * @returns Discriminated union: `{ success: true, user: TokenPayload }` or `{ success: false, response: NextResponse }`
   */
  public static requireRole(
    request: NextRequest,
    allowedRoles: ReadonlyArray<UserRole>
  ): { success: true; user: TokenPayload } | { success: false; response: NextResponse } {
    const authResult = this.requireAuth(request);
    if (!authResult.success) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user's role is in the allowed list OR if user is an ADMIN (inherits all permissions)
    const hasRole = allowedRoles.includes(user.role) || user.role === 'ADMIN';

    if (!hasRole) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: {
              code: 'FORBIDDEN',
              message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${user.role}.`,
            },
          },
          { status: 403 }
        ),
      };
    }

    return { success: true, user };
  }

  /**
   * Enforces that the user is either the resource owner OR has administrative privilege.
   *
   * @param user - Authenticated user payload
   * @param resourceOwnerId - ID of the user who owns the listing/order/offer
   * @returns true if caller is authorized to modify the resource
   */
  public static isOwnerOrAdmin(user: TokenPayload, resourceOwnerId: string): boolean {
    return user.userId === resourceOwnerId || user.role === 'ADMIN' || user.role === 'MODERATOR';
  }
}
