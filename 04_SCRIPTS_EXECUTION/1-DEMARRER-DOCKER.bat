@echo off
chcp 65001 > nul
cls
echo =======================================================================
echo   UNIVERSITE ASSANE SECK DE ZIGUINCHOR - L3 INFORMATIQUE (L2I)
echo   Module : Développement d'Applications Orientées Services
echo   Binôme : Collé SYLL (202300489) & Ndeye Thiamba FAYE (202300488)
echo =======================================================================
echo.
echo [1/3] Vérification de l'environnement Docker...
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas détecté ou n'est pas démarré sur votre machine.
    echo Veuillez lancer Docker Desktop puis réexécuter ce script.
    pause
    exit /b 1
)

echo [2/3] Démarrage du cluster distribué via Docker Compose...
cd ..
docker compose up --build -d

echo.
echo [3/3] Vérification de l'état des conteneurs :
docker compose ps

echo.
echo =======================================================================
echo   SYSTÈME DÉMARRÉ AVEC SUCCÈS !
echo.
echo   - Portail Web Touristique : http://localhost:8080
echo   - API ms-patrimoine      : http://localhost:8081/api/patrimoines
echo   - API ms-circuit         : http://localhost:8082/api/circuits/enrichis
echo   - API ms-evenement       : http://localhost:8083/api/evenements
echo   - API ms-reservation     : http://localhost:8084/api/reservations
echo =======================================================================
echo.
echo Ouverture automatique du portail Web dans votre navigateur...
start http://localhost:8080
echo.
pause
