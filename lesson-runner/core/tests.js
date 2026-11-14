// core/tests.js
//
// Test steps: the command that runs a language's tests, and the reading of each framework's report into one shape.
// Pure functions only. main.js does the running and the reading of report files.
//
// Each test step has a test file in its step folder, named test.py or test.js. The runner copies it into the run folder,
// next to the learner's main file. The report formats:
//   Python:      pytest writes JUnit XML to a file (--junitxml), which is read after the run.
//   JavaScript:  node:test prints TAP to stdout, which is read from the run's output.
// Every reader returns the same shape: { name, passed, skipped, message, expected, actual }.

'use strict';

const PYTEST_REPORT_FILE = 'report.xml';
const TAP_REPORT_FILE = 'report.tap';
const TRX_REPORT_FILE = 'report.trx';

const TEST_FILE_NAMES = {
  csharp: 'test.cs',
  python: 'test.py',
  javascript: 'test.js',
};

// The command that runs one language's tests in the run folder. The file is named explicitly, so pytest does not need the
// file to match its own naming pattern.
function testCommandFor(language, environment) {
  switch (language) {
    case 'python':
      return {
        command: environment.python,
        args: ['-m', 'pytest', '-v', `--junitxml=${PYTEST_REPORT_FILE}`, TEST_FILE_NAMES.python],
        reportFile: PYTEST_REPORT_FILE,
      };
    case 'javascript':
      return {
        command: 'node',
        // Two reporters: TAP on the console, which the runner reads for the results, and the same TAP in a file for the report button.
        args: [
          '--test',
          '--test-reporter=tap', '--test-reporter-destination=stdout',
          '--test-reporter=tap', `--test-reporter-destination=${TAP_REPORT_FILE}`,
          TEST_FILE_NAMES.javascript,
        ],
        reportFile: TAP_REPORT_FILE,
      };
    case 'csharp':
      return {
        command: 'dotnet',
        // The run folder holds one project, so dotnet test finds it. The TRX report is written into the run folder.
        args: ['test', '--results-directory', '.', '--logger', `trx;LogFileName=${TRX_REPORT_FILE}`, '--verbosity', 'quiet'],
        reportFile: TRX_REPORT_FILE,
      };
    default:
      throw new Error(`The runner has no test command for ${language}.`);
  }
}

// Reverses the entities that XML uses in attribute values. &amp; is last, so an encoded ampersand is not decoded twice.
function decodeXml(text) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function xmlAttribute(attributes, name) {
  const match = new RegExp(`\\b${name}="([^"]*)"`).exec(attributes);
  return match ? decodeXml(match[1]) : null;
}

// Reads a JUnit XML report, as pytest writes it. A testcase with a failure or error child did not pass.
function parseJUnit(xml) {
  const tests = [];
  const testcase = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g;
  let match;
  while ((match = testcase.exec(xml)) !== null) {
    const attributes = match[1];
    const body = match[2] ?? '';
    const failure = /<(failure|error)\b([^>]*)>/.exec(body);
    const message = failure ? xmlAttribute(failure[2], 'message') : null;
    tests.push({
      name: xmlAttribute(attributes, 'name') ?? '(unnamed test)',
      passed: !failure,
      skipped: /<skipped\b/.test(body),
      message: message ? message.split('\n')[0].trim() : null,
      expected: null,
      actual: null,
    });
  }
  return tests;
}

