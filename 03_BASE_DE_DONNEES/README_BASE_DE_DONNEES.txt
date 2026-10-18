========================================================================
BASE DE DONNÉES : patrimoinedb
Module : Développement d'Applications Orientées Services (L3 L2I - UASZ)
Binôme : Collé SYLL (202300489) & Ndeye Thiamba FAYE (202300488)
========================================================================

1. DÉMARRAGE AUTOMATIQUE AVEC DOCKER (RECOMMANDÉ) :
   Si vous lancez le projet avec Docker Compose (`docker compose up --build`),
   vous n'avez STRICTEMENT RIEN À FAIRE !
   Le conteneur MySQL `patrimoine-mysql-db` s'initialise automatiquement avec
   ce fichier `init_clean_utf8_data.sql`.

2. IMPORT MANUEL SOUS XAMPP / PHPMYADMIN (OPTIONNEL) :
   Si vous préférez exécuter l'application avec votre serveur MySQL XAMPP local :
   a. Démarrez MySQL sous XAMPP (port 3306).
   b. Ouvrez phpMyAdmin (http://localhost/phpmyadmin).
   c. Créez une base de données nommée `patrimoinedb` avec l'interclassement `utf8mb4_unicode_ci`.
   d. Cliquez sur l'onglet 'Importer' et sélectionnez le fichier `init_clean_utf8_data.sql`.
   e. Cliquez sur 'Exécuter'.
========================================================================
