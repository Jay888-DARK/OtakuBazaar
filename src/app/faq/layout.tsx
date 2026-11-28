import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — OtakuBazaar India',
  description:
    'Answers to common questions about buying, selling, shipping, and the 48-hour unboxing inspection window on OtakuBazaar.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
