========================================================================
BASE DE DONNEES : patrimoinedb (UTF-8 mb4)
Module : Developpement d'Applications Orientees Services (L3 L2I - UASZ)
Trinome : Colle SYLL (202300489) - Ndeye Thiamba FAYE (202300488) - Mame Faty DIOP (202101544)
========================================================================

1. DEMARRAGE AUTOMATIQUE VIA DOCKER (RECOMMANDE) :
   Si vous lancez le projet avec Docker Compose (`docker compose up --build`),
   le conteneur MySQL `patrimoine-mysql-db` s'initialise automatiquement avec
   ce fichier `init_clean_utf8_data.sql` (8 sites reels de Casamance et 3 circuits).

2. IMPORT MANUEL SOUS XAMPP / PHPMYADMIN (OPTIONNEL) :
   Si vous preferez executer avec votre MySQL local :
   a. Demarrez MySQL sous XAMPP (port 3306).
   b. Ouvrez phpMyAdmin (http://localhost/phpmyadmin).
   c. Creez une base nommée `patrimoinedb` (interclassement utf8mb4_unicode_ci).
   d. Importez le fichier `init_clean_utf8_data.sql`.
========================================================================
