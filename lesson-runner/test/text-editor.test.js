// test/text-editor.test.js

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { isTextFile, isPlainText, registryValue, expandEnvironment, commandFor } = require('../core/text-editor');

test('sample files that are plain text are offered the text editor, and binary files are not', () => {
  assert.equal(isTextFile('customers.csv'), true);
  assert.equal(isTextFile('customers.json'), true);
  assert.equal(isTextFile('customers.fixed.layout.txt'), true);
  assert.equal(isTextFile('customers.xlsx'), false);
  assert.equal(isTextFile('customers.parquet'), false);
});

test('a value is read from reg query output, including the default value', () => {
  const userChoice = '\r\nHKEY_CURRENT_USER\\...\\UserChoice\r\n    ProgId    REG_SZ    Applications\\notepad.exe\r\n';
  assert.equal(registryValue(userChoice, 'ProgId'), 'Applications\\notepad.exe');

  const association = '\r\nHKEY_CLASSES_ROOT\\.txt\r\n    (Default)    REG_SZ    txtfile\r\n';
  assert.equal(registryValue(association, '(Default)'), 'txtfile');
  assert.equal(registryValue(association, 'ProgId'), null);
});

test('environment variables in a command are expanded, and unknown ones are left alone', () => {
  const environment = { SystemRoot: 'C:\\WINDOWS' };
  assert.equal(
    expandEnvironment('%SystemRoot%\\system32\\NOTEPAD.EXE %1', environment),
    'C:\\WINDOWS\\system32\\NOTEPAD.EXE %1',
  );
  assert.equal(expandEnvironment('%NOT_SET%\\tool.exe', environment), '%NOT_SET%\\tool.exe');
});

test('a quoted program with a %1 placeholder gets the file in place of the placeholder', () => {
  const command = commandFor('"C:\\Program Files\\Microsoft VS Code\\Code.exe" "%1"', 'C:\\data\\customers.csv');
  assert.deepEqual(command, {
    program: 'C:\\Program Files\\Microsoft VS Code\\Code.exe',
    args: ['C:\\data\\customers.csv'],
  });
});

test('an unquoted command with a placeholder works, and a command without one gets the file appended', () => {
  assert.deepEqual(commandFor('C:\\WINDOWS\\system32\\NOTEPAD.EXE %1', 'C:\\data\\orders.csv'), {
    program: 'C:\\WINDOWS\\system32\\NOTEPAD.EXE',
    args: ['C:\\data\\orders.csv'],
  });
  assert.deepEqual(commandFor('"C:\\Editor\\edit.exe"', 'C:\\data\\orders.csv'), {
    program: 'C:\\Editor\\edit.exe',
    args: ['C:\\data\\orders.csv'],
  });
});

test('an empty command gives no program', () => {
  assert.equal(commandFor('   ', 'C:\\data\\orders.csv'), null);
});

test('a file with a NUL byte is not plain text, whatever its name says', () => {
  assert.equal(isPlainText(Buffer.from('customer_id,name\n1001,Alice\n')), true);
  // The start of an .xlsx file is a zip archive, which holds NUL bytes.
  assert.equal(isPlainText(Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00])), false);
});
