import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <!-- Si non conservateur : Accès restreint -->
      <div *ngIf="!isConservateur()" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-5">
        <i class="bi bi-shield-lock-fill text-warning display-3 mb-3"></i>
        <h3 class="fw-bold brand-font text-dark mb-2">Accès Réservé au Conservateur (Côté Admin)</h3>
        <p class="text-muted mb-4" style="max-width: 580px; margin: 0 auto;">
          La structure d'architecture distribuée SOA et la supervision technique des microservices sont strictement réservées à l'Administration et au Conservateur du Patrimoine.
        </p>
        <div class="d-flex justify-content-center gap-2">
          <a routerLink="/" class="btn btn-outline-secondary rounded-pill px-4">Retour à l'Accueil</a>
          <a routerLink="/login" class="btn btn-casa-primary rounded-pill px-4">Connexion Conservateur</a>
        </div>
      </div>

      <div *ngIf="isConservateur()">
        <!-- Header -->
        <div class="mb-4 pb-3 border-bottom">
          <span class="badge bg-primary-custom text-white mb-2">Architecture Fonctionnelle & Technique</span>
          <h2 class="fw-bold mb-1">Architecture Distribuée Orientée Services (SOA)</h2>
          <p class="text-muted mb-0">
            Module : Développement d'Applications Orientées Services — Dr Lamine FATY (UASZ - L3 L2I)
          </p>
        </div>

      <!-- Trinôme Card -->
      <div class="card-custom p-4 mb-4 bg-primary-custom text-white">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h5 class="fw-bold mb-2"><i class="bi bi-people-fill me-2"></i>Trinôme d'Ingénierie Étudiante</h5>
            <p class="small text-white-50 mb-0">
              Projet noté de conception, découplage, orchestration Docker et développement frontend Angular.
            </p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <div class="d-inline-block text-start">
              <div><strong>1. Collé SYLL</strong> <span class="badge bg-white text-dark ms-1">202300489</span></div>
              <div><strong>2. Ndeye Thiamba FAYE</strong> <span class="badge bg-white text-dark ms-1">202300488</span></div>
              <div><strong>3. Mame Faty DIOP</strong> <span class="badge bg-white text-dark ms-1">L3 Informatique</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture Diagram (Cards & Flow) -->
      <h4 class="fw-bold text-primary-custom mb-3">
        <i class="bi bi-diagram-3-fill me-2"></i> Schéma d'Orchestration des Microservices
      </h4>

      <div class="row g-3 mb-5">
        <!-- Client Angular -->
        <div class="col-12">
          <div class="card-custom p-3 bg-light border-2 border-primary text-center">
            <div class="badge bg-danger mb-1">FRONTEND CLIENT</div>
            <h5 class="fw-bold mb-1">Application Web Angular 17 (Port 4200 / 80 Nginx)</h5>
            <small class="text-muted">Consommation REST via HttpClient (RxJS), composants autonomes (Standalone), responsive design Bootstrap 5</small>
          </div>
          <div class="text-center my-2 fs-4 text-muted"><i class="bi bi-arrow-down-up"></i> Appels HTTP REST / JSON Asynchrones</div>
        </div>

        <!-- 4 Microservices -->
        <div class="col-md-3">
          <div class="card-custom p-3 h-100 border-start border-4 border-success">
            <div class="badge bg-success mb-2">MICROSERVICE 1</div>
            <h6 class="fw-bold text-success">ms-patrimoine</h6>
            <div class="small text-muted mb-2">Port : <strong>8081</strong></div>
            <p class="small text-secondary mb-2">Gestion du catalogue des 8 sites écotouristiques de Casamance.</p>
            <span class="badge bg-light text-dark border small">Spring Data JPA • DTOs</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-custom p-3 h-100 border-start border-4 border-warning">
            <div class="badge bg-warning text-dark mb-2">MICROSERVICE 2</div>
            <h6 class="fw-bold text-warning-emphasis">ms-circuit</h6>
            <div class="small text-muted mb-2">Port : <strong>8082</strong></div>
            <p class="small text-secondary mb-2">Itinéraires touristiques et étapes séquentielles enrichies.</p>
            <span class="badge bg-warning-subtle text-dark border border-warning small">OpenFeign vers 8081</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-custom p-3 h-100 border-start border-4 border-info">
            <div class="badge bg-info text-dark mb-2">MICROSERVICE 3</div>
            <h6 class="fw-bold text-info-emphasis">ms-evenement</h6>
            <div class="small text-muted mb-2">Port : <strong>8083</strong></div>
            <p class="small text-secondary mb-2">Agenda culturel des fêtes, régates et manifestations artistiques.</p>
            <span class="badge bg-info-subtle text-dark border border-info small">REST Controller • JPA</span>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card-custom p-3 h-100 border-start border-4 border-primary">
            <div class="badge bg-primary mb-2">MICROSERVICE 4</div>
            <h6 class="fw-bold text-primary">ms-reservation</h6>
            <div class="small text-muted mb-2">Port : <strong>8084</strong></div>
            <p class="small text-secondary mb-2">Enregistrement des réservations touristiques et jetons QR.</p>
            <span class="badge bg-primary-subtle text-dark border border-primary small">CRUD • Transactional</span>
          </div>
        </div>

        <!-- Base de données -->
        <div class="col-12 mt-2">
          <div class="text-center my-2 fs-4 text-muted"><i class="bi bi-arrow-down-up"></i> Connexion JDBC Hibernate</div>
          <div class="card-custom p-3 bg-dark text-white text-center">
            <div class="badge bg-light text-dark mb-1">PERSISTANCE DEDIEE</div>
            <h5 class="fw-bold mb-1">Serveur de Base de Données MySQL (patrimoinedb - Port 3306)</h5>
            <small class="text-white-50">Schémas relationnels avec jeux de données UTF-8 réels et indexations optimisées</small>
          </div>
        </div>
      </div>

      <!-- Synthèse des Travaux Pratiques Réalisés -->
      <h4 class="fw-bold text-primary-custom mb-3">
        <i class="bi bi-check2-circle me-2"></i> Synthèse des TP & Exigences du Professeur
      </h4>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="card-custom p-3 h-100">
            <h6 class="fw-bold text-primary-custom">TP 1 : Découplage Microservices</h6>
            <p class="small text-muted">
              Séparation de l'application monolithique en 4 microservices indépendants dotés de leurs propres contextes Spring Boot 3 et ports réseau distincts (8081, 8082, 8083, 8084).
            </p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-custom p-3 h-100">
            <h6 class="fw-bold text-accent-custom">TP 2 : DTOs, MapStruct & OpenFeign</h6>
            <p class="small text-muted">
              Implémentation du pattern DTO avec MapStruct pour isoler les entités JPA. Mise en place de Spring Cloud OpenFeign pour la communication synchrone inter-services (<code>ms-circuit</code> appelle <code>ms-patrimoine</code>).
            </p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card-custom p-3 h-100">
            <h6 class="fw-bold text-success">TP 3 : Docker & Orchestration Multi-conteneurs</h6>
            <p class="small text-muted">
              Conteneurisation via Dockerfiles (Eclipse Temurin 21) et orchestration unifiée par <code>docker-compose.yml</code> avec réseau bridge dédié et résolutions DNS internes.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class ArchitectureComponent {
  private authService = inject(AuthService);

  isConservateur(): boolean {
    return this.authService.hasRole('CONSERVATEUR') || this.authService.hasRole('ADMIN');
  }
}
