@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Dang cai dependencies...
  call npm install --include=dev --no-audit --no-fund || goto :fail
)
call npm run desktop:dev
goto :eof
:fail
echo Cai dependency that bai.
pause
