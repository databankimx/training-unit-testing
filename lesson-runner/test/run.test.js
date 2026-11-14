// test/run.test.js
//
// Checks the command for each language, the environment and run folder each run gets, the C# project file and the
// JavaScript copy of the library, and the toolchain check with a stand-in for the real commands.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  CSHARP_RUN_ARGS,
  FILE_NAMES,
  commandFor,
  csharpProjectText,
  environmentFor,
  isInstalled,
  libraryProjectFor,
  prepareRunFolder,
  prerequisiteProblem,
  runEnvironment,
  runFolderFor,
} = require('../core/run');
const { probe, probeAll, COMMANDS } = require('../core/toolchains');

function tempFolder(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// A course folder laid out the way the tutorial's files are: the library under samples/, the packages at the root.
function courseFolder() {
  const root = tempFolder('course-');
  const csharp = path.join(root, 'samples', 'csharp', 'Invoicing');
  fs.mkdirSync(csharp, { recursive: true });
  fs.writeFileSync(path.join(csharp, 'Invoicing.csproj'), '<Project />');
  const python = path.join(root, 'samples', 'python', 'invoicing');
  fs.mkdirSync(python, { recursive: true });
  fs.writeFileSync(path.join(python, '__init__.py'), '');
  const javascript = path.join(root, 'samples', 'javascript', 'invoicing');
  fs.mkdirSync(javascript, { recursive: true });
  fs.writeFileSync(path.join(javascript, 'index.js'), 'export {};\n');
  return root;
}

test('each course language maps to its source file name', () => {
  assert.deepEqual(FILE_NAMES, { csharp: 'main.cs', python: 'main.py', javascript: 'main.js' });
});

test('each language runs with its own command', () => {
  const environment = { python: 'C:\\course\\.venv\\Scripts\\python.exe' };
  assert.deepEqual(commandFor('csharp', 'main.cs', environment), { command: 'dotnet', args: [...CSHARP_RUN_ARGS] });
  assert.deepEqual(commandFor('python', 'main.py', environment), { command: environment.python, args: ['main.py'] });
  assert.deepEqual(commandFor('javascript', 'main.js', environment), { command: 'node', args: ['main.js'] });
});

test('C# runs through a project file in the run folder', () => {
  assert.deepEqual(CSHARP_RUN_ARGS, ['run', '--project', 'run.csproj', '--verbosity', 'quiet']);
});

test('an unknown language is refused', () => {
  assert.throws(() => commandFor('typescript', 'main.ts', {}), /no way to run typescript/);
});

test('the Python environment is the tutorial .venv', () => {
  assert.equal(environmentFor('C:\\course').python, path.join('C:\\course', '.venv', 'Scripts', 'python.exe'));
});

test('every run gets TRAINING_DATA and PYTHONPATH to the library, and keeps the learner environment', () => {
  const course = courseFolder();
  const before = process.env.PYTHONPATH;
  try {
    delete process.env.PYTHONPATH;
    const environment = runEnvironment(course);
    assert.deepEqual(environment, {
      ...process.env,
      TRAINING_DATA: path.join(course, 'samples', 'data'),
      PYTHONPATH: path.join(course, 'samples', 'python'),
    });
    assert.equal('CHAIN_DATA' in environment, false);
  } finally {
    if (before === undefined) delete process.env.PYTHONPATH;
    else process.env.PYTHONPATH = before;
    fs.rmSync(course, { recursive: true, force: true });
  }
});

test('a learner PYTHONPATH is kept after the library path', () => {
  const course = courseFolder();
  const before = process.env.PYTHONPATH;
  try {
    process.env.PYTHONPATH = 'extra-lib';
    const parts = runEnvironment(course).PYTHONPATH.split(path.delimiter);
    assert.deepEqual(parts, [path.join(course, 'samples', 'python'), 'extra-lib']);
  } finally {
    if (before === undefined) delete process.env.PYTHONPATH;
    else process.env.PYTHONPATH = before;
    fs.rmSync(course, { recursive: true, force: true });
  }
});

test('JavaScript runs happen inside the sample package, so its module type applies', () => {
  const course = '/course';
  assert.equal(
    runFolderFor('javascript', 'ch00-introduction_02-the-invoicing-library', course, '/user'),
    path.join(course, 'samples', 'javascript', '.runs', 'ch00-introduction_02-the-invoicing-library'),
  );
});

test('C# and Python runs happen in the user data folder', () => {
  assert.equal(runFolderFor('csharp', 'ch00-a_b', '/course', '/user'), path.join('/user', 'runs', 'ch00-a_b'));
  assert.equal(runFolderFor('python', 'ch00-a_b', '/course', '/user'), path.join('/user', 'runs', 'ch00-a_b'));
});

test('the C# project file references the library by its full path, escaping XML characters', () => {
  const text = csharpProjectText('C:\\Work & Play\\samples\\csharp\\Invoicing\\Invoicing.csproj');
  assert.match(text, /<TargetFramework>net10.0<\/TargetFramework>/);
  assert.match(text, /<ProjectReference Include="C:\\Work &amp; Play\\samples\\csharp\\Invoicing\\Invoicing.csproj" \/>/);
});

test('preparing a C# run writes the project file that points at the library', () => {
  const course = courseFolder();
  const run = tempFolder('run-');
  try {
    prepareRunFolder('csharp', run, course);
    const project = fs.readFileSync(path.join(run, 'run.csproj'), 'utf8');
    assert.ok(project.includes(libraryProjectFor(course)));
    assert.equal(fs.existsSync(path.join(run, 'invoicing')), false);
  } finally {
    fs.rmSync(course, { recursive: true, force: true });
    fs.rmSync(run, { recursive: true, force: true });
  }
});

test('preparing a JavaScript run copies the library beside the learner code', () => {
  const course = courseFolder();
  const run = tempFolder('run-');
  try {
    prepareRunFolder('javascript', run, course);
    assert.equal(fs.readFileSync(path.join(run, 'invoicing', 'index.js'), 'utf8'), 'export {};\n');
  } finally {
    fs.rmSync(course, { recursive: true, force: true });
    fs.rmSync(run, { recursive: true, force: true });
  }
});

test('preparing a Python run writes nothing, because PYTHONPATH already reaches the library', () => {
  const course = courseFolder();
  const run = tempFolder('run-');
  try {
    prepareRunFolder('python', run, course);
    assert.deepEqual(fs.readdirSync(run), []);
  } finally {
    fs.rmSync(course, { recursive: true, force: true });
    fs.rmSync(run, { recursive: true, force: true });
  }
});

test('a language whose command runs is available, with its first line of version output', async () => {
  const fakeRun = (command, args, options, callback) => callback(null, '10.0.100\nmore text\n', '');
  const result = await probe('csharp', fakeRun);
  assert.deepEqual(result, { available: true, version: '10.0.100' });
});

test('a language whose command is missing is unavailable', async () => {
  const fakeRun = (command, args, options, callback) => callback(new Error('not found'), '', '');
  const result = await probe('python', fakeRun);
  assert.deepEqual(result, { available: false, version: null });
});

test('probeAll checks every course language', async () => {
  const fakeRun = (command, args, options, callback) =>
    command === 'node' ? callback(new Error('missing'), '', '') : callback(null, 'v1\n', '');
  const result = await probeAll(fakeRun);
  assert.deepEqual(Object.keys(result).sort(), Object.keys(COMMANDS).sort());
  assert.equal(result.javascript.available, false);
  assert.equal(result.csharp.available, true);
  assert.equal(result.python.available, true);
});

test('a missing Python environment is reported with the setup step', () => {
  const course = courseFolder();
  try {
    assert.match(prerequisiteProblem('python', course), /setup\.ps1/);
  } finally {
    fs.rmSync(course, { recursive: true, force: true });
  }
});

// A course folder with a sample manifest under samples/javascript and packages installed at the root.
function courseWith(dependencies, installed) {
  const root = courseFolder();
  fs.writeFileSync(path.join(root, 'samples', 'javascript', 'package.json'), JSON.stringify({ dependencies }));
  for (const name of installed) {
    const folder = path.join(root, 'node_modules', name);
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'package.json'), '{}');
  }
  return root;
}

test('a sample package installed at the repository root is found', () => {
  const root = courseWith({ 'csv-parse': '7.0.2' }, ['csv-parse']);
  try {
    assert.equal(isInstalled('csv-parse', path.join(root, 'samples', 'javascript')), true);
    assert.equal(prerequisiteProblem('javascript', root), null);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a declared sample package that is not installed is reported by name', () => {
  const root = courseWith({ 'csv-parse': '7.0.2', 'js-yaml': '5.4.1' }, ['csv-parse']);
  try {
    const problem = prerequisiteProblem('javascript', root);
    assert.match(problem, /js-yaml/);
    assert.doesNotMatch(problem, /csv-parse/);
    assert.match(problem, /npm install in the training-unit-testing folder/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a package folder without a package.json does not count as installed', () => {
  const root = courseWith({ 'csv-parse': '7.0.2' }, []);
  try {
    fs.mkdirSync(path.join(root, 'node_modules', 'csv-parse'), { recursive: true });
    assert.equal(isInstalled('csv-parse', path.join(root, 'samples', 'javascript')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
