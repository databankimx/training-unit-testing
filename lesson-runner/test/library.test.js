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

test('a comment goes on the first line that has the text, in the language comment style', () => {
  const { markLine } = require('../core/library');
  assert.equal(markLine('a\n  x + 5000\nb', 'python', '+ 5000', 'TODO'), 'a\n  x + 5000  # TODO\nb');
  assert.equal(markLine('x + 5000;', 'javascript', '+ 5000', 'TODO'), 'x + 5000;  // TODO');
  assert.equal(markLine('x + 5000\r\nb', 'csharp', '+ 5000', 'TODO'), 'x + 5000  // TODO\r\nb');
});

test('a line that is not there leaves the text alone', () => {
  const { markLine } = require('../core/library');
  assert.equal(markLine('nothing here', 'python', '+ 5000', 'TODO'), 'nothing here');
});
