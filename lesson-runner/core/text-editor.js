// core/text-editor.js
//
// Finds the text editor this computer uses for plain text, and builds the command that opens a file in it. The
// functions here are pure: main.js reads the registry and runs the command, and these functions read the output.

'use strict';

// The sample files that are plain text, so a text editor can show them. Excel and Parquet files are binary.
const TEXT_EXTENSIONS = ['.csv', '.tsv', '.json', '.jsonl', '.xml', '.yaml', '.yml', '.fixed', '.txt'];

function isTextFile(name) {
  const lower = name.toLowerCase();
  return TEXT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

// Reads one value from `reg query` output. The data is printed after the value's type, on the same line. The
// default value is printed as (Default). Returns null when the value isn't there.
function registryValue(output, valueName) {
  const escaped = valueName.replace(/[()]/g, '\\$&');
  const match = new RegExp(`^\\s*${escaped}\\s+REG_(?:EXPAND_)?SZ\\s+(.+?)\\s*$`, 'm').exec(output);
  return match ? match[1] : null;
}

// Replaces %NAME% with the value of that environment variable. A name that isn't set is left as it is.
function expandEnvironment(text, environment) {
  return text.replace(/%([A-Za-z0-9_]+)%/g, (whole, name) =>
    environment[name] !== undefined ? environment[name] : whole,
  );
}

// Splits an open command into the program and its arguments, keeping quoted parts together. The file replaces the
// %1, %L, or %* placeholder. When the command has no placeholder, the file is added as the last argument.
// Returns null for an empty command.
function commandFor(commandLine, file) {
  const tokens = [];
  const pattern = /"([^"]*)"|(\S+)/g;
  let match;
  while ((match = pattern.exec(commandLine)) !== null) {
    tokens.push(match[1] !== undefined ? match[1] : match[2]);
  }
  if (tokens.length === 0) return null;

  const [program, ...rest] = tokens;
  let placed = false;
  const args = rest.map((token) => {
    if (token === '%1' || token === '%L' || token === '%*') {
      placed = true;
      return file;
    }
    return token;
  });
  if (!placed) args.push(file);
  return { program, args };
}

// Whether the first bytes of a file look like plain text. A NUL byte is the mark of a binary file: Excel and Parquet
// files both contain them, and a text file never does. Only the first part of the file is checked.
function isPlainText(bytes) {
  return !bytes.subarray(0, 8192).includes(0);
}

module.exports = { isTextFile, isPlainText, registryValue, expandEnvironment, commandFor };
