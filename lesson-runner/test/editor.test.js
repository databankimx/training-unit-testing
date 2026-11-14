// test/editor.test.js
//
// Reading the default text editor from Windows registry output, and building the command that opens a report with it.

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { commandForFile, parseRegistryValue } = require('../core/editor');

test('reads a named value from reg query output', () => {
  const output = [
    '',
    'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.txt\\UserChoice',
    '    ProgId    REG_SZ    Applications\\notepad++.exe',
    '    Hash    REG_SZ    abc123',
    '',
  ].join('\r\n');
  assert.equal(parseRegistryValue(output, 'ProgId'), 'Applications\\notepad++.exe');
});

test('reads the default value, which reg prints as (Default)', () => {
  const output = 'HKEY_CLASSES_ROOT\\txtfile\\shell\\open\\command\r\n    (Default)    REG_SZ    notepad.exe %1\r\n';
  assert.equal(parseRegistryValue(output, '(Default)'), 'notepad.exe %1');
});

test('a missing value gives null', () => {
  assert.equal(parseRegistryValue('ERROR: The system was unable to find the specified registry key', 'ProgId'), null);
});

test('a quoted program path with %1 gets the file in place of %1', () => {
  const command = commandForFile('"C:\\Program Files\\Notepad++\\notepad++.exe" "%1"', 'C:\\run\\report.xml');
  assert.deepEqual(command, { program: 'C:\\Program Files\\Notepad++\\notepad++.exe', args: ['C:\\run\\report.xml'] });
});

test('an unquoted program path works too', () => {
  const command = commandForFile('notepad.exe %1', 'C:\\run\\report.tap');
  assert.deepEqual(command, { program: 'notepad.exe', args: ['C:\\run\\report.tap'] });
});

test('a command with no %1 gets the file added at the end', () => {
  const command = commandForFile('"C:\\Editor\\edit.exe" --new-window', 'C:\\run\\report.xml');
  assert.deepEqual(command, { program: 'C:\\Editor\\edit.exe', args: ['--new-window', 'C:\\run\\report.xml'] });
});

test('an empty or unterminated command gives null', () => {
  assert.equal(commandForFile('', 'x.xml'), null);
  assert.equal(commandForFile('"C:\\Editor\\edit.exe', 'x.xml'), null);
});
