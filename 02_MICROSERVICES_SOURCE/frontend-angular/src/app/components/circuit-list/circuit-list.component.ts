import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CircuitService } from '../../services/circuit.service';
import { GuideService } from '../../services/guide.service';
import { AuthService } from '../../services/auth.service';
import { Circuit } from '../../models/circuit.model';
import { Guide, CreneauHoraire } from '../../models/guide.model';
import { CarteModalComponent } from '../carte-modal/carte-modal.component';

@Component({
  selector: 'app-circuit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CarteModalComponent],
  template: `
    <main class="container my-5 flex-grow-1">

      <!-- Hero Header Circuits (Exactement comme circuits.html version 1) -->
      <div class="rounded-4 p-4 p-md-5 mb-5 shadow-sm text-white position-relative overflow-hidden" 
           style="background: linear-gradient(135deg, rgba(22, 56, 44, 0.88), rgba(28, 75, 104, 0.82)), url('/assets/images/casamance/carabane_bolong.jpg') center/cover no-repeat;">
        <div class="position-relative" style="z-index: 2; max-width: 680px;">
          <span class="badge px-3 py-2 rounded-pill mb-2" style="background: var(--casa-ochre); color: white;">
            <i class="bi bi-compass-fill me-1"></i> ÉCOTOURISME FLUVIAL & TERRESTRE
          </span>
          <h1 class="display-6 fw-bold mb-2 brand-font">
            Circuits & Itinéraires en Basse-Casamance
          </h1>
          <p class="mb-0 text-white-50 lead" style="font-size: 1.05rem;">
            Parcourez les dédales de bolongs en pirogue traditionnelle, visitez les villages d'artisans et sillonnez les forêts protégées accompagnés par nos guides locaux agréés.
          </p>
        </div>
      </div>

      <!-- Titre Section & Retour -->
      <div class="mb-4 pb-2 border-bottom d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <span class="badge bg-warning-subtle text-dark border border-warning-subtle mb-1">Itinéraires Certifiés</span>
          <h2 class="fw-bold mb-0 brand-font" style="color: var(--casa-green-deep);">
            Catalogue des Circuits Disponibles
          </h2>
        </div>
        <a routerLink="/" class="btn btn-outline-secondary btn-sm rounded-pill">
          <i class="bi bi-arrow-left me-1"></i> Retour à l'accueil
        </a>
      </div>

      <!-- Loading / Error states -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-warning" role="status"></div>
        <p class="mt-2 text-muted">Chargement des circuits et des étapes OpenFeign...</p>
      </div>

      <div *ngIf="error" class="alert alert-warning rounded-3 shadow-sm mb-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> Le microservice des circuits (ms-circuit) est momentanément inaccessible.
      </div>

      <!-- Grid des circuits (Structure conforme à circuits.html de la première version) -->
      <div class="row row-cols-1 row-cols-md-2 g-4" *ngIf="!loading && !error && circuits.length > 0">
        <div class="col" *ngFor="let c of circuits">
          <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden bg-white">
            
            <!-- Image de couverture du circuit -->
            <div style="height: 180px; position: relative; overflow: hidden; background-color: #16382C;">
              <img [src]="getCircuitImage(c)" [alt]="c.nomCircuit" (error)="onImageError($event)" style="width: 100%; height: 100%; object-fit: cover;">
              <div class="position-absolute top-0 start-0 m-3">
                <span class="badge rounded-pill bg-dark bg-opacity-75 text-white font-monospace px-3 py-1">
                  {{ c.codeCircuit }}
                </span>
              </div>
              <div class="position-absolute top-0 end-0 m-3">
                <span class="badge bg-success text-white px-3 py-1 rounded-pill fw-semibold shadow-sm">Certifié</span>
              </div>
            </div>

            <!-- Contenu du Circuit -->
            <div class="p-4 d-flex flex-column flex-grow-1">
              <h4 class="fw-bold mb-2 brand-font" style="color: var(--casa-green-deep);">
                {{ c.nomCircuit }}
              </h4>
              <p class="text-secondary small mb-3 flex-grow-1">
                {{ c.descriptionCircuit }}
              </p>

              <!-- Sites et Patrimoines reliés au circuit (Consigne prof TP2 OpenFeign) -->
              <div class="mb-3" *ngIf="c.etapes && c.etapes.length > 0">
                <span class="text-muted small fw-bold d-block mb-1">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i> Sites & Patrimoines visités (OpenFeign) :
                </span>
                <div class="d-flex flex-wrap gap-1">
                  <span *ngFor="let etape of c.etapes" class="badge bg-light text-dark text-decoration-none border px-2 py-1 rounded-pill small">
                    <i class="bi bi-pin-map-fill text-success me-1"></i> 
                    <span>{{ etape.patrimoine?.nomPatrimoine || ('Site #' + etape.patrimoineId) }}</span>
                  </span>
                </div>
              </div>

              <!-- Bloc Guide Attitré & Créneaux Horaires -->
              <div class="p-3 rounded-3 bg-light border mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small fw-bold text-uppercase text-muted" style="font-size: 0.72rem;">
                    <i class="bi bi-person-badge-fill text-success me-1"></i> Guide Certifié Attitré
                  </span>
                  <button class="btn btn-link btn-sm p-0 text-decoration-none fw-semibold small text-success" 
                          (click)="openDispoModal(c)">
                    <i class="bi bi-calendar-check me-1"></i> Vérifier disponibilités
                  </button>
                </div>
                
                <div class="d-flex align-items-center justify-content-between" *ngIf="getGuideForCircuit(c) as g">
                  <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.8rem;">
                      {{ g.nomComplet.substring(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <div class="fw-bold small text-dark mb-0">{{ g.nomComplet }}</div>
                      <small class="text-muted" style="font-size: 0.75rem;">{{ g.langues.join(', ') }}</small>
                    </div>
                  </div>
                  <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
                    <i class="bi bi-check-circle-fill me-1"></i> Actif
                  </span>
                </div>
              </div>

              <!-- Infos Métriques : Durée / Distance / Tarif -->
              <div class="d-flex gap-4 mb-4 text-muted small border-top border-bottom py-2">
                <div><i class="bi bi-clock me-1 text-danger"></i> <strong>{{ c.dureeTotale || 180 }} min</strong></div>
                <div><i class="bi bi-signpost-2 me-1 text-primary"></i> <strong>{{ c.distanceTotale || 4 }} km</strong></div>
                <div><i class="bi bi-cash me-1 text-success"></i> <strong>5000 FCFA</strong></div>
              </div>

              <!-- Actions Réservation & Carte -->
              <div class="d-flex gap-2 mt-auto flex-wrap">
                <button class="btn btn-outline-success btn-sm rounded-pill" (click)="ouvrirCarteCircuit(c)" title="Voir l'itinéraire sur la Carte GPS">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i> Carte
                </button>
                <button class="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1" (click)="openDispoModal(c)">
                  <i class="bi bi-clock-history me-1"></i> Horaires
                </button>
                <!-- Réservation : Touriste uniquement -->
                <a *ngIf="isTouriste()" [routerLink]="['/reservations']" 
                   [queryParams]="{type: 'CIRCUIT', id: c.id, titre: c.nomCircuit, guideId: getGuideForCircuit(c)?.id}" 
                   class="btn btn-casa-primary btn-sm rounded-pill flex-grow-1">
                  Réserver <i class="bi bi-arrow-right ms-1"></i>
                </a>
                <!-- Actions d'accès direct pour Guide et Conservateur (pas de réservation) -->
                <a *ngIf="isGuide()" routerLink="/profil" 
                   class="btn btn-outline-success btn-sm rounded-pill flex-grow-1">
                  <i class="bi bi-calendar-check me-1"></i> Mon Agenda
                </a>
                <a *ngIf="isConservateur()" routerLink="/profil" 
                   class="btn btn-outline-warning text-dark btn-sm rounded-pill flex-grow-1 fw-semibold">
                  <i class="bi bi-sliders me-1"></i> Dashboard
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Modal Vérification Créneaux Horaires du Guide -->
      <div class="modal fade show d-block" tabindex="-1" *ngIf="modalVisible" style="background: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header bg-primary-custom text-white py-3">
              <h5 class="modal-title fw-bold brand-font mb-0">
                <i class="bi bi-calendar3 me-2"></i> Planning & Créneaux Horaires
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="modalVisible = false"></button>
            </div>
            
            <div class="modal-body p-4" *ngIf="selectedCircuit">
              <h6 class="fw-bold text-primary-custom mb-1">{{ selectedCircuit.nomCircuit }}</h6>
              <p class="text-muted small mb-3">Vérifiez la disponibilité du guide en temps réel pour le créneau de votre choix.</p>

              <div class="p-3 rounded-3 bg-light border mb-3" *ngIf="activeGuide">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="fw-bold small">{{ activeGuide.nomComplet }}</span>
                  <span class="badge bg-primary rounded-pill small">{{ activeGuide.specialite }}</span>
                </div>
                <div class="small text-muted mb-2">Langues : {{ activeGuide.langues.join(', ') }}</div>
                <div class="small text-muted"><i class="bi bi-telephone text-success me-1"></i> {{ activeGuide.telephone }}</div>
              </div>

              <!-- Sélecteur de date -->
              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Date de visite souhaitée :</label>
                <input type="date" [(ngModel)]="checkDate" (change)="refreshCheck()" class="form-control">
              </div>

              <!-- Liste des 3 créneaux horaires avec statut LIBRE / OCCUPÉ -->
              <label class="form-label small fw-bold text-secondary mb-2">Créneaux horaires journaliers :</label>
              <div class="d-flex flex-column gap-2 mb-4">
                <div *ngFor="let cr of creneaux" 
                     class="p-3 rounded-3 border d-flex justify-content-between align-items-center"
                     [ngClass]="getDispoForCreneau(cr.id).disponible ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'">
                  <div>
                    <div class="fw-bold text-dark mb-0">{{ cr.libelle }}</div>
                    <small class="text-muted">{{ cr.description }}</small>
                  </div>
                  <div>
                    <span *ngIf="getDispoForCreneau(cr.id).disponible" class="badge bg-success rounded-pill px-3 py-2">
                      <i class="bi bi-check-circle me-1"></i> LIBRE
                    </span>
                    <span *ngIf="!getDispoForCreneau(cr.id).disponible" class="badge bg-danger rounded-pill px-3 py-2">
                      <i class="bi bi-x-circle me-1"></i> OCCUPÉ
                    </span>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary rounded-pill" (click)="modalVisible = false">Fermer</button>
                <a *ngIf="isTouriste()" [routerLink]="['/reservations']" 
                   [queryParams]="{type: 'CIRCUIT', id: selectedCircuit.id, titre: selectedCircuit.nomCircuit, guideId: activeGuide?.id, date: checkDate}" 
                   (click)="modalVisible = false"
                   class="btn btn-casa-primary rounded-pill">
                  Réserver avec ce Guide <i class="bi bi-arrow-right ms-1"></i>
                </a>
                <a *ngIf="isGuide()" routerLink="/profil" (click)="modalVisible = false" class="btn btn-success rounded-pill fw-bold">
                  <i class="bi bi-calendar-check me-1"></i> Voir mon Agenda de Visites
                </a>
                <a *ngIf="isConservateur()" routerLink="/profil" (click)="modalVisible = false" class="btn btn-warning rounded-pill fw-bold">
                  <i class="bi bi-calendar-plus me-1"></i> Planifier dans mon Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Carte & Géolocalisation de l'Itinéraire -->
      <app-carte-modal *ngIf="carteCircuitTitre" [titre]="carteCircuitTitre" [nomLieu]="carteCircuitTitre" [pointsNoms]="carteCircuitEtapes" (fermer)="carteCircuitTitre = null"></app-carte-modal>

    </main>
  `
})
export class CircuitListComponent implements OnInit {
  private circuitService = inject(CircuitService);
  private guideService = inject(GuideService);
  private authService = inject(AuthService);

