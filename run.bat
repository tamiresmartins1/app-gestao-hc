@echo off
chcp 65001 > nul
echo.
echo =========================================
echo   APP GESTÃO HC
echo =========================================
echo.
echo Este script abrirá o backend e frontend.
echo Mantenha ambas as janelas abertas!
echo.

echo Iniciando Backend (porta 5000)...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak

echo Iniciando Frontend (porta 5173)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Aplicação iniciada!
echo.
echo Acesse em seu navegador:
echo http://localhost:5173
echo.
echo Mantenha os terminais abertos enquanto usar o app.
echo.
