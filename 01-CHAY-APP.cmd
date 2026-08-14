@echo off
cd /d "%~dp0"
if exist "release-local\win-unpacked\The Habit Mosaic.exe" (
  start "" "release-local\win-unpacked\The Habit Mosaic.exe"
  exit /b 0
)
echo Chua co EXE. Hay chay 00-CAI-MOI-HOAN-TOAN.cmd truoc.
pause
