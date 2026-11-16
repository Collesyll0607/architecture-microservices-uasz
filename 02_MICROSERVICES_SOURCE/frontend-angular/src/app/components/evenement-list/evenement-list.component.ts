import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EvenementService } from '../../services/evenement.service';
import { AuthService } from '../../services/auth.service';
import { Evenement } from '../../models/evenement.model';

@Component({
  selector: 'app-evenement-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="container my-5 flex-grow-1">

      <!-- Hero Header Événements (Exactement comme evenements.html version 1) -->
      <div class="rounded-4 p-4 p-md-5 mb-5 shadow-sm text-white position-relative overflow-hidden" 
           style="background: linear-gradient(135deg, rgba(22, 56, 44, 0.88), rgba(217, 119, 36, 0.82)), url('/assets/images/casamance/alliance_francaise.jpg') center/cover no-repeat;">
        <div class="position-relative" style="z-index: 2; max-width: 680px;">
          <span class="badge px-3 py-2 rounded-pill mb-2" style="background: var(--casa-green-deep); color: white;">
            <i class="bi bi-calendar-event me-1"></i> AGENDA CULTUREL & MANIFESTATIONS
          </span>
          <h1 class="display-6 fw-bold mb-2 brand-font">
            Événements & Célébrations de Casamance
          </h1>
          <p class="mb-0 text-white-50 lead" style="font-size: 1.05rem;">
            Expositions artistiques, festivals de danses traditionnelles, ateliers d'artisanat et rencontres mémorielles au cœur de Ziguinchor.
          </p>
        </div>
      </div>

      <!-- Titre Section & Retour -->
      <div class="mb-4 pb-2 border-bottom d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <span class="badge bg-danger-subtle text-danger border border-danger-subtle mb-1">Manifestations Officielles</span>
          <h2 class="fw-bold mb-0 brand-font" style="color: var(--casa-green-deep);">
            Programme des Événements
          </h2>
        </div>
        <a routerLink="/" class="btn btn-outline-secondary btn-sm rounded-pill">
          <i class="bi bi-arrow-left me-1"></i> Retour à l'accueil
        </a>
      </div>

      <!-- Loading / Error states -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status"></div>
        <p class="mt-2 text-muted">Chargement de l'agenda culturel depuis ms-evenement...</p>
      </div>

      <div *ngIf="error" class="alert alert-warning rounded-3 shadow-sm mb-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> Le microservice des événements (ms-evenement) est momentanément inaccessible.
      </div>

      <!-- Grid des événements (Structure conforme à evenements.html de la première version) -->
      <div class="row row-cols-1 row-cols-md-2 g-4" *ngIf="!loading && !error && evenements.length > 0">
        <div class="col" *ngFor="let e of evenements">
          <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
            
            <!-- Couverture Image Événement -->
            <div style="height: 180px; position: relative; overflow: hidden; background-color: #16382C;">
              <img [src]="getEventImage(e)" [alt]="e.titre" (error)="onImageError($event)" style="width: 100%; height: 100%; object-fit: cover;">
              <div class="position-absolute top-0 start-0 m-3">
                <span class="badge bg-dark bg-opacity-75 text-white font-monospace px-3 py-1">
                  {{ e.code }}
                </span>
              </div>
              <div class="position-absolute top-0 end-0 m-3">
                <span class="badge bg-warning text-dark px-3 py-1 rounded-pill fw-semibold shadow-sm">
                  {{ e.typeEvenement }}
                </span>
              </div>
            </div>

            <!-- Corps de la carte -->
            <div class="p-4 d-flex flex-column flex-grow-1">
              <h4 class="fw-bold mb-2 brand-font" style="color: var(--casa-green-deep);">
                {{ e.titre }}
              </h4>
              <p class="text-secondary small mb-3 flex-grow-1">
                {{ e.description }}
              </p>

              <div class="mb-3 text-muted small bg-light p-3 rounded-3 border">
                <div><i class="bi bi-geo-alt-fill text-danger me-1"></i> Lieu : <strong class="text-dark">{{ e.lieuPrecis }}</strong></div>
                <div class="mt-1">
                  <i class="bi bi-cash me-1 text-success"></i> 
                  Tarif : <strong class="text-dark">{{ e.tarifEntree == 0 ? 'Gratuit / Entrée Libre' : (e.tarifEntree + ' FCFA') }}</strong>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                  <i class="bi bi-ticket-perforated me-1"></i>
                  Places : <strong>{{ (e.placesMax - e.placesOccupees) > 0 ? (e.placesMax - e.placesOccupees) : 10 }}</strong> max
                </span>
                <a *ngIf="isTouriste()" [routerLink]="['/reservations']" 
                   [queryParams]="{type: 'EVENEMENT', id: e.id, titre: e.titre}" 
                   class="btn btn-casa-ochre btn-sm rounded-pill px-3">
                  Réserver sa place <i class="bi bi-ticket ms-1"></i>
                </a>
                <span *ngIf="!isTouriste()" class="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                  <i class="bi bi-calendar-check me-1"></i> Événement au Calendrier
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div *ngIf="evenements.length === 0 && !loading && !error" class="card border-0 shadow-sm p-5 text-center bg-white rounded-4">
        <i class="bi bi-calendar-x fs-1 text-muted mb-2"></i>
        <h5 class="fw-bold text-secondary">Aucun événement planifié</h5>
        <p class="text-muted mb-0">Revenez bientôt pour découvrir les prochaines manifestations culturelles de la région.</p>
      </div>

    </main>
  `
})
export class EvenementListComponent implements OnInit {
  private evenementService = inject(EvenementService);
  private authService = inject(AuthService);

  isTouriste(): boolean {
    return this.authService.hasRole('TOURISTE') || (!this.authService.hasRole('GUIDE') && !this.authService.hasRole('CONSERVATEUR') && !this.authService.hasRole('ADMIN'));
  }

  evenements: Evenement[] = [];
  loading: boolean = true;
  error: boolean = false;

  ngOnInit(): void {
    this.evenementService.getAll().subscribe({
      next: (data) => {
        this.evenements = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/casamance/bras_de_mer.jpg';
  }

  getEventImage(e: Evenement): string {
    const titre = (e.titre || '').toLowerCase();
    const code = (e.code || '').toLowerCase();
    if (titre.includes('art') || titre.includes('rythme') || titre.includes('festival') || code.includes('01')) return '/assets/images/casamance/culture_casamance.jpg';
    if (titre.includes('vannerie') || titre.includes('poterie') || titre.includes('atelier') || code.includes('02')) return '/assets/images/casamance/artisanat_senegal_real.jpg';
    if (titre.includes('régate') || titre.includes('regate') || titre.includes('pirogue') || code.includes('003')) return '/assets/images/casamance/pirogue_fleuve.jpg';
    if (titre.includes('joola') || titre.includes('résilience') || titre.includes('resilience') || titre.includes('mémoire') || code.includes('004')) return '/assets/images/casamance/memorial_joola.jpg';
    return '/assets/images/casamance/alliance_francaise.jpg';
  }
}
