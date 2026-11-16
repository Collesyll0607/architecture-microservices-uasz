# UNIVERSITÉ ASSANE SECK DE ZIGUINCHOR
**UFR Sciences & Technologies — Département d'Informatique**  
**Licence 3 Ingénierie Informatique (Année universitaire 2025 – 2026)**

---

## RAPPORT DE DEVOIR
### Mise en œuvre d'une architecture microservices pour la gestion du patrimoine touristique de Ziguinchor
*Module : Développement d'Applications Orientées Services (SOA)*

- **Réalisé par :**
  - Collé SYLL (Matricule : 202300489)
  - Ndeye Thiamba FAYE (Matricule : 202300488)
  - Mame Faty DIOP (Matricule : 202101544)
- **Enseignant responsable :** Dr Lamine FATY

---

## Introduction

Ce document présente le travail réalisé dans le cadre du devoir du module Développement d'Applications Orientées Services en Licence 3 Ingénierie Informatique (L2I). L'objectif du sujet est de construire une application distribuée reposant sur une architecture microservices pour gérer et valoriser les sites patrimoniaux, les circuits touristiques, les événements culturels et les réservations de visites dans la commune de Ziguinchor et en Basse-Casamance.

## 1. Architecture générale de l'application

| Composant | Port | Responsabilité fonctionnelle | Socle technique |
| :--- | :---: | :--- | :--- |
| **ms-patrimoine** | 8081 | Gestion du référentiel des sites patrimoniaux (localisation GPS, historique, capacité). | Spring Boot 3, Spring Data JPA, MySQL |
| **ms-circuit** | 8082 | Gestion des circuits touristiques, des étapes ordonnées et récupération des sites via OpenFeign. | Spring Boot 3, OpenFeign, MapStruct |
| **ms-evenement** | 8083 | Programmation des événements culturels, gestion du nombre de places et des tarifs. | Spring Boot 3, Spring Data JPA, MySQL |
| **ms-reservation** | 8084 | Enregistrement des réservations, génération du pass QR et suivi des paiements. | Spring Boot 3, Spring Data JPA, MySQL |
| **frontend-angular** | 4200 | Interface web destinée aux trois profils : Touriste, Guide et Conservateur. | Angular 17, TypeScript, Bootstrap 5 |

## 2. Structuration par DTO, MapStruct et OpenFeign (TP 2)

Chaque microservice expose des objets de transfert (DTO) convertis par MapStruct à la compilation afin d'éviter le couplage au schéma relationnel et les boucles de sérialisation JSON. Le microservice `ms-circuit` interroge `ms-patrimoine` de manière synchrone via `PatrimoineFeignClient`.

## 3. Conteneurisation et déploiement avec Docker (TP 3)

Chaque microservice possède un `Dockerfile` basé sur `eclipse-temurin:21-jdk`, et le frontend Angular est servi par `nginx:alpine`. L'orchestration de l'ensemble est assurée par `docker-compose.yml`.

## 4. Écrans principaux de l'application

- **Figure 1 :** Page d'accueil du portail *Ziguinchor Tourisme* (`RAPPORT_ILLUSTRATIONS/capture_1_accueil.png`).
- **Figure 2 :** Catalogue des sites patrimoniaux alimenté par `ms-patrimoine` (`RAPPORT_ILLUSTRATIONS/capture_2_catalogue_sites.png`).
- **Figure 3 :** Espace Touriste — suivi des réservations, pass QR et médiation (`RAPPORT_ILLUSTRATIONS/capture_3_espace_touriste.png`).
- **Figure 4 :** Tableau de bord du Conservateur — indicateurs et planification des visites (`RAPPORT_ILLUSTRATIONS/capture_4_dashboard_conservateur.png`).
