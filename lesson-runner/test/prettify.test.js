// test/prettify.test.js
//
// Re-indenting a JUnit report: one element per line, with the text inside the elements left as written.

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { parseTestResults, prettifyXml } = require('../core/tests');

const ONE_LINE = '<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite name="pytest" tests="2" failures="1">'
  + '<testcase classname="test" name="test_a" time="0.001"/>'
  + '<testcase classname="test" name="test_b" time="0.002"><failure message="assert 206 == 207">def test_b():\n'
  + '&gt;   assert 206 == 207\nE   assert 206 == 207</failure></testcase></testsuite></testsuites>';

test('each element starts its own line, indented by its depth', () => {
  const pretty = prettifyXml(ONE_LINE);
  assert.match(pretty, /^<\?xml version="1\.0" encoding="utf-8"\?>\n<testsuites>\n {2}<testsuite /);
  assert.match(pretty, /\n {4}<testcase classname="test" name="test_a" time="0\.001"\/>\n/);
  assert.match(pretty, /\n {4}<testcase classname="test" name="test_b" time="0\.002">\n {6}<failure /);
  assert.ok(pretty.endsWith('</testsuites>\n'));
});

test('the text inside an element is kept exactly, including its lines', () => {
  const pretty = prettifyXml(ONE_LINE);
  assert.ok(pretty.includes('<failure message="assert 206 == 207">def test_b():\n&gt;   assert 206 == 207\nE   assert 206 == 207</failure>'));
});

test('a tidied report reads to the same test results as the original', () => {
  assert.deepEqual(
    parseTestResults('python', { reportText: prettifyXml(ONE_LINE) }),
    parseTestResults('python', { reportText: ONE_LINE }),
  );
});

test('tidying twice changes nothing more', () => {
  const once = prettifyXml(ONE_LINE);
  assert.equal(prettifyXml(once), once);
});
