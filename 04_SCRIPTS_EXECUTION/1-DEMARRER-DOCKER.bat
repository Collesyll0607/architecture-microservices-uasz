@echo off
chcp 65001 > nul
cls
echo =======================================================================
echo   UNIVERSITE ASSANE SECK DE ZIGUINCHOR - L3 INFORMATIQUE (L2I)
echo   Module : Developpement d'Applications Orientees Services (SOA)
echo   Trinome : Colle SYLL (202300489) - Ndeye Thiamba FAYE (202300488) - Mame Faty DIOP (202101544)
echo =======================================================================
echo.
echo [1/3] Verification de l'environnement Docker...
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas detecte ou Docker Desktop n'est pas demarre.
    echo Veuillez lancer Docker Desktop puis reessayer.
    pause
    exit /b 1
)

echo [2/3] Demarrage du cluster complet via Docker Compose...
cd ..
docker compose up --build -d

echo.
echo [3/3] Verification de l'etat des conteneurs :
docker compose ps

echo.
echo =======================================================================
echo   SYSTEME DEMARRE AVEC SUCCES !
echo.
echo   - Frontend Angular 17 (Exigence)  : http://localhost:4200
echo   - Portail Web Thymeleaf           : http://localhost:8080
echo   - API ms-patrimoine (Port 8081)   : http://localhost:8081/api/patrimoines
echo   - API ms-circuit (Port 8082 Feign): http://localhost:8082/api/circuits
echo   - API ms-evenement (Port 8083)    : http://localhost:8083/api/evenements
echo   - API ms-reservation (Port 8084)  : http://localhost:8084/api/reservations
echo =======================================================================
echo.
echo Ouverture automatique du Frontend Angular dans votre navigateur...
start http://localhost:4200
echo.
pause
