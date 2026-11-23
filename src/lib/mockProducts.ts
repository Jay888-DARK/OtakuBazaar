/**
 * @file src/lib/mockProducts.ts
 *
 * Collectible product types and empty archival definitions for OtakuBazaar.
 * Zero hardcoded or seeded placeholder products (pure database driven).
 */

export interface ProductMediaItem {
  src: string;
  label: string;
  caption: string;
}

export interface MacroSlotItem {
  slot: string; // e.g. "01 // STUDIO SCULPT"
  title: string;
  src: string;
  description: string;
}

export interface MockProduct {
  id: string;
  lotNumber: string;
  title: string;
  franchise?: string;
  series?: string;
  category: 'Scale Figure' | 'Nendoroid' | 'Manga Sets' | 'Cosplay & Props' | 'Statues & Resin' | 'Mecha & Gunpla';
  categorySubtitle: string;
  edition: string;
  price: number;
  imageUrl: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD';
  gradeCondition: string; // e.g. "MISB (FACTORY SEALED)" | "BIB (CABINET DISPLAYED)"
  figureGrade: 'MISB (FACTORY SEALED)' | 'BIB (CABINET DISPLAYED)' | 'LOOSE (DISPLAYED PRISTINE)';
  boxCondition:
  | 'MINT BOX (BLISTER INTACT)'
  | 'MINOR COURIER CORNER WEAR'
  | 'FACTORY CARTON SEALED'
  | 'FACTORY SHRINKWRAP SEALED'
  | 'MINT / SHRINKWRAP INTACT';
  origin: string; // e.g. "MUMBAI, MH • IN-HAND"
  indianLocation: string; // e.g. "MUMBAI, MH" | "BENGALURU, KA" | "AHMEDABAD, GJ"
  ownerCount: string; // e.g. "1ST OWNER" | "AUTHENTIC IMPORT"
  sellerHandle: string; // e.g. "@flame_hashira_in"
  dispatchSla: string; // e.g. "48H INSURED BLUEDART/DELHIVERY"
  scale: '1/4 SCALE' | '1/6 SCALE' | '1/7 SCALE' | '1/8 SCALE' | 'NON-SCALE';
  weight: string;
  seal: string;
  sculptor: string;
  manufacturer: string;
  boxDimensions: string;
  provenance: string;
  videoUrl?: string;
  gallery: ProductMediaItem[];
  macroSlots: MacroSlotItem[];
  bundleItems?: { title: string; price: number; scale: string }[];
  mfcItemId?: string;
  mfcUrl?: string;
  originalPriceJPY?: number;
  releaseYear?: number;
  sellerBadges?: Array<{ id: string; label: string; shortLabel: string; description: string }>;
  isNewSeller?: boolean;
}

export const MOCK_GRAILS: MockProduct[] = [];
export const MOCK_PRODUCTS: MockProduct[] = [];
