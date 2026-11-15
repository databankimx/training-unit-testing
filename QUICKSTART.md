# Quick start

This guide gets the Unit Testing With Fixtures and Mocks runner open. The runner is a desktop window, so the tutorial needs no server, no browser, and no accounts. The samples run on your machine in C#, Python, and JavaScript, and the runner shows each one next to its lesson.

The tutorial lives at [databankimx/training-unit-testing](https://github.com/databankimx/training-unit-testing). Clone it into `C:\Development\training\training-unit-testing`, or let the setup script do that for you.

## Quick setup with the script

`setup.ps1` does the whole setup, and then starts the course. You can run it from anywhere. If it isn't inside the repository, it clones the repository into `C:\Development\training\training-unit-testing` and runs the cloned copy. It then:

- checks for Git, and installs it with winget if it's missing
- checks for Node.js 24 or later, and installs the LTS release with winget if it's missing
- checks for Python 3.12 or later, and installs it with winget if it's missing
- checks for the .NET 10 SDK, which runs the C# samples and tests, and installs it with winget if it's missing
- checks for the C++ Build Tools, which are the fallback if Electron's download fails
- checks for Visual Studio Code, and installs it with winget if it's missing
- creates the Python virtual environment in `.venv` at the repository root, and installs `requirements.txt` into it
- installs every npm package in one step, from `package.json` and `package-lock.json` at the repository root, and makes sure the Electron binary is present
- opens the repository in VS Code, and starts the lesson runner in its own window

It's safe to run more than once. Anything already in place is skipped.

Open PowerShell, and run:

```pwsh
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
```

The `-ExecutionPolicy Bypass` part lets this one script run. It doesn't change any setting on your machine.

The C++ Build Tools are about 4 to 5 GB and can take several minutes. They need an **Administrator** PowerShell. If you aren't an administrator, the script stops at that step and says so. Open PowerShell as Administrator, and run the script again.

These options change what the script does:

- `-SkipInstall` checks your setup without installing anything. It doesn't open VS Code or start the runner either.
- `-NoLaunch` installs everything, but doesn't open VS Code or start the runner.
- `-RunTests` runs the runner's tests after the install. They aren't run by default.

```pwsh
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1 -SkipInstall
```

When the script finishes, it prints a summary. Every line should say `ok`, or say `started` or `not started` for the runner.

Installing uses winget. If winget isn't available, install **App Installer** from the Microsoft Store first. Company policy can block installs, in which case the script stops and you'll need IT.

## Manual setup

If you'd rather not run the script, these are the same steps by hand. Run them from the repository root, `C:\Development\training\training-unit-testing`, in PowerShell.

1. Install the tools:
   - Node.js 24 or later, from [nodejs.org](https://nodejs.org)
   - Python 3.12 or later, from [python.org](https://www.python.org)
   - The .NET 10 SDK, from [dotnet.microsoft.com](https://dotnet.microsoft.com)
   - The Visual Studio Build Tools with the C++ workload, only if Electron's download fails later
   - Visual Studio Code, from [code.visualstudio.com](https://code.visualstudio.com), if you want to open the tutorial in it
2. Install the npm packages. This one command installs the runner's packages and the JavaScript samples' packages together:

   ```pwsh
   npm install
   ```

3. Create the Python virtual environment and install the Python packages:

   ```pwsh
   python -m venv .venv
   .venv\Scripts\activate
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   ```

If `npm install` reports that the Electron binary is missing, run `npm install` again, with the Build Tools installed.

## Start the runner

```pwsh
cd C:\Development\training\training-unit-testing\lesson-runner
npm start
```

You can also run `npm start` from the repository root. The root's script starts the same runner.

The runner reopens the lesson you were on last. The first time, it opens on the first lesson. Close the window normally to stop it.

## Editing in VS Code

Open the repository folder in VS Code to read and edit the lessons and samples there. The runner doesn't need VS Code. It finds the Python packages in `.venv` by itself.

For Python IntelliSense and the editor's test runner, choose the `.venv` interpreter: open a Python file in `samples\python`, then choose **Python: Select Interpreter**, and pick the one in `.venv`. This only affects editing.

## How the lessons work

- The **sidebar** lists the parts and chapters. Open a part, then choose a chapter, and its steps appear below it. Use **Previous** and **Next** to move through the course in order. **Ctrl+Left** and **Ctrl+Right** do the same, unless the cursor is in an editor.
- Read each lesson in the **Lesson** tab. Examples show the code in each language, and you choose the language once for every example.
- Homework uses the **Source** tab. Press **Run** (F5) to run your code. For a step where you write the tests, the button says **Test** instead. Press **Check** (Ctrl+F5) to run a syntax check, then compare the output with the expected result.
- **Reset** puts back the starter code of a homework item.
- **Show solutions (spoiler)** shows the solution for a homework item. Try the homework first. The runner remembers that you revealed a solution, so it stays shown the next time you open that step.
- Press Ctrl and move the mouse wheel to change the size of the lesson text.

The chapter called **Appendix** has the framework cheat sheet. It has no exercises.

## Your progress

The runner saves your progress as you go, in a file outside the repository, so it's never committed:

```
%APPDATA%\training-unit-testing-runner\progress.json
```

The saved progress includes the step you were on, the steps you've visited, your quiz answers, the spoilers you've opened, and the solutions you've revealed.

To clear it, press **Ctrl+Alt+Shift+Backspace** in the runner. The lesson on screen is redrawn with nothing saved, and the next start opens the first lesson.

Your homework edits aren't saved to disk, so restarting the runner clears them. Copy anything you want to keep into a file in your own folder.

Runs go to two places. C# and Python runs happen in `%APPDATA%\training-unit-testing-runner\runs`. JavaScript runs happen in `samples\javascript\.runs`, which Git ignores.

## Troubleshooting

- **Setup says Git is missing and winget is not available.** Install **App Installer** from the Microsoft Store, or install Git from [git-scm.com](https://git-scm.com), then run the script again.
- **Setup says Node.js, Python, or the .NET SDK is too old.** Install the current release from the link above, open a new PowerShell window, and run the script again.
- **Setup says the C++ Build Tools need an Administrator.** Open PowerShell as Administrator, then run the script again.
- **Setup says VS Code is missing.** Install it from [code.visualstudio.com](https://code.visualstudio.com), then run the script again. The runner still starts without it.
- **Setup says `npm ci` failed.** Check your network access to the npm registry, then run the script again. Don't delete `package-lock.json` to get past the error.
- **Setup says the Electron binary still won't download.** Check your network access to github.com, and that the C++ Build Tools are installed. Then run the script again.
- **A C# step fails the first time with a package error.** The C# tests download their NuGet packages on the first run, so that run needs internet access. Run it again once you're online.
- **`pip install -r requirements.txt` fails.** Check your network access to the Python package index, then run the install again.
- **`npm start` fails with "package.json not found".** You're in the wrong folder. Change to `lesson-runner`, or to the repository's root, and try again.
- **The runner says the course could not be loaded, or lists a chapter as missing.** A chapter folder is missing from `parts.json`, or a listed chapter has no folder. Tell the tutorial's owner what the message says.
