import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Contact Support & Grievance Desk — OtakuBazaar',
  description:
    'Reach OtakuBazaar customer support in India for order help, unboxing inspection disputes, or grievance inquiries.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
