// test/readonly.test.js
//
// Checks the examples fence flags: "readonly" renders plain code with no editor, and a readonly block never becomes the
// learner's code in the Source pane.

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { examplesInfo } = require('../core/markdown');
const { sourceFromExamples } = require('../core/sources');
const { createRenderer } = require('../core/markdown');

test('examples fences read their flags in any order, and other fences are not examples', () => {
  assert.deepEqual(examplesInfo('examples'), { source: false, readonly: false });
  assert.deepEqual(examplesInfo('examples readonly'), { source: false, readonly: true });
  assert.deepEqual(examplesInfo('examples source readonly'), { source: true, readonly: true });
  assert.deepEqual(examplesInfo('examples readonly source'), { source: true, readonly: true });
  assert.equal(examplesInfo('examples banana'), null);
  assert.equal(examplesInfo('quiz'), null);
  assert.equal(examplesInfo('shadow'), null);
});

const ALL_LANGUAGES = [
  '```csharp\nConsole.WriteLine(1);\n```',
  '```python\nprint(1)\n```',
  '```javascript\nconsole.log(1);\n```',
].join('\n');

test('a readonly block renders its tabs with no editor and no Run button', () => {
  const html = createRenderer().render(`~~~examples readonly\n${ALL_LANGUAGES}\n~~~\n`, {});
  assert.match(html, /class="example-readonly"/);
  assert.doesNotMatch(html, /data-sample/);
});

test('an examples block without the flag stays editable and runnable', () => {
  const html = createRenderer().render(`~~~examples\n${ALL_LANGUAGES}\n~~~\n`, {});
  assert.match(html, /data-sample/);
  assert.doesNotMatch(html, /class="example-readonly"/);
});

test('a readonly block is never the Source pane, even when it is the only block', () => {
  const lesson = `~~~examples readonly\n\`\`\`python\nprint(1)\n\`\`\`\n~~~\n`;
  assert.equal(sourceFromExamples(lesson), null);
});

test('the Source pane takes the first block that is not readonly', () => {
  const lesson = [
    '~~~examples readonly',
    '```python',
    'print("read only")',
    '```',
    '~~~',
    '~~~examples',
    '```python',
    'print("editable")',
    '```',
    '~~~',
  ].join('\n');
  assert.deepEqual(sourceFromExamples(lesson), { python: 'print("editable")\n' });
});
