// test/tests.test.js
//
// Checks the test command for each language, and the reading of each report, with output captured from real runs.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  decodeXml,
  parseJUnit,
  parseTap,
  parseTestResults,
  summarizeTests,
  testCommandFor,
} = require('../core/tests');

const JUNIT_PASS =
  '<?xml version="1.0" encoding="utf-8"?><testsuites name="pytest tests"><testsuite name="pytest" errors="0" failures="0" skipped="0" tests="1" time="0.015"><testcase classname="tests.test_tax" name="test_tax_rounds_half_up_to_207_cents_on_2505_cents" time="0.000" /></testsuite></testsuites>';

const JUNIT_FAIL =
  '<?xml version="1.0" encoding="utf-8"?><testsuites name="pytest tests"><testsuite name="pytest" errors="0" failures="1" tests="1"><testcase classname="tests.test_tax" name="test_tax_rounds_half_up_to_207_cents_on_2505_cents" time="0.001"><failure message="AssertionError: assert 206 == 207&#10; +  where 206 = tax_cents(Invoice(id=&apos;INV-1002&apos;))">def test_tax():\n    assert tax_cents(invoice) == 207\nE       AssertionError: assert 206 == 207</failure></testcase></testsuite></testsuites>';

const TAP_PASS = [
  'TAP version 13',
  '# Subtest: tax rounds half up to 207 cents on 2505 cents',
  'ok 1 - tax rounds half up to 207 cents on 2505 cents',
  '  ---',
  '  duration_ms: 0.61959',
  "  type: 'test'",
  '  ...',
  '1..1',
  '# tests 1',
  '# suites 0',
  '# pass 1',
  '# fail 0',
  '',
].join('\n');

const TAP_FAIL = [
  'TAP version 13',
  '# Subtest: tax rounds half up to 207 cents on 2505 cents',
  'not ok 1 - tax rounds half up to 207 cents on 2505 cents',
  '  ---',
  '  duration_ms: 1.100551',
  "  type: 'test'",
  '  error: |-',
  '    Expected values to be strictly equal:',
  '    ',
  '    206 !== 207',
  '    ',
  "  code: 'ERR_ASSERTION'",
  "  name: 'AssertionError'",
  '  expected: 207',
  '  actual: 206',
  "  operator: 'strictEqual'",
  '  stack: |-',
  '    TestContext.<anonymous> (file:///tmp/tax.test.js:16:10)',
  '  ...',
  '1..1',
  '# tests 1',
  '# pass 0',
  '# fail 1',
  '',
].join('\n');

test('pytest runs in the run folder, writes a JUnit report, and names the test file', () => {
  const command = testCommandFor('python', { python: 'C:\\course\\.venv\\Scripts\\python.exe' });
  assert.equal(command.command, 'C:\\course\\.venv\\Scripts\\python.exe');
  assert.deepEqual(command.args, ['-m', 'pytest', '-v', '--junitxml=report.xml', 'test.py']);
  assert.equal(command.reportFile, 'report.xml');
});

test('node:test prints TAP and names the test file', () => {
  const command = testCommandFor('javascript', {});
  assert.equal(command.command, 'node');
  assert.deepEqual(command.args, [
    '--test',
    '--test-reporter=tap', '--test-reporter-destination=stdout',
    '--test-reporter=tap', '--test-reporter-destination=report.tap',
    'test.js',
  ]);
  assert.equal(command.reportFile, 'report.tap');
});

test('a language with no test command is refused', () => {
  assert.throws(() => testCommandFor('ruby', {}), /no test command for ruby/);
});

test('XML entities in attribute values are decoded, the ampersand last', () => {
  assert.equal(decodeXml('a &amp;lt; b &#10; &quot;c&quot; &apos;d&apos; &gt;'), 'a &lt; b \n "c" \'d\' >');
});

test('a passing JUnit testcase is a pass, even when it is written as a self-closing element', () => {
  assert.deepEqual(parseJUnit(JUNIT_PASS), [
    {
      name: 'test_tax_rounds_half_up_to_207_cents_on_2505_cents',
      passed: true,
      skipped: false,
      message: null,
      expected: null,
      actual: null,
    },
  ]);
});

test('a failing JUnit testcase carries the first line of its message', () => {
  const [result] = parseJUnit(JUNIT_FAIL);
  assert.equal(result.passed, false);
  assert.equal(result.message, "AssertionError: assert 206 == 207");
});

test('a passing TAP test is ok, with its name', () => {
  assert.deepEqual(parseTap(TAP_PASS), [
    {
      name: 'tax rounds half up to 207 cents on 2505 cents',
      passed: true,
      skipped: false,
      message: null,
      expected: null,
      actual: null,
    },
  ]);
});

test('a failing TAP test carries its message, expected, and actual', () => {
  const [result] = parseTap(TAP_FAIL);
  assert.equal(result.passed, false);
  assert.equal(result.message, 'Expected values to be strictly equal:');
  assert.equal(result.expected, '207');
  assert.equal(result.actual, '206');
});

test('a skipped TAP test is neither a pass nor a failure', () => {
  const [result] = parseTap('ok 1 - later # SKIP not ready\n1..1\n');
  assert.equal(result.skipped, true);
  assert.equal(result.name, 'later');
});

test('a run with no tests reads as no results, not a pass', () => {
  assert.deepEqual(parseTap('TAP version 13\n1..0\n# tests 0\n'), []);
  assert.deepEqual(parseJUnit('<testsuites></testsuites>'), []);
});

test('each language reads its own report: JUnit text for Python, standard output for JavaScript', () => {
  assert.equal(parseTestResults('python', { reportText: JUNIT_PASS })[0].passed, true);
  assert.equal(parseTestResults('javascript', { stdout: TAP_FAIL })[0].passed, false);
});

test('the summary counts passed, failed, and skipped results', () => {
  const tests = [
    { name: 'a', passed: true, skipped: false },
    { name: 'b', passed: false, skipped: false },
    { name: 'c', passed: true, skipped: true },
  ];
  assert.deepEqual(summarizeTests(tests), { total: 3, passed: 1, failed: 1, skipped: 1 });
});