  isTouriste(): boolean {
    return this.authService.hasRole('TOURISTE') || (!this.isGuide() && !this.isConservateur());
  }

  isGuide(): boolean {
    return this.authService.hasRole('GUIDE');
  }

  isConservateur(): boolean {
    return this.authService.hasRole('CONSERVATEUR') || this.authService.hasRole('ADMIN');
  }

  circuits: Circuit[] = [];
  loading: boolean = true;
  error: boolean = false;

  carteCircuitTitre: string | null = null;
  carteCircuitEtapes: string[] = [];

  modalVisible: boolean = false;
  selectedCircuit: Circuit | null = null;
  activeGuide: Guide | null = null;
  checkDate: string = new Date().toISOString().split('T')[0];
  creneaux: CreneauHoraire[] = [];

  ouvrirCarteCircuit(c: Circuit): void {
    this.carteCircuitTitre = c.nomCircuit;
    if (c.etapes && c.etapes.length > 0) {
      this.carteCircuitEtapes = c.etapes.map(e => e.patrimoine?.nomPatrimoine || `Étape ${e.position}`);
    } else {
      this.carteCircuitEtapes = [c.nomCircuit];
    }
  }

  ngOnInit(): void {
    this.creneaux = this.guideService.getCreneaux();
    this.circuitService.getAll().subscribe({
      next: (data) => {
        this.circuits = data;
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

  getCircuitImage(c: Circuit): string {
    const nom = (c.nomCircuit || '').toLowerCase();
    const code = (c.codeCircuit || '').toLowerCase();
    if (nom.includes('royaume') || nom.includes('mlomp') || code.includes('003')) return '/assets/images/casamance/cases_mlomp.jpg';
    if (nom.includes('bolong') || nom.includes('îles') || nom.includes('iles') || code.includes('03')) return '/assets/images/casamance/bolong_mangrove.jpg';
    if (nom.includes('historique') || nom.includes('mémoire') || nom.includes('memoire') || code.includes('01')) return '/assets/images/casamance/gouvernance_ziguinchor.jpg';
    if (nom.includes('carabane')) return '/assets/images/casamance/carabane_pirogue_panorama.jpg';
    return '/assets/images/casamance/pirogue_fleuve.jpg';
  }

  getGuideForCircuit(c: Circuit): Guide | undefined {
    const list = this.guideService.getGuidesForCircuit(c.id);
    return list.length > 0 ? list[0] : undefined;
  }

  openDispoModal(c: Circuit): void {
    this.selectedCircuit = c;
    this.activeGuide = this.getGuideForCircuit(c) || null;
    this.modalVisible = true;
  }

  refreshCheck(): void {
    // Déclenche la mise à jour des disponibilités
  }

  getDispoForCreneau(horaireId: string) {
    if (!this.activeGuide) return { disponible: true };
    return this.guideService.checkDisponibilite(this.activeGuide.id, this.checkDate, horaireId);
  }
}
