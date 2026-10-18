@echo off
chcp 65001 > nul
cls
echo =======================================================================
echo   Arrêt des conteneurs du projet...
echo =======================================================================
cd ..
docker compose down
echo.
echo Tous les conteneurs sont arrêtés proprement.
pause
