// test/edit.test.js
//
// The edit modes: which file the learner's code goes to, and which library copy a run folder gets.

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { codeTargetPath, editedFileName, prepareRunFolder } = require('../core/run');

function tempFolder(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `edit-${label}-`));
}

// A course folder with the library in both languages, as the tutorial lays it out.
function fakeCourse() {
  const root = tempFolder('course');
  const py = path.join(root, 'samples', 'python', 'invoicing');
  const js = path.join(root, 'samples', 'javascript', 'invoicing');
  fs.mkdirSync(py, { recursive: true });
  fs.mkdirSync(js, { recursive: true });
  fs.writeFileSync(path.join(py, 'invoice.py'), 'LIBRARY = "python"\n');
  fs.writeFileSync(path.join(js, 'invoice.js'), 'export const LIBRARY = "javascript";\n');
  return root;
}

test('a test step writes the test file name, and other steps write main', () => {
  assert.equal(editedFileName('python', 'test'), 'test.py');
  assert.equal(editedFileName('javascript', 'test'), 'test.js');
  assert.equal(editedFileName('python', 'main'), 'main.py');
  assert.equal(editedFileName('javascript', 'none'), 'main.js');
  assert.equal(editedFileName('csharp', 'test'), 'test.cs');
});

test('a library edit replaces the library file inside the run folder', () => {
  const dir = path.join('run-folder');
  assert.equal(codeTargetPath(dir, 'python', 'library', 'invoice'), path.join(dir, 'invoicing', 'invoice.py'));
  assert.equal(codeTargetPath(dir, 'javascript', 'library', 'invoice'), path.join(dir, 'invoicing', 'invoice.js'));
});

test('without a library edit, the code goes beside the test or main file, never into the library copy', () => {
  const dir = path.join('run-folder');
  assert.equal(codeTargetPath(dir, 'python', 'test', null), path.join(dir, 'test.py'));
  assert.equal(codeTargetPath(dir, 'python', 'main', null), path.join(dir, 'main.py'));
});

test('a Python library edit copies the package into the run folder, and a main edit copies nothing', () => {
  const course = fakeCourse();
  const libraryRun = tempFolder('run-library');
  const mainRun = tempFolder('run-main');
  try {
    prepareRunFolder('python', libraryRun, course, 'library');
    assert.equal(fs.readFileSync(path.join(libraryRun, 'invoicing', 'invoice.py'), 'utf8'), 'LIBRARY = "python"\n');

    prepareRunFolder('python', mainRun, course, 'main');
    assert.equal(fs.existsSync(path.join(mainRun, 'invoicing')), false);
  } finally {
    fs.rmSync(course, { recursive: true, force: true });
    fs.rmSync(libraryRun, { recursive: true, force: true });
    fs.rmSync(mainRun, { recursive: true, force: true });
  }
});

test('JavaScript always gets its own copy of the library, and a library edit writes into that copy only', () => {
  const course = fakeCourse();
  const dir = tempFolder('run-js');
  try {
    prepareRunFolder('javascript', dir, course, 'library');
    const copied = path.join(dir, 'invoicing', 'invoice.js');
    assert.equal(fs.readFileSync(copied, 'utf8'), 'export const LIBRARY = "javascript";\n');

    // The learner's text replaces the copy, and the library in samples/ keeps its own text.
    fs.writeFileSync(codeTargetPath(dir, 'javascript', 'library', 'invoice'), 'export const LIBRARY = "changed";\n');
    assert.equal(
      fs.readFileSync(path.join(course, 'samples', 'javascript', 'invoicing', 'invoice.js'), 'utf8'),
      'export const LIBRARY = "javascript";\n',
    );
  } finally {
    fs.rmSync(course, { recursive: true, force: true });
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
