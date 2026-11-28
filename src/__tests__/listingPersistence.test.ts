import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { encode } from 'next-auth/jwt';
import { prisma } from '../infrastructure/database/prismaClient';
import { ListingRepository } from '../infrastructure/database/repositories/ListingRepository';
import { CloudStorageService } from '../infrastructure/services/cloudStorageService';
import { toPublicLotDTO, toPrivateLotDTO } from '../app/api/listings/route';
import { GET as getListingById } from '../app/api/listings/[id]/route';
import { GET as getListingInvoice } from '../app/api/listings/[id]/invoice/route';
import { POST as uploadPost } from '../app/api/upload/route';

test('ListingRepository: saves all photos in order, logistics fields, and invoice proof, then reloads cleanly', async () => {
  const storedListings = new Map<string, any>();
  const storedImages: Array<{ listingId: string; url: string; position: number }> = [];

  const origUserUpsert = prisma.user.upsert;
  const origListingCreate = prisma.listing.create;
  const origListingFindUnique = prisma.listing.findUnique;
  const origListingImageCreateMany = prisma.listingImage.createMany;
  const origUploadDataUri = CloudStorageService.uploadDataUri;

  let uploadCounter = 0;
  (CloudStorageService as any).uploadDataUri = async (_dataUri: string, prefix = 'lot') => {
    uploadCounter += 1;
    return {
      success: true,
      url: `https://cdn.otakubazaar.test/${prefix}_${uploadCounter}.webp`,
      provider: 'SUPABASE',
    };
  };

  (prisma.user as any).upsert = async () => ({ id: 'google_seller_1' });
  (prisma.listing as any).create = async ({ data }: { data: any }) => {
    const row = {
      ...data,
      createdAt: new Date('2026-11-28T10:00:00Z'),
      updatedAt: new Date('2026-11-28T10:00:00Z'),
    };
    storedListings.set(row.id, row);
    return row;
  };
  (prisma.listingImage as any).createMany = async ({ data }: { data: any[] }) => {
    storedImages.push(...data);
    return { count: data.length };
  };
  (prisma.listing as any).findUnique = async ({ where }: { where: { id: string } }) => {
    return storedListings.get(where.id) || null;
  };

  try {
    const created = await ListingRepository.create({
      id: 'lot_persist_001',
      sellerId: 'google_seller_1',
      sellerEmail: 'collector@example.com',
      sellerName: 'Collector One',
      title: 'Saber Alter 1/7 Scale',
      description: '',
      imageUrls: [
        'data:image/png;base64,AAAA',
        'https://cdn.otakubazaar.test/existing_second.jpg',
        'data:image/webp;base64,BBBB',
      ],
      askingPriceAmount: 1500000,
      askingPriceCurrency: 'INR',
      category: 'Scale Figure',
      condition: 'NEW',
      pickupPincode: '400001',
      weightKg: 2.25,
      dimensionsCm: '32x26x36',
      invoiceProofUrl: 'data:image/png;base64,INVOICE',
    });

    assert.deepEqual(created.imageUrls, [
      'https://cdn.otakubazaar.test/lot_1.webp',
      'https://cdn.otakubazaar.test/existing_second.jpg',
      'https://cdn.otakubazaar.test/lot_2.webp',
    ]);
    assert.equal(storedImages.length, 3);
    assert.deepEqual(
      storedImages.map((img) => ({ url: img.url, position: img.position })),
      [
        { url: 'https://cdn.otakubazaar.test/lot_1.webp', position: 0 },
        { url: 'https://cdn.otakubazaar.test/existing_second.jpg', position: 1 },
        { url: 'https://cdn.otakubazaar.test/lot_2.webp', position: 2 },
      ]
    );
    assert.equal(created.description, '', 'Must not inject default Verified description');
    assert.equal(created.pickupPincode, '400001');
    assert.equal(created.weightKg, 2.25);
    assert.equal(created.dimensionsCm, '32x26x36');
    assert.equal(created.invoiceProofUrl, 'https://cdn.otakubazaar.test/invoice_3.webp');

    // Reload via findById
    const reloaded = await ListingRepository.findById('lot_persist_001');
    assert.ok(reloaded);
    assert.deepEqual(reloaded.imageUrls, created.imageUrls);
    assert.equal(reloaded.pickupPincode, '400001');
    assert.equal(reloaded.weightKg, 2.25);
    assert.equal(reloaded.dimensionsCm, '32x26x36');
    assert.equal(reloaded.invoiceProofUrl, 'https://cdn.otakubazaar.test/invoice_3.webp');

    // Privacy check: Public DTO must strip pickupPincode and invoiceProofUrl
    const publicDto = toPublicLotDTO(reloaded) as unknown as Record<string, unknown>;
    assert.equal('pickupPincode' in publicDto, false);
    assert.equal('invoiceProofUrl' in publicDto, false);

    // Private DTO includes PIN and protected invoice endpoint
    const privateDto = toPrivateLotDTO(reloaded);
    assert.equal(privateDto.pickupPincode, '400001');
    assert.equal(privateDto.invoiceProofUrl, '/api/listings/lot_persist_001/invoice');

    // API route privacy: unauthenticated caller gets no PIN or invoice
    const publicRes = await getListingById(
      new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001'),
      { params: Promise.resolve({ id: 'lot_persist_001' }) }
    );
    const publicJson = await publicRes.json();
    assert.equal(publicRes.status, 200);
    assert.equal('pickupPincode' in publicJson.lot, false);
    assert.equal('invoiceProofUrl' in publicJson.lot, false);

    // API route privacy: another buyer gets no PIN or invoice
    process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-32-chars-minimum';
    const otherUserJwt = await encode({
      token: { sub: 'other_buyer_999', role: 'BUYER', email: 'buyer@example.com' },
      secret: process.env.NEXTAUTH_SECRET,
    });
    const otherRes = await getListingById(
      new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001', {
        headers: { cookie: `next-auth.session-token=${otherUserJwt}` },
      }),
      { params: Promise.resolve({ id: 'lot_persist_001' }) }
    );
    const otherJson = await otherRes.json();
    assert.equal('pickupPincode' in otherJson.lot, false);
    assert.equal('invoiceProofUrl' in otherJson.lot, false);

    // API route privacy: seller and ADMIN receive PIN and invoice
    const sellerJwt = await encode({
      token: { sub: 'google_seller_1', role: 'SELLER', email: 'collector@example.com' },
      secret: process.env.NEXTAUTH_SECRET,
    });
    const sellerRes = await getListingById(
      new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001', {
        headers: { cookie: `next-auth.session-token=${sellerJwt}` },
      }),
      { params: Promise.resolve({ id: 'lot_persist_001' }) }
    );
    const sellerJson = await sellerRes.json();
    assert.equal(sellerJson.lot.pickupPincode, '400001');
    assert.equal(sellerJson.lot.invoiceProofUrl, '/api/listings/lot_persist_001/invoice');

    const adminJwt = await encode({
      token: { sub: 'admin_1', role: 'ADMIN', email: 'admin@example.com' },
      secret: process.env.NEXTAUTH_SECRET,
    });
    const adminRes = await getListingById(
      new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001', {
        headers: { cookie: `next-auth.session-token=${adminJwt}` },
      }),
      { params: Promise.resolve({ id: 'lot_persist_001' }) }
    );
    const adminJson = await adminRes.json();
    assert.equal(adminJson.lot.pickupPincode, '400001');
    assert.equal(adminJson.lot.invoiceProofUrl, '/api/listings/lot_persist_001/invoice');

    // Private invoice download endpoint RBAC: 401 unauth, 403 other buyer, 200 seller & admin
    const origFetchPrivate = CloudStorageService.fetchPrivateFile;
    (CloudStorageService as any).fetchPrivateFile = async () => ({
      success: true,
      buffer: Buffer.from('%PDF-1.4 mock-invoice'),
      contentType: 'application/pdf',
    });
    try {
      const unauthInv = await getListingInvoice(
        new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001/invoice'),
        { params: Promise.resolve({ id: 'lot_persist_001' }) }
      );
      assert.equal(unauthInv.status, 401);

      const otherInv = await getListingInvoice(
        new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001/invoice', {
          headers: { cookie: `next-auth.session-token=${otherUserJwt}` },
        }),
        { params: Promise.resolve({ id: 'lot_persist_001' }) }
      );
      assert.equal(otherInv.status, 403);

      const sellerInv = await getListingInvoice(
        new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001/invoice', {
          headers: { cookie: `next-auth.session-token=${sellerJwt}` },
        }),
        { params: Promise.resolve({ id: 'lot_persist_001' }) }
      );
      assert.equal(sellerInv.status, 200);
      assert.equal(sellerInv.headers.get('content-type'), 'application/pdf');

      const adminInv = await getListingInvoice(
        new NextRequest('https://otakubazaar.jaybhatt.me/api/listings/lot_persist_001/invoice', {
          headers: { cookie: `next-auth.session-token=${adminJwt}` },
        }),
        { params: Promise.resolve({ id: 'lot_persist_001' }) }
      );
      assert.equal(adminInv.status, 200);
    } finally {
      (CloudStorageService as any).fetchPrivateFile = origFetchPrivate;
    }
  } finally {
    (prisma.user as any).upsert = origUserUpsert;
    (prisma.listing as any).create = origListingCreate;
    (prisma.listing as any).findUnique = origListingFindUnique;
    (prisma.listingImage as any).createMany = origListingImageCreateMany;
    (CloudStorageService as any).uploadDataUri = origUploadDataUri;
  }
});

