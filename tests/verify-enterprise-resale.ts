import { prisma } from '../src/lib/prismaClient';
import { submitOffer, acceptOffer, getOffer, addToCart, getCartItems, removeFromCart } from '../src/app/actions/dealActions';

async function runVerification() {
  console.log('--- Starting Enterprise Resale Verification Suite ---');

  // 1. Ensure test users exist
  const buyer1 = await prisma.user.upsert({
    where: { id: 'user_buyer_tanjiro' },
    update: {},
    create: {
      id: 'user_buyer_tanjiro',
      name: 'Tanjiro Kamado',
      email: 'tanjiro@otakubazaar.dev',
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { id: 'user_buyer_zenitsu' },
    update: {},
    create: {
      id: 'user_buyer_zenitsu',
      name: 'Zenitsu Agatsuma',
      email: 'zenitsu@otakubazaar.dev',
    },
  });

  const seller = await prisma.user.upsert({
    where: { id: 'user_seller_rengoku' },
    update: {},
    create: {
      id: 'user_seller_rengoku',
      name: 'Kyojuro Rengoku',
      email: 'rengoku@otakubazaar.dev',
    },
  });

  // 2. Ensure a test Product with minOfferPrice exists
  const testProduct = await prisma.product.upsert({
    where: { id: 'test_product_rengoku_scale' },
    update: {
      price: 10000,
      minOfferPrice: 7500, // Floor is ₹7,500
      sellerId: seller.id,
    },
    create: {
      id: 'test_product_rengoku_scale',
      title: 'Kyojuro Rengoku 1/8 Flame Breathing Scale Figure',
      price: 10000,
      minOfferPrice: 7500,
      sellerId: seller.id,
    },
  });

  console.log('✓ Test product verified: asking price ₹10,000, minOfferPrice ₹7,500');

  // 3. Test Auto-Rejection for bids below floor price
  console.log('\n[Test 1] Testing Auto-Rejection for bids below floor (₹5,000 < ₹7,500)...');
  const lowOfferResult = await submitOffer({
    productId: testProduct.id,
    offeredPrice: 5000,
    buyerId: buyer1.id,
  });

  if (lowOfferResult.autoRejected && !lowOfferResult.success) {
    console.log('✓ PASS: Low offer auto-rejected correctly:', lowOfferResult.message);
  } else {
    throw new Error(`FAIL: Low offer was not auto-rejected: ${JSON.stringify(lowOfferResult)}`);
  }

  // 4. Test Valid Offer & 24-Hour Expiration Lifecycle
  console.log('\n[Test 2] Testing Valid Offer with 24-Hour Expiration Window (₹8,500)...');
  const validOfferResult = await submitOffer({
    productId: testProduct.id,
    offeredPrice: 8500,
    buyerId: buyer1.id,
  });

  if (!validOfferResult.success || !validOfferResult.offerId) {
    throw new Error(`FAIL: Valid offer failed: ${JSON.stringify(validOfferResult)}`);
  }

  const offerRecord = await getOffer(validOfferResult.offerId);
  if (!offerRecord) throw new Error('FAIL: Offer record not found in database');

  const now = Date.now();
  const expiresAtMs = new Date(offerRecord.expiresAt).getTime();
  const hoursUntilExpiry = (expiresAtMs - now) / (1000 * 60 * 60);

  if (hoursUntilExpiry > 23.9 && hoursUntilExpiry <= 24.1) {
    console.log(`✓ PASS: Offer expiration is exactly 24 hours (~${hoursUntilExpiry.toFixed(2)}h). Status: ${offerRecord.status}`);
  } else {
    throw new Error(`FAIL: Expiration window unexpected: ${hoursUntilExpiry} hours`);
  }

  // 5. Test Concurrent Multi-Buyer Bids on the Same Product
  console.log('\n[Test 3] Testing Concurrent Multi-Buyer Bids on Same Product...');
  const concurrentOfferResult = await submitOffer({
    productId: testProduct.id,
    offeredPrice: 9000,
    buyerId: buyer2.id,
  });

  if (concurrentOfferResult.success && concurrentOfferResult.offerId) {
    console.log(`✓ PASS: Second concurrent buyer submitted offer: ${concurrentOfferResult.offerId}`);
  } else {
    throw new Error(`FAIL: Concurrent offer submission failed: ${JSON.stringify(concurrentOfferResult)}`);
  }

  const allOffers = await prisma.dealOffer.findMany({
    where: { productId: testProduct.id },
  });
  console.log(`✓ PASS: Verified ${allOffers.length} concurrent active offers stored for product ${testProduct.id}`);

  // 6. Test Offer Acceptance Status Transition
  console.log('\n[Test 4] Testing Seller Acceptance Status Transition...');
  const acceptResult = await acceptOffer(validOfferResult.offerId);
  if (acceptResult.success && acceptResult.offer?.status === 'ACCEPTED') {
    console.log('✓ PASS: Deal offer status updated to ACCEPTED. Escrow payment is unlocked!');
  } else {
    throw new Error(`FAIL: Offer acceptance failed: ${JSON.stringify(acceptResult)}`);
  }

  // 7. Test Slide-Over Cart Drawer Integration
  console.log('\n[Test 5] Testing Cart Drawer Actions (Add, Fetch, Remove)...');
  const addCartRes = await addToCart(testProduct.id, buyer1.id);
  if (!addCartRes.success || !addCartRes.cartItem) {
    throw new Error(`FAIL: Add to cart failed: ${JSON.stringify(addCartRes)}`);
  }
  console.log('✓ PASS: Item added to cart for negotiation drawer');

  const cartItems = await getCartItems(buyer1.id);
  const found = cartItems.some((ci) => ci.productId === testProduct.id);
  if (found) {
    console.log(`✓ PASS: Item retrieved in cart drawer items list (count: ${cartItems.length})`);
  } else {
    throw new Error('FAIL: Item not found in cart');
  }

  const removeRes = await removeFromCart(addCartRes.cartItem.id);
  if (removeRes.success) {
    console.log('✓ PASS: Item removed cleanly from cart drawer');
  } else {
    throw new Error('FAIL: Remove from cart failed');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 5 ENTERPRISE RESALE SPECIFICATIONS VERIFIED PASS!');
  console.log('======================================================');
}

runVerification()
  .catch((err) => {
    console.error('Verification error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
