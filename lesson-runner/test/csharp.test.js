// test/csharp.test.js
//
// C# test steps: the test project, the TRX report, the syntax check that builds, and the library copy for a library edit.

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { parseTestResults, parseTrx, TEST_FILE_NAMES, testCommandFor } = require('../core/tests');
const fs = require('node:fs');
const os = require('node:os');
const { codeTargetPath, csharpProjectText, prepareRunFolder } = require('../core/run');
const { libraryFileName } = require('../core/library');
const { syntaxCommand } = require('../core/check');

const TRX = '<?xml version="1.0" encoding="utf-8"?><TestRun><Results>'
  + '<UnitTestResult testName="Invoicing.Tests.TaxRounding.Tax_rounds_half_up" outcome="Passed"/>'
  + '<UnitTestResult testName="Invoicing.Tests.TaxRounding.Tax_fails" outcome="Failed"><Output><ErrorInfo>'
  + '<Message>  Expected: 207\n  But was:  206</Message></ErrorInfo></Output></UnitTestResult>'
  + '<UnitTestResult testName="Invoicing.Tests.Later" outcome="NotExecuted"/>'
  + '</Results></TestRun>';

test('a C# test step runs dotnet test and writes a TRX report into the run folder', () => {
  const command = testCommandFor('csharp', {});
  assert.equal(command.command, 'dotnet');
  assert.deepEqual(command.args, ['test', '--results-directory', '.', '--logger', 'trx;LogFileName=report.trx', '--verbosity', 'quiet']);
  assert.equal(command.reportFile, 'report.trx');
});

test('the C# test file is test.cs', () => {
  assert.equal(TEST_FILE_NAMES.csharp, 'test.cs');
});

test('a C# test step is built to check it, and a program is still run for other steps', () => {
  assert.deepEqual(syntaxCommand('csharp', 'test.cs', true), { command: 'dotnet', args: ['build', '--verbosity', 'quiet', '--nologo'] });
  assert.deepEqual(syntaxCommand('csharp', 'main.cs', false), { command: 'dotnet', args: ['run', '--project', 'run.csproj', '--verbosity', 'quiet'] });
});

test('a TRX report gives passed, failed, and not-run tests, with NUnit\'s expected and actual values', () => {
  const tests = parseTrx(TRX);
  assert.equal(tests.length, 3);
  assert.equal(tests[0].passed, true);
  assert.equal(tests[1].passed, false);
  assert.equal(tests[1].expected, '207');
  assert.equal(tests[1].actual, '206');
  assert.equal(tests[1].message, 'Expected: 207');
  assert.equal(tests[2].skipped, true);
});

test('C# results come from the TRX report', () => {
  assert.deepEqual(parseTestResults('csharp', { reportText: TRX }), parseTrx(TRX));
});

test('a C# library edit writes into the run folder\'s copy of Invoices.cs', () => {
  assert.equal(codeTargetPath('run', 'csharp', 'library', 'invoice'), path.join('run', 'invoicing', 'Invoices.cs'));
  assert.equal(libraryFileName('csharp', 'invoice'), 'Invoices.cs');
  assert.equal(libraryFileName('python', 'invoice'), 'invoice.py');
  assert.equal(libraryFileName('csharp', null), null);
});

test('a C# test project references NUnit and the library, and a copied library is kept out of its own build', () => {
  const text = csharpProjectText('/course/samples/csharp/Invoicing/Invoicing.csproj', { test: true });
  assert.match(text, /<IsTestProject>true<\/IsTestProject>/);
  assert.match(text, /<PackageReference Include="NUnit" Version="4\.6\.1" \/>/);
  assert.match(text, /<PackageReference Include="NUnit3TestAdapter" Version="6\.3\.1" \/>/);
  assert.match(text, /<PackageReference Include="Microsoft\.NET\.Test\.Sdk" Version="18\.12\.0" \/>/);
  assert.doesNotMatch(text, /OutputType/);
  assert.doesNotMatch(text, /Compile Remove/);

  const copied = csharpProjectText('/run/invoicing/Invoicing.csproj', { copied: true });
  assert.match(copied, /<Compile Remove="invoicing\/\*\*" \/>/);
  assert.match(copied, /<OutputType>Exe<\/OutputType>/);
  assert.doesNotMatch(copied, /PackageReference/);
});

test('a C# test step removes the main file an earlier shape left behind, so it is not compiled twice', () => {
  const course = fs.mkdtempSync(path.join(os.tmpdir(), 'csharp-course-'));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'csharp-run-'));
  try {
    fs.mkdirSync(path.join(course, 'samples', 'csharp', 'Invoicing'), { recursive: true });
    fs.writeFileSync(path.join(course, 'samples', 'csharp', 'Invoicing', 'Invoicing.csproj'), '<Project />');
    fs.writeFileSync(path.join(dir, 'main.cs'), 'stale');
    fs.writeFileSync(path.join(dir, 'test.cs'), 'learner test');

    prepareRunFolder('csharp', dir, course, 'library', true);

    assert.equal(fs.existsSync(path.join(dir, 'main.cs')), false);
    assert.equal(fs.readFileSync(path.join(dir, 'test.cs'), 'utf8'), 'learner test');
    assert.match(fs.readFileSync(path.join(dir, 'run.csproj'), 'utf8'), /IsTestProject/);
  } finally {
    fs.rmSync(course, { recursive: true, force: true });
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
