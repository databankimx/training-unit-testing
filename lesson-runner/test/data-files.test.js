// test/data-files.test.js

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { isSampleFile, dataFilesMentioned } = require('../core/data-files');

test('Python sources, the package manifest, and requirements files are not sample data', () => {
  assert.equal(isSampleFile('generate.py'), false);
  assert.equal(isSampleFile('package.json'), false);
  assert.equal(isSampleFile('requirements-generator.txt'), false);
  assert.equal(isSampleFile('customers.csv'), true);
  assert.equal(isSampleFile('customers.fixed.layout.txt'), true);
});

test('a file name is found in the text, including at the end of a sentence', () => {
  const names = ['customers.csv', 'customers-utf8-bom.csv'];
  assert.deepEqual(dataFilesMentioned(['Open `customers.csv`.'], names), ['customers.csv']);
  assert.deepEqual(dataFilesMentioned(['The file customers.csv.'], names), ['customers.csv']);
});

test('a shorter name is not found inside a longer one', () => {
  const names = ['customers.csv', 'customers-utf8-bom.csv', 'customers.json', 'customers.jsonl'];
  assert.deepEqual(dataFilesMentioned(['read customers-utf8-bom.csv'], names), ['customers-utf8-bom.csv']);
  assert.deepEqual(dataFilesMentioned(['read customers.jsonl'], names), ['customers.jsonl']);
  assert.deepEqual(dataFilesMentioned(['customers.fixed.layout.txt'], ['customers.fixed', 'customers.fixed.layout.txt']), [
    'customers.fixed.layout.txt',
  ]);
});

test('names mentioned in several texts are reported once, in list order', () => {
  const names = ['customers.csv', 'orders.csv'];
  assert.deepEqual(dataFilesMentioned(['orders.csv', 'customers.csv and orders.csv'], names), [
    'customers.csv',
    'orders.csv',
  ]);
});
