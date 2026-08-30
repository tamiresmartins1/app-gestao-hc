@echo off
chcp 65001 > nul
echo.
echo =========================================
echo   APP GESTÃO HC - SETUP
echo =========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não está instalado!
    echo.
    echo Acesse: https://nodejs.org/
    echo 1. Baixe a versão LTS
    echo 2. Execute o instalador
    echo 3. Reinicie o computador
    echo 4. Execute este script novamente
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version

echo.
echo Instalando dependências do Backend...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do backend
    pause
    exit /b 1
)
echo ✅ Backend pronto

echo.
echo Instalando dependências do Frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências do frontend
    pause
    exit /b 1
)
echo ✅ Frontend pronto

cd ..
echo.
echo =========================================
echo   ✅ SETUP CONCLUÍDO COM SUCESSO!
echo =========================================
echo.
echo Para RODAR o APP:
echo.
echo 1. Abra um terminal (CMD) e execute:
echo    cd backend
echo    npm run dev
echo.
echo 2. Abra outro terminal (CMD) e execute:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Abra seu navegador em:
echo    http://localhost:5173
echo.
echo Documentação: SETUP.md
echo.
pause
