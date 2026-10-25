/**
 * @file src/lib/mockProducts.ts
 *
 * High-Ticket Authenticated Scale Figures & Private Vault Grails.
 * Features verified collector-grade photography and realistic Indian custody telemetry.
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
  boxCondition: 'MINT BOX (BLISTER INTACT)' | 'MINOR COURIER CORNER WEAR' | 'FACTORY CARTON SEALED';
  origin: string; // e.g. "MUMBAI, MH • IN-HAND"
  indianLocation: string; // e.g. "MUMBAI, MH" | "BENGALURU, KA" | "AHMEDABAD, GJ"
  ownerCount: string; // e.g. "1ST OWNER" | "DIRECT TOKYO IMPORT"
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
}

export const MOCK_GRAILS: MockProduct[] = [
  {
    id: 'lot-0482',
    lotNumber: '0482',
    title: 'GUTS BERSERKER ARMOR 1/4 SCALE STATUE',
    category: 'Statues & Resin',
    categorySubtitle: 'PRE-PAINTED POLYSTONE STATUE',
    edition: 'EDITION: 042 / 350',
    price: 124000,
    imageUrl: '/showcase/guts_berserker_statue.jpg',
    condition: 'NEW',
    gradeCondition: 'GRADE S // MISB (FACTORY SEALED)',
    figureGrade: 'MISB (FACTORY SEALED)',
    boxCondition: 'FACTORY CARTON SEALED',
    origin: 'MUMBAI, MH • IN-HAND',
    indianLocation: 'MUMBAI, MH',
    ownerCount: '1ST OWNER',
    sellerHandle: '@berserk_vault_bom',
    dispatchSla: '48H INSURED BLUEDART AIR (CRATED)',
    scale: '1/4 SCALE',
    weight: '18.4 KG',
    seal: 'HOLOGRAM S-01 (PRIME 1 VERIFIED)',
    sculptor: 'Prime 1 Studio Artisans / Head Sculpt by Kojima',
    manufacturer: 'Prime 1 Studio',
    boxDimensions: '74cm × 52cm × 48cm • Flight Crate 24.2 KG',
    provenance: 'Cast in heavy polystone resin with battle-damaged enamel finish, removable magnetic cape, and illuminated LED base. Acquired directly from Prime 1 Tokyo archival stock and cleared through Mumbai customs with full import duty documentation. Inspected under high-magnification optical sensors with zero micro-fractures.',
    videoUrl: '/showcase/guts_berserker_statue.jpg',
    gallery: [
      { src: '/showcase/guts_berserker_statue.jpg', label: 'FRONT ELEVATION', caption: 'Primary front view showcasing battle-hardened Berserker armor patina' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'BACK CAPE DETAIL', caption: 'Fabric weave texture, wired cape armature, and rear spinal plates' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'HEAD SCULPT MACRO', caption: 'Close-up macro of helmet teeth, crimson optical slits, and teeth gradient' },
      { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'BASE SERIAL STAMP', caption: 'Solid cold-cast bronze edition plaque stamped 042 / 350' },
      { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'HOLOGRAM SEAL', caption: 'Tamper-evident holographic authenticity seal with Tokyo Vault serial' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: '/showcase/guts_berserker_statue.jpg', description: 'Hand-weathered enamel armor joints with high-definition specular reflection.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'Hologram Sticker Macro', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Hakusensha license seal with micro-optic tamper security layer.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Deep debossed copyright © Kentaro Miura / Studio Gaga / Prime 1 Studio.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', description: 'Physical ledger card verified with @berserk_vault_bom and current IST date stamp.' },
    ],
    bundleItems: [
      { title: 'Berserk Deluxe Vol 1-14 Complete Hardcover Set', price: 42000, scale: 'Manga' },
      { title: 'Griffith 1/4 Scale Golden Age Falcon Statue', price: 98000, scale: '1/4 Scale' },
    ],
  },
  {
    id: 'lot-0481',
    lotNumber: '0481',
    title: 'KYOJURO RENGOKU 1/8 FLAME BREATHING',
    category: 'Scale Figure',
    categorySubtitle: 'PRE-PAINTED PVC & ABS FIGURE',
    edition: 'EDITION: 128 / 500',
    price: 28500,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'GRADE S // MISB (FACTORY SEALED)',
    figureGrade: 'MISB (FACTORY SEALED)',
    boxCondition: 'MINT BOX (BLISTER INTACT)',
    origin: 'BENGALURU, KA • 1ST OWNER',
    indianLocation: 'BENGALURU, KA',
    ownerCount: '1ST OWNER',
    sellerHandle: '@flame_hashira_in',
    dispatchSla: '48H INSURED BLUEDART AIR',
    scale: '1/8 SCALE',
    weight: '2.4 KG',
    seal: 'HOLOGRAM S-09 (ANIPLEX+ SEALED)',
    sculptor: 'Aniplex+ Official Modeling Guild',
    manufacturer: 'Aniplex / Kotobukiya',
    boxDimensions: '38cm × 30cm × 28cm',
    provenance: 'Authentic First-Run Aniplex+ exclusive with translucent flame effect parts, immaculate hilt wrapping, and pristine Japanese distributor gold sticker. Kept in climate-controlled dark collector vault in Indiranagar, Bengaluru.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Frontal stance with dual flame spirals in translucent resin' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'CAPE FLAME DETAIL', caption: 'Gradated flame hem on white haori with authentic gold piping' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'BLADE ENGRAVING', caption: 'Macro inspection of kanji inscription Destroy Demons on Nichirin blade' },
      { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'HOLOGRAM SEAL', caption: 'Double-entry serial sticker with intact security foil' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Translucent polycarbonate flame aura with zero micro-bubbles.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'Aniplex+ Gold Sticker Macro', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Prismatic Ufotable/Aniplex gold foil authentication label.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Molded underside reading © Koyoharu Gotoge / Shueisha / Aniplex / ufotable.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', description: 'In-hand note reading @flame_hashira_in • Bengaluru Hub.' },
    ],
    bundleItems: [
      { title: 'Akaza 1/8 Scale Destructive Death Battle Figure', price: 26000, scale: '1/8 Scale' },
      { title: 'Tanjirou Kamado Hinokami Kagura Dance Scale', price: 22500, scale: '1/8 Scale' },
    ],
  },
  {
    id: 'lot-0484',
    lotNumber: '0484',
    title: 'SABER / ALTRIA PENDRAGON 1/7 DELUXE',
    category: 'Scale Figure',
    categorySubtitle: 'PRE-PAINTED PVC & DIECAST FIGURE',
    edition: 'EDITION: 089 / 400',
    price: 24500,
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'GRADE S // MISB (FACTORY SEALED)',
    figureGrade: 'MISB (FACTORY SEALED)',
    boxCondition: 'MINT BOX (BLISTER INTACT)',
    origin: 'AHMEDABAD, GJ • 1ST OWNER',
    indianLocation: 'AHMEDABAD, GJ',
    ownerCount: '1ST OWNER',
    sellerHandle: '@chaldea_vault_gj',
    dispatchSla: '48H INSURED BLUEDART AIR',
    scale: '1/7 SCALE',
    weight: '3.1 KG',
    seal: 'HOLOGRAM S-04 (TYPE-MOON CERTIFIED)',
    sculptor: 'Kawasakishi Art Works',
    manufacturer: 'Good Smile Company / Alter',
    boxDimensions: '42cm × 32cm × 30cm',
    provenance: 'Deluxe packaging including both Invisible Air sword clear component and diecast Excalibur blade. Certified Grade S pristine factory condition from Gujarat private collection.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Regal battle posture with blue pleated armor and silver greaves' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'EXCALIBUR MACRO', caption: 'Precision electroplated gold and blue runes across crossguard' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', description: 'Diecast metallic electroplating with flawless silver armor sheen.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'Type-Moon Hologram', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Official Type-Moon embossed hologram with sequential registry digits.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Base stamp reading © TYPE-MOON / FGO PROJECT / Alter Japan.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Proof note with @chaldea_vault_gj and Ahmedabad postal code.' },
    ],
  },
  {
    id: 'lot-0485',
    lotNumber: '0485',
    title: 'SATORU GOJO HOLLOW PURPLE 1/7 SCRAMBLE',
    category: 'Scale Figure',
    categorySubtitle: 'SHIBUYA SCRAMBLE ARCHIVAL RESIN',
    edition: 'EDITION: 015 / 250',
    price: 36000,
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=85',
    condition: 'LIKE_NEW',
    gradeCondition: 'GRADE A // BIB (CABINET DISPLAYED)',
    figureGrade: 'BIB (CABINET DISPLAYED)',
    boxCondition: 'MINOR COURIER CORNER WEAR',
    origin: 'PUNE, MH • 1ST OWNER',
    indianLocation: 'PUNE, MH',
    ownerCount: '1ST OWNER',
    sellerHandle: '@jujutsu_curator_pn',
    dispatchSla: '48H INSURED DELHIVERY EXPRESS',
    scale: '1/7 SCALE',
    weight: '4.8 KG',
    seal: 'HOLOGRAM S-11 (MAPPA CERTIFIED)',
    sculptor: 'Design COCO Studio',
    manufacturer: 'eStream / Shibuya Scramble',
    boxDimensions: '48cm × 40cm × 38cm',
    provenance: 'Massive translucent purple energy explosion effect with flawless clarity. Displayed inside UV-treated glass Moducase. Box and internal blisters preserved with minor corner storage wear.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Floating dynamic pose with inverted gravity blindfold physics' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'ENERGY SPHERE', caption: 'Resin gradient from crimson to deep ultraviolet without clouding' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Translucent violet resin sphere with gradient light diffusion.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'MAPPA Hologram Macro', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Official MAPPA production hologram intact on outer sleeve.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Laser-etched plate 015 / 250 © Gege Akutami / Shueisha, JUJUTSU KAISEN Project.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', description: 'Dated note with @jujutsu_curator_pn verified in Pune staging.' },
    ],
  },
  {
    id: 'lot-0483',
    lotNumber: '0483',
    title: 'EDWARD ELRIC FULLMETAL ALCHEMIST GEM',
    category: 'Scale Figure',
    categorySubtitle: 'PRE-PAINTED PVC STATUETTE',
    edition: 'EDITION: 210 / 600',
    price: 17500,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'GRADE S // MISB (FACTORY SEALED)',
    figureGrade: 'MISB (FACTORY SEALED)',
    boxCondition: 'MINT BOX (BLISTER INTACT)',
    origin: 'DELHI NCR • 1ST OWNER',
    indianLocation: 'NEW DELHI, DL',
    ownerCount: '1ST OWNER',
    sellerHandle: '@alchemy_vault_delhi',
    dispatchSla: '48H INSURED BLUEDART AIR',
    scale: '1/8 SCALE',
    weight: '1.9 KG',
    seal: 'HOLOGRAM S-07 (MEGAHOUSE TOKYO)',
    sculptor: 'MegaHouse Artisans',
    manufacturer: 'MegaHouse',
    boxDimensions: '34cm × 26cm × 24cm',
    provenance: 'G.E.M. series iconic transmutation pose with stone wall effects and automail arm specular metallic reflection. Kept sealed in Japanese collector shipping carton.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Transmutation circle ground posture with billowing crimson coat' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'AUTOMAIL MACRO', caption: 'Polished silver joint mechanics with micro-rivet sculpting' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Transmutation crackle ground with specular automail arm.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'MegaHouse Hologram', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Square holographic tamper seal with MegaHouse serial code.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Underside stamp reading © Hiromu Arakawa / FA Project / MBS.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', description: 'Verification card with @alchemy_vault_delhi.' },
    ],
  },
  {
    id: 'lot-0486',
    lotNumber: '0486',
    title: 'EVA UNIT-01 TEST TYPE METAL BUILD',
    category: 'Mecha & Gunpla',
    categorySubtitle: 'DIECAST & COMPOSITE ACTION RELIC',
    edition: 'EDITION: 094 / 300',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=85',
    condition: 'LIKE_NEW',
    gradeCondition: 'GRADE A // BIB (CABINET DISPLAYED)',
    figureGrade: 'BIB (CABINET DISPLAYED)',
    boxCondition: 'MINT BOX (BLISTER INTACT)',
    origin: 'HYDERABAD, TS • 1ST OWNER',
    indianLocation: 'HYDERABAD, TS',
    ownerCount: '1ST OWNER',
    sellerHandle: '@nerv_custody_hyd',
    dispatchSla: '48H INSURED BLUEDART AIR',
    scale: 'NON-SCALE',
    weight: '3.6 KG',
    seal: 'HOLOGRAM S-18 (TAMASHII QUALITY)',
    sculptor: 'Bandai Spirits Tamashii Nations',
    manufacturer: 'Bandai Spirits',
    boxDimensions: '45cm × 35cm × 18cm',
    provenance: 'High-density zinc alloy internal endoskeleton with iridescent purple armor plates. Complete weapon arsenal and pristine blister trays preserved.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Tactical mecha stance displaying articulated diecast joints' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'PALETTE RIFLE', caption: 'High-caliber rifle assembly and umbilical power cord attachment' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85', description: 'Articulated diecast knee joint showing authentic gear teeth.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'Bandai Tamashii Seal', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Tamashii Nations Quality certified holographic sticker.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Base markings: © khara / Bandai 2024 Made in Japan.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Dated note with @nerv_custody_hyd in Hyderabad vault.' },
    ],
  },
  {
    id: 'lot-0487',
    lotNumber: '0487',
    title: 'NENDOROID DENJI CHAINSAW MAN EDITION',
    category: 'Nendoroid',
    categorySubtitle: 'ARTICULATED CHIBI ACTION COLLECTIBLE',
    edition: 'EDITION: 312 / 1000',
    price: 6200,
    imageUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'GRADE S // MISB (FACTORY SEALED)',
    figureGrade: 'MISB (FACTORY SEALED)',
    boxCondition: 'MINT BOX (BLISTER INTACT)',
    origin: 'CHENNAI, TN • 1ST OWNER',
    indianLocation: 'CHENNAI, TN',
    ownerCount: '1ST OWNER',
    sellerHandle: '@csm_grail_chennai',
    dispatchSla: '48H INSURED DELHIVERY SURFACE',
    scale: 'NON-SCALE',
    weight: '0.8 KG',
    seal: 'HOLOGRAM S-22 (GSC JAPANESE LABEL)',
    sculptor: 'Shichibee / Good Smile',
    manufacturer: 'Good Smile Company',
    boxDimensions: '21cm × 17cm × 10cm',
    provenance: 'Factory sealed blister pack with Pochita miniature companion, alternate chainsaw head, and blood splash accessories. Clean box edges.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Chainsaw head configuration with extended metallic blades' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'POCHITA ACCESSORY', caption: 'Handheld chainsaw devil companion figure' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=1000&q=85', description: 'Precision molded engine cord and serrated head blades.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'GSC Authenticity Hologram', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Good Smile Company Japanese distributor circular seal.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Translucent arm pin: © Tatsuki Fujimoto / Shueisha / MAPPA.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Custody card with @csm_grail_chennai.' },
    ],
  },
  {
    id: 'lot-0488',
    lotNumber: '0488',
    title: 'BERSERK DELUXE EDITION VOL 1-14 HARDCOVER SET',
    category: 'Manga Sets',
    categorySubtitle: 'LEATHERETTE ARCHIVAL BOX SET',
    edition: 'EDITION: 054 / 200',
    price: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'GRADE S // MISB (FACTORY SEALED)',
    figureGrade: 'MISB (FACTORY SEALED)',
    boxCondition: 'MINT BOX (BLISTER INTACT)',
    origin: 'KOLKATA, WB • 1ST OWNER',
    indianLocation: 'KOLKATA, WB',
    ownerCount: '1ST OWNER',
    sellerHandle: '@manga_curator_ccu',
    dispatchSla: '48H HEAVY CRATE BLUEDART',
    scale: 'NON-SCALE',
    weight: '26.5 KG',
    seal: 'HOLOGRAM S-30 (DARK HORSE SEALED)',
    sculptor: 'Kentaro Miura / Dark Horse',
    manufacturer: 'Dark Horse Comics',
    boxDimensions: '80cm × 45cm × 30cm • Complete 14 Volumes',
    provenance: 'Complete 14-volume oversized leatherette deluxe edition set. Embossed red foil lettering, bookmark ribbons, acid-free archival paper. Factory plastic sealed in storage box.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'COMPLETE SET', caption: 'All 14 volumes in pristine factory shrink wrap with Brand of Sacrifice spine art' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'FOIL EMBOSSING', caption: 'Glossy red metallic foil against textured matte leatherette cover' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Red metallic Brand of Sacrifice foil stamped into faux leather.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'Dark Horse Barcode Macro', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Individual ISBN shrinkwrap barcodes intact across all 14 volumes.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Publisher Imprint', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'First Edition Hardcover Printing © Kentaro Miura / Dark Horse Books.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Seller timestamp with @manga_curator_ccu Kolkata.' },
    ],
  },
  {
    id: 'lot-0489',
    lotNumber: '0489',
    title: 'TANJIROU SUN BREATHING NICHIRIN SWORD 1:1 PROP',
    category: 'Cosplay & Props',
    categorySubtitle: '1:1 SCALE DIECAST REPLICA WITH AUDIO',
    edition: 'EDITION: 088 / 350',
    price: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'GRADE S // MISB (FACTORY SEALED)',
    figureGrade: 'MISB (FACTORY SEALED)',
    boxCondition: 'MINT BOX (BLISTER INTACT)',
    origin: 'JAIPUR, RJ • 1ST OWNER',
    indianLocation: 'JAIPUR, RJ',
    ownerCount: '1ST OWNER',
    sellerHandle: '@samurai_props_jpr',
    dispatchSla: '48H INSURED BLUEDART AIR',
    scale: 'NON-SCALE',
    weight: '1.6 KG',
    seal: 'HOLOGRAM S-33 (PROPLICA TAMASHII)',
    sculptor: 'Proplica Engineering Division',
    manufacturer: 'Bandai Spirits / Proplica',
    boxDimensions: '92cm × 16cm × 12cm',
    provenance: 'Full 1:1 scale replica with integrated speaker sound effects, authentic hilt ray-skin texture, and matte black sun-etched blade. Never unsheathed, sealed inside Bandai carton.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=85', label: 'SHEATHED PROFILE', caption: 'Full-length 880mm blade with custom display stand and scabbard' },
      { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'TSUBA WHEEL', caption: 'Detailed flame tsuba handguard with authentic paint layering' },
    ],
    macroSlots: [
      { slot: '[ 01 // STUDIO SCULPT ]', title: 'Studio Sculpt Macro', src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=85', description: 'Matte black sun-etched steel blade with flame hilt tsuba.' },
      { slot: '[ 02 // HOLOGRAM STICKER MACRO ]', title: 'Proplica Tamashii Seal', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', description: 'Official Bandai Proplica tamper sticker.' },
      { slot: '[ 03 // BASE COPYRIGHT STAMP ]', title: 'Base Copyright Stamp', src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', description: 'Pommel stamp: © Koyoharu Gotoge / Shueisha, Aniplex, ufotable.' },
      { slot: '[ 04 // HANDWRITTEN TIMESTAMP ]', title: 'Handwritten Timestamp', src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', description: 'Verification with @samurai_props_jpr in Jaipur.' },
    ],
  },
];

export const MOCK_PRODUCTS = MOCK_GRAILS;
