import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { authOptions } from '../app/api/auth/[...nextauth]/route';
import { RBACGuard } from '../infrastructure/security/RBACGuard';
import { TokenService, SESSION_COOKIE_NAME } from '../infrastructure/security/TokenService';
import { DELETE as deleteUserAccount } from '../app/api/user/delete/route';
import { GET as getAuthMe } from '../app/api/auth/me/route';
import { POST as razorpayCheckout } from '../app/api/checkout/razorpay/route';
import { middleware } from '../middleware';
import { encode } from 'next-auth/jwt';

test('Security: credentials (email/password) and phone-otp NextAuth providers are disabled', () => {
  const providerIds = authOptions.providers.map((p) => p.id);
  assert.equal(
    providerIds.includes('credentials'),
    false,
    'Email/password credentials provider must be disabled'
  );
  assert.equal(
    providerIds.includes('phone-otp'),
    false,
    'Phone OTP credentials provider must be disabled'
  );
  assert.equal(
    authOptions.secret === 'otakubazaar-escrow-super-secret-key-2026',
    false,
    'NextAuth must not use a hardcoded fallback secret'
  );
});

test('Security: /api/auth/login route and demo accounts are deleted', () => {
  const loginRoutePath = path.resolve(process.cwd(), 'src/app/api/auth/login/route.ts');
  assert.equal(
    fs.existsSync(loginRoutePath),
    false,
    '/api/auth/login/route.ts must be deleted'
  );
});

test('Security: old otaku_session JWT cookies (including ADMIN) are rejected by RBACGuard', async () => {
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-32-chars-minimum';

  const legacyAdminToken = TokenService.signToken({
    userId: 'user_admin_allmight',
    email: 'admin@otakubazaar.com',
    name: 'Toshinori Yagi',
    role: 'ADMIN',
  });

  const reqWithLegacyCookie = new NextRequest('http://localhost:3000/api/auth/me', {
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${legacyAdminToken}`,
      authorization: `Bearer ${legacyAdminToken}`,
    },
  });

  assert.equal(
    RBACGuard.authenticate(reqWithLegacyCookie),
    null,
    'Synchronous RBACGuard.authenticate must reject legacy otaku_session cookies'
  );

  const asyncUser = await RBACGuard.authenticateAsync(reqWithLegacyCookie);
  assert.equal(
    asyncUser,
    null,
    'Async RBACGuard.authenticateAsync must reject legacy otaku_session cookies'
  );

  const authResult = await RBACGuard.requireAuthAsync(reqWithLegacyCookie);
  assert.equal(authResult.success, false, 'requireAuthAsync must fail for legacy cookie');
  if (!authResult.success) {
    assert.equal(authResult.response.status, 401);
  }

  const adminRoleResult = await RBACGuard.requireRoleAsync(reqWithLegacyCookie, ['ADMIN']);
  assert.equal(adminRoleResult.success, false, 'requireRoleAsync must fail for legacy ADMIN cookie');
  if (!adminRoleResult.success) {
    assert.equal(adminRoleResult.response.status, 401);
  }

  const meRes = await getAuthMe(reqWithLegacyCookie);
  assert.equal(meRes.status, 401, 'GET /api/auth/me must return 401 for legacy otaku_session cookie');
});

test('Security: DELETE /api/user/delete rejects unauthenticated demoUserId and legacy cookies', async () => {
  const legacyToken = TokenService.signToken({
    userId: 'user_seller_rengoku',
    email: 'seller@otakubazaar.com',
    name: 'Kyojuro Rengoku',
    role: 'SELLER',
  });

  const req = new NextRequest('http://localhost:3000/api/user/delete', {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
      cookie: `${SESSION_COOKIE_NAME}=${legacyToken}`,
    },
    body: JSON.stringify({ demoUserId: 'user_victim_123' }),
  });

  const res = await deleteUserAccount(req);
  assert.equal(res.status, 401, 'DELETE /api/user/delete must reject unauthenticated/legacy requests with 401');
});

test('Security: wrong password and random OTP providers cannot authorize via NextAuth', async () => {
  const credentialsProvider = authOptions.providers.find(
    (p) => p.id === 'credentials' || p.type === 'credentials'
  );
  assert.equal(credentialsProvider, undefined, 'No credentials (email/password) provider may exist');

  const otpProvider = authOptions.providers.find(
    (p) => p.id === 'phone-otp' || p.name?.toLowerCase().includes('otp')
  );
  assert.equal(otpProvider, undefined, 'No phone-otp provider may exist');

  // Verify only OAuth providers (Google / Discord) are permitted
  for (const provider of authOptions.providers) {
    assert.ok(
      provider.id === 'google' || provider.id === 'discord',
      `Unexpected provider configured: ${provider.id}`
    );
  }
});

test('Security: old hardcoded secret and rotated-out NextAuth JWT tokens are rejected by RBACGuard and middleware', async () => {
  const oldHardcodedSecret = 'otakubazaar-escrow-super-secret-key-2026';
  const rotatedSecret = 'new-rotated-nextauth-secret-minimum-32-bytes';
  process.env.NEXTAUTH_SECRET = rotatedSecret;

  // Token signed with the old hardcoded secret
  const oldNextAuthToken = await encode({
    token: { sub: 'user_admin_allmight', role: 'ADMIN', email: 'admin@otakubazaar.com' },
    secret: oldHardcodedSecret,
  });

  const reqWithOldNextAuth = new NextRequest('https://otakubazaar.jaybhatt.me/api/auth/me', {
    headers: {
      cookie: `next-auth.session-token=${oldNextAuthToken}`,
    },
  });

  const authUser = await RBACGuard.authenticateAsync(reqWithOldNextAuth);
  assert.equal(authUser, null, 'Tokens signed with old NEXTAUTH_SECRET must be rejected after rotation');

  const meRes = await getAuthMe(reqWithOldNextAuth);
  assert.equal(meRes.status, 401, 'GET /api/auth/me must return 401 for rotated-out NextAuth token');

  // Middleware must reject legacy otaku_session and old NextAuth tokens on /sell and /vault-ops
  const legacyAdminToken = TokenService.signToken({
    userId: 'user_admin_allmight',
    email: 'admin@otakubazaar.com',
    name: 'Toshinori Yagi',
    role: 'ADMIN',
  });

  const reqSellLegacy = new NextRequest('https://otakubazaar.jaybhatt.me/sell', {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${legacyAdminToken}` },
  });
  const sellRes = await middleware(reqSellLegacy);
  assert.equal(sellRes.status, 307, 'Middleware must redirect legacy otaku_session on /sell to /login');
  assert.ok(sellRes.headers.get('location')?.includes('/login'));

  const reqVaultOldToken = new NextRequest('https://otakubazaar.jaybhatt.me/vault-ops', {
    headers: { cookie: `next-auth.session-token=${oldNextAuthToken}` },
  });
  const vaultRes = await middleware(reqVaultOldToken);
  assert.equal(vaultRes.status, 307, 'Middleware must redirect old NextAuth token on /vault-ops to /login');
  assert.ok(vaultRes.headers.get('location')?.includes('/login'));
});

