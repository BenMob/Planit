@echo off
setlocal EnableDelayedExpansion

cd /d "%~dp0"

if not exist ".env.local" (
  echo [deploy] Missing .env.local
  echo [deploy] Copy .env.example to .env.local and set PLANIT_DEPLOY_DIR.
  exit /b 1
)

for /f "usebackq eol=# tokens=1,* delims==" %%a in (".env.local") do (
  if /i "%%a"=="PLANIT_DEPLOY_DIR" set "PLANIT_DEPLOY_DIR=%%b"
)

if defined PLANIT_DEPLOY_DIR set "PLANIT_DEPLOY_DIR=!PLANIT_DEPLOY_DIR:"=!"
if defined PLANIT_DEPLOY_DIR for /f "tokens=* delims= " %%a in ("!PLANIT_DEPLOY_DIR!") do set "PLANIT_DEPLOY_DIR=%%a"

if "!PLANIT_DEPLOY_DIR!"=="" (
  echo [deploy] PLANIT_DEPLOY_DIR is not set in .env.local
  exit /b 1
)

if not exist "!PLANIT_DEPLOY_DIR!" (
  echo [deploy] Deploy directory does not exist: !PLANIT_DEPLOY_DIR!
  exit /b 1
)

if not exist "resources\icon.png" (
  echo [deploy] Missing resources\icon.png — add your app icon before deploying.
  exit /b 1
)

echo [deploy] Optimizing icons (PNG + ICO)...
call npm run icons
if errorlevel 1 (
  echo [deploy] Icon build failed.
  exit /b 1
)

echo [deploy] Building Planit...
call npm run build
if errorlevel 1 (
  echo [deploy] Build failed.
  exit /b 1
)

echo [deploy] Packaging Windows executable...
set "CSC_IDENTITY_AUTO_DISCOVERY=false"
call npx electron-builder --win portable
if errorlevel 1 (
  echo [deploy] Packaging failed.
  exit /b 1
)

set "EXE_SOURCE="
for %%f in ("release\Planit*.exe") do set "EXE_SOURCE=%%~ff"

if not defined EXE_SOURCE if exist "release\win-unpacked\Planit.exe" (
  set "EXE_SOURCE=%~dp0release\win-unpacked\Planit.exe"
)

if not defined EXE_SOURCE (
  echo [deploy] Could not find Planit.exe in release\
  exit /b 1
)

echo [deploy] Copying to !PLANIT_DEPLOY_DIR!\Planit.exe
copy /Y "!EXE_SOURCE!" "!PLANIT_DEPLOY_DIR!\Planit.exe"
if errorlevel 1 (
  echo [deploy] Copy to Desktop failed.
  exit /b 1
)

echo [deploy] Done — Planit.exe is at !PLANIT_DEPLOY_DIR!\Planit.exe
endlocal
