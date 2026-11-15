# setup.ps1
#
# Prepares the Unit Testing With Fixtures and Mocks tutorial. It can be run from anywhere:
#   0. Checks Git. If this script isn't inside the tutorial, it clones the repository into
#      C:\Development\training\training-unit-testing (or uses the folder already there), then runs the copy of this
#      script in that folder, so every later step uses the repository's own files.
#   1. Checks Node.js 24 or later.
#   2. Checks Python 3.12 or later.
#   3. Checks the .NET 10 SDK, which runs the C# samples and tests.
#   4. Checks the C++ Build Tools. They are the fallback when Electron's download fails, so they are installed up front.
#   5. Checks Visual Studio Code, and installs it if it is missing.
#   6. Installs the packages the tutorial needs:
#        a. creates a virtual environment in .venv at the repository root, and installs requirements.txt into it
#        b. installs every npm package in one step, from package.json and package-lock.json at the repository root
#           (the runner and the JavaScript samples are workspaces), and makes sure the Electron binary is present
#   7. Opens the repository in VS Code, and starts the lesson runner. Skipped with -NoLaunch.
#
# Anything missing is installed with winget. Use -SkipInstall to only check. Installing the C++ Build Tools needs an
# elevated (Administrator) PowerShell. Safe to run again: anything already in place is skipped.
#
# Run from anywhere with:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
#
# Add -RunTests to run the runner's tests after the install. They are not run by default.

param(
    [switch]$SkipInstall,
    [switch]$RunTests,
    [switch]$NoLaunch,
    [string]$RepoUrl = "https://github.com/databankimx/training-unit-testing.git",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

$defaultRepoPath = "C:\Development\training\training-unit-testing"
$requiredNodeMajor = 24
$requiredPythonMinor = 12
$requiredDotNetMajor = 10
$summary = [ordered]@{}

function Write-Step([string]$title) {
    Write-Host ""
    Write-Host "== $title ==" -ForegroundColor Cyan
}

function Stop-Setup([string]$message) {
    Write-Host ""
    Write-Host "SETUP STOPPED: $message" -ForegroundColor Red
    Write-Host "Fix the problem above, then run this script again. Steps already done are skipped."
    exit 1
}

function Add-Warning([string]$message) {
    Write-Host "   WARNING: $message" -ForegroundColor Yellow
}

function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Invoke-Winget([string]$id) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Stop-Setup "winget is not available. Install 'App Installer' from the Microsoft Store, or install $id by hand."
    }
    Write-Host "   winget install -e --id $id" -ForegroundColor Gray
    & winget install -e --id $id --silent --accept-package-agreements --accept-source-agreements
    # 0 = installed. -1978335189 = already installed. 3010 = installed, and a restart is needed.
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne -1978335189 -and $LASTEXITCODE -ne 3010) {
        Stop-Setup "winget could not install $id (exit code $LASTEXITCODE)."
    }
}

# Finds a program on PATH, or in the folders it installs to. A program installed in this session isn't on PATH until
# a new window opens, so the usual folders are checked too.
function Find-Program([string]$CommandName, [string[]]$Candidates) {
    $command = Get-Command $CommandName -ErrorAction SilentlyContinue
    if ($command -and $command.Source -notlike "*\WindowsApps\*") { return $command.Source }
    foreach ($candidate in $Candidates) {
        if ($candidate -and (Test-Path $candidate)) { return $candidate }
    }
    return $null
}

function Add-FolderToPath([string]$exePath) {
    $folder = Split-Path $exePath -Parent
    if ($env:Path -notlike "*$folder*") { $env:Path = "$folder;$env:Path" }
}

function Get-VisualStudioInstallPath {
    # vswhere finds Visual Studio installations. Only one with the C++ compiler component counts.
    $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
    if (-not (Test-Path $vswhere)) { return $null }
    $path = & $vswhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -latest -property installationPath 2>$null
    if ($path) { return ($path | Select-Object -First 1).Trim() }
    return $null
}