test('Security: unauthenticated POST /api/checkout/razorpay is rejected with 401', async () => {
  const prevPayments = process.env.PAYMENTS_ENABLED;
  process.env.PAYMENTS_ENABLED = 'true';
  try {
    const req = new NextRequest('https://otakubazaar.jaybhatt.me/api/checkout/razorpay', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: 'lot_123', price: 1 }),
    });

    const res = await razorpayCheckout(req);
    assert.equal(res.status, 401, 'POST /api/checkout/razorpay must require authentication');
  } finally {
    if (prevPayments !== undefined) process.env.PAYMENTS_ENABLED = prevPayments;
    else delete process.env.PAYMENTS_ENABLED;
  }
});

test('SEO: middleware permanently redirects *.vercel.app to otakubazaar.jaybhatt.me while preserving auth and webhooks', async () => {
  const pageReq = new NextRequest('https://otaku-bazaar.vercel.app/catalog', {
    headers: { host: 'otaku-bazaar.vercel.app' },
  });
  const pageRes = await middleware(pageReq);
  assert.equal(pageRes.status, 308);
  assert.equal(pageRes.headers.get('location'), 'https://otakubazaar.jaybhatt.me/catalog');

  const webhookReq = new NextRequest('https://otaku-bazaar.vercel.app/api/webhooks/razorpay', {
    method: 'POST',
    headers: { host: 'otaku-bazaar.vercel.app' },
  });
  const webhookRes = await middleware(webhookReq);
  assert.equal(webhookRes.status, 200, 'Webhooks on vercel.app must not be redirected');

  const authReq = new NextRequest('https://otaku-bazaar.vercel.app/api/auth/callback/google', {
    headers: { host: 'otaku-bazaar.vercel.app' },
  });
  const authRes = await middleware(authReq);
  assert.equal(authRes.status, 200, 'NextAuth routes on vercel.app must not be redirected');
});
