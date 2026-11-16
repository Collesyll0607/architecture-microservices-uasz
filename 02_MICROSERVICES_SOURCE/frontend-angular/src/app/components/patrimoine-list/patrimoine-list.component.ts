import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PatrimoineService } from '../../services/patrimoine.service';
import { AuthService } from '../../services/auth.service';
import { Patrimoine } from '../../models/patrimoine.model';
import { CarteModalComponent } from '../carte-modal/carte-modal.component';

@Component({
  selector: 'app-patrimoine-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CarteModalComponent],
  template: `
    <main class="container my-4 flex-grow-1">

      <!-- Hero Section : Paysage & Esprit Casamançais (Exactement comme liste.html version 1) -->
      <div class="hero-casamance text-center text-lg-start">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <span class="badge px-3 py-2 rounded-pill mb-3" style="background: rgba(217, 119, 36, 0.9); font-weight: 600; letter-spacing: 0.5px;">
              <i class="bi bi-water me-1"></i> AU CŒUR DES BOLONGS & DU FLEUVE
            </span>
            <h1 class="hero-title">Patrimoine & Trésors de Ziguinchor</h1>
            <p class="hero-subtitle ms-0">
              Explorez l'héritage vivant de la Casamance : de l'architecture coloniale de l'Escale aux villages d'artisans, des forêts sacrées aux berges majestueuses du fleuve.
            </p>
            <div class="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start">
              <div class="hero-stats-badge">
                <i class="bi bi-shield-check text-warning"></i>
                <span>{{ filteredPatrimoines.length }}</span> Sites Répertoriés
              </div>
              <div class="hero-stats-badge">
                <i class="bi bi-compass text-info"></i>
                Circuits Écotouristiques Disponibles
              </div>
            </div>
          </div>
          <div class="col-lg-4 text-center d-none d-lg-block">
            <div class="p-3 bg-white bg-opacity-10 rounded-4 border border-white border-opacity-25 backdrop-blur shadow-lg">
              <i class="bi bi-tree-fill display-3 text-warning d-block mb-2"></i>
              <h6 class="fw-bold text-white mb-1">Écotourisme & Mémoire</h6>
              <small class="text-white-50">Immersion authentique et préservation culturelle</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Boîte de Recherche & Filtrage Raffinée (Comme la première version) -->
      <div class="filter-box-casa">
        <div class="row g-3 align-items-center">
          <div class="col-md-5">
            <label class="form-label small fw-bold text-secondary mb-1">
              <i class="bi bi-search me-1 text-success"></i> Rechercher un site
            </label>
            <input type="text" [(ngModel)]="searchTerm" class="form-control filter-input" 
                   placeholder="Ex: Alliance, Boudody, Santhiaba, Cases...">
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-bold text-secondary mb-1">
              <i class="bi bi-filter me-1 text-success"></i> Catégorie patrimoniale
            </label>
            <select [(ngModel)]="selectedCategory" class="form-select filter-input">
              <option value="">Toutes les catégories</option>
              <option value="HISTORIQUE">Patrimoine Historique & Colonial</option>
              <option value="RELIGIEUX">Édifices Religieux & Sacrés</option>
              <option value="NATUREL">Sites Naturels & Bolongs</option>
              <option value="CULTUREL">Artisanat & Mémoire Vivante</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end gap-2">
            <button class="btn btn-casa-primary flex-grow-1" (click)="resetFilters()">
              <i class="bi bi-arrow-clockwise me-1"></i> Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Loading / Error states -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status"></div>
        <p class="mt-2 text-muted">Chargement des patrimoines depuis ms-patrimoine...</p>
      </div>

      <div *ngIf="error" class="alert alert-danger shadow-sm rounded-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Impossible de joindre le catalogue des patrimoines. Vérifiez votre connexion.
      </div>

      <!-- Patrimoine Cards Grid (Style card-site-casa de la première version) -->
      <div class="row row-cols-1 row-cols-md-3 g-4" *ngIf="!loading && !error">
        <div class="col" *ngFor="let p of filteredPatrimoines">
          <div class="card-site-casa">
            
            <!-- Wrapper Image avec badges -->
            <div class="site-img-wrapper">
              <img [src]="getImageForPatrimoine(p)" [alt]="p.nomPatrimoine" (error)="onImageError($event)" loading="lazy">
              <span class="site-badge-category">PATRIMOINE</span>
              <span class="site-badge-code">{{ p.codePatrimoine }}</span>
            </div>

            <!-- Corps de la carte -->
            <div class="card-site-body">
              <h5 class="site-title">{{ p.nomPatrimoine }}</h5>
              <div class="site-location">
                <i class="bi bi-geo-alt-fill text-danger"></i>
                <span>{{ p.adressePatrimoine }}</span>
              </div>
              <p class="site-description">
                {{ truncate(p.descriptionPatrimoine, 120) }}
              </p>
              
              <div class="site-card-footer">
                <span class="site-price">Entrée Libre</span>
                <div class="d-flex gap-1 flex-wrap justify-content-end align-items-center">
                  <button class="btn btn-sm btn-outline-primary rounded-pill px-2" (click)="carteLieu = p.nomPatrimoine" title="Voir sur la Carte GPS">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> Carte
                  </button>
                  <button class="btn btn-sm btn-outline-success rounded-pill px-2" (click)="selectedPatrimoine = p" data-bs-toggle="modal" data-bs-target="#detailModal">
                    <i class="bi bi-eye"></i> Aperçu
                  </button>
                  <!-- Réservation : Uniquement pour les touristes -->
                  <a *ngIf="isTouriste()" [routerLink]="['/reservations']" [queryParams]="{type: 'PATRIMOINE', id: p.id, titre: p.nomPatrimoine}" class="btn btn-sm btn-casa-ochre rounded-pill px-2">
                    Réserver
                  </a>
                  <!-- Badge indicatif pour Guide (pas de réservation) -->
                  <span *ngIf="isGuide()" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill py-2 px-2 small">
                    <i class="bi bi-check2-circle me-1"></i> Aperçu Guide
                  </span>
                  <!-- Badge indicatif pour Conservateur (pas de réservation) -->
                  <span *ngIf="isConservateur()" class="badge bg-warning-subtle text-dark border border-warning-subtle rounded-pill py-2 px-2 small">
                    <i class="bi bi-shield-check me-1"></i> Inventaire
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Detail Modal with Photo & Historique -->
      <div class="modal fade" id="detailModal" tabindex="-1" aria-hidden="true" *ngIf="selectedPatrimoine">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="position-relative" style="height: 280px; overflow: hidden; background-color: #16382C;">
              <img [src]="getImageForPatrimoine(selectedPatrimoine)" [alt]="selectedPatrimoine.nomPatrimoine" class="w-100 h-100" style="object-fit: cover;">
              <div class="position-absolute bottom-0 start-0 w-100 p-3 text-white" style="background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%);">
                <span class="badge bg-warning text-dark mb-1">{{ selectedPatrimoine.codePatrimoine }}</span>
                <h4 class="fw-bold text-white mb-0 brand-font">{{ selectedPatrimoine.nomPatrimoine }}</h4>
              </div>
              <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-4">
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                  <i class="bi bi-people-fill me-1"></i> Capacité d'accueil : {{ selectedPatrimoine.capacitePatrimoine }} personnes
                </span>
                <span class="badge bg-light text-dark border px-3 py-2 rounded-pill">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i> {{ selectedPatrimoine.adressePatrimoine }}
                </span>
              </div>
              
              <h6 class="fw-bold text-muted small text-uppercase mb-2">Description Écotouristique</h6>
              <p class="text-secondary mb-3">{{ selectedPatrimoine.descriptionPatrimoine }}</p>

              <h6 class="fw-bold text-muted small text-uppercase mb-2" *ngIf="selectedPatrimoine.historiquePatrimoine">Repères Historiques & Culturels</h6>
              <div class="p-3 bg-light rounded-3 border mb-3" *ngIf="selectedPatrimoine.historiquePatrimoine">
                <p class="text-dark small mb-0">{{ selectedPatrimoine.historiquePatrimoine }}</p>
              </div>

              <div class="d-flex justify-content-end gap-2 pt-3 border-top">
                <button type="button" class="btn btn-outline-secondary rounded-pill" data-bs-dismiss="modal">Fermer</button>
                <a *ngIf="isTouriste()" [routerLink]="['/reservations']" [queryParams]="{type: 'PATRIMOINE', id: selectedPatrimoine.id, titre: selectedPatrimoine.nomPatrimoine}" data-bs-dismiss="modal" class="btn btn-casa-primary rounded-pill">
                  <i class="bi bi-ticket-perforated me-1"></i> Réserver une Visite
                </a>
                <a *ngIf="isGuide()" routerLink="/profil" data-bs-dismiss="modal" class="btn btn-success rounded-pill">
                  <i class="bi bi-calendar-check me-1"></i> Voir mon Agenda de Guide
                </a>
                <a *ngIf="isConservateur()" routerLink="/profil" data-bs-dismiss="modal" class="btn btn-warning rounded-pill fw-bold">
                  <i class="bi bi-plus-circle me-1"></i> Planifier dans mon Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Carte & Géolocalisation -->
      <app-carte-modal *ngIf="carteLieu" [titre]="'Localisation : ' + carteLieu" [nomLieu]="carteLieu" (fermer)="carteLieu = null"></app-carte-modal>

    </main>
  `
})
export class PatrimoineListComponent implements OnInit {
  private patrimoineService = inject(PatrimoineService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  patrimoines: Patrimoine[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  loading: boolean = true;
  error: boolean = false;
  selectedPatrimoine: Patrimoine | null = null;
  carteLieu: string | null = null;

  isTouriste(): boolean {
    return this.authService.hasRole('TOURISTE') || (!this.isGuide() && !this.isConservateur());
  }

  isGuide(): boolean {
    return this.authService.hasRole('GUIDE');
  }

  isConservateur(): boolean {
    return this.authService.hasRole('CONSERVATEUR') || this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
      }
    });

