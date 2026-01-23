@echo off
echo Installing dependencies...
call npm install
echo.
echo Dependencies installed! Starting dev server...
echo.
call npm run dev
