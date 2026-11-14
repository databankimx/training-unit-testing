// core/library.js
//
// Where the library's source files are, for the read-only library view and the library edit. A step's lesson.json lists the
// names it uses, such as "library": ["invoice"]. Each language has its own folder and extension. C# names its files after
// what they hold, so a lesson name can map to another file: "invoice" is Invoices.cs in C#.
// Pure functions only. main.js reads the files.

'use strict';

const path = require('node:path');

const LIBRARY_FOLDERS = {
  csharp: { folder: ['samples', 'csharp', 'Invoicing'], extension: 'cs', fileNames: { invoice: 'Invoices' } },
  python: { folder: ['samples', 'python', 'invoicing'], extension: 'py' },
  javascript: { folder: ['samples', 'javascript', 'invoicing'], extension: 'js' },
};

// A file name in the lesson must be a plain word, so a lesson can't point outside the library folder.
const SAFE_NAME = /^[a-z][a-z0-9_]*$/;

// The file name, with its extension, for one library name in a language. Null when the language has no library folder or the
// name is missing or unsafe.
function libraryFileName(language, name) {
  const location = LIBRARY_FOLDERS[language];
  if (!location || typeof name !== 'string' || !SAFE_NAME.test(name)) return null;
  const base = (location.fileNames && location.fileNames[name]) || name;
  return `${base}.${location.extension}`;
}

// The path of one library file for a language, or null when there is no such file.
function libraryFilePath(courseRoot, language, name) {
  const file = libraryFileName(language, name);
  if (!file) return null;
  return path.join(courseRoot, ...LIBRARY_FOLDERS[language].folder, file);
}

// The extension a language's library files use, for the file menu's labels.
function libraryExtension(language) {
  return LIBRARY_FOLDERS[language] ? LIBRARY_FOLDERS[language].extension : null;
}

// The comment marker for each language.
const COMMENT_START = { csharp: '//', python: '#', javascript: '//' };

// Adds a comment to the first line that contains the text, for the learner's copy of a library file. The text is returned
// unchanged when no line has it, or when the language has no comment marker.
function markLine(text, language, find, comment) {
  const marker = COMMENT_START[language];
  if (!marker || !find || !comment) return text;
  const lines = String(text).split('\n');
  const index = lines.findIndex((line) => line.includes(find));
  if (index < 0) return text;
  // A Windows line ending stays on the end of the line.
  const ending = lines[index].endsWith('\r') ? '\r' : '';
  const line = ending ? lines[index].slice(0, -1) : lines[index];
  lines[index] = `${line}  ${marker} ${comment}${ending}`;
  return lines.join('\n');
}

module.exports = { libraryExtension, libraryFileName, libraryFilePath, markLine };
