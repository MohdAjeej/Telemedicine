@echo off
REM ===================================================================
REM Telemedicine Platform Deployment Script (Windows)
REM Server: 147.93.108.99
REM ===================================================================

echo.
echo ============================================================
echo   Telemedicine Platform Deployment
echo   Server: 147.93.108.99
echo ============================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo Please create .env file in the root directory
    pause
    exit /b 1
)

echo [OK] Found .env file
echo.

REM Load environment variables from .env
for /f "tokens=*" %%a in ('type .env ^| findstr /v "^#"') do set %%a

echo Configuration Summary:
echo ----------------------------------------
echo Environment: %NODE_ENV%
echo API Port: %PORT%
echo MongoDB: %MONGO_URI%
echo Client URLs: %CLIENT_URL%
echo API URL: %VITE_API_BASE_URL%
echo Socket URL: %VITE_SOCKET_URL%
echo Cloudinary: %CLOUDINARY_CLOUD_NAME%
echo ----------------------------------------
echo.

REM Warn about default secrets
if "%JWT_ACCESS_SECRET%"=="change-me-access-secret" (
    echo [WARNING] JWT_ACCESS_SECRET is still set to default value!
    echo           Generate a secure secret with: openssl rand -hex 32
    echo.
)

if "%JWT_REFRESH_SECRET%"=="change-me-refresh-secret" (
    echo [WARNING] JWT_REFRESH_SECRET is still set to default value!
    echo           Generate a secure secret with: openssl rand -hex 32
    echo.
)

REM Ask for confirmation
set /p CONFIRM="Continue with deployment? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo [CANCELLED] Deployment cancelled
    pause
    exit /b 1
)

echo.
echo [BUILD] Building and starting services...
echo.

REM Stop existing containers
docker-compose down

REM Build and start services
docker-compose up -d --build

echo.
echo [WAIT] Waiting for services to be healthy...
timeout /t 10 /nobreak > nul

REM Check service status
echo.
echo Service Status:
docker-compose ps

echo.
echo [TEST] Testing API Health...
timeout /t 5 /nobreak > nul

REM Test API health endpoint
curl -s -o nul -w "Status: %%{http_code}" http://147.93.108.99:5002/api/v1/health
echo.
echo.

echo.
echo ============================================================
echo   Deployment Complete!
echo ============================================================
echo.
echo Service URLs:
echo ----------------------------------------
echo   Patient App:     http://147.93.108.99:8080
echo   Admin Dashboard: http://147.93.108.99:8081
echo   API Server:      http://147.93.108.99:5002
echo   MongoDB:         mongodb://147.93.108.99:27019
echo ----------------------------------------
echo.
echo Next steps:
echo   1. Test the Patient App: http://147.93.108.99:8080
echo   2. Test the Admin Dashboard: http://147.93.108.99:8081
echo   3. Check API health: http://147.93.108.99:5002/api/v1/health
echo   4. Seed demo data:
echo      docker-compose exec server npx ts-node --transpile-only src/scripts/seed.ts
echo.
echo Useful commands:
echo   View logs:    docker-compose logs -f
echo   Restart:      docker-compose restart
echo   Stop:         docker-compose down
echo.
pause