test('ListingRepository: throws error if image upload fails or sellerId is missing', async () => {
  const origUserUpsert = prisma.user.upsert;
  const origUploadDataUri = CloudStorageService.uploadDataUri;

  (prisma.user as any).upsert = async () => ({ id: 'google_seller_1' });
  (CloudStorageService as any).uploadDataUri = async () => ({
    success: false,
    error: 'Cloud storage unavailable',
  });

  try {
    await assert.rejects(
      () =>
        ListingRepository.create({
          sellerId: '',
          title: 'Missing Seller',
          description: '',
          imageUrls: ['https://example.com/a.jpg'],
          askingPriceAmount: 100000,
          category: 'Scale Figure',
          condition: 'NEW',
        }),
      /Authenticated sellerId is required/
    );

    await assert.rejects(
      () =>
        ListingRepository.create({
          sellerId: 'google_seller_1',
          title: 'Failed Upload Figure',
          description: '',
          imageUrls: ['data:image/png;base64,AAAA'],
          askingPriceAmount: 100000,
          category: 'Scale Figure',
          condition: 'NEW',
        }),
      /Cloud storage unavailable/
    );
  } finally {
    (prisma.user as any).upsert = origUserUpsert;
    (CloudStorageService as any).uploadDataUri = origUploadDataUri;
  }
});

