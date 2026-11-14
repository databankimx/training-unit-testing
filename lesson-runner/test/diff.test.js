// test/diff.test.js
//
// The changes a solution makes to its starter, line by line.

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { changedLines } = require('../core/diff');

test('a changed line is listed with its number and both versions', () => {
  const starter = 'expected = 207\nprint(expected)';
  const solution = 'expected = 206\nprint(expected)';
  assert.deepEqual(changedLines(starter, solution), [{ line: 1, before: 'expected = 207', after: 'expected = 206' }]);
});

test('identical text has no changes, and line endings do not count', () => {
  assert.deepEqual(changedLines('a\r\nb', 'a\nb'), []);
});

test('a line added by the solution is listed with an empty before', () => {
  assert.deepEqual(changedLines('a', 'a\nb'), [{ line: 2, before: '', after: 'b' }]);
});
