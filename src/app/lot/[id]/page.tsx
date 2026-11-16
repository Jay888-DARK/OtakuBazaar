import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mockProducts';
import { LotDetailClientView } from '@/presentation/components/products/LotDetailClientView';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getProduct(id: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find(
    (p) =>
      p.id.toLowerCase() === id.toLowerCase() ||
      p.lotNumber.toLowerCase() === id.toLowerCase()
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id) || MOCK_PRODUCTS[0]!;

  const title = `${product.title} — OtakuBazaar Escrow Marketplace`;
  const description = `Buy authentic ${product.title} (${product.category}, ${product.gradeCondition}) for ₹${product.price.toLocaleString('en-IN')}. Protected by 48-hour unboxing inspection escrow.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 1000,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.imageUrl],
    },
  };
}

export default async function LotDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  // Schema.org Product JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.imageUrl],
    description: product.provenance || product.categorySubtitle,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: product.manufacturer || 'Japanese Collectibles',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      itemCondition: product.condition === 'NEW' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Person',
        name: product.sellerHandle,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LotDetailClientView product={product} />
    </>
  );
}
