@echo off
chcp 65001 > nul
cls
echo =======================================================================
echo   Arret propre du cluster microservices...
echo =======================================================================
cd ..
docker compose down
echo.
echo Tous les conteneurs sont arretes.
pause
