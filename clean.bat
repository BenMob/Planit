@echo off
cd /d "%~dp0"

echo [clean] Removing build artifacts...

if exist "out" rmdir /s /q "out"
if exist "release" rmdir /s /q "release"
if exist "dist" rmdir /s /q "dist"
if exist ".vite" rmdir /s /q ".vite"
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

del /f /q "*.tsbuildinfo" 2>nul

echo [clean] Done.
