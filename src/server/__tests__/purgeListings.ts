import { prisma } from '@/infrastructure/database/prismaClient';

async function main() {
  await prisma.escrowLedgerEntry.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.bargainOffer.deleteMany({});
  await prisma.listing.deleteMany({});
  console.log('✓ All database tables purged cleanly to 100% empty state.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
