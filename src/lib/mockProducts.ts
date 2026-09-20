/**
 * @file src/lib/mockProducts.ts
 *
 * High-Ticket Authenticated Scale Figures & Private Vault Grails.
 * Features verified collector-grade photography and lot telemetry.
 */

export interface MockProduct {
  id: string;
  lotNumber: string;
  title: string;
  category: 'Scale Figure' | 'Nendoroid' | 'Manga Sets' | 'Cosplay & Props';
  price: number;
  imageUrl: string;
  condition: 'NEW' | 'LIKE_NEW';
}

export const MOCK_GRAILS: MockProduct[] = [
  {
    id: 'lot-0481',
    lotNumber: '0481',
    title: 'Kyojuro Rengoku 1/8 Flame Breathing',
    category: 'Scale Figure',
    price: 28500,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
  },
  {
    id: 'lot-0482',
    lotNumber: '0482',
    title: 'Guts Berserker Armor Unleashed 1/4',
    category: 'Scale Figure',
    price: 89000,
    imageUrl: '/showcase/guts_berserker_statue.jpg',
    condition: 'LIKE_NEW',
  },
  {
    id: 'lot-0483',
    lotNumber: '0483',
    title: 'Edward Elric Fullmetal Alchemist GEM',
    category: 'Scale Figure',
    price: 17500,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
  },
  {
    id: 'lot-0484',
    lotNumber: '0484',
    title: 'Saber / Altria Pendragon 1/7 Deluxe',
    category: 'Scale Figure',
    price: 24500,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
  },
  {
    id: 'lot-0485',
    lotNumber: '0485',
    title: 'Satoru Gojo Hollow Purple 1/7 Scramble',
    category: 'Scale Figure',
    price: 36000,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
  },
  {
    id: 'lot-0486',
    lotNumber: '0486',
    title: 'EVA Unit-01 Test Type Metal Build',
    category: 'Scale Figure',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
    condition: 'LIKE_NEW',
  },
  {
    id: 'lot-0487',
    lotNumber: '0487',
    title: 'Nendoroid Denji Chainsaw Man Edition',
    category: 'Nendoroid',
    price: 6200,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
  },
  {
    id: 'lot-0488',
    lotNumber: '0488',
    title: 'Berserk Deluxe Edition Vol 1-14 Hardcover Set',
    category: 'Manga Sets',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
  },
  {
    id: 'lot-0489',
    lotNumber: '0489',
    title: 'Tanjirou Sun Breathing Nichirin Sword 1:1 Prop',
    category: 'Cosplay & Props',
    price: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
  },
];

export const MOCK_PRODUCTS = MOCK_GRAILS;