// Reads TAP output, as node:test prints it with --test-reporter=tap. Only top-level tests are read. A test's YAML-style
// block follows its line, indented by two spaces, and holds the error text and, for an assertion, the expected and
// actual values.
function parseTap(text) {
  const tests = [];
  let current = null;
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    const start = /^(not ok|ok) \d+ - (.*?)(?: # (SKIP|TODO).*)?$/.exec(line);
    if (start) {
      current = {
        name: start[2],
        passed: start[1] === 'ok',
        skipped: start[3] === 'SKIP',
        message: null,
        expected: null,
        actual: null,
        errorLines: null,
      };
      tests.push(current);
      continue;
    }
    if (!current) continue;
    if (/^1\.\.\d+/.test(line) || /^# /.test(line)) {
      current = null;
      continue;
    }
    if (/^  error: \|-/.test(line)) {
      current.errorLines = [];
      continue;
    }
    if (current.errorLines && /^ {4}\S/.test(line)) {
      current.errorLines.push(line.trim());
      continue;
    }
    if (current.errorLines && /^ {4}$|^$/.test(line)) continue;
    const error = /^  error: (.+)$/.exec(line);
    if (error) current.message = error[1].trim();
    const expected = /^  expected: (.*)$/.exec(line);
    if (expected) current.expected = expected[1].trim();
    const actual = /^  actual: (.*)$/.exec(line);
    if (actual) current.actual = actual[1].trim();
  }
  for (const test of tests) {
    if (test.errorLines && test.errorLines.length > 0) {
      test.message = test.errorLines.find((text) => text.length > 0) ?? test.message;
    }
    delete test.errorLines;
  }
  return tests;
}

// Reads one language's test results. For pytest, the report text comes from the JUnit file. For node:test, the report is
// the standard output.
// Reads a TRX report, as `dotnet test` writes it with the trx logger. A result with the outcome Passed passed. NotExecuted is a
// skipped test. Anything else did not pass. The message is the first line of the error, and the expected and actual values come
// from NUnit's wording: "Expected: 207" and "But was:  206".
function parseTrx(xml) {
  const tests = [];
  const result = /<UnitTestResult\b([^>]*?)(?:\/>|>([\s\S]*?)<\/UnitTestResult>)/g;
  let match;
  while ((match = result.exec(xml)) !== null) {
    const attributes = match[1];
    const body = match[2] ?? '';
    const outcome = xmlAttribute(attributes, 'outcome') ?? '';
    const errorMessage = /<Message>([\s\S]*?)<\/Message>/.exec(body);
    const text = errorMessage ? decodeXml(errorMessage[1]) : '';
    const expected = /Expected:\s*(.*)/.exec(text);
    const actual = /But was:\s*(.*)/.exec(text);
    tests.push({
      name: xmlAttribute(attributes, 'testName') ?? '(unnamed test)',
      passed: outcome === 'Passed',
      skipped: outcome === 'NotExecuted',
      message: text ? text.split('\n')[0].trim() : null,
      expected: expected ? expected[1].trim() : null,
      actual: actual ? actual[1].trim() : null,
    });
  }
  return tests;
}

function parseTestResults(language, { reportText = '', stdout = '' }) {
  if (language === 'csharp') return parseTrx(reportText);
  if (language === 'python') return parseJUnit(reportText);
  if (language === 'javascript') return parseTap(stdout);
  throw new Error(`The runner has no test report for ${language}.`);
}

// Counts the results: how many passed, failed, and were skipped.
function summarizeTests(tests) {
  const skipped = tests.filter((test) => test.skipped).length;
  const passed = tests.filter((test) => test.passed && !test.skipped).length;
  return { total: tests.length, passed, failed: tests.length - passed - skipped, skipped };
}

// Re-indents a JUnit XML report so each element starts its own line. Only the whitespace between elements changes. The
// text inside an element is kept exactly as written, so a multi-line failure message keeps its lines.
function prettifyXml(xml) {
  const tokens = String(xml).match(/<[^>]*>|[^<]+/g) ?? [];
  let out = '';
  let depth = 0;
  let afterText = false;
  for (const token of tokens) {
    if (token.startsWith('<')) {
      const isClose = token.startsWith('</');
      const isStandalone = token.startsWith('<?') || token.startsWith('<!') || /\/>$/.test(token);
      if (isClose) depth = Math.max(0, depth - 1);
      out += afterText ? token : (out ? '\n' : '') + '  '.repeat(depth) + token;
      afterText = false;
      if (!isClose && !isStandalone) depth++;
    } else if (token.trim() !== '') {
      out += token;
      afterText = true;
    }
  }
  return out + '\n';
}

module.exports = {
  PYTEST_REPORT_FILE,
  TAP_REPORT_FILE,
  prettifyXml,
  TEST_FILE_NAMES,
  decodeXml,
  parseJUnit,
  parseTap,
  parseTestResults,
  parseTrx,
  TRX_REPORT_FILE,
  summarizeTests,
  testCommandFor,
};
