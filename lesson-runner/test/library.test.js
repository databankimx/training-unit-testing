// test/library.test.js
//
// Checks where each language's library files are, and that a lesson can't point outside the library folder.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { libraryExtension, libraryFilePath } = require('../core/library');

test('each language finds its library file in its own folder', () => {
  assert.equal(libraryFilePath('/course', 'python', 'invoice'), path.join('/course', 'samples', 'python', 'invoicing', 'invoice.py'));
  assert.equal(libraryFilePath('/course', 'javascript', 'invoice'), path.join('/course', 'samples', 'javascript', 'invoicing', 'invoice.js'));
});

test('a language with no library folder has no library path yet', () => {
  assert.match(libraryFilePath('/course', 'csharp', 'invoice'), /Invoices\.cs$/);
  assert.equal(libraryExtension('csharp'), 'cs');
  assert.equal(libraryExtension('python'), 'py');
});

test('a lesson name that leaves the library folder is refused', () => {
  assert.equal(libraryFilePath('/course', 'python', '../../secrets'), null);
  assert.equal(libraryFilePath('/course', 'python', 'Invoice'), null);
  assert.equal(libraryFilePath('/course', 'python', 'a/b'), null);
});