test('POST /api/upload: handles real-size 2.5MB photo upload, rejects >4MB, and stores PDF invoices privately', async () => {
  process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-32-chars-minimum';
  process.env.SUPABASE_URL = 'https://mock-project.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-service-role-key';

  const sellerJwt = await encode({
    token: { sub: 'google_seller_1', role: 'SELLER', email: 'collector@example.com' },
    secret: process.env.NEXTAUTH_SECRET,
  });

  const origFetch = globalThis.fetch;
  let uploadedBytes = 0;
  let lastUploadUrl = '';

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    lastUploadUrl = String(input);
    if (init?.body instanceof Uint8Array) {
      uploadedBytes = init.body.byteLength;
    }
    return new Response(JSON.stringify({ Key: 'ok' }), { status: 200 });
  }) as typeof fetch;

  try {
    // 1. Real-size 2.5MB photo upload via multipart/form-data
    const photoSize = Math.floor(2.5 * 1024 * 1024);
    const photoBytes = new Uint8Array(photoSize);
    photoBytes.fill(0xab);
    const photoForm = new FormData();
    photoForm.append('file', new File([photoBytes], 'figure.webp', { type: 'image/webp' }));

    const photoReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/upload?purpose=photo', {
      method: 'POST',
      headers: { cookie: `next-auth.session-token=${sellerJwt}` },
      body: photoForm,
    });

    const photoRes = await uploadPost(photoReq);
    const photoJson = await photoRes.json();
    assert.equal(photoRes.status, 200);
    assert.equal(photoJson.success, true);
    assert.equal(uploadedBytes, photoSize);
    assert.ok(photoJson.url.startsWith('https://mock-project.supabase.co/storage/v1/object/public/'));

    // 2. Reject >4MB upload to respect Vercel's 4.5MB limit
    const oversizeBytes = new Uint8Array(4 * 1024 * 1024 + 1024);
    const oversizeForm = new FormData();
    oversizeForm.append('file', new File([oversizeBytes], 'huge.jpg', { type: 'image/jpeg' }));

    const oversizeReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/upload?purpose=photo', {
      method: 'POST',
      headers: { cookie: `next-auth.session-token=${sellerJwt}` },
      body: oversizeForm,
    });
    const oversizeRes = await uploadPost(oversizeReq);
    assert.equal(oversizeRes.status, 413);

    // 3. Private PDF invoice upload returns private:// reference (never public URL)
    const pdfBytes = new Uint8Array(Buffer.from('%PDF-1.4 real-invoice-bytes'));
    const pdfForm = new FormData();
    pdfForm.append('file', new File([pdfBytes], 'receipt.pdf', { type: 'application/pdf' }));

    const pdfReq = new NextRequest('https://otakubazaar.jaybhatt.me/api/upload?purpose=invoice', {
      method: 'POST',
      headers: { cookie: `next-auth.session-token=${sellerJwt}` },
      body: pdfForm,
    });
    const pdfRes = await uploadPost(pdfReq);
    const pdfJson = await pdfRes.json();
    assert.equal(pdfRes.status, 200);
    assert.ok(pdfJson.url.startsWith('private://supabase/private-invoices/'));
    assert.ok(lastUploadUrl.includes('/storage/v1/object/private-invoices/'));
  } finally {
    globalThis.fetch = origFetch;
  }
});
