@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title The Habit Mosaic V23.8 - CLEAN INSTALL
chcp 65001 >nul 2>nul

echo ============================================================
echo THE HABIT MOSAIC V23.8 - CAI MOI / SUA BUILD
echo ============================================================
echo Thu muc hien tai:
echo %CD%
echo.

echo [1/6] Kiem tra Node.js va npm...
where node >nul 2>nul || goto :NO_NODE
where npm >nul 2>nul || goto :NO_NODE
node --version
call npm --version
if errorlevel 1 goto :FAIL

echo.
echo [2/6] Kiem tra source V23.8...
node VERIFY-CLEAN-V23.cjs
if errorlevel 1 goto :FAIL
findstr /c:"const activeNpcCount = (Object.values(world.npc) as NpcState[])" "src\components\CommunityWorld.tsx" >nul || goto :BAD_FIX
findstr /c:"declare props: Readonly<{children:React.ReactNode}>;" "src\components\RewardRouteHost.tsx" >nul || goto :BAD_FIX
findstr /c:"const assignments:Record<string,number>" "src\components\RewardWorld.tsx" >nul || goto :BAD_FIX

echo [PASS] V23.8 TypeScript hotfix markers

echo.
echo [3/6] Kiem tra dependency...
if exist "node_modules\.bin\tsc.cmd" (
  echo [PASS] node_modules da co - KHONG tai lai 483 package.
) else (
  echo node_modules chua co. Cai dependency + dong bo package-lock.json...
  call npm install --include=dev --no-audit --no-fund
  if errorlevel 1 goto :FAIL
)

echo.
echo [4/6] Kiem tra TypeScript...
call npm run lint
if errorlevel 1 goto :FAIL

echo.
echo [5/6] Bao toan data runtime neu dang co...
set "DATA_BACKUP=%TEMP%\habit-mosaic-v23-data-%RANDOM%-%RANDOM%"
set "HAD_DATA=0"
if exist "release-local\win-unpacked\data" (
  set "HAD_DATA=1"
  mkdir "!DATA_BACKUP!" >nul 2>nul
  xcopy /e /i /h /y "release-local\win-unpacked\data" "!DATA_BACKUP!\data" >nul
  echo [PASS] Da backup data tam thoi.
) else (
  echo Khong co data cu - day la cai moi sach.
)

echo.
echo [6/6] Build Electron moi...
call npm run desktop:local
if errorlevel 1 goto :RESTORE_FAIL

if not exist "release-local\win-unpacked\The Habit Mosaic.exe" (
  echo [FAIL] Build xong nhung khong thay EXE Windows.
  goto :RESTORE_FAIL
)

if "!HAD_DATA!"=="1" (
  if exist "!DATA_BACKUP!\data" (
    xcopy /e /i /h /y "!DATA_BACKUP!\data" "release-local\win-unpacked\data" >nul
    echo [PASS] Da khoi phuc data runtime sau build.
  )
)
if exist "!DATA_BACKUP!" rmdir /s /q "!DATA_BACKUP!"

echo.
echo ============================================================
echo [PASS] V23.8 TYPECHECK + BUILD HOAN TAT
echo EXE: %CD%\release-local\win-unpacked\The Habit Mosaic.exe
echo DATA: %CD%\release-local\win-unpacked\data
echo ============================================================
echo.
choice /c YN /n /m "Mo The Habit Mosaic ngay? [Y/N]: "
if errorlevel 2 goto :END
start "" "release-local\win-unpacked\The Habit Mosaic.exe"
goto :END

:BAD_FIX
echo.
echo [FAIL] Source khong phai V23.8 hotfix day du.
goto :FAIL

:RESTORE_FAIL
if "!HAD_DATA!"=="1" (
  if exist "!DATA_BACKUP!\data" (
    mkdir "release-local\win-unpacked" >nul 2>nul
    xcopy /e /i /h /y "!DATA_BACKUP!\data" "release-local\win-unpacked\data" >nul
    echo [INFO] Da co gang khoi phuc data sau build loi.
  )
)
if exist "!DATA_BACKUP!" rmdir /s /q "!DATA_BACKUP!"
goto :FAIL

:NO_NODE
echo.
echo [FAIL] Chua co Node.js/npm trong PATH.
echo Hay cai Node.js, mo CMD moi, roi chay lai file nay.
goto :END

:FAIL
echo.
echo ============================================================
echo [FAIL] TYPECHECK/BUILD KHONG THANH CONG.
echo Gui phan log loi phia tren neu can sua.
echo ============================================================

:END
pause
endlocal
