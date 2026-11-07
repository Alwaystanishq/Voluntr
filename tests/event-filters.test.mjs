import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Compile the actual TypeScript helper without requiring a separate test runtime.
function load(relativePath) {
  const exports = {};
  const source = fs.readFileSync(path.join(testDirectory, '..', relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  vm.runInNewContext(outputText, {
    exports, URLSearchParams, Date,
    require(name) {
      if (name === '@/types/event') return load('types/event.ts');
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}
const { parseEventFilters, literalPattern } = load('lib/event-filters.ts');
const now = new Date('2027-01-01T12:00:00Z');
const parse = (query) => parseEventFilters(new URLSearchParams(query), now);
const plain = (value) => JSON.parse(JSON.stringify(value));

test('defaults to upcoming events with bounded pagination', () => {
  const filters = parse('');
  assert.equal(filters.page, 1);
  assert.equal(filters.pageSize, 12);
  assert.equal(filters.sort, 'soonest');
  assert.deepEqual(plain(filters.conditions), [{ date: { $gt: now.toISOString() } }]);
});

test('search punctuation is treated literally, including regex operators', () => {
  const text = 'NGO (A+B) [city].*?^$|\\';
  const regex = new RegExp(literalPattern(text), 'i');
  assert.ok(regex.test(text));
  assert.ok(!regex.test('NGO AAAB city'));
  assert.equal(parse('q=++Park++').q, 'Park');
});

test('combines category, literal location, date boundaries and pagination', () => {
  const result = parse('scope=all&category=Education&location=St.+John&q=School&page=2&sort=newest&from=2027-02-01T00:00:00Z&to=2027-02-03T00:00:00Z');
  assert.equal(result.page, 2);
  assert.equal(result.sort, 'newest');
  assert.equal(result.q, 'School');
  assert.deepEqual(plain(result.conditions), [
    {date: {$gte: '2027-02-01T00:00:00.000Z'}},
    {date: {$lt: '2027-02-03T00:00:00.000Z'}},
    {category: 'Education'},
    {location: {$regex: 'St\\. John', $options: 'i'}},
  ]);
});

test('all and past scopes use the intended date constraints', () => {
  assert.equal(parse('scope=all').conditions.length, 0);
  assert.deepEqual(plain(parse('scope=past').conditions), [{date: {$lte: now.toISOString()}}]);
});

test('availability requires a future event, open deadline, and spare or unlimited capacity', () => {
  const conditions = plain(parse('scope=all&available=true').conditions);
  assert.deepEqual(conditions[0], {date: {$gt: now.toISOString()}});
  assert.deepEqual(conditions[1], {$or: [{registrationDeadline: null}, {registrationDeadline: {$gt: now.toISOString()}}]});
  assert.deepEqual(conditions[2], {$expr: {$or: [
    {$eq: [{$ifNull: ['$capacity', null]}, null]},
    {$lt: [{$size: {$ifNull: ['$enrolledUsers', []]}}, '$capacity']},
  ]}});
});

test('invalid filters are rejected rather than silently widening results', () => {
  for (const query of ['page=0', 'page=-1', 'page=1.5', 'page=10001', 'page=nope', 'scope=invalid', 'sort=invalid', 'category=invalid', 'available=yes', 'from=nope', 'to=nope', 'from=2027-02-03&to=2027-02-01', 'from=2027-02-01&to=2027-02-01', `q=${'a'.repeat(201)}`, `location=${'b'.repeat(201)}`]) {
    assert.throws(() => parse(query), undefined, query);
  }
});
