// core/run.js
//
// Works out how to run a step's code for each language, and what each run folder must hold first. The runner writes
// the learner's code to a file with the name given here, then starts the command this module returns.
//
// The tutorial's library lives in samples/. Each language reaches it in its own way, so a sample runs against the same
// code the learner reads:
//   C#:          a project file in the run folder references samples/csharp/Invoicing/Invoicing.csproj by its full
//                path. The path is worked out when the runner starts, from the course folder.
//   Python:      PYTHONPATH includes samples/python, so `import invoicing` finds the package.
//   JavaScript:  the invoicing folder is copied into the run folder, beside the learner's main.js. An ES module cannot
//                take its import path from an environment variable, so the copy keeps the import a plain relative one.
//
// A step that edits the library gets its own copy of the library in the run folder, and the learner's text replaces the
// one file in that copy. The library in samples/ is never changed by a run.
//
// Python runs with the interpreter in the tutorial's .venv. JavaScript runs in a folder under samples/javascript, so
// the run is inside the package that declares "type": "module".

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { TEST_FILE_NAMES } = require('./tests');
const { libraryFileName } = require('./library');

const FILE_NAMES = {
  csharp: 'main.cs',
  python: 'main.py',
  javascript: 'main.js',
};

const CSHARP_PROJECT_FILE = 'run.csproj';
// Build output folders, which a copied library leaves out.
const BUILD_FOLDER = /[\\/](bin|obj)(?=[\\/]|$)/;
// `dotnet run` builds the project and then runs it. The quiet verbosity keeps the build messages out of the output.
const CSHARP_RUN_ARGS = ['run', '--project', CSHARP_PROJECT_FILE, '--verbosity', 'quiet'];

// The library's parts, as they are laid out in the course folder.
function libraryProjectFor(courseRoot) {
  return path.join(courseRoot, 'samples', 'csharp', 'Invoicing', 'Invoicing.csproj');
}
function libraryPythonFolderFor(courseRoot) {
  return path.join(courseRoot, 'samples', 'python', 'invoicing');
}
function libraryPythonPathFor(courseRoot) {
  return path.join(courseRoot, 'samples', 'python');
}
function libraryJavaScriptFolderFor(courseRoot) {
  return path.join(courseRoot, 'samples', 'javascript', 'invoicing');
}

// The C# library's folder, as the course lays it out.
function libraryCSharpFolderFor(courseRoot) {
  return path.join(courseRoot, 'samples', 'csharp', 'Invoicing');
}

// The Python interpreter inside the tutorial's environment, as setup.ps1 creates it.
function environmentFor(courseRoot) {
  return { python: path.join(courseRoot, '.venv', 'Scripts', 'python.exe') };
}

// The environment every run gets: the learner's own environment, plus TRAINING_DATA, which points at the sample data
// folder, and PYTHONPATH, which lets Python find the library. The learner's own PYTHONPATH, if any, is kept after it.
function runEnvironment(courseRoot) {
  const pythonPath = [libraryPythonPathFor(courseRoot), process.env.PYTHONPATH].filter(Boolean).join(path.delimiter);
  return { ...process.env, TRAINING_DATA: path.join(courseRoot, 'samples', 'data'), PYTHONPATH: pythonPath };
}

// The folder a run happens in. JavaScript runs under samples/javascript, so the package's "type": "module" applies.
// C# and Python run in the user data folder.
function runFolderFor(language, lessonId, courseRoot, userDataDir) {
  const name = lessonId.replace(/[^A-Za-z0-9-]+/g, '_');
  if (language === 'javascript') return path.join(courseRoot, 'samples', 'javascript', '.runs', name);
  return path.join(userDataDir, 'runs', name);
}

// The file name the learner's code is written to. A test step whose learner writes the tests uses the test file's name.
function editedFileName(language, edit) {
  if (edit === 'test' && TEST_FILE_NAMES[language]) return TEST_FILE_NAMES[language];
  return FILE_NAMES[language];
}

// Where the learner's code goes inside the run folder. A library step replaces the library file in the run's copy.
function codeTargetPath(dir, language, edit, libraryName) {
  const fileName = edit === 'library' && libraryName ? libraryFileName(language, libraryName) : null;
  if (fileName) return path.join(dir, 'invoicing', fileName);
  return path.join(dir, editedFileName(language, edit));
}

// Packages a C# test project needs, with the versions the team has checked.
const TEST_PACKAGES = [
  ['Microsoft.NET.Test.Sdk', '18.12.0'],
  ['NUnit', '4.6.1'],
  ['NUnit3TestAdapter', '6.3.1'],
];

