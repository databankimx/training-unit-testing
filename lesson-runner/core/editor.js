// core/editor.js
//
// Finds the text editor that Windows is set to use for .txt files, so a report opens in that editor with its syntax
// highlighting. Pure functions only. main.js runs `reg` and starts the program.

'use strict';

// Where Windows keeps the program the user chose for a file type. UserChoice comes first, because it is set when the user
// picks a default in Windows settings. The file type's own default is the fallback.
const USER_CHOICE_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.txt\\UserChoice';
const FILE_TYPE_KEY = 'HKCR\\.txt';

// `reg query` prints one line per value: name, type, data. Returns the data for the named value, or null.
// The default value is printed as "(Default)".
function parseRegistryValue(output, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^\\s*${escaped}\\s+REG_\\w+\\s+(.*?)\\s*$`, 'm').exec(String(output));
  return match ? match[1] : null;
}

// Turns an open command, such as "C:\Program Files\Notepad++\notepad++.exe" "%1", into a program and its arguments with the
// file put in place of %1. A command without %1 gets the file added at the end.
function commandForFile(template, file) {
  const text = String(template).trim();
  let program;
  let rest;
  if (text.startsWith('"')) {
    const end = text.indexOf('"', 1);
    if (end < 0) return null;
    program = text.slice(1, end);
    rest = text.slice(end + 1);
  } else {
    const space = text.search(/\s/);
    program = space < 0 ? text : text.slice(0, space);
    rest = space < 0 ? '' : text.slice(space);
  }
  if (!program) return null;

  const tokens = rest.match(/"[^"]*"|\S+/g) ?? [];
  let hasFile = false;
  const args = tokens.map((token) => {
    if (token.includes('%1')) {
      hasFile = true;
      return file;
    }
    return token.replace(/^"|"$/g, '');
  });
  if (!hasFile) args.push(file);
  return { program, args };
}

module.exports = {
  FILE_TYPE_KEY,
  USER_CHOICE_KEY,
  commandForFile,
  parseRegistryValue,
};
