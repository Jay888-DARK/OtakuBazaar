import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../infrastructure/database/prismaClient';
import {
  getSiteUrl,
  buildListingSeoTitle,
  buildListingMetaDescription,
} from '../infrastructure/utils/siteUrl';
import robots from '../app/robots';
import sitemap from '../app/sitemap';
import { generateMetadata } from '../app/lot/[id]/page';

test('SEO: getSiteUrl uses NEXT_PUBLIC_SITE_URL, defaults to otakubazaar.jaybhatt.me, and strips trailing slashes', () => {
  const prevSite = process.env.NEXT_PUBLIC_SITE_URL;
  const prevApp = process.env.NEXT_PUBLIC_APP_URL;

  try {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    assert.equal(getSiteUrl(), 'https://otakubazaar.jaybhatt.me');

    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.otakubazaar.in///';
    assert.equal(getSiteUrl(), 'https://custom.otakubazaar.in');
  } finally {
    if (prevSite !== undefined) process.env.NEXT_PUBLIC_SITE_URL = prevSite;
    else delete process.env.NEXT_PUBLIC_SITE_URL;
    if (prevApp !== undefined) process.env.NEXT_PUBLIC_APP_URL = prevApp;
    else delete process.env.NEXT_PUBLIC_APP_URL;
  }
});

test('SEO: buildListingSeoTitle and buildListingMetaDescription satisfy length targets', () => {
  const shortTitle = buildListingSeoTitle('Saber Alter 1/7 Scale Figure');
  assert.ok(`${shortTitle} | OtakuBazaar`.length <= 60);

  const longTitle = buildListingSeoTitle(
    'Good Smile Company Fate/Grand Order Saber Altria Pendragon Alter Dress Ver. 1/7 Scale Figure'
  );
  assert.ok(`${longTitle} | OtakuBazaar`.length <= 60);

  const desc = buildListingMetaDescription({
    title: 'Saber Alter 1/7 Scale',
    brand: 'Alter',
    series: 'Fate/Grand Order',
    condition: 'NEW',
    priceINR: 15500,
  });
  assert.ok(desc.length >= 150 && desc.length <= 160, `Expected 150-160 chars, got ${desc.length}: ${desc}`);
  assert.ok(desc.includes('₹15,500'));
  assert.ok(desc.includes('Alter'));
});

test('SEO: robots() blocks private/admin/API routes and points sitemap to NEXT_PUBLIC_SITE_URL', () => {
  const prevSite = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = 'https://otakubazaar.jaybhatt.me/';
  try {
    const res = robots();
    assert.equal(res.sitemap, 'https://otakubazaar.jaybhatt.me/sitemap.xml');
    const rule = Array.isArray(res.rules) ? res.rules[0] : res.rules;
    const disallow = Array.isArray(rule?.disallow) ? rule.disallow : [];
    for (const blocked of ['/api/', '/admin', '/dashboard', '/account', '/checkout']) {
      assert.ok(disallow.includes(blocked), `Expected ${blocked} in robots disallow`);
    }
  } finally {
    if (prevSite !== undefined) process.env.NEXT_PUBLIC_SITE_URL = prevSite;
    else delete process.env.NEXT_PUBLIC_SITE_URL;
  }
});

test('SEO: sitemap() includes active listings with real updatedAt and excludes private/draft/demo routes', async () => {
  const origFindMany = prisma.listing.findMany;
  const origUpdateMany = prisma.listing.updateMany;
  const realUpdatedAt = new Date('2026-10-15T12:30:00.000Z');

  (prisma.listing as any).updateMany = async () => ({ count: 0 });
  (prisma.listing as any).findMany = async () => [
    {
      id: 'lot_real_01',
      sellerId: 'google_user_1',
      title: 'Guts Berserker Armor',
      description: 'Sealed figure',
      imageUrls: '["https://cdn.example.com/guts.webp"]',
      askingPriceAmount: 1800000,
      askingPriceCurrency: 'INR',
      status: 'ACTIVE',
      category: 'Scale Figure',
      condition: 'NEW',
      reservedByBuyerId: null,
      createdAt: new Date('2026-10-01T00:00:00.000Z'),
      updatedAt: realUpdatedAt,
    },
    {
      id: 'demo_item_01',
      sellerId: 'user_seller_rengoku',
      title: 'Demo Item',
      description: 'Demo',
      imageUrls: '["https://cdn.example.com/demo.webp"]',
      askingPriceAmount: 100000,
      askingPriceCurrency: 'INR',
      status: 'ACTIVE',
      category: 'Scale Figure',
      condition: 'NEW',
      reservedByBuyerId: null,
      createdAt: new Date('2026-10-01T00:00:00.000Z'),
      updatedAt: realUpdatedAt,
    },
  ];

  try {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    assert.ok(urls.includes('https://otakubazaar.jaybhatt.me/lot/lot_real_01'));
    assert.equal(urls.includes('https://otakubazaar.jaybhatt.me/lot/demo_item_01'), false);
    for (const forbidden of ['/admin', '/dashboard', '/account', '/checkout', '/api/', '/vault-ops']) {
      assert.equal(
        urls.some((u) => u.includes(forbidden)),
        false,
        `Sitemap must not include ${forbidden}`
      );
    }
    const lotEntry = entries.find((e) => e.url.endsWith('/lot/lot_real_01'));
    assert.equal(lotEntry?.lastModified, realUpdatedAt);
  } finally {
    (prisma.listing as any).findMany = origFindMany;
    (prisma.listing as any).updateMany = origUpdateMany;
  }
});

test('SEO: generateMetadata on /lot/[id] sets canonical, OG image, 150-160 desc, and excludes private fields', async () => {
  const origFindUnique = prisma.listing.findUnique;
  const origSellerBadge = prisma.user.findUnique;

  (prisma.listing as any).findUnique = async () => ({
    id: 'lot_seo_01',
    sellerId: 'google_user_1',
    title: 'Gojo Satoru 1/7 Scale Figure',
    description: 'Mint figure in unopened box.',
    imageUrls: '["https://cdn.example.com/gojo.webp"]',
    askingPriceAmount: 1250000,
    askingPriceCurrency: 'INR',
    status: 'ACTIVE',
    category: 'Scale Figure',
    condition: 'NEW',
    manufacturer: 'MAPPA / Shibuya Scramble',
    pickupPincode: '400001',
    invoiceProofUrl: 'private://supabase/private-invoices/inv.pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  (prisma.user as any).findUnique = async () => null;

  try {
    const meta = await generateMetadata({ params: Promise.resolve({ id: 'lot_seo_01' }) });
    assert.equal(meta.alternates?.canonical, 'https://otakubazaar.jaybhatt.me/lot/lot_seo_01');
    assert.ok(meta.description && meta.description.length >= 150 && meta.description.length <= 160);
    const serialized = JSON.stringify(meta);
    assert.equal(serialized.includes('400001'), false);
    assert.equal(serialized.includes('private-invoices'), false);
  } finally {
    (prisma.listing as any).findUnique = origFindUnique;
    (prisma.user as any).findUnique = origSellerBadge;
  }
});
