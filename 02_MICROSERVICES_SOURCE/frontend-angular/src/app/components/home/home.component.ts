import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatrimoineService } from '../../services/patrimoine.service';
import { CircuitService } from '../../services/circuit.service';
import { EvenementService } from '../../services/evenement.service';
import { Patrimoine } from '../../models/patrimoine.model';
import { Circuit } from '../../models/circuit.model';
import { Evenement } from '../../models/evenement.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- 1. GRANDE SECTION D'INTRODUCTION HERO (Pleine Largeur - SANS structure de colonne) -->
    <section class="hero-casamance text-center text-white position-relative py-5 mb-0" 
             style="border-radius: 0; min-height: 480px; display: flex; align-items: center; justify-content: center;">
      <div class="container py-4 position-relative" style="z-index: 2; max-width: 900px;">
        <span class="badge px-3 py-2 rounded-pill mb-3 shadow-sm" style="background: var(--casa-ochre); color: white; font-weight: 600; letter-spacing: 0.5px;">
          <i class="bi bi-geo-alt-fill me-1"></i> RÉGION DE CASAMANCE — SÉNÉGAL
        </span>
        <h1 class="hero-title display-4 fw-bold mb-3">
          Découvrez le Patrimoine Vivant de Ziguinchor
        </h1>
        <p class="hero-subtitle lead mb-4 text-white-90" style="max-width: 760px;">
          Bienvenue sur le portail officiel de valorisation touristique. Entre fleuve majestueux, architecture coloniale, villages d'artisans d'art et forêts sacrées, plongez dans l'authenticité de la Casamance.
        </p>

        <!-- Barre de recherche rapide intégrée (Comme la première version) -->
        <div class="d-flex justify-content-center mb-4">
          <div class="p-2 bg-white rounded-pill shadow-lg d-flex gap-2 w-100" style="max-width: 580px;">
            <input type="text" [(ngModel)]="searchKeyword" (keyup.enter)="onSearch()" 
                   class="form-control border-0 rounded-pill ps-3 shadow-none text-dark" 
                   placeholder="Rechercher un monument, quartier, musée...">
            <button (click)="onSearch()" class="btn btn-casa-primary rounded-pill px-4 text-nowrap shadow-sm">
              <i class="bi bi-search me-1"></i> Explorer
            </button>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-4 justify-content-center align-items-center text-white-90 small">
          <span><i class="bi bi-check2-circle text-warning me-1"></i> Données certifiées</span>
          <span><i class="bi bi-check2-circle text-warning me-1"></i> Guides professionnels locaux</span>
          <span><i class="bi bi-check2-circle text-warning me-1"></i> Réservation directe avec e-Pass QR</span>
        </div>
      </div>
    </section>

    <!-- 2. SÉLECTION DES SITES PATRIMONIAUX (Données Réelles ms-patrimoine) -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <span class="text-uppercase fw-bold text-success small">Trésors Incontournables</span>
            <h2 class="fw-bold mb-0 brand-font" style="color: var(--casa-green-deep);">Sites & Monuments Majeurs</h2>
          </div>
          <a routerLink="/patrimoines" class="btn btn-outline-success btn-sm rounded-pill px-3">
            Voir tout le catalogue ({{ sites.length }} sites) <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>

        <div class="row row-cols-1 row-cols-md-3 g-4" *ngIf="sites.length > 0">
          <div class="col" *ngFor="let p of sitesSelection">
            <div class="card-site-casa">
              <div class="site-img-wrapper">
                <img [src]="getImageForPatrimoine(p)" [alt]="p.nomPatrimoine" (error)="onImageError($event)" loading="lazy">
                <span class="site-badge-category">PATRIMOINE</span>
                <span class="site-badge-code">{{ p.codePatrimoine }}</span>
              </div>
              <div class="card-site-body">
                <h5 class="site-title">{{ p.nomPatrimoine }}</h5>
                <div class="site-location">
                  <i class="bi bi-geo-alt-fill text-danger"></i>
                  <span>{{ p.adressePatrimoine }}</span>
                </div>
                <p class="site-description">
                  {{ truncate(p.descriptionPatrimoine, 110) }}
                </p>
                <div class="site-card-footer">
                  <span class="site-price">Entrée Libre</span>
                  <a *ngIf="isTouriste()" [routerLink]="['/reservations']" [queryParams]="{type: 'PATRIMOINE', id: p.id, titre: p.nomPatrimoine}" 
                     class="btn btn-sm btn-outline-success rounded-pill px-3">
                    Explorer & Réserver <i class="bi bi-arrow-right"></i>
                  </a>
                  <a *ngIf="!isTouriste()" routerLink="/patrimoines" 
                     class="btn btn-sm btn-outline-success rounded-pill px-3">
                    Aperçu du Site <i class="bi bi-eye"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-4" *ngIf="sites.length === 0">
          <div class="spinner-border text-success" role="status"></div>
          <p class="text-muted small mt-2">Chargement des patrimoines de Ziguinchor...</p>
        </div>
      </div>
    </section>

    <!-- 3. CIRCUITS TOURISTIQUES RECOMMANDÉS (ms-circuit) -->
    <section class="py-5" style="background: var(--casa-cream);">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <span class="text-uppercase fw-bold text-warning small">Parcours & Itinéraires</span>
            <h2 class="fw-bold mb-0 brand-font" style="color: var(--casa-green-deep);">Circuits Touristiques Recommandés</h2>
          </div>
          <a routerLink="/circuits" class="btn btn-outline-dark btn-sm rounded-pill px-3">
            Tous les circuits <i class="bi bi-compass ms-1"></i>
          </a>
        </div>

        <div class="row row-cols-1 row-cols-md-2 g-4" *ngIf="circuits.length > 0">
          <div class="col" *ngFor="let c of circuits">
            <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
              
              <!-- Couverture Image Circuit -->
              <div class="circuit-img-wrapper">
                <img [src]="getCircuitImage(c)" [alt]="c.nomCircuit" (error)="onImageError($event)" loading="lazy">
                <span class="site-badge-category" style="background: rgba(22, 56, 44, 0.88);">CIRCUIT</span>
                <span class="site-badge-code">{{ c.codeCircuit }}</span>
              </div>

              <div class="p-4 d-flex flex-column flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h4 class="fw-bold mb-0 brand-font" style="color: var(--casa-green-deep);">{{ c.nomCircuit }}</h4>
                  <span class="badge bg-success-subtle text-success px-3 py-1 rounded-pill fw-semibold">Certifié</span>
                </div>
                <p class="text-secondary small mb-3">{{ c.descriptionCircuit }}</p>
                
                <!-- Sites et Patrimoines reliés au circuit (OpenFeign) -->
                <div class="mb-3" *ngIf="c.etapes && c.etapes.length > 0">
                  <span class="text-muted small fw-bold d-block mb-1">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> Sites visités (OpenFeign) :
                  </span>
                  <div class="d-flex flex-wrap gap-1">
                    <span *ngFor="let e of c.etapes" class="badge bg-light text-dark text-decoration-none border px-2 py-1 rounded-pill small">
                      <i class="bi bi-pin-map-fill text-success me-1"></i> {{ e.patrimoine?.nomPatrimoine || ('Site #' + e.patrimoineId) }}
                    </span>
                  </div>
                </div>

                <div class="d-flex gap-4 mb-4 text-muted small border-top border-bottom py-2">
                  <div><i class="bi bi-clock me-1 text-danger"></i> <strong>{{ c.dureeTotale || 180 }} min</strong></div>
                  <div><i class="bi bi-signpost-2 me-1 text-primary"></i> <strong>{{ c.distanceTotale || 4 }} km</strong></div>
                  <div><i class="bi bi-cash me-1 text-success"></i> <strong>5000 FCFA</strong></div>
                </div>

                <a *ngIf="isTouriste()" [routerLink]="['/reservations']" [queryParams]="{type: 'CIRCUIT', id: c.id, titre: c.nomCircuit}" 
                   class="btn btn-casa-primary btn-sm rounded-pill mt-auto">
                  Consulter le circuit & Réserver <i class="bi bi-arrow-right ms-1"></i>
                </a>
                <a *ngIf="!isTouriste()" routerLink="/circuits" 
                   class="btn btn-casa-primary btn-sm rounded-pill mt-auto">
                  Aperçu du Circuit <i class="bi bi-compass ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-4" *ngIf="circuits.length === 0">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="text-muted small mt-2">Chargement des circuits touristiques...</p>
        </div>
      </div>
    </section>

    <!-- 4. ÉVÉNEMENTS & EXPOSITIONS À VENIR (ms-evenement) -->
    <section class="py-5">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-end mb-4">
          <div>
            <span class="text-uppercase fw-bold text-danger small">Agenda Culturel</span>
            <h2 class="fw-bold mb-0 brand-font" style="color: var(--casa-green-deep);">Événements & Expositions à Venir</h2>
          </div>
          <a routerLink="/evenements" class="btn btn-outline-success btn-sm rounded-pill px-3">
            Tous les événements <i class="bi bi-calendar-event ms-1"></i>
          </a>
        </div>

        <div class="row row-cols-1 row-cols-md-2 g-4" *ngIf="evenements.length > 0">
          <div class="col" *ngFor="let e of evenements">
            <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
              
              <!-- Couverture Image Événement -->
              <div class="event-img-wrapper">
                <img [src]="getEvenementImage(e)" [alt]="e.titre" (error)="onImageError($event)" loading="lazy">
                <span class="site-badge-category" style="background: rgba(217, 119, 36, 0.9);">{{ e.typeEvenement }}</span>
                <span class="site-badge-code">{{ e.code }}</span>
              </div>

              <div class="p-4 d-flex flex-column flex-grow-1">
                <h4 class="fw-bold mb-2 brand-font" style="color: var(--casa-green-deep);">{{ e.titre }}</h4>
                <p class="text-secondary small mb-3">{{ e.description }}</p>
                
                <div class="text-muted small mb-3">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i> <span>{{ e.lieuPrecis }}</span>
                </div>

                <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                  <span class="badge bg-success-subtle text-success border border-success-subtle">
                    {{ (e.placesMax - e.placesOccupees) > 0 ? (e.placesMax - e.placesOccupees) : 10 }} places disponibles
                  </span>
                  <a *ngIf="isTouriste()" [routerLink]="['/reservations']" [queryParams]="{type: 'EVENEMENT', id: e.id, titre: e.titre}" 
                     class="btn btn-sm btn-casa-ochre rounded-pill px-3">
                    Détails & Réservation <i class="bi bi-ticket-perforated ms-1"></i>
                  </a>
                  <a *ngIf="!isTouriste()" routerLink="/evenements" 
                     class="btn btn-sm btn-casa-ochre rounded-pill px-3">
                    Aperçu de l'Événement <i class="bi bi-eye ms-1"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-4" *ngIf="evenements.length === 0">
          <div class="spinner-border text-success" role="status"></div>
          <p class="text-muted small mt-2">Chargement des événements culturels...</p>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private patrimoineService = inject(PatrimoineService);
  private circuitService = inject(CircuitService);
  private evenementService = inject(EvenementService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isTouriste(): boolean {
    return this.authService.hasRole('TOURISTE') || (!this.authService.hasRole('GUIDE') && !this.authService.hasRole('CONSERVATEUR') && !this.authService.hasRole('ADMIN'));
  }

  searchKeyword: string = '';
  sites: Patrimoine[] = [];
  circuits: Circuit[] = [];
  evenements: Evenement[] = [];

  get sitesSelection(): Patrimoine[] {
    return this.sites.slice(0, 3);
  }

  ngOnInit(): void {
    this.patrimoineService.getAll().subscribe({
      next: (data) => this.sites = data,
      error: () => {}
    });
    this.circuitService.getAll().subscribe({
      next: (data) => this.circuits = data,
      error: () => {}
    });
    this.evenementService.getAll().subscribe({
      next: (data) => this.evenements = data,
      error: () => {}
    });
  }

  onSearch(): void {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/patrimoines'], { queryParams: { q: this.searchKeyword.trim() } });
    } else {
      this.router.navigate(['/patrimoines']);
    }
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

  getCircuitImage(c: Circuit): string {
    const nom = (c.nomCircuit || '').toLowerCase();
    const code = (c.codeCircuit || '').toLowerCase();
    if (nom.includes('royaume') || nom.includes('mlomp') || code.includes('003')) return '/assets/images/casamance/cases_mlomp.jpg';
    if (nom.includes('bolong') || nom.includes('îles') || nom.includes('iles') || code.includes('03')) return '/assets/images/casamance/bolong_mangrove.jpg';
    if (nom.includes('historique') || nom.includes('mémoire') || nom.includes('memoire') || code.includes('01')) return '/assets/images/casamance/gouvernance_ziguinchor.jpg';
    if (nom.includes('carabane')) return '/assets/images/casamance/carabane_pirogue_panorama.jpg';
    return '/assets/images/casamance/pirogue_fleuve.jpg';
  }

  getEvenementImage(e: Evenement): string {
    const titre = (e.titre || '').toLowerCase();
    const code = (e.code || '').toLowerCase();
    if (titre.includes('art') || titre.includes('rythme') || titre.includes('festival') || code.includes('01')) return '/assets/images/casamance/culture_casamance.jpg';
    if (titre.includes('vannerie') || titre.includes('poterie') || titre.includes('atelier') || code.includes('02')) return '/assets/images/casamance/artisanat_senegal_real.jpg';
    if (titre.includes('régate') || titre.includes('regate') || titre.includes('pirogue') || code.includes('003')) return '/assets/images/casamance/pirogue_fleuve.jpg';
    if (titre.includes('joola') || titre.includes('résilience') || titre.includes('resilience') || titre.includes('mémoire') || code.includes('004')) return '/assets/images/casamance/memorial_joola.jpg';
    return '/assets/images/casamance/alliance_francaise.jpg';
  }
}