function Test-BuildTools {
    return [bool](Get-VisualStudioInstallPath)
}

function Install-BuildTools {
    if (-not (Test-Administrator)) {
        Stop-Setup "The C++ Build Tools need an elevated PowerShell. Open PowerShell as Administrator, and run this script again."
    }
    Write-Host "   Installing Visual Studio Build Tools with the C++ workload."
    Write-Host "   This downloads about 4 to 5 GB and may take several minutes."
    $override = "--quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
    Write-Host "   winget install --id Microsoft.VisualStudio.BuildTools --override ""$override""" -ForegroundColor Gray
    & winget install --id Microsoft.VisualStudio.BuildTools -e --accept-package-agreements --accept-source-agreements --override $override
    # 0 = success, 3010 = success but a restart is needed, -1978335189 = already installed.
    if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 3010 -and $LASTEXITCODE -ne -1978335189) {
        Stop-Setup "winget could not install the C++ Build Tools (exit code $LASTEXITCODE)."
    }
    Start-Sleep -Seconds 5
    return (Test-BuildTools)
}

# Native modules are compiled with the C++ compiler, which needs the Visual Studio environment variables.
# vcvars64.bat sets them, and this function copies the result into the current PowerShell session.
function Import-BuildToolsEnvironment {
    $install = Get-VisualStudioInstallPath
    if (-not $install) { return $false }
    $vcvars = Join-Path $install "VC\Auxiliary\Build\vcvars64.bat"
    if (-not (Test-Path $vcvars)) { return $false }
    $environmentLines = cmd /c "`"$vcvars`" >nul 2>&1 && set"
    foreach ($line in $environmentLines) {
        if ($line -match "^([^=]+)=(.*)$") {
            Set-Item -Path "env:$($Matches[1])" -Value $Matches[2]
        }
    }
    return $true
}

$gitCandidates = @("C:\Program Files\Git\cmd\git.exe")
$nodeCandidates = @("C:\Program Files\nodejs\node.exe")
$pythonCandidates = @(
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "C:\Program Files\Python312\python.exe"
)
$dotnetCandidates = @("C:\Program Files\dotnet\dotnet.exe")
$codeCandidates = @(
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
    "C:\Program Files\Microsoft VS Code\bin\code.cmd"
)

Write-Host ""
Write-Host "Unit Testing With Fixtures and Mocks setup" -ForegroundColor Yellow

# 0. Git and the repository ------------------------------------------------------------------------------

Write-Step "0. Git and the repository"

$gitExe = Find-Program 'git' $gitCandidates
if (-not $gitExe) {
    if ($SkipInstall) { Stop-Setup "Git isn't installed. Install Git from https://git-scm.com, or run this script without -SkipInstall." }
    Write-Host "   Git is missing: installing it"
    Invoke-Winget "Git.Git"
    $gitExe = Find-Program 'git' $gitCandidates
    if (-not $gitExe) { Stop-Setup "Git was installed, but git.exe can't be found. Open a new PowerShell window and run this script again." }
}
Add-FolderToPath $gitExe
Write-Host "   Git: $gitExe"
$summary["Git"] = "ok"

if (-not (Test-Path (Join-Path $root "lesson-runner\package.json"))) {
    # The script is running outside the tutorial. Use the folder that is already in place, or clone the repository into it.
    if (Test-Path $defaultRepoPath) {
        $runnerFile = Join-Path $defaultRepoPath "lesson-runner\package.json"
        if (-not (Test-Path $runnerFile)) {
            Stop-Setup "$runnerFile was not found. The folder $defaultRepoPath is not a complete copy of the tutorial. Move or rename that folder, then run this script again, so the repository can be cloned into a new folder."
        }
        Write-Host "   Using the existing folder at $defaultRepoPath (no clone needed)"
        $repoRoot = $defaultRepoPath
    } else {
        Write-Host "   Cloning $RepoUrl ($Branch) into $defaultRepoPath"
        New-Item -ItemType Directory -Force -Path (Split-Path $defaultRepoPath -Parent) | Out-Null
        & $gitExe clone --branch $Branch $RepoUrl $defaultRepoPath
        if ($LASTEXITCODE -ne 0) {
            Stop-Setup "git clone failed (exit code $LASTEXITCODE). Check the address, and your access to the repository."
        }
        $repoRoot = $defaultRepoPath
    }
    $childScript = Join-Path $repoRoot "setup.ps1"
    if (-not (Test-Path $childScript)) {
        Stop-Setup "The repository at $repoRoot has no setup.ps1. Check that the branch '$Branch' is the right one."
    }
    Write-Host "   Continuing from the repository's own copy of this script."
    $childParams = @{}
    if ($SkipInstall) { $childParams["SkipInstall"] = $true }
    if ($RunTests) { $childParams["RunTests"] = $true }
    if ($NoLaunch) { $childParams["NoLaunch"] = $true }
    & $childScript @childParams
    exit $LASTEXITCODE
}
$summary["Repository"] = $root

# 1. Node.js ---------------------------------------------------------------------------------------------

Write-Step "1. Node.js $requiredNodeMajor or later"

$nodeExe = Find-Program 'node' $nodeCandidates
if (-not $nodeExe -and -not $SkipInstall) {
    Write-Host "   Node.js is missing: installing the LTS release"
    Invoke-Winget "OpenJS.NodeJS.LTS"
    $nodeExe = Find-Program 'node' $nodeCandidates
}
if (-not $nodeExe) {
    Stop-Setup "Node.js isn't installed. Run this script without -SkipInstall, or install Node.js $requiredNodeMajor or later from https://nodejs.org."
}

Add-FolderToPath $nodeExe
$nodeDir = Split-Path $nodeExe -Parent
$nodeVersion = (& $nodeExe --version | Select-Object -First 1).Trim()
if ($nodeVersion -match "^v(\d+)\.") {
    $nodeMajor = [int]$Matches[1]
} else {
    Stop-Setup "Couldn't read the Node.js version: $nodeVersion"
}
if ($nodeMajor -lt $requiredNodeMajor) {
    Stop-Setup "Node.js $nodeVersion was found, but the tutorial needs Node.js $requiredNodeMajor or later. Install a current LTS release from https://nodejs.org, then run this script again."
}
Write-Host "   Node.js $nodeVersion in $nodeDir"
$summary["Node.js"] = $nodeVersion

$npmCmd = Join-Path $nodeDir "npm.cmd"
if (-not (Test-Path $npmCmd)) {
    Stop-Setup "npm wasn't found next to Node.js at $npmCmd. Reinstall Node.js, then run this script again."
}

# 2. Python ------------------------------------------------------------------------------------------------

Write-Step "2. Python 3.$requiredPythonMinor or later"

$pythonExe = Find-Program 'python' $pythonCandidates
if ($pythonExe -and $pythonExe -notlike "*\WindowsApps\*") {
    $pythonVersion = (& $pythonExe --version 2>&1 | Select-Object -First 1).ToString().Trim()
} else {
    $pythonVersion = ""
}
$pythonOk = $pythonVersion -match "^Python 3\.(\d+)" -and [int]$Matches[1] -ge $requiredPythonMinor
if (-not $pythonOk -and -not $SkipInstall) {
    Write-Host "   Python 3.$requiredPythonMinor or later is missing: installing it"
    Invoke-Winget "Python.Python.3.12"
    $pythonExe = Find-Program 'python' $pythonCandidates
    $pythonVersion = if ($pythonExe) { (& $pythonExe --version 2>&1 | Select-Object -First 1).ToString().Trim() } else { "" }
    $pythonOk = $pythonVersion -match "^Python 3\.(\d+)" -and [int]$Matches[1] -ge $requiredPythonMinor
}
if (-not $pythonOk) {
    Stop-Setup "Python 3.$requiredPythonMinor or later isn't installed (found: '$pythonVersion'). Install it from https://www.python.org, or run this script without -SkipInstall."
}
Write-Host "   $pythonVersion in $pythonExe"
$summary["Python"] = $pythonVersion

# 3. .NET SDK ----------------------------------------------------------------------------------------------

Write-Step "3. .NET $requiredDotNetMajor SDK (runs the C# samples and tests)"

$dotnetExe = Find-Program 'dotnet' $dotnetCandidates
$dotnetVersion = if ($dotnetExe) { (& $dotnetExe --version 2>$null | Select-Object -First 1).ToString().Trim() } else { "" }
$dotnetOk = $dotnetVersion -match "^(\d+)\." -and [int]$Matches[1] -ge $requiredDotNetMajor
if (-not $dotnetOk -and -not $SkipInstall) {
    Write-Host "   .NET $requiredDotNetMajor SDK is missing: installing it"
    Invoke-Winget "Microsoft.DotNet.SDK.$requiredDotNetMajor"
    $dotnetExe = Find-Program 'dotnet' $dotnetCandidates
    $dotnetVersion = if ($dotnetExe) { (& $dotnetExe --version 2>$null | Select-Object -First 1).ToString().Trim() } else { "" }
    $dotnetOk = $dotnetVersion -match "^(\d+)\." -and [int]$Matches[1] -ge $requiredDotNetMajor
}
if (-not $dotnetOk) {
    Stop-Setup ".NET $requiredDotNetMajor SDK isn't installed (found: '$dotnetVersion'). Install it from https://dotnet.microsoft.com, or run this script without -SkipInstall."
}
Add-FolderToPath $dotnetExe
Write-Host "   .NET SDK $dotnetVersion in $dotnetExe"
$summary[".NET SDK"] = $dotnetVersion

# 4. C++ Build Tools ---------------------------------------------------------------------------------------

Write-Step "4. C++ Build Tools (the fallback if Electron's download fails)"

$hasBuildTools = Test-BuildTools
if (-not $hasBuildTools -and -not $SkipInstall) {
    Write-Host "   C++ Build Tools not found. They are needed to rebuild native modules if Electron's download fails."
    $hasBuildTools = Install-BuildTools
}
if ($hasBuildTools) {
    Write-Host "   C++ Build Tools found"
    $summary["C++ Build Tools"] = "ok"
} else {
    Stop-Setup "The C++ Build Tools aren't installed. Run this script as Administrator without -SkipInstall, or install 'Visual Studio Build Tools' with the 'Desktop development with C++' workload by hand."
}

# 5. Visual Studio Code -------------------------------------------------------------------------------------

Write-Step "5. Visual Studio Code (the tutorial opens in it)"

$codeExe = Find-Program 'code' $codeCandidates
if (-not $codeExe -and -not $SkipInstall) {
    Write-Host "   VS Code is missing: installing it"
    Invoke-Winget "Microsoft.VisualStudioCode"
    $codeExe = Find-Program 'code' $codeCandidates
}
if ($codeExe) {
    Write-Host "   VS Code: $codeExe"
    $summary["VS Code"] = "ok"
} else {
    Add-Warning "VS Code isn't installed, so the tutorial won't open in it. The runner still starts. Install VS Code from https://code.visualstudio.com, then run this script again."
    $summary["VS Code"] = "not found"
}

# 6. Packages: virtual environment, runner and samples, and Electron ----------------------------------------

Write-Step "6a. Python virtual environment (.venv) and requirements.txt"

$venvDir = Join-Path $root ".venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "   Creating the virtual environment in $venvDir"
    & $pythonExe -m venv $venvDir
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $venvPython)) {
        Stop-Setup "The virtual environment could not be created (exit code $LASTEXITCODE). Check the Python installation, then run this script again."
    }
} else {
    Write-Host "   Virtual environment already exists at $venvDir"
}

& $venvPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) {
    Stop-Setup "pip could not be upgraded (exit code $LASTEXITCODE). Check your network access to the Python package index."
}
Write-Host "   Installing requirements.txt (pytest)."
& $venvPython -m pip install -r (Join-Path $root "requirements.txt")
if ($LASTEXITCODE -ne 0) {
    Stop-Setup "pip install -r requirements.txt failed (exit code $LASTEXITCODE). Check the messages above, and your network access to the Python package index."
}
$summary["Python packages"] = "ok"

Write-Step "6b. npm packages (one install at the repository root)"

Set-Location $root
if (Test-Path (Join-Path $root "package-lock.json")) {
    & $npmCmd ci
} else {
    Write-Host "   No package-lock.json found, so npm install is used. Commit the lock file it creates."
    & $npmCmd install
}
if ($LASTEXITCODE -ne 0) {
    Stop-Setup "npm install failed (exit code $LASTEXITCODE). Check the messages above, and your network access to the npm registry."
}
$summary["npm packages"] = "ok"

Write-Step "6c. Electron binary"

$electronExe = Join-Path $root "node_modules\electron\dist\electron.exe"
$electronInstall = Join-Path $root "node_modules\electron\install.js"

if (-not (Test-Path $electronExe)) {
    Write-Host "   Electron binary not found. Downloading it."
    if (-not (Test-Path $electronInstall)) {
        Stop-Setup "Electron's install.js is missing. Check the messages from npm ci above."
    }
    & $nodeExe $electronInstall
    $firstAttempt = $LASTEXITCODE

    if ($firstAttempt -ne 0 -or -not (Test-Path $electronExe)) {
        # A known npm problem (npm bug 4828) can leave an optional native package unbuilt. Rebuilding with the compiler
        # environment loaded usually fixes it, and then the download is retried.
        Write-Host "   The download failed. Rebuilding native modules with the C++ environment, then trying again."
        if (Import-BuildToolsEnvironment) {
            Write-Host "   C++ environment loaded for this session"
        } else {
            Add-Warning "The C++ environment could not be loaded, so the rebuild may fail."
        }
        & $npmCmd rebuild
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   npm rebuild reported problems, so the retry below decides the outcome." -ForegroundColor Yellow
        }

        & $nodeExe $electronInstall
        if ($LASTEXITCODE -ne 0) {
            Stop-Setup "Electron's binary still won't download (exit code $LASTEXITCODE). Check network access to github.com, and that the C++ Build Tools are installed."
        }
    }
}

if (Test-Path $electronExe) {
    Write-Host "   Electron binary ready"
    $summary["Electron binary"] = "ok"
} else {
    Stop-Setup "Electron's binary is still missing after the download. Run this script again, or check the messages above."
}

if ($RunTests) {
    Write-Step "6d. Runner tests (requested with -RunTests)"
    Set-Location (Join-Path $root "lesson-runner")
    & $npmCmd test
    if ($LASTEXITCODE -ne 0) {
        Stop-Setup "The runner's tests failed. Check the messages above, then run this script again."
    }
    $summary["Tests"] = "ok"
    Set-Location $root
}

Set-Location $root

# 7. Open the tutorial and start the runner -----------------------------------------------------------------

Write-Step "7. Open in VS Code and start the lesson runner"

$runnerDir = Join-Path $root "lesson-runner"
if ($NoLaunch -or $SkipInstall) {
    Write-Host "   Skipped (-NoLaunch or -SkipInstall). To start the runner later, run 'npm start' in the lesson-runner folder."
    $summary["Runner"] = "not started"
} else {
    if ($codeExe) {
        Write-Host "   Opening $root in VS Code"
        & $codeExe $root
    }
    Write-Host "   Starting the lesson runner in its own window"
    Start-Process -FilePath $npmCmd -ArgumentList "start" -WorkingDirectory $runnerDir
    $summary["Runner"] = "started"
}

Write-Step "Summary"
foreach ($item in $summary.GetEnumerator()) {
    Write-Host ("   {0,-20} {1}" -f $item.Key, $item.Value)
}

Write-Host ""
Write-Host "Setup finished." -ForegroundColor Green
Write-Host ""
Write-Host "To start the runner again later:" -ForegroundColor Green
Write-Host "   cd `"$runnerDir`""
Write-Host "   npm start"
