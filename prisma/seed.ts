import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  if (process.env.ALLOW_DB_SEED !== 'true') {
    console.log('[OtakuBazaar Seed] Automatic seeding disabled. Run with ALLOW_DB_SEED=true to execute manually.');
    return;
  }

  console.log('--- Initializing OtakuBazaar Database ---');

  // 1. Ensure verified base users exist for escrow and consignment testing
  const seller = await prisma.user.upsert({
    where: { id: 'user_seller_rengoku' },
    update: {},
    create: {
      id: 'user_seller_rengoku',
      name: 'Kyojuro Rengoku',
      email: 'rengoku@demon-slayer.corp',
      displayName: 'Kyojuro Rengoku',
      rating: 4.95,
      totalSales: 142,
      totalPurchases: 12,
      verifiedUpiVpa: 'rengoku@upi',
      upiVerifiedAt: new Date(),
    },
  });

  const buyer = await prisma.user.upsert({
    where: { id: 'user_buyer_tanjiro' },
    update: {},
    create: {
      id: 'user_buyer_tanjiro',
      name: 'Tanjiro Kamado',
      email: 'tanjiro@demon-slayer.corp',
      displayName: 'Tanjiro Kamado',
      rating: 5.0,
      totalSales: 4,
      totalPurchases: 38,
      verifiedUpiVpa: 'tanjiro@upi',
      upiVerifiedAt: new Date(),
    },
  });

  console.log(`Verified system users initialized: ${seller.name}, ${buyer.name}`);
  console.log('Zero dummy products seeded. Marketplace ready for authentic live consignments.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
