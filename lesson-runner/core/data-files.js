// core/data-files.js
//
// The sample data files a lesson works with. Pure functions apart from reading the data folder's names, so they can
// be tested without Electron. main.js uses them to decide which buttons a lesson shows.

'use strict';

const fs = require('node:fs');

// The files in the sample data folder that are data. Python sources, the package manifest, and the requirements files
// are not data, so a learner is never offered them.
function isSampleFile(name) {
  if (name.endsWith('.py')) return false;
  if (name === 'package.json') return false;
  if (/^requirements.*\.txt$/.test(name)) return false;
  return true;
}

// The sample data file names in a folder, sorted. An empty list when the folder doesn't exist.
function sampleFileNames(dataDir) {
  if (!fs.existsSync(dataDir)) return [];
  return fs
    .readdirSync(dataDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isSampleFile(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// The names from the list that appear in any of the texts as a whole file name, in list order and reported once.
// A name must not be part of a longer one: customers.csv is not found inside customers-windows-1252.csv, and
// customers.fixed is not found inside customers.fixed.layout.txt. A full stop after a name, as at the end of a
// sentence, is allowed.
function dataFilesMentioned(texts, names) {
  const combined = texts.join('\n');
  return names.filter((name) => {
    const pattern = new RegExp(`(?<![A-Za-z0-9_-])${escapeRegExp(name)}(?!\\.?[A-Za-z0-9_-])`);
    return pattern.test(combined);
  });
}

module.exports = { isSampleFile, sampleFileNames, dataFilesMentioned };
