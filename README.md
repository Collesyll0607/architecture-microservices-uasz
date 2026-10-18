# Plateforme Microservices Distribuée — Devoir Noté

> **Université Assane SECK de Ziguinchor (UASZ)**  
> **UFR des Sciences et Technologies — Département Informatique**  
> **Licence 3 - Informatique (L2I) — Année Académique 2025-2026**  
> **Module : Développement d'Applications Orientées Services**  
> **Enseignant : Dr Lamine FATY**  
> 
> **Binôme d'étudiants :**  
> - **Collé SYLL** — Matricule : `202300489`  
> - **Ndeye Thiamba FAYE** — Matricule : `202300488`  

---

## 📌 1. Vue d'Ensemble du Projet

Ce projet concrétise la transition d'une application patrimoniale monolithique vers une **architecture microservices distribuée, découplée et conteneurisée**, réalisée à travers les trois Travaux Pratiques du cours :

1. **TP 1 (Persistance relationnelle)** : Utilisation de **Spring Data JPA** et Hibernate pour la gestion des entités et des repositories.
2. **TP 2 (Découplage & Communication)** : Sécurisation par **DTOs**, génération des mappers avec **MapStruct**, et communication synchrone déclarative avec **Spring Cloud OpenFeign** en respectant la règle d'isolation du Slide 28.
3. **TP 3 (Déploiement)** : Standardisation par **Dockerfiles** (Java 21 LTS) avec étiquetage `collesyll/*:v1` et orchestration multi-conteneurs via **Docker Compose**.

---

## 🗂️ 2. Structure Intuitive du Dossier

```
DEVOIR_SERVICES_SYLL_FAYE/
│
├── 01_RAPPORT_ET_COMPTE_RENDU/
│   ├── COMPTE_RENDU_DEVOIR_SERVICES_SYLL_FAYE.docx    <- Rapport Word officiel conforme au template
│   └── COMPTE_RENDU_DEVOIR_SERVICES_SYLL_FAYE.pdf     <- Version PDF haute définition
│
├── 02_MICROSERVICES_SOURCE/
│   ├── pom.xml                                        <- Parent POM Maven multi-modules
│   ├── ms-patrimoine/                                 <- Microservice Patrimoine (Port 8081)
│   ├── ms-circuit/                                    <- Microservice Circuit + Feign (Port 8082)
│   ├── ms-evenement/                                  <- Microservice Événement (Port 8083)
│   ├── ms-reservation/                                <- Microservice Réservation (Port 8084)
│   └── patrimoine-touristique-web/                    <- Portail Web Frontend (Port 8080)
│
├── 03_BASE_DE_DONNEES/
│   ├── init_clean_utf8_data.sql                       <- Données et tables complètes (UTF-8)
│   └── README_BASE_DE_DONNEES.txt                     <- Guide d'import si XAMPP manuel
│
├── 04_SCRIPTS_EXECUTION/
│   ├── 1-DEMARRER-DOCKER.bat                          <- Lancement 1-clic pour Windows
│   ├── 2-ARRETER-DOCKER.bat                           <- Arrêt propre pour Windows
│   ├── demarrer-docker.sh                             <- Lancement pour Linux / macOS
│   └── arreter-docker.sh                              <- Arrêt pour Linux / macOS
│
├── docker-compose.yml                                 <- Orchestration 100% autonome (MySQL inclus)
├── docker-compose-xampp.yml                           <- Variante pour MySQL XAMPP externe
├── LISEZ-MOI_DEMARRAGE.txt                            <- Guide rapide texte brut
└── README.md                                          <- Ce document
```

---

## 🚀 3. Guide de Démarrage Rapide

### Option A : Déploiement 1-Clic avec Docker (Recommandé)

Aucune configuration préalable n'est nécessaire hormis Docker Desktop :

1. Entrez dans le dossier `04_SCRIPTS_EXECUTION`.
2. Double-cliquez sur `1-DEMARRER-DOCKER.bat` (ou tapez `docker compose up --build -d` à la racine).
3. Le conteneur MySQL et les 5 microservices s'initialisent automatiquement.
4. Rendez-vous sur votre navigateur à l'adresse : **[http://localhost:8080](http://localhost:8080)**.

### Option B : Déploiement avec XAMPP MySQL local

Si vous préférez utiliser votre propre serveur MySQL XAMPP :
1. Démarrez MySQL sous XAMPP (port 3306).
2. Créez la base `patrimoinedb` et importez `03_BASE_DE_DONNEES/init_clean_utf8_data.sql`.
3. Lancez la commande suivante à la racine :
   ```bash
   docker compose -f docker-compose-xampp.yml up --build -d
   ```

---

## 🌐 4. Cartographie des Services et Endpoints

| Service | Port | Image Docker | URL d'accès / Endpoints principaux |
| :--- | :---: | :--- | :--- |
| **patrimoine-touristique-web** | `8080` | `collesyll/patrimoine-web:v1` | [http://localhost:8080](http://localhost:8080) |
| **ms-patrimoine** | `8081` | `collesyll/patrimoines:v1` | `GET http://localhost:8081/api/patrimoines`<br>`GET http://localhost:8081/api/patrimoines/1` |
| **ms-circuit** | `8082` | `collesyll/circuits:v1` | `GET http://localhost:8082/api/circuits/enrichis`<br>`GET http://localhost:8082/api/circuits/1/patrimoines` |
| **ms-evenement** | `8083` | `collesyll/evenements:v1` | `GET http://localhost:8083/api/evenements` |
| **ms-reservation** | `8084` | `collesyll/reservations:v1` | `GET http://localhost:8084/api/reservations` |
| **patrimoine-mysql-db** | `3307` | `mysql:8.0` | `jdbc:mysql://localhost:3307/patrimoinedb` |

---

## 🛑 5. Arrêt du Système

Pour arrêter et nettoyer les conteneurs :
- Double-cliquez sur `04_SCRIPTS_EXECUTION/2-ARRETER-DOCKER.bat`
- Ou tapez : `docker compose down`
