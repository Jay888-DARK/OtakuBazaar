/**
 * @file src/lib/mockProducts.ts
 *
 * High-Ticket Authenticated Scale Figures & Private Vault Grails.
 * Features verified collector-grade photography and lot telemetry.
 */

export interface ProductMediaItem {
  src: string;
  label: string;
  caption: string;
}

export interface MockProduct {
  id: string;
  lotNumber: string;
  title: string;
  category: 'Scale Figure' | 'Nendoroid' | 'Manga Sets' | 'Cosplay & Props' | 'Statues & Resin' | 'Mecha & Gunpla';
  categorySubtitle: string;
  edition: string;
  price: number;
  imageUrl: string;
  condition: 'NEW' | 'LIKE_NEW';
  gradeCondition: 'GRADE S (MINT)' | 'GRADE A' | 'FACTORY SEALED';
  origin: 'TOKYO, JAPAN' | 'OSAKA, JAPAN' | 'KYOTO, JAPAN';
  scale: '1/4 SCALE' | '1/6 SCALE' | '1/7 SCALE' | '1/8 SCALE' | 'NON-SCALE';
  weight: string;
  seal: string;
  sculptor: string;
  manufacturer: string;
  boxDimensions: string;
  provenance: string;
  videoUrl?: string;
  gallery: ProductMediaItem[];
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
    gradeCondition: 'GRADE S (MINT)',
    origin: 'TOKYO, JAPAN',
    scale: '1/4 SCALE',
    weight: '18.4 KG',
    seal: 'HOLOGRAM S-01',
    sculptor: 'Prime 1 Studio Artisans / Head Sculpt by Kojima',
    manufacturer: 'Prime 1 Studio',
    boxDimensions: '74cm × 52cm × 48cm • Flight Crate 24.2 KG',
    provenance: 'Cast in heavy polystone resin with battle-damaged enamel finish, removable magnetic cape, and illuminated LED base. Acquired directly from Prime 1 Tokyo archival stock. Inspected under high-magnification optical sensors with zero micro-fractures.',
    videoUrl: '/showcase/guts_berserker_statue.jpg',
    gallery: [
      { src: '/showcase/guts_berserker_statue.jpg', label: 'FRONT ELEVATION', caption: 'Primary front view showcasing battle-hardened Berserker armor patina' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'BACK CAPE DETAIL', caption: 'Fabric weave texture, wired cape armature, and rear spinal plates' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'HEAD SCULPT MACRO', caption: 'Close-up macro of helmet teeth, crimson optical slits, and teeth gradient' },
      { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'BASE SERIAL STAMP', caption: 'Solid cold-cast bronze edition plaque stamped 042 / 350' },
      { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'HOLOGRAM SEAL', caption: 'Tamper-evident holographic authenticity seal with Tokyo Vault serial' },
      { src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85', label: 'FACTORY BOX INTEGRITY', caption: 'Original art box with reinforced corner guards and styrofoam inserts' },
      { src: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=85', label: 'LATERAL FLANK', caption: 'Full profile showing Dragon Slayer sword balance and resin joint tolerances' },
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
    gradeCondition: 'FACTORY SEALED',
    origin: 'TOKYO, JAPAN',
    scale: '1/8 SCALE',
    weight: '2.4 KG',
    seal: 'HOLOGRAM S-09',
    sculptor: 'Aniplex+ Official Modeling Guild',
    manufacturer: 'Aniplex / Kotobukiya',
    boxDimensions: '38cm × 30cm × 28cm',
    provenance: 'Authentic First-Run Aniplex+ exclusive with translucent flame effect parts, immaculate hilt wrapping, and pristine Japanese distributor gold sticker.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Frontal stance with dual flame spirals in translucent resin' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'CAPE FLAME DETAIL', caption: 'Gradated flame hem on white haori with authentic gold piping' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'BLADE ENGRAVING', caption: 'Macro inspection of kanji inscription Destroy Demons on Nichirin blade' },
      { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'HOLOGRAM SEAL', caption: 'Double-entry serial sticker with intact security foil' },
      { src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85', label: 'FACTORY PACKAGING', caption: 'Factory sealed box with Japanese barcode verification' },
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
    gradeCondition: 'FACTORY SEALED',
    origin: 'TOKYO, JAPAN',
    scale: '1/7 SCALE',
    weight: '3.1 KG',
    seal: 'HOLOGRAM S-04',
    sculptor: 'Kawasakishi Art Works',
    manufacturer: 'Good Smile Company / Alter',
    boxDimensions: '42cm × 32cm × 30cm',
    provenance: 'Deluxe packaging including both Invisible Air sword clear component and diecast Excalibur blade. Certified Grade S pristine factory condition.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Regal battle posture with blue pleated armor and silver greaves' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'EXCALIBUR MACRO', caption: 'Precision electroplated gold and blue runes across crossguard' },
      { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'HOLOGRAM VERIFIED', caption: 'Type-Moon certified holographic authenticity mark' },
      { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'FACTORY CRATE', caption: 'Unopened factory shipper box direct from Tokyo vault bay' },
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
    condition: 'NEW',
    gradeCondition: 'GRADE S (MINT)',
    origin: 'OSAKA, JAPAN',
    scale: '1/7 SCALE',
    weight: '4.8 KG',
    seal: 'HOLOGRAM S-11',
    sculptor: 'Design COCO Studio',
    manufacturer: 'eStream / Shibuya Scramble',
    boxDimensions: '48cm × 40cm × 38cm',
    provenance: 'Massive translucent purple energy explosion effect with flawless clarity. Direct Shibuya Scramble Tokyo release with inspection certificate intact.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Floating dynamic pose with inverted gravity blindfold physics' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'ENERGY SPHERE', caption: 'Resin gradient from crimson to deep ultraviolet without clouding' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'BASE NUMBER', caption: 'Laser-etched plate 015 / 250 with cryptographic custody ID' },
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
    gradeCondition: 'FACTORY SEALED',
    origin: 'KYOTO, JAPAN',
    scale: '1/8 SCALE',
    weight: '1.9 KG',
    seal: 'HOLOGRAM S-07',
    sculptor: 'MegaHouse Artisans',
    manufacturer: 'MegaHouse',
    boxDimensions: '34cm × 26cm × 24cm',
    provenance: 'G.E.M. series iconic transmutation pose with stone wall effects and automail arm specular metallic reflection.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Transmutation circle ground posture with billowing crimson coat' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'AUTOMAIL MACRO', caption: 'Polished silver joint mechanics with micro-rivet sculpting' },
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
    gradeCondition: 'GRADE A',
    origin: 'TOKYO, JAPAN',
    scale: 'NON-SCALE',
    weight: '3.6 KG',
    seal: 'HOLOGRAM S-18',
    sculptor: 'Bandai Spirits Tamashii Nations',
    manufacturer: 'Bandai Spirits',
    boxDimensions: '45cm × 35cm × 18cm',
    provenance: 'High-density zinc alloy internal endoskeleton with iridescent purple armor plates. Complete weapon arsenal included.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Tactical mecha stance displaying articulated diecast joints' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'PALETTE RIFLE', caption: 'High-caliber rifle assembly and umbilical power cord attachment' },
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
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'FACTORY SEALED',
    origin: 'TOKYO, JAPAN',
    scale: 'NON-SCALE',
    weight: '0.8 KG',
    seal: 'HOLOGRAM S-22',
    sculptor: 'Shichibee / Good Smile',
    manufacturer: 'Good Smile Company',
    boxDimensions: '21cm × 17cm × 10cm',
    provenance: 'Factory sealed blister pack with Pochita miniature companion, alternate chainsaw head, and blood splash accessories.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'FRONT ELEVATION', caption: 'Chainsaw head configuration with extended metallic blades' },
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'POCHITA ACCESSORY', caption: 'Handheld chainsaw devil companion figure' },
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
    gradeCondition: 'FACTORY SEALED',
    origin: 'TOKYO, JAPAN',
    scale: 'NON-SCALE',
    weight: '26.5 KG',
    seal: 'HOLOGRAM S-30',
    sculptor: 'Kentaro Miura / Dark Horse',
    manufacturer: 'Dark Horse Comics',
    boxDimensions: '80cm × 45cm × 30cm • Complete 14 Volumes',
    provenance: 'Complete 14-volume oversized leatherette deluxe edition set. Embossed foil lettering, bookmark ribbons, acid-free archival paper.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'COMPLETE SET', caption: 'All 14 volumes in pristine factory shrink wrap with Brand of Sacrifice spine art' },
      { src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85', label: 'FOIL EMBOSSING', caption: 'Glossy red metallic foil against textured matte leatherette cover' },
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
    imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=85',
    condition: 'NEW',
    gradeCondition: 'FACTORY SEALED',
    origin: 'OSAKA, JAPAN',
    scale: 'NON-SCALE',
    weight: '1.6 KG',
    seal: 'HOLOGRAM S-33',
    sculptor: 'Proplica Engineering Division',
    manufacturer: 'Bandai Spirits / Proplica',
    boxDimensions: '92cm × 16cm × 12cm',
    provenance: 'Full 1:1 scale replica with integrated speaker sound effects, authentic hilt ray-skin texture, and matte black sun-etched blade.',
    gallery: [
      { src: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85', label: 'SHEATHED PROFILE', caption: 'Full-length 880mm blade with custom display stand and scabbard' },
      { src: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85', label: 'TSUBA WHEEL', caption: 'Detailed flame tsuba handguard with authentic paint layering' },
    ],
  },
];

export const MOCK_PRODUCTS = MOCK_GRAILS;