    this.patrimoineService.getAll().subscribe({
      next: (data) => {
        this.patrimoines = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  get filteredPatrimoines(): Patrimoine[] {
    return this.patrimoines.filter(p => {
      const matchSearch = !this.searchTerm ||
        (p.nomPatrimoine && p.nomPatrimoine.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.adressePatrimoine && p.adressePatrimoine.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (p.descriptionPatrimoine && p.descriptionPatrimoine.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchCategory = !this.selectedCategory ||
        (p.descriptionPatrimoine && p.descriptionPatrimoine.toLowerCase().includes(this.selectedCategory.toLowerCase())) ||
        (p.nomPatrimoine && p.nomPatrimoine.toLowerCase().includes(this.selectedCategory.toLowerCase()));

      return matchSearch && matchCategory;
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
  }

  truncate(str: string | undefined, max: number): string {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/casamance/bras_de_mer.jpg';
  }

  getImageForPatrimoine(p: Patrimoine): string {
    const nom = (p.nomPatrimoine || '').toLowerCase();
    const code = (p.codePatrimoine || '').toLowerCase();
    if (nom.includes('alliance') || code.includes('001')) return '/assets/images/casamance/alliance_francaise.jpg';
    if (nom.includes('boudody') || nom.includes('port') || code.includes('002')) return '/assets/images/casamance/port_boudody.jpg';
    if (nom.includes('cathedrale') || nom.includes('antoine') || code.includes('003')) return '/assets/images/casamance/cathedrale_saint_antoine.jpg';
    if (nom.includes('village artisanal') || nom.includes('artisanal') || code.includes('004')) return '/assets/images/casamance/village_artisanal.jpg';
    if (nom.includes('joola') || nom.includes('mémorial') || nom.includes('memorial') || code.includes('005')) return '/assets/images/casamance/memorial_joola.jpg';
    if (nom.includes('bolong') || nom.includes('mangrove') || code.includes('006')) return '/assets/images/casamance/bolong_mangrove.jpg';
    if (nom.includes('mlomp') || nom.includes('case') || code.includes('007')) return '/assets/images/casamance/cases_mlomp.jpg';
    if (nom.includes('carabane') || code.includes('008')) return '/assets/images/casamance/carabane_bolong.jpg';
    if (nom.includes('marche') || nom.includes('saint-maur')) return '/assets/images/casamance/marche_saint_maur.jpg';
    if (nom.includes('gouvernance')) return '/assets/images/casamance/gouvernance_ziguinchor.jpg';
    return '/assets/images/casamance/bras_de_mer.jpg';
  }
}
