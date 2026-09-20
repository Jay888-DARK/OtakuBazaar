/**
 * @file src/server/__tests__/verifyPaginationFlow.ts
 *
 * Automated verification script for Pagination UI and Server-Side Query.
 */

import { prisma } from '../../infrastructure/database/prismaClient';
import HomePage from '../../app/page';

async function verify() {
  console.log('--- Step 1: Testing Prisma Product Alias ---');
  const initialCount = await prisma.product.count();
  console.log(`Initial product count: ${initialCount}`);

  console.log('\n--- Step 2: Seeding 25 Test Collectibles for Pagination ---');
  const testIds: string[] = [];
  for (let i = 1; i <= 25; i++) {
    const id = `test-pg-${Date.now()}-${i}`;
    testIds.push(id);
    await prisma.listing.create({
      data: {
        id,
        sellerId: 'user_seller_rengoku',
        title: `Collectable Grail #${i}`,
        description: `Autographed anime scale figure #${i}`,
        imageUrls: JSON.stringify(['/Firefly_clean.png']),
        askingPriceAmount: 500000 + i * 1000,
        askingPriceCurrency: 'INR',
        category: 'Scale Figure',
        condition: 'NEW',
        status: 'ACTIVE',
      },
    });
  }

  const seededCount = await prisma.product.count();
  console.log(`Total products after seed: ${seededCount}`);
  if (seededCount < 25) throw new Error('Seeding failed');

  try {
    console.log('\n--- Step 3: Verifying Server Queries Across Pages ---');
    // Page 1: take 12, skip 0
    const page1Items = await prisma.product.findMany({
      take: 12,
      skip: (1 - 1) * 12,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`Page 1 count: ${page1Items.length} (Expected: 12)`);
    if (page1Items.length !== 12) throw new Error('Page 1 count mismatch');

    // Page 2: take 12, skip 12
    const page2Items = await prisma.product.findMany({
      take: 12,
      skip: (2 - 1) * 12,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`Page 2 count: ${page2Items.length} (Expected: 12)`);
    if (page2Items.length !== 12) throw new Error('Page 2 count mismatch');

    // Page 3: take 12, skip 24
    const page3Items = await prisma.product.findMany({
      take: 12,
      skip: (3 - 1) * 12,
      orderBy: { createdAt: 'desc' },
    });
    const expectedPage3 = Math.min(12, Math.max(0, seededCount - 24));
    console.log(`Page 3 count: ${page3Items.length} (Expected: ${expectedPage3})`);
    if (page3Items.length !== expectedPage3) throw new Error('Page 3 count mismatch');

    console.log('\n--- Step 4: Invoking HomePage Server Component ---');
    // Next.js 15 Promise searchParams
    const jsxPage1 = await HomePage({ searchParams: Promise.resolve({ page: '1' }) });
    if (!jsxPage1) throw new Error('HomePage returned null for page 1');
    console.log('✓ HomePage successfully rendered Page 1 with Promise searchParams');

    const jsxPage2 = await HomePage({ searchParams: Promise.resolve({ page: '2' }) });
    if (!jsxPage2) throw new Error('HomePage returned null for page 2');
    console.log('✓ HomePage successfully rendered Page 2');

    const jsxDefault = await HomePage({ searchParams: Promise.resolve({}) });
    if (!jsxDefault) throw new Error('HomePage returned null for default page');
    console.log('✓ HomePage successfully rendered default page (fallback to 1)');
  } finally {
    console.log('\n--- Step 5: Cleaning up test data ---');
    await prisma.listing.deleteMany({
      where: {
        id: { startsWith: 'test-pg-' },
      },
    });
    const finalCount = await prisma.product.count();
    console.log(`Final product count after cleanup: ${finalCount}`);
  }

  console.log('\n===========================================');
  console.log('ALL PAGINATION VERIFICATION CHECKS PASSED!');
  console.log('===========================================');
}

verify()
  .catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
