import { test } from 'node:test';
import assert from 'node:assert';
import {
  validateAiVisionResponse,
  normalizeCategory,
  normalizeManufacturer,
  normalizeCondition,
  normalizeDraftItem,
  deduplicateDraftItems,
} from '../domain/services/listingVisionService';

test('validateAiVisionResponse: parses clean JSON array of items', () => {
  const json = JSON.stringify([
    {
      title: 'Satoru Gojo 1/7 Scale Figure',
      franchise: 'Jujutsu Kaisen',
      category: 'Scale Figure',
      publisher_or_manufacturer: 'eStream',
      condition_grade: 'MISB',
      price_inr: 24500,
      confidence: { title: 0.95, category: 0.9, price_inr: 0.8 },
    },
  ]);

  const res = validateAiVisionResponse(json);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.items.length, 1);
  assert.strictEqual(res.items[0]!.title, 'Satoru Gojo 1/7 Scale Figure');
  assert.strictEqual(res.items[0]!.price_inr, 24500);
});

test('validateAiVisionResponse: handles markdown-wrapped JSON code blocks', () => {
  const markdown = '```json\n[{"title": "Chainsaw Man Vol 1", "category": "Manga Sets"}]\n```';
  const res = validateAiVisionResponse(markdown);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.items.length, 1);
  assert.strictEqual(res.items[0]!.title, 'Chainsaw Man Vol 1');
});

test('validateAiVisionResponse: caps at 20 items maximum', () => {
  const items = Array.from({ length: 30 }, (_, i) => ({
    title: `Manga Volume ${i + 1}`,
    category: 'Manga Sets',
  }));
  const res = validateAiVisionResponse(JSON.stringify(items));
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.items.length, 20);
});

test('normalizeCategory: exact matches and fuzzy matches', () => {
  assert.strictEqual(normalizeCategory('Scale Figure').category, 'Scale Figure');
  assert.strictEqual(normalizeCategory('1/7 pvc scale figure').category, 'Scale Figure');
  assert.strictEqual(normalizeCategory('Nendoroid Chibi').category, 'Nendoroid');
  assert.strictEqual(normalizeCategory('Manga Book Collection').category, 'Manga Sets');
  assert.strictEqual(normalizeCategory('Gunpla Master Grade').category, 'Mecha & Gunpla');
  assert.strictEqual(normalizeCategory('Cosplay Prop Sword').category, 'Cosplay & Props');
});

test('normalizeCategory: falls back to Other for unmapped categories', () => {
  const res = normalizeCategory('Vintage Vinyl Record');
  assert.strictEqual(res.category, 'Other');
  assert.strictEqual(res.unmappedRaw, 'Vintage Vinyl Record');
});

test('normalizeManufacturer: maps recognized Japanese studios and falls back to Other', () => {
  assert.strictEqual(normalizeManufacturer('Good Smile Company').manufacturer, 'Good Smile Company');
  assert.strictEqual(normalizeManufacturer('GSC Orange Rouge').manufacturer, 'Good Smile Company');
  assert.strictEqual(normalizeManufacturer('Kotobukiya ARTFX').manufacturer, 'Kotobukiya');
  assert.strictEqual(normalizeManufacturer('Bandai Tamashii Nations').manufacturer, 'Bandai Spirits');

  const unmapped = normalizeManufacturer('Prime 1 Studio');
  assert.strictEqual(unmapped.manufacturer, 'Other');
  assert.strictEqual(unmapped.unmappedRaw, 'Prime 1 Studio');
});

test('normalizeDraftItem: preserves unmapped metadata in description and flags low confidence', () => {
  const raw = {
    title: 'Unknown Anime Prop',
    franchise: null,
    category: 'Collectible Accessory',
    publisher_or_manufacturer: 'Indie Creator',
    volume_or_edition: '1st Print',
    language: 'Japanese',
    condition_grade: null,
    price_inr: null,
    description: 'Found at Comiket',
    confidence: { title: 0.9, category: 0.5, condition_grade: 0.3 },
  };

  const draft = normalizeDraftItem(raw, 0, 'data:image/webp;base64,sample');
  assert.strictEqual(draft.category, 'Other');
  assert.strictEqual(draft.manufacturer, 'Other');
  assert.ok(draft.description.includes('Original Category: Collectible Accessory'));
  assert.ok(draft.description.includes('Publisher/Manufacturer: Indie Creator'));
  assert.ok(draft.description.includes('Volume/Edition: 1st Print'));
  assert.ok(draft.lowConfidenceFields.includes('category'));
  assert.ok(draft.lowConfidenceFields.includes('condition_grade'));
});

test('deduplicateDraftItems: removes duplicates by title and volume', () => {
  const items = [
    normalizeDraftItem({ title: 'Berserk Deluxe Edition', volume_or_edition: 'Vol 1' }),
    normalizeDraftItem({ title: 'berserk deluxe edition', volume_or_edition: 'vol 1' }),
    normalizeDraftItem({ title: 'Berserk Deluxe Edition', volume_or_edition: 'Vol 2' }),
  ];

  const deduped = deduplicateDraftItems(items);
  assert.strictEqual(deduped.length, 2);
  assert.strictEqual(deduped[0]!.volumeOrEdition, 'Vol 1');
  assert.strictEqual(deduped[1]!.volumeOrEdition, 'Vol 2');
});
