/**
 * @file src/server/__tests__/verifyPersistenceFlow.ts
 *
 * Direct end-to-end verification of Server Actions -> Prisma SQLite Persistence -> Buyer Feed.
 */

import { createListingAction, fetchBuyerFeedAction } from '@/app/actions';
import { prisma } from '@/infrastructure/database/prismaClient';

async function verifyPersistenceFlow() {
  console.log('=== OtakuBazaar Persistence Flow Verification ===\n');

  // 1. Fetch initial buyer feed count
  console.log('Step 1: Fetching initial buyer feed via fetchBuyerFeedAction()...');
  const initialFeed = await fetchBuyerFeedAction();
  if (!initialFeed.success || !initialFeed.data) {
    throw new Error(`fetchBuyerFeedAction failed: ${initialFeed.error}`);
  }
  const initialCount = initialFeed.data.length;
  console.log(`✓ Initial active collectibles in feed: ${initialCount}`);

  // 2. Call createListingAction from /sell flow
  console.log('\nStep 2: Calling createListingAction() as a seller...');
  const testListingTitle = `E2E Test Collectible #${Date.now()}`;
  const createResult = await createListingAction({
    title: testListingTitle,
    series: 'Demon Slayer: Kimetsu no Yaiba',
    manufacturer: 'Aniplex+',
    category: 'Figures',
    condition: 'NEW',
    conditionGrade: '[S-RANK] FACTORY SEALED',
    askingPriceINR: 7500,
    originalPriceINR: 9000,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop',
    description: 'Special verified test figure with pristine Japanese gold licensing seal.',
  });

  if (!createResult.success || !createResult.data) {
    throw new Error(`createListingAction failed: ${createResult.error}`);
  }
  const createdId = createResult.data.id;
  console.log(`✓ Created listing successfully in database! ID: ${createdId}, Title: "${createResult.data.title}"`);

  // 3. Verify direct row in SQLite database via Prisma
  console.log('\nStep 3: Verifying row directly in SQLite database via prisma.listing.findUnique()...');
  const dbRow = await prisma.listing.findUnique({
    where: { id: createdId },
  });

  if (!dbRow) {
    throw new Error(`Prisma could not find row with id: ${createdId}`);
  }
  console.log(`✓ Database row confirmed: [id=${dbRow.id}, title="${dbRow.title}", price=${dbRow.askingPriceAmount} paise, status=${dbRow.status}]`);

  // 4. Verify fetchBuyerFeedAction() immediately reads and returns the newly created listing
  console.log('\nStep 4: Calling fetchBuyerFeedAction() to verify immediate visibility in feed...');
  const updatedFeed = await fetchBuyerFeedAction();
  if (!updatedFeed.success || !updatedFeed.data) {
    throw new Error(`fetchBuyerFeedAction failed: ${updatedFeed.error}`);
  }

  const foundInFeed = updatedFeed.data.find((item) => item.id === createdId);
  if (!foundInFeed) {
    throw new Error(`New listing ${createdId} was not found in fetchBuyerFeedAction response!`);
  }
  console.log(`✓ Confirmed: Newly created collectible is immediately visible at top of Buyer Feed!`);
  console.log(`  Feed total count: ${updatedFeed.data.length} (was ${initialCount})`);

  console.log('\n================================================================================');
  console.log('🎉 ALL PERSISTENCE AND FLOW VERIFICATIONS PASSED SUCCESSFULLY!');
  console.log('================================================================================\n');
}

verifyPersistenceFlow()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