// The project file for the learner's C# code. A test step gets a test project with NUnit. A copied library, in the run folder,
// is kept out of the build's own sources, because the project reference already builds it. The library's full path is
// escaped for XML, so a path with spaces or an ampersand still works.
function csharpProjectText(libraryProject, options = {}) {
  const reference = libraryProject
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const lines = [
    '<Project Sdk="Microsoft.NET.Sdk">',
    '',
    '  <PropertyGroup>',
    options.test ? '    <IsTestProject>true</IsTestProject>' : '    <OutputType>Exe</OutputType>',
    '    <TargetFramework>net10.0</TargetFramework>',
    '    <ImplicitUsings>enable</ImplicitUsings>',
    '    <Nullable>enable</Nullable>',
  ];
  if (options.test) lines.push('    <IsPackable>false</IsPackable>');
  lines.push('  </PropertyGroup>', '');
  if (options.test) {
    lines.push('  <ItemGroup>');
    for (const [name, version] of TEST_PACKAGES) lines.push(`    <PackageReference Include="${name}" Version="${version}" />`);
    lines.push('  </ItemGroup>', '');
  }
  lines.push('  <ItemGroup>', `    <ProjectReference Include="${reference}" />`, '  </ItemGroup>', '');
  if (options.copied) lines.push('  <ItemGroup>', '    <Compile Remove="invoicing/**" />', '  </ItemGroup>', '');
  lines.push('</Project>', '');
  return lines.join('\n');
}

// Gets a run folder ready for a language before its code is written. C# gets its project file, and a library edit gets a copy
// of the C# library. JavaScript always gets a copy of the library. A Python library edit gets a copy of the Python package. A
// Python run with no library edit needs nothing, because PYTHONPATH already points at the library.
function prepareRunFolder(language, dir, courseRoot, edit, isTest = false) {
  if (language === 'csharp') {
    // The project compiles every .cs file in the folder, so a file left by an earlier shape of the step would be compiled too,
    // and a duplicate type fails the build. Remove the file this run does not use.
    fs.rmSync(path.join(dir, isTest ? FILE_NAMES.csharp : TEST_FILE_NAMES.csharp), { force: true });
    const copied = edit === 'library';
    let libraryProject = libraryProjectFor(courseRoot);
    if (copied) {
      fs.cpSync(libraryCSharpFolderFor(courseRoot), path.join(dir, 'invoicing'), {
        recursive: true,
        force: true,
        filter: (source) => !BUILD_FOLDER.test(source),
      });
      libraryProject = path.join(dir, 'invoicing', 'Invoicing.csproj');
    }
    fs.writeFileSync(path.join(dir, CSHARP_PROJECT_FILE), csharpProjectText(libraryProject, { test: isTest, copied }), 'utf8');
  }
  if (language === 'javascript') {
    fs.cpSync(libraryJavaScriptFolderFor(courseRoot), path.join(dir, 'invoicing'), { recursive: true, force: true });
  }
  if (language === 'python' && edit === 'library') {
    // The run's own copy comes first on the import path, because `python -m` puts the current folder first.
    fs.cpSync(libraryPythonFolderFor(courseRoot), path.join(dir, 'invoicing'), { recursive: true, force: true });
  }
}

// True when a package is installed in this folder or in one above it, the way Node looks for packages.
function isInstalled(name, folder) {
  let dir = folder;
  for (;;) {
    if (fs.existsSync(path.join(dir, 'node_modules', name, 'package.json'))) return true;
    const parent = path.dirname(dir);
    if (parent === dir) return false;
    dir = parent;
  }
}

// What must be in place before a language can run, or null when it is ready. The message says what to do.
function prerequisiteProblem(language, courseRoot) {
  if (language === 'python' && !fs.existsSync(environmentFor(courseRoot).python)) {
    return 'The tutorial Python environment is missing. Run setup.ps1 in the training-unit-testing folder.';
  }
  if (language === 'javascript') {
    const manifest = path.join(courseRoot, 'samples', 'javascript', 'package.json');
    if (!fs.existsSync(manifest)) {
      return 'The JavaScript sample setup is missing. Run setup.ps1 in the training-unit-testing folder.';
    }
    // Packages are needed only when the manifest declares some. Each declared package must be installed, not just the folder.
    const declared = Object.keys(JSON.parse(fs.readFileSync(manifest, 'utf8')).dependencies || {});
    const missing = declared.filter((name) => !isInstalled(name, path.join(courseRoot, 'samples', 'javascript')));
    if (missing.length > 0) {
      return 'The JavaScript sample packages are missing (' + missing.join(', ') + '). Run npm install in the training-unit-testing folder, or setup.ps1.';
    }
  }
  return null;
}

// The command to run one file. For C#, the run goes through the project file in the run folder, which `prepareRunFolder`
// writes. The file name is not needed for C#, because the project includes every source file in the folder.
function commandFor(language, file, environment) {
  switch (language) {
    case 'csharp':
      return { command: 'dotnet', args: [...CSHARP_RUN_ARGS] };
    case 'python':
      return { command: environment.python, args: [file] };
    case 'javascript':
      return { command: 'node', args: [file] };
    default:
      throw new Error(`The runner has no way to run ${language}.`);
  }
}

module.exports = {
  FILE_NAMES,
  CSHARP_RUN_ARGS,
  codeTargetPath,
  commandFor,
  csharpProjectText,
  editedFileName,
  environmentFor,
  isInstalled,
  libraryProjectFor,
  prepareRunFolder,
  prerequisiteProblem,
  runEnvironment,
  runFolderFor,
};
