@echo off
cd /d "%~dp0"
echo Starting Vite from %CD% > dev-server.log
where npm.cmd >> dev-server.log 2>&1
npm.cmd run dev -- --host 127.0.0.1 --port 5174 --configLoader runner >> dev-server.log 2>&1
echo Dev server exited with code %ERRORLEVEL% >> dev-server.log
pause
