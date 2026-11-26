import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findActiveHeading, collectHeadingEntries} from '../src/lib/scroll-spy.mjs';

// --- findActiveHeading ---

test('findActiveHeading returns null for empty input', () => {
  assert.equal(findActiveHeading([], 0), null);
  assert.equal(findActiveHeading(null, 0), null);
});

test('findActiveHeading returns first heading at scroll top', () => {
  const headings = [
    {id: 'a', top: 0},
    {id: 'b', top: 200},
    {id: 'c', top: 400},
  ];
  assert.equal(findActiveHeading(headings, 0, 100), 'a');
});

test('findActiveHeading returns the last heading whose top is within threshold', () => {
  const headings = [
    {id: 'a', top: 0},
    {id: 'b', top: 200},
    {id: 'c', top: 400},
  ];
  // scrollTop = 350: a(0) <= 450, b(200) <= 450, c(400) <= 450 → c
  assert.equal(findActiveHeading(headings, 350, 100), 'c');
});

test('findActiveHeading stops at first heading past threshold', () => {
  const headings = [
    {id: 'a', top: 0},
    {id: 'b', top: 200},
    {id: 'c', top: 500},
  ];
  // scrollTop = 100: a(0) <= 200, b(200) <= 200, c(500) > 200 → b
  assert.equal(findActiveHeading(headings, 100, 100), 'b');
});

test('findActiveHeading defaults to first when at top and none qualify', () => {
  const headings = [
    {id: 'a', top: 1000},
    {id: 'b', top: 2000},
  ];
  // scrollTop = 0, threshold = 100: a(1000) > 100, none qualify → fallback to first
  assert.equal(findActiveHeading(headings, 0, 100), 'a');
});

test('findActiveHeading with single heading', () => {
  assert.equal(findActiveHeading([{id: 'only', top: 0}], 0, 100), 'only');
  assert.equal(findActiveHeading([{id: 'only', top: 1000}], 0, 100), 'only');
});

// --- collectHeadingEntries ---

test('collectHeadingEntries maps elements to {id, top}', () => {
  const els = [
    {id: 'a', getBoundingClientRect: () => ({top: 50})},
    {id: 'b', getBoundingClientRect: () => ({top: 250})},
  ];
  const entries = collectHeadingEntries(els, 100);
  assert.deepEqual(entries, [
    {id: 'a', top: 150},
    {id: 'b', top: 350},
  ]);
});

test('collectHeadingEntries filters elements without id', () => {
  const els = [
    {id: 'a', getBoundingClientRect: () => ({top: 50})},
    {getBoundingClientRect: () => ({top: 250})}, // no id
    null,
  ];
  const entries = collectHeadingEntries(els, 0);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].id, 'a');
});

test('collectHeadingEntries adds scrollY to boundingClientRect top', () => {
  const els = [
    {id: 'a', getBoundingClientRect: () => ({top: 10})},
  ];
  const entries = collectHeadingEntries(els, 800);
  assert.equal(entries[0].top, 810);
});
