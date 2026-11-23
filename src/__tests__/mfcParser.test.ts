/**
 * @file src/__tests__/mfcParser.test.ts
 * Unit tests for MyFigureCollection URL parser
 */

import assert from 'node:assert';
import test from 'node:test';
import { parseMfcUrl } from '../infrastructure/services/mfcService';

test('parseMfcUrl: parses standard https URL', () => {
  const result = parseMfcUrl('https://myfigurecollection.net/item/1983344');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.itemId, '1983344');
  assert.strictEqual(result.error, undefined);
});

test('parseMfcUrl: parses URL with trailing slash and query params', () => {
  const result = parseMfcUrl('https://myfigurecollection.net/item/1983344/?ref=feed&sort=date');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.itemId, '1983344');
});

test('parseMfcUrl: parses www URL with slug', () => {
  const result = parseMfcUrl('https://www.myfigurecollection.net/item/1983344/megahouse-rengoku-flame-hashira');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.itemId, '1983344');
});

test('parseMfcUrl: parses relative /item/123 path', () => {
  const result = parseMfcUrl('/item/123456');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.itemId, '123456');
});

test('parseMfcUrl: parses item/123 path without leading slash', () => {
  const result = parseMfcUrl('item/778899');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.itemId, '778899');
});

test('parseMfcUrl: parses bare numeric ID', () => {
  const result = parseMfcUrl('456789');
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.itemId, '456789');
});

test('parseMfcUrl: rejects foreign domains', () => {
  const result = parseMfcUrl('https://amiami.com/item/123456');
  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /Invalid domain/i);
});

test('parseMfcUrl: rejects non-item MFC paths (e.g. blog or user)', () => {
  const result = parseMfcUrl('https://myfigurecollection.net/blog/123');
  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /Invalid MFC path/i);
});

test('parseMfcUrl: rejects empty or whitespace input', () => {
  const empty1 = parseMfcUrl('');
  assert.strictEqual(empty1.valid, false);

  const empty2 = parseMfcUrl('   ');
  assert.strictEqual(empty2.valid, false);
});
