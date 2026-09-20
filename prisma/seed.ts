import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding OtakuBazaar Database ---');

  // 1. Ensure Seller and Buyer users exist
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

  console.log(`Users verified: ${seller.name}, ${buyer.name}`);

  // 2. High-ticket diverse scale figure collectibles
  const animeGrails = [
    {
      lot: '0481',
      title: 'Kyojuro Rengoku 1/8 Flame Breathing',
      category: 'Figures',
      price: 28500,
      pricePaisa: 2850000,
      imageUrl: 'https://images.unsplash.com/photo-1612462766564-96eb122ce279?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0482',
      title: 'Guts Berserker Armor Unleashed 1/4',
      category: 'Figures',
      price: 89000,
      pricePaisa: 8900000,
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0483',
      title: 'Edward Elric Fullmetal Alchemist GEM',
      category: 'Figures',
      price: 17500,
      pricePaisa: 1750000,
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0484',
      title: 'Saber / Altria Pendragon 1/7 Deluxe',
      category: 'Figures',
      price: 24500,
      pricePaisa: 2450000,
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0485',
      title: 'Satoru Gojo Hollow Purple 1/7 Scramble',
      category: 'Figures',
      price: 36000,
      pricePaisa: 3600000,
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0486',
      title: 'EVA Unit-01 Test Type Metal Build',
      category: 'Figures',
      price: 42000,
      pricePaisa: 4200000,
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0487',
      title: 'Nendoroid Denji Chainsaw Man Edition',
      category: 'Nendoroid',
      price: 6200,
      pricePaisa: 620000,
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0488',
      title: 'Nendoroid Makima Public Safety Hunter',
      category: 'Nendoroid',
      price: 6500,
      pricePaisa: 650000,
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0489',
      title: 'Nendoroid Anya Forger Spy x Family',
      category: 'Nendoroid',
      price: 5800,
      pricePaisa: 580000,
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0490',
      title: 'Berserk Deluxe Edition Vol 1-14 Hardcover Set',
      category: 'Manga',
      price: 42000,
      pricePaisa: 4200000,
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0491',
      title: 'One Piece Box Set 1-4 Complete Manga',
      category: 'Manga',
      price: 38000,
      pricePaisa: 3800000,
      imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0492',
      title: 'Demon Slayer Complete Box Set with Extras',
      category: 'Manga',
      price: 14500,
      pricePaisa: 1450000,
      imageUrl: 'https://images.unsplash.com/photo-1612462766564-96eb122ce279?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0493',
      title: 'Tanjirou Sun Breathing Nichirin Sword 1:1 Prop',
      category: 'Cosplay',
      price: 12500,
      pricePaisa: 1250000,
      imageUrl: 'https://images.unsplash.com/photo-1612462766564-96eb122ce279?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0494',
      title: 'Zenitsu Thunder Breathing Metal Katana Replica',
      category: 'Cosplay',
      price: 11500,
      pricePaisa: 1150000,
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    },
    {
      lot: '0495',
      title: 'Sailor Moon Eternal Holy Grail Proplica 1:1',
      category: 'Cosplay',
      price: 29000,
      pricePaisa: 2900000,
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85',
    },
  ];

  // Clear existing items to eliminate repetitive kitsune mask
  await prisma.dealOffer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.listing.deleteMany({});

  for (const item of animeGrails) {
    const id = `lot-${item.lot}`;

    // Upsert into Listing
    await prisma.listing.create({
      data: {
        id,
        sellerId: seller.id,
        title: item.title,
        description: `Authentic Japanese imported ${item.title}. Verified holographic seal, mint condition inspectable via 48-hour escrow protection.`,
        imageUrls: JSON.stringify([item.imageUrl]),
        askingPriceAmount: item.pricePaisa,
        askingPriceCurrency: 'INR',
        category: item.category,
        condition: 'NEW',
        status: 'ACTIVE',
      },
    });

    // Upsert into Product
    await prisma.product.create({
      data: {
        id,
        sellerId: seller.id,
        title: item.title,
        description: `Authentic Japanese imported ${item.title}. Verified holographic seal, mint condition inspectable via 48-hour escrow protection.`,
        imageUrls: JSON.stringify([item.imageUrl]),
        price: item.price,
        askingPriceAmount: item.pricePaisa,
        askingPriceCurrency: 'INR',
        category: item.category,
        condition: 'NEW',
        status: 'ACTIVE',
      },
    });
  }

  const count = await prisma.product.count();
  console.log(`Successfully seeded ${count} anime collectible grails with diverse photography!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
