// main.js
//
// The Electron main process. It finds the course, renders lessons, saves progress, checks which languages can run,
// runs a step's code when asked, opens links in the browser, and manages the pop-out lesson window. The page talks
// to this process only through the preload bridge.

'use strict';

const { app, BrowserWindow, ipcMain, Menu, screen, shell } = require('electron');
const { execFile, spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { loadCatalog, flatten, summarize, neighbors, readParts, checkParts, groupByPart } = require('./core/catalog');
const { createRenderer } = require('./core/markdown');
const { lessonImageUri } = require('./core/images');
const { sourceFromExamples } = require('./core/sources');
const { highlightCode, markdownHighlight } = require('./core/highlight');
const {
  emptyState,
  loadState,
  saveState,
  markVisited,
  recordProgress,
  lessonProgress,
  recordSolutionsRevealed,
  solutionsRevealed,
} = require('./core/state');
const { loadWindowState, saveWindowState, isVisibleOn } = require('./core/window-state');
const { probeAll } = require('./core/toolchains');
const { FILE_NAMES, codeTargetPath, commandFor, environmentFor, prepareRunFolder, runEnvironment, runFolderFor, prerequisiteProblem } = require('./core/run');
const { syntaxCommand, parseDiagnostics, outputMatches } = require('./core/check');
const { testCommandFor, parseTestResults, summarizeTests, TEST_FILE_NAMES, prettifyXml } = require('./core/tests');
const { FILE_TYPE_KEY, USER_CHOICE_KEY, commandForFile, parseRegistryValue } = require('./core/editor');
const { libraryFileName, libraryFilePath } = require('./core/library');
const { isGatedStep } = require('./core/gating');
const { sampleFileNames, dataFilesMentioned } = require('./core/data-files');
const { isTextFile, isPlainText, registryValue, expandEnvironment, commandFor: commandFromLine } = require('./core/text-editor');

// The runner lives in lesson-runner/, inside the course folder.
const courseRoot = path.resolve(__dirname, '..');
const rendererDir = path.join(__dirname, 'renderer');
// The sample data: the files a lesson works with, and the folder TRAINING_DATA points at.
const dataDir = path.join(courseRoot, 'samples', 'data');
const md = createRenderer({ highlight: markdownHighlight });

// The rendering environment for one lesson: its images are read from the folder that holds its lesson.md.
function lessonRenderEnv(item) {
  const folder = path.dirname(item.markdownPath);
  return { resolveImage: (src) => lessonImageUri(folder, src) };
}

// The file extension for each language's starter and solution files: main.cs and solution.cs, and so on.
const EXTENSIONS = { csharp: 'cs', python: 'py', javascript: 'js' };
// The languages a lesson's examples are written in. A sample can run in any of them.
const SAMPLE_LANGUAGES = ['csharp', 'python', 'javascript'];
// Time allowed for one run. C# is slower to start, because the first run compiles the file.
// C# restores its packages the first time a project is built, so its limit is longer.
const TIME_LIMIT_MS = { csharp: 180000, python: 10000, javascript: 10000 };

let mainWindow = null;
let popoutWindow = null;
let toolchainCache = null;
let activeRun = null;
// The report the last test run wrote, which the page can open in the text editor.
let lastReportPath = null;

function stateFile() {
  return path.join(app.getPath('userData'), 'progress.json');
}

function currentItems() {
  return flatten(loadCatalog(courseRoot));
}

function findItem(id) {
  return currentItems().find((candidate) => candidate.id === id) ?? null;
}

// A step's own main files, one per language, read from its folder. Missing files are skipped.
function codeFiles(item, prefix) {
  const files = {};
  for (const language of item.languages) {
    const file = path.join(item.dir, `${prefix}.${EXTENSIONS[language]}`);
    if (fs.existsSync(file)) files[language] = fs.readFileSync(file, 'utf8');
  }
  return files;
}

// The examples in a step's lesson text, as the code for each language. Null when the lesson has none.
function exampleSource(item) {
  if (!fs.existsSync(item.markdownPath)) return null;
  return sourceFromExamples(fs.readFileSync(item.markdownPath, 'utf8'));
}

// The languages a step's Source pane can run: its own list, or the languages of its examples. A chapter has none.
function codeLanguages(item) {
  if (item.kind !== 'step') return [];
  if (item.languages.length > 0) return item.languages;
  const examples = exampleSource(item);
  return examples ? Object.keys(examples) : [];
}

// The starting code for each language: the step's main files, or, for a reading step, its examples.
function startingCode(item) {
  if (item.kind !== 'step') return {};
  if (item.languages.length > 0 && item.edit === 'library') return libraryStarters(item, item.languages);
  if (item.languages.length > 0) return codeFiles(item, item.edit === 'test' ? 'test' : 'main');
  return exampleSource(item) ?? {};
}

// Which course languages can run here. The check runs once per session, and the result is kept.
function toolchains() {
  if (toolchainCache === null) toolchainCache = probeAll(execFile);
  return toolchainCache;
}

function openLesson(id) {
  const items = currentItems();
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown lesson: ${id}`);

  const markdown = fs.readFileSync(item.markdownPath, 'utf8');
  const { previous, next } = neighbors(items, id);
  const state = loadState(stateFile());
  const isCodeStep = codeLanguages(item).length > 0;
  const gated = isGatedStep(item);
  // The sample data files a lesson mentions, in its text or its starting code. Each gets an Open button.
  const dataFiles = dataFilesMentioned(
    [markdown, ...Object.values(isCodeStep ? startingCode(item) : {})],
    sampleFileNames(dataDir),
  ).map((name) => ({
    name,
    // The text editor button is offered only for a file that really is plain text, not just one named like it.
    text: isTextFile(name) && isPlainText(fs.readFileSync(path.join(dataDir, name))),
  }));
  return {
    id: item.id,
    kind: item.kind,
    title: item.title,
    html: md.render(markdown, lessonRenderEnv(item)),
    markdown,
    previous: previous ? { id: previous.id, title: previous.title } : null,
    next: next ? { id: next.id, title: next.title } : null,
    isLast: next === null,
    progress: lessonProgress(state, id),
    // For a code step: the languages it covers, its starter code in each, and whether its solutions are revealed.
    // The solutions themselves are not sent until the learner opens the gate.
    languages: isCodeStep ? codeLanguages(item) : [],
    starters: isCodeStep ? startingCode(item) : {},
    expected: isCodeStep ? (item.expected ?? null) : null,
    isTest: isTestStep(item),
    testFiles: isCodeStep && isTestStep(item) && item.edit !== 'test' ? readTestFiles(item, codeLanguages(item)) : null,
    edit: item.edit,
    libraryName: item.edit === 'library' ? (item.library[0] ?? null) : null,
    libraryFileNames: item.edit === 'library'
      ? Object.fromEntries(codeLanguages(item).map((language) => [language, libraryFileName(language, item.library[0] ?? null)]))
      : null,
    libraryFiles: isCodeStep && item.edit !== 'library' ? readLibraryFiles(item, codeLanguages(item)) : null,
    gated,
    dataFiles,
    solutionsRevealed: gated && solutionsRevealed(state, id),
    // The learner's prompt file for a code step, if the step has one. It's language-neutral, so it isn't per language.
    // The sample prompt (prompt.md) is part of the solution, so like the solutions it is sent only once the gate is open.
    // It is rendered here, and the page shows it read-only.
    prompt: gated && solutionsRevealed(state, id) && fs.existsSync(path.join(item.dir, 'prompt.md'))
      ? md.render(fs.readFileSync(path.join(item.dir, 'prompt.md'), 'utf8'), lessonRenderEnv(item))
      : null,
  };
}

// Links in a lesson open in the learner's browser. Only web addresses are allowed, so a lesson can't start a program.
function openInBrowser(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  shell.openExternal(parsed.toString());
  return true;
}

// Opens a report in the editor Windows is set to use for .txt files, such as Notepad++, so the report keeps its syntax
// highlighting. The report itself is opened, not a copy. Outside Windows, or when no editor is set, the system's default
// program for the file is used. Resolves to an error message, or to an empty string.
async function openInTextEditor(file) {
  if (process.platform !== 'win32') return shell.openPath(file);
  const template = await defaultTextEditorCommand();
  const command = template ? commandForFile(template, file) : null;
  if (!command) return shell.openPath(file);
  return new Promise((resolve) => {
    const child = spawn(command.program, command.args, { detached: true, stdio: 'ignore', windowsHide: false });
    child.once('error', (error) => resolve(error.message));
    child.once('spawn', () => {
      child.unref();
      resolve('');
    });
  });
}

// Runs `reg query` and resolves to its output, or null when the key or value is missing.
function regQuery(args) {
  return new Promise((resolve) => {
    execFile('reg', ['query', ...args], { windowsHide: true }, (error, stdout) => resolve(error ? null : String(stdout)));
  });
}

// The open command Windows uses for .txt files, such as "C:\Program Files\Notepad++\notepad++.exe" "%1", or null.
async function defaultTextEditorCommand() {
  const choice = await regQuery([USER_CHOICE_KEY, '/v', 'ProgId']);
  let handler = choice ? parseRegistryValue(choice, 'ProgId') : null;
  if (!handler) {
    const fileType = await regQuery([FILE_TYPE_KEY, '/ve']);
    handler = fileType ? parseRegistryValue(fileType, '(Default)') : null;
  }
  if (!handler) return null;
  const openCommand = await regQuery([`HKCR\\${handler}\\shell\\open\\command`, '/ve']);
  return openCommand ? parseRegistryValue(openCommand, '(Default)') : null;
}

// Keeps a window from navigating away from the lesson page. Every outside link opens in the browser instead.
function guardWindow(window) {
  window.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    openInBrowser(url);
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    openInBrowser(url);
    return { action: 'deny' };
  });
}

function sendPopoutState() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('popout:state', { open: popoutWindow !== null });
  }
}

function windowStateFile() {
  return path.join(app.getPath('userData'), 'window-state.json');
}

// The pop-out reopens where it was last closed, if enough of that place is still on a screen. Otherwise the default
// place is used, so an unplugged monitor can't leave the window off-screen.
function savedPopoutBounds() {
  const saved = loadWindowState(windowStateFile());
  if (!saved) return null;
  const workAreas = screen.getAllDisplays().map((display) => display.workArea);
  return isVisibleOn(saved, workAreas) ? saved : null;
}

// Saves the pop-out's position and size as it moves, resizes, and closes. Moves are saved after a short pause, so a
// drag writes the file once rather than many times.
function rememberPopout(window) {
  let timer = null;
  const save = () => {
    if (window.isDestroyed()) return;
    const maximized = window.isMaximized();
    const bounds = maximized ? window.getNormalBounds() : window.getBounds();
    saveWindowState(windowStateFile(), { ...bounds, maximized });
  };
  const later = () => {
    clearTimeout(timer);
    timer = setTimeout(save, 400);
  };
  window.on('move', later);
  window.on('resize', later);
  window.on('close', save);
}

function openPopout(id) {
  if (popoutWindow !== null) {
    popoutWindow.webContents.send('page:show', id);
    popoutWindow.focus();
    return;
  }
  const saved = savedPopoutBounds();
  popoutWindow = createWindow({ mode: 'lesson', lesson: id, width: 900, height: 700, saved });
  if (saved && saved.maximized) popoutWindow.maximize();
  rememberPopout(popoutWindow);
  popoutWindow.on('closed', () => {
    popoutWindow = null;
    sendPopoutState();
  });
  sendPopoutState();
}

// Stops the run in progress, if there is one.
function stopActiveRun() {
  if (activeRun !== null) {
    activeRun.kill();
    activeRun = null;
  }
}

// Writes the learner's code to a file in the user data folder, runs it, and streams its output to the window that asked.
// A sample (an example in a lesson's text) may come from any lesson, so it needs no step and no homework rules. A step's
// run must be a code step in a language it covers.
async function startRun(sender, lessonId, language, code, sample = false) {
  const item = findItem(lessonId);
  if (sample) {
    if (!item || !SAMPLE_LANGUAGES.includes(language)) throw new Error('This example has no code in that language.');
  } else if (!item || item.kind !== 'step' || !codeLanguages(item).includes(language)) {
    throw new Error('This step has no code in that language.');
  }
  if (typeof code !== 'string' || code.length > 200000) throw new Error('The code is too long to run.');

  const tool = (await toolchains())[language];
  if (!tool || !tool.available) throw new Error(`${language} is not installed on this computer.`);

  stopActiveRun();
  const problem = prerequisiteProblem(language, courseRoot);
  if (problem) throw new Error(problem);
  const dir = runFolderFor(language, lessonId, courseRoot, app.getPath('userData'));
  fs.mkdirSync(dir, { recursive: true });
  prepareRunFolder(language, dir, courseRoot, item.edit, isTestStep(item));
  const target = codeTargetPath(dir, language, item.edit, item.library[0]);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, code, 'utf8');
  const file = path.relative(dir, target);
  const isTest = !sample && isTestStep(item);
  const testRun = isTest ? testCommandFor(language, environmentFor(courseRoot)) : null;
  if (isTest) {
    if (item.edit !== 'test') copyTestFile(item, language, dir);
    if (testRun.reportFile) fs.rmSync(path.join(dir, testRun.reportFile), { force: true });
  }

  const { command, args } = testRun ?? commandFor(language, file, environmentFor(courseRoot));
  const send = (payload) => {
    if (!sender.isDestroyed()) sender.send('run:event', payload);
  };
  const child = spawn(command, args, { cwd: dir, windowsHide: true, shell: false, env: runEnvironment(courseRoot) });
  activeRun = child;
  child.stdin.end();

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, TIME_LIMIT_MS[language]);

  child.stdout.on('data', (chunk) => send({ kind: 'stdout', text: chunk.toString() }));
  child.stderr.on('data', (chunk) => send({ kind: 'stderr', text: chunk.toString() }));
  child.on('error', (error) => send({ kind: 'stderr', text: `${error.message}\n` }));
  child.on('close', (exitCode) => {
    clearTimeout(timer);
    if (activeRun === child) activeRun = null;
    if (testRun && testRun.reportFile) tidyReportFile(path.join(dir, testRun.reportFile));
    const reportPath = testRun && testRun.reportFile ? path.join(dir, testRun.reportFile) : null;
    const hasReport = Boolean(reportPath && fs.existsSync(reportPath));
    if (hasReport) lastReportPath = reportPath;
    send({ kind: 'done', code: exitCode, timedOut, reportFile: hasReport });
  });
}

// Writes the learner's code into the run folder, for one step and language.
function writeSource(lessonId, language, code) {
  const item = findItem(lessonId);
  if (!item || item.kind !== 'step' || !codeLanguages(item).includes(language)) {
    throw new Error('This step has no code in that language.');
  }
  if (typeof code !== 'string' || code.length > 200000) throw new Error('The code is too long to check.');
  const problem = prerequisiteProblem(language, courseRoot);
  if (problem) throw new Error(problem);
  const dir = runFolderFor(language, lessonId, courseRoot, app.getPath('userData'));
  fs.mkdirSync(dir, { recursive: true });
  prepareRunFolder(language, dir, courseRoot, item.edit, isTestStep(item));
  const target = codeTargetPath(dir, language, item.edit, item.library[0]);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, code, 'utf8');
  const file = path.relative(dir, target);
  return { item, dir, file };
}

// Runs a command to the end and keeps what it printed. Check needs the output, so this doesn't stream it.
function runToEnd(command, args, cwd, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, windowsHide: true, shell: false, env: runEnvironment(courseRoot) });
    child.stdin.end();
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ exitCode: null, stdout, stderr: stderr + error.message });
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ exitCode, stdout, stderr });
    });
  });
}

// The Check button. The syntax check runs first. If it passes and the step has an expected output, the program runs
// and its output is compared with that expected output. A step with no expected output gets the syntax check only.
async function checkSource(lessonId, language, code) {
  const { item, dir, file } = writeSource(lessonId, language, code);
  const tool = (await toolchains())[language];
  if (!tool || !tool.available) throw new Error(`${language} is not installed on this computer.`);

  const syntax = syntaxCommand(language, file, isTestStep(item));
  const syntaxResult = await runToEnd(syntax.command, syntax.args, dir, TIME_LIMIT_MS[language]);
  const diagnostics = parseDiagnostics(language, syntaxResult);
  if (diagnostics.length > 0) return { kind: 'diagnostics', items: diagnostics };
  if (isTestStep(item)) return checkTests(item, language, dir);
  if (item.expected === null) return { kind: 'no-expected' };

  // For C#, the syntax check is a run of the program, so its output is the output to compare.
  let output = syntaxResult;
  if (language !== 'csharp') {
    const run = commandFor(language, file, environmentFor(courseRoot));
    output = await runToEnd(run.command, run.args, dir, TIME_LIMIT_MS[language]);
  }
  if (outputMatches(item.expected, output.stdout)) return { kind: 'passed' };
  return { kind: 'mismatch', expected: item.expected, actual: output.stdout };
}

// True for a step whose lesson.json says "checks": "tests". Its test file is supplied by the lesson, not written by the learner.
function isTestStep(item) {
  return item.kind === 'step' && item.checks === 'tests';
}

// Copies a test step's test file into the run folder, next to the learner's file.
function copyTestFile(item, language, dir) {
  const source = path.join(item.dir, TEST_FILE_NAMES[language]);
  if (!fs.existsSync(source)) throw new Error(`This test step has no test file for ${language}.`);
  fs.copyFileSync(source, path.join(dir, TEST_FILE_NAMES[language]));
}

// The text of each test file, for the page's read-only test view. Null when the step has no test file.
function readTestFiles(item, languages) {
  const files = {};
  for (const language of languages) {
    const name = TEST_FILE_NAMES[language];
    if (name && fs.existsSync(path.join(item.dir, name))) files[language] = fs.readFileSync(path.join(item.dir, name), 'utf8');
  }
  return Object.keys(files).length > 0 ? files : null;
}

// The text of the library files a step lists, for each language. Null when the step lists none that exist.
function readLibraryFiles(item, languages) {
  const files = {};
  for (const language of languages) {
    for (const name of item.library) {
      const file = libraryFilePath(courseRoot, language, name);
      if (!file || !fs.existsSync(file)) continue;
      files[language] = { ...(files[language] ?? {}), [name]: fs.readFileSync(file, 'utf8') };
    }
  }
  return Object.keys(files).length > 0 ? files : null;
}

// For a step that edits the library: the text of its editable file for each language.
function libraryStarters(item, languages) {
  const files = readLibraryFiles(item, languages) ?? {};
  const name = item.library[0];
  return Object.fromEntries(
    Object.entries(files).filter(([, byName]) => name in byName).map(([language, byName]) => [language, byName[name]]),
  );
}

// Re-indents an XML report after its run, so it reads well in a text editor. A report that cannot be rewritten is left as
// the test run wrote it, and the tests still read from it.
function tidyReportFile(file) {
  if (!/\.(xml|trx)$/.test(file) || !fs.existsSync(file)) return;
  try {
    fs.writeFileSync(file, prettifyXml(fs.readFileSync(file, 'utf8')), 'utf8');
  } catch {
    // The report stays as the test run wrote it.
  }
}

// The Check for a test step, after the learner's file has passed its syntax check. The tests run, and their report is read.
// When no test runs at all, the reason is shown as a diagnostic, because a run with no tests is not a pass.
async function checkTests(item, language, dir) {
  if (item.edit !== 'test') copyTestFile(item, language, dir);
  const run = testCommandFor(language, environmentFor(courseRoot));
  if (run.reportFile) fs.rmSync(path.join(dir, run.reportFile), { force: true });
  const result = await runToEnd(run.command, run.args, dir, TIME_LIMIT_MS[language]);
  if (run.reportFile) tidyReportFile(path.join(dir, run.reportFile));
  let reportText = '';
  if (run.reportFile) {
    try {
      reportText = fs.readFileSync(path.join(dir, run.reportFile), 'utf8');
    } catch {
      reportText = '';
    }
  }
  const tests = parseTestResults(language, { reportText, stdout: result.stdout });
  if (tests.length === 0) {
    const lines = `${result.stderr}\n${result.stdout}`.split('\n').map((line) => line.trim()).filter(Boolean);
    return { kind: 'diagnostics', items: [{ line: 1, column: 1, message: lines[lines.length - 1] ?? 'No tests ran.' }] };
  }
  const reportPath = run.reportFile ? path.join(dir, run.reportFile) : null;
  const hasReport = Boolean(reportPath && fs.existsSync(reportPath));
  if (hasReport) lastReportPath = reportPath;
  return { kind: 'tests', tests, summary: summarizeTests(tests), reportFile: hasReport };
}

// Runs `reg query` and returns its output. A key that doesn't exist gives an empty string, not an error.
function queryRegistry(args) {
  return new Promise((resolve) => {
    execFile('reg', ['query', ...args], { windowsHide: true }, (error, stdout) => resolve(error ? '' : stdout));
  });
}

// The command that opens a plain text file in the text editor this computer uses. The learner's own choice for .txt
// files is used if they've made one, then the system default for .txt. Notepad is used when neither is set.
async function textEditorCommand(file) {
  const choice = await queryRegistry([
    'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.txt\\UserChoice',
    '/v',
    'ProgId',
  ]);
  let progId = registryValue(choice, 'ProgId');
  if (!progId) progId = registryValue(await queryRegistry(['HKCR\\.txt', '/ve']), '(Default)');
  if (progId) {
    const line = registryValue(await queryRegistry([`HKCR\\${progId}\\shell\\open\\command`, '/ve']), '(Default)');
    const command = line ? commandFromLine(expandEnvironment(line, process.env), file) : null;
    if (command) return command;
  }
  return { program: 'notepad.exe', args: [file] };
}

function registerHandlers() {
  ipcMain.handle('catalog:list', () => summarize(loadCatalog(courseRoot)));
  // The menu's parts, each with its chapters. Checked against the chapter folders, so a chapter missing from parts.json
  // is reported rather than hidden.
  ipcMain.handle('catalog:parts', () => {
    const chapters = loadCatalog(courseRoot);
    const parts = checkParts(readParts(courseRoot), chapters.map((chapter) => chapter.id));
    return groupByPart(summarize(chapters), parts);
  });
  ipcMain.handle('lesson:open', (_event, id) => openLesson(String(id)));
  ipcMain.handle('state:get', () => loadState(stateFile()));
  ipcMain.handle('state:visit', (_event, id) => {
    const items = currentItems();
    if (!items.some((item) => item.id === id)) throw new Error(`Unknown lesson: ${id}`);
    const next = markVisited(loadState(stateFile()), id);
    saveState(stateFile(), next);
    return next;
  });
  ipcMain.handle('link:open', (_event, url) => openInBrowser(String(url)));
  ipcMain.handle('progress:record', (_event, id, kind, index, value) => {
    const lessonId = String(id);
    if (!currentItems().some((item) => item.id === lessonId)) throw new Error(`Unknown lesson: ${lessonId}`);
    if (kind !== 'quiz' && kind !== 'spoiler') throw new Error(`Unknown progress kind: ${kind}`);
    if (!Number.isInteger(index) || index < 0 || index > 999) throw new Error('Progress index out of range');
    const valid = kind === 'quiz' ? Number.isInteger(value) && value >= 0 && value <= 99 : typeof value === 'boolean';
    if (!valid) throw new Error(`Invalid ${kind} value`);
    saveState(stateFile(), recordProgress(loadState(stateFile()), lessonId, kind, index, value));
  });
  // Clears saved progress and tells every open window to redraw its lesson.
  ipcMain.handle('progress:reset', () => {
    saveState(stateFile(), emptyState());
    for (const window of [mainWindow, popoutWindow]) {
      if (window && !window.isDestroyed()) window.webContents.send('progress:reset');
    }
  });
  // Opens a code step's solution gate. Only then are its solutions sent to the page, and the gate stays open.
  ipcMain.handle('solutions:reveal', (_event, id) => {
    const lessonId = String(id);
    const item = findItem(lessonId);
    if (!isGatedStep(item)) throw new Error('This step has no solutions to reveal.');
    const solutions = codeFiles(item, 'solution');
    if (Object.keys(solutions).length === 0) throw new Error('The solution files for this step are missing.');
    saveState(stateFile(), recordSolutionsRevealed(loadState(stateFile()), lessonId));
    // The sample prompt and its reasoning (prompt.md) are part of the solution. They are rendered, and read-only in the page.
    const promptFile = path.join(item.dir, 'prompt.md');
    const prompt = fs.existsSync(promptFile) ? md.render(fs.readFileSync(promptFile, 'utf8'), lessonRenderEnv(item)) : null;
    return { code: solutions, prompt };
  });
  ipcMain.handle('toolchains:get', () => toolchains());
  ipcMain.handle('code:highlight', (_event, code, language) => highlightCode(String(code), String(language)));
  // Opens a sample data file in the program this computer uses for its type. Only names from the sample data folder
  // are accepted, so the page can't open any other file.
  ipcMain.handle('data:open', async (_event, name) => {
    const fileName = String(name);
    if (!sampleFileNames(dataDir).includes(fileName)) throw new Error(`Not a sample data file: ${fileName}`);
    const problem = await shell.openPath(path.join(dataDir, fileName));
    if (problem) throw new Error(`The file could not be opened: ${problem}`);
  });
  // Opens a plain text sample file in the text editor. The file is passed to the program as an argument, never through
  // a shell, and only the names of text sample files are accepted.
  ipcMain.handle('data:edit', async (_event, name) => {
    const fileName = String(name);
    const file = path.join(dataDir, fileName);
    if (!sampleFileNames(dataDir).includes(fileName) || !isTextFile(fileName) || !isPlainText(fs.readFileSync(file))) {
      throw new Error(`Not a text sample data file: ${fileName}`);
    }
    const { program, args } = await textEditorCommand(file);
    await new Promise((resolve, reject) => {
      const child = spawn(program, args, { detached: true, stdio: 'ignore', windowsHide: false });
      child.once('error', (error) => reject(new Error(`The text editor could not be started: ${error.message}`)));
      child.once('spawn', () => {
        child.unref();
        resolve();
      });
    });
  });
  ipcMain.handle('run:start', (event, id, language, code) =>
    startRun(event.sender, String(id), String(language), code),
  );
  ipcMain.handle('sample:run', (event, id, language, code) =>
    startRun(event.sender, String(id), String(language), code, true),
  );
  ipcMain.handle('check:run', (_event, id, language, code) => checkSource(String(id), String(language), code));
  ipcMain.handle('report:open', async () => {
    if (!lastReportPath || !fs.existsSync(lastReportPath)) throw new Error('There is no test report to open yet. Run the tests first.');
    const problem = await openInTextEditor(lastReportPath);
    if (problem) throw new Error(problem);
  });
  ipcMain.handle('run:stop', () => {
    stopActiveRun();
  });
  ipcMain.handle('popout:open', (_event, id) => {
    openPopout(String(id));
  });
  ipcMain.handle('popout:navigated', (_event, id) => {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('page:navigated', String(id));
  });
  ipcMain.handle('popout:sync', (_event, id) => {
    if (popoutWindow !== null) popoutWindow.webContents.send('page:show', String(id));
  });
  ipcMain.handle('popout:close', () => {
    if (popoutWindow !== null) popoutWindow.close();
  });
  ipcMain.handle('popout:state', () => ({ open: popoutWindow !== null }));
}

// A window for the lesson page. The main window shows the whole runner. A pop-out shows the lesson alone.
// A saved place, when given, sets the window's position as well as its size.
function createWindow({ mode, lesson, width = 1280, height = 820, saved = null }) {
  const placement = saved
    ? { x: saved.x, y: saved.y, width: saved.width, height: saved.height }
    : { width, height };
  const window = new BrowserWindow({
    ...placement,
    minWidth: 720,
    minHeight: 520,
    title: 'Unit Testing With Fixtures and Mocks',
    icon: fs.existsSync(path.join(rendererDir, 'app.png')) ? path.join(rendererDir, 'app.png') : undefined,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  guardWindow(window);
  const query = mode ? { mode, lesson: lesson ?? '' } : undefined;
  window.loadFile(path.join(rendererDir, 'index.html'), query ? { query } : undefined);
  return window;
}

app.whenReady().then(() => {
  // The File, Edit, View, and Window menus are not used, so the menu bar is removed.
  Menu.setApplicationMenu(null);
  registerHandlers();
  mainWindow = createWindow({});
  mainWindow.on('closed', () => {
    mainWindow = null;
    stopActiveRun();
    if (popoutWindow !== null) popoutWindow.close();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow({});
    }
  });
});

app.on('window-all-closed', () => {
  stopActiveRun();
  app.quit();
});
