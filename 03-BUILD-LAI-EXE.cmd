@echo off
setlocal EnableExtensions
cd /d "%~dp0"
chcp 65001 >nul 2>nul
echo THE HABIT MOSAIC V23.8 - TYPECHECK + BUILD LAI EXE
if not exist "node_modules\.bin\tsc.cmd" (
  echo node_modules chua co. Dang cai dependency...
  call npm install --include=dev --no-audit --no-fund || goto :FAIL
)
call npm run lint || goto :FAIL
call "00-CAI-MOI-HOAN-TOAN.cmd"
goto :END
:FAIL
echo [FAIL] Khong build duoc. Xem log phia tren.
:END
pause
endlocal
