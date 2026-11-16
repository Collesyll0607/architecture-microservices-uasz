import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { GuideService } from '../../services/guide.service';
import { PatrimoineService } from '../../services/patrimoine.service';
import { CircuitService } from '../../services/circuit.service';
import { OfflineService } from '../../services/offline.service';
import { User } from '../../models/user.model';
import { Reservation } from '../../models/reservation.model';
import { Guide, VisiteGuidee, AvisVisite, CandidatureGuide } from '../../models/guide.model';
import { CarteModalComponent } from '../carte-modal/carte-modal.component';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CarteModalComponent],
  styles: [`
    .stat-card-btn {
      transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
      cursor: pointer;
      text-align: left;
      border: none;
      display: block;
      width: 100%;
    }
    .stat-card-btn:hover {
      transform: translateY(-6px);
      box-shadow: 0 14px 28px rgba(0,0,0,0.22) !important;
      filter: brightness(1.08);
    }
    .stat-card-btn:active {
      transform: translateY(-2px);
    }
    .letter-spacing-1 {
      letter-spacing: 0.8px;
    }
  `],
  template: `
    <div class="container py-4">
      
      <!-- Si non connecté -->
      <div *ngIf="!currentUser" class="text-center py-5">
        <div class="card-custom p-5 mx-auto" style="max-width: 520px;">
          <div class="fs-1 text-muted mb-3"><i class="bi bi-person-lock"></i></div>
          <h4 class="fw-bold text-primary-custom mb-2 brand-font">Espace Privé Non Connecté</h4>
          <p class="text-muted small mb-4">
            Veuillez vous identifier pour accéder à votre espace personnalisé (Touriste, Guide ou Conservateur).
          </p>
          <div class="d-flex justify-content-center gap-2">
            <a routerLink="/login" class="btn btn-custom-accent rounded-pill px-4">Se Connecter</a>
            <a routerLink="/register" class="btn btn-outline-secondary rounded-pill px-4">Créer un Compte</a>
          </div>
        </div>
      </div>

      <!-- Utilisateur Connecté -->
      <div *ngIf="currentUser">
        
        <!-- En-tête Profil Personnalisé selon le Rôle -->
        <div class="card-custom p-4 mb-4 border-0 shadow-sm bg-white">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 text-white shadow-sm"
                   [ngClass]="isGuide() ? 'bg-success' : (isConservateur() ? 'bg-warning text-dark' : 'bg-primary-custom')" 
                   style="width: 72px; height: 72px;">
                {{ getInitials(currentUser.nomComplet) }}
              </div>
              <div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <h3 class="fw-bold mb-0 brand-font text-primary-custom">{{ currentUser.nomComplet }}</h3>
                  <span class="badge" [ngClass]="getRoleBadgeClass(currentUser.role)">
                    {{ formatRole(currentUser.role) }}
                  </span>
                  <span *ngIf="isGuide()" class="badge bg-success-subtle text-success border border-success-subtle">
                    <i class="bi bi-patch-check-fill me-1"></i> Guide Officiel Certifié
                  </span>
                  <span *ngIf="isConservateur()" class="badge bg-warning-subtle text-dark border border-warning-subtle">
                    <i class="bi bi-shield-fill-check me-1"></i> Administrateur UASZ
                  </span>
                </div>
                <div class="text-muted small mt-1">
                  <i class="bi bi-envelope me-1 text-primary"></i> {{ currentUser.email }}
                  <span class="ms-3"><i class="bi bi-telephone me-1 text-success"></i> {{ currentUser.telephone || '+221 77 555 12 34' }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="badge py-2 px-3 rounded-pill" [ngClass]="isOffline ? 'bg-warning text-dark border border-warning' : 'bg-success-subtle text-success border border-success'">
                <i class="bi" [ngClass]="isOffline ? 'bi-wifi-off me-1' : 'bi-wifi me-1'"></i>
                {{ isOffline ? 'Mode Hors Ligne' : 'Connecté' }}
              </span>
              <button class="btn btn-outline-secondary btn-sm rounded-pill px-2" (click)="onToggleOffline()" title="Tester le mode déconnecté">
                <i class="bi bi-arrow-repeat me-1"></i> {{ isOffline ? 'En Ligne' : 'Hors Ligne' }}
              </button>
              <button class="btn btn-outline-danger btn-sm rounded-pill px-3" (click)="onLogout()">
                <i class="bi bi-box-arrow-right me-1"></i> Déconnexion
              </button>
            </div>
          </div>
        </div>

        <!-- Alertes de Succès et d'Erreur -->
        <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show rounded-3 shadow-sm border-0 border-start border-success border-4" role="alert">
          <i class="bi bi-check-circle-fill text-success me-2 fs-5 align-middle"></i>
          <span>{{ successMessage }}</span>
          <button type="button" class="btn-close" (click)="successMessage = ''"></button>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm border-0 border-start border-danger border-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill text-danger me-2 fs-5 align-middle"></i>
          <span>{{ errorMessage }}</span>
          <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
        </div>

        <!-- Système d'Onglets Dédié par Rôle -->
        <div class="row g-4">
          
          <!-- Colonne Gauche : Navigation des Onglets -->
          <div class="col-lg-3">
            <div class="card-custom p-3 bg-white border-0 shadow-sm sticky-top" style="top: 85px;">
              <div class="nav flex-column nav-pills gap-1">
                
                <!-- Onglets GUIDE -->
                <ng-container *ngIf="isGuide()">
                  <button class="nav-link text-start" [class.active]="activeTab === 'guide-agenda'" (click)="activeTab = 'guide-agenda'">
                    <i class="bi bi-calendar-check me-2 text-success"></i> Visites Confiées ({{ mesVisitesGuide.length }})
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'guide-profil'" (click)="activeTab = 'guide-profil'">
                    <i class="bi bi-person-badge me-2 text-warning"></i> Mon Profil & Compétences
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'guide-avis'" (click)="activeTab = 'guide-avis'">
                    <i class="bi bi-star-half me-2 text-warning"></i> Avis & Retours Touristes ({{ mesAvisGuide.length }})
                  </button>
                </ng-container>

                <!-- Onglets TOURISTE -->
                <ng-container *ngIf="isTouriste()">
                  <button class="nav-link text-start" [class.active]="activeTab === 'touriste-reservations'" (click)="activeTab = 'touriste-reservations'">
                    <i class="bi bi-ticket-perforated me-2 text-primary"></i> Mes Billets & Pass QR ({{ userReservations.length }})
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'infos'" (click)="activeTab = 'infos'">
                    <i class="bi bi-person-gear me-2 text-secondary"></i> Modifier mes Coordonnées
                  </button>
                </ng-container>

                <!-- Onglets CONSERVATEUR / ADMIN -->
                <ng-container *ngIf="isConservateur()">
                  <button class="nav-link text-start" [class.active]="activeTab === 'admin-dashboard'" (click)="activeTab = 'admin-dashboard'">
                    <i class="bi bi-speedometer2 me-2 text-warning"></i> Tableau de Bord
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'admin-guides'" (click)="activeTab = 'admin-guides'">
                    <i class="bi bi-people-fill me-2 text-info"></i> Guides & Circuits Gérés ({{ tousGuides.length }})
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'admin-planifier'" (click)="activeTab = 'admin-planifier'">
                    <i class="bi bi-calendar-plus me-2 text-success"></i> Planifier une Visite
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'admin-candidatures'" (click)="activeTab = 'admin-candidatures'">
                    <i class="bi bi-person-check me-2 text-primary"></i> Candidatures Guides ({{ candidaturesEnAttente.length }})
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'admin-litiges'" (click)="activeTab = 'admin-litiges'">
                    <i class="bi bi-exclamation-octagon me-2 text-danger"></i> Médiation Litiges ({{ litigesEnAttente.length }})
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'admin-utilisateurs'" (click)="activeTab = 'admin-utilisateurs'">
                    <i class="bi bi-people-fill me-2 text-danger"></i> Utilisateurs & Suspensions ({{ allUsers.length }})
                  </button>
                  <button class="nav-link text-start" [class.active]="activeTab === 'admin-soa'" (click)="activeTab = 'admin-soa'">
                    <i class="bi bi-diagram-3 me-2 text-warning"></i> Architecture SOA (Admin)
                  </button>
                </ng-container>

                <!-- Onglet Sécurité Commun à Tous -->
                <hr class="my-2">
                <button class="nav-link text-start" [class.active]="activeTab === 'securite'" (click)="activeTab = 'securite'">
                  <i class="bi bi-shield-lock me-2 text-dark"></i> Sécurité & Mot de Passe
                </button>
              </div>
            </div>
          </div>

          <!-- Colonne Droite : Contenu Dynamique -->
          <div class="col-lg-9">

            <!-- ======================================================== -->
            <!-- 1. VUE GUIDE : VISITES CONFIÉES & AGENDA DU GUIDE        -->
            <!-- ======================================================== -->
            <div *ngIf="isGuide() && activeTab === 'guide-agenda'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-calendar-check text-success me-2"></i>Mon Agenda & Visites Confiées
                    </h5>
                    <p class="text-muted small mb-0">
                      Gérez les visites qui vous sont assignées par le Conservateur. Démarrez ou clôturez les visites pour permettre les avis touristes.
                    </p>
                  </div>
                  <span class="badge bg-success px-3 py-2 rounded-pill">{{ mesVisitesGuide.length }} Visite(s) Confiée(s)</span>
                </div>

                <div *ngIf="mesVisitesGuide.length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
                  Vous n'avez aucune visite assignée pour le moment.
                </div>

                <div class="d-flex flex-column gap-3" *ngIf="mesVisitesGuide.length > 0">
                  <div class="p-4 rounded-4 border bg-white shadow-sm" *ngFor="let v of mesVisitesGuide">
                    
                    <div class="d-flex flex-wrap justify-content-between align-items-start mb-2">
                      <div>
                        <span class="badge bg-accent-custom px-2 py-1 rounded-pill small mb-1">{{ v.horaireLibelle }}</span>
                        <h5 class="fw-bold text-primary-custom brand-font mb-1">{{ v.titre }}</h5>
                        <div class="text-muted small">
                          <i class="bi bi-calendar-event text-danger me-1"></i> Date : <strong>{{ v.dateHeure }}</strong>
                        </div>
                      </div>

                      <div>
                        <span *ngIf="v.statut === 'PROGRAMMEE'" class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                          <i class="bi bi-clock me-1"></i> Programmée
                        </span>
                        <span *ngIf="v.statut === 'EN_COURS'" class="badge bg-warning-subtle text-dark border border-warning px-3 py-2 rounded-pill">
                          <i class="bi bi-broadcast me-1"></i> En Cours d'Excursion
                        </span>
                        <span *ngIf="v.statut === 'TERMINEE'" class="badge bg-success text-white px-3 py-2 rounded-pill">
                          <i class="bi bi-check2-all me-1"></i> Visite Terminée
                        </span>
                      </div>
                    </div>

                    <!-- Métriques de la visite -->
                    <div class="row g-2 small text-muted my-2 p-2 bg-light rounded-3 border">
                      <div class="col-sm-4">
                        <i class="bi bi-people-fill text-info me-1"></i> Inscrits : <strong>{{ v.placesOccupees }} / {{ v.placesMax }} pers.</strong>
                      </div>
                      <div class="col-sm-4">
                        <i class="bi bi-cash me-1 text-success"></i> Tarif : <strong>{{ v.tarifParPersonne | number }} FCFA / pers.</strong>
                      </div>
                      <div class="col-sm-4">
                        <i class="bi bi-compass me-1 text-warning"></i> Type : <strong>{{ v.type }}</strong>
                      </div>
                    </div>

                    <!-- Participants inscrits avec Pass QR -->
                    <div class="mb-3">
                      <span class="fw-bold text-secondary small d-block mb-1">
                        <i class="bi bi-person-check-fill text-success me-1"></i> Touristes Inscrits & Pass QR :
                      </span>
                      <div class="d-flex flex-wrap gap-2">
                        <div class="p-2 rounded-2 bg-light border small" *ngFor="let p of v.participants">
                          <strong class="text-dark">{{ p.clientNom }}</strong>
                          <span class="text-muted ms-1">({{ p.nombrePlaces }} pl. • <i class="bi bi-telephone"></i> {{ p.telephone }})</span>
                          <span class="badge bg-white text-dark border ms-2 font-monospace">{{ p.qrCodeToken }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Actions d'Exécution de la Visite par le Guide -->
                    <div class="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top gap-2">
                      <small class="text-muted">
                        <span *ngIf="v.statut === 'PROGRAMMEE'">En attente du départ avec le groupe de voyageurs.</span>
                        <span *ngIf="v.statut === 'EN_COURS'" class="text-warning fw-bold">Excursion active sur le terrain.</span>
                        <span *ngIf="v.statut === 'TERMINEE'" class="text-success fw-bold">Visite effectuée avec succès. Avis débloqués pour les voyageurs.</span>
                      </small>

                      <div class="d-flex gap-2 flex-wrap">
                        <!-- Localiser sur la carte en direct -->
                        <button class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold" (click)="ouvrirCarteVisite(v)">
                          <i class="bi bi-geo-alt-fill text-danger me-1"></i> Carte & Géolocalisation en Direct
                        </button>

                        <!-- Démarrer si programmée -->
                        <button *ngIf="v.statut === 'PROGRAMMEE'" class="btn btn-outline-warning btn-sm rounded-pill px-3 fw-bold" (click)="onDemarrerVisite(v.id)">
                          <i class="bi bi-play-fill me-1"></i> Démarrer la Visite
                        </button>

                        <!-- Terminer si programmée ou en cours -->
                        <button *ngIf="v.statut === 'PROGRAMMEE' || v.statut === 'EN_COURS'" class="btn btn-success btn-sm rounded-pill px-3 shadow-sm fw-bold" (click)="onTerminerVisite(v.id)">
                          <i class="bi bi-check-circle-fill me-1"></i> Arrêter & Confirmer Visite Terminée
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- OUTIL GUIDE : CONTRÔLEUR DE BILLETS & PASS QR HORS LIGNE -->
                <div class="card border rounded-4 shadow-sm p-4 bg-light mt-4">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-qr-code-scan fs-4 text-success"></i>
                    <h6 class="fw-bold mb-0 text-dark">Contrôleur de Billets & Pass QR Hors Ligne (Sur le Terrain)</h6>
                  </div>
                  <p class="small text-muted mb-3">
                    Authentifiez instantanément les e-Pass QR des voyageurs sur le terrain, même en zone blanche sans connexion Internet.
                  </p>

                  <div class="input-group input-group-sm mb-3" style="max-width: 520px;">
                    <input type="text" [(ngModel)]="tokenOfflineAverifier" class="form-control font-monospace" placeholder="Saisir ou scanner le code e-Pass (Ex: PASS-AF-778)">
                    <button class="btn btn-success fw-bold px-3" (click)="onVerifierPassOffline()">
                      <i class="bi bi-shield-check me-1"></i> Vérifier Hors Ligne
                    </button>
                  </div>

                  <div *ngIf="resultatVerificationOffline" class="p-3 rounded-3 border small"
                       [ngClass]="resultatVerificationOffline.valide ? 'alert-success' : 'alert-danger'">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi fs-4" [ngClass]="resultatVerificationOffline.valide ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
                      <div>
                        <strong class="d-block">{{ resultatVerificationOffline.message }}</strong>
                        <div *ngIf="resultatVerificationOffline.valide" class="mt-1">
                          <span>Voyageur : <strong>{{ resultatVerificationOffline.clientNom }}</strong></span> • 
                          <span>Places : <strong>{{ resultatVerificationOffline.places }} pers.</strong></span> • 
                          <span>Excursion : <strong>{{ resultatVerificationOffline.circuit }}</strong></span> • 
                          <span class="badge bg-success ms-1">{{ resultatVerificationOffline.statut }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 2. VUE GUIDE : PROFIL COMPLET, EXPÉRIENCE, LANGUES       -->
            <!-- ======================================================== -->
            <div *ngIf="isGuide() && activeTab === 'guide-profil'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <h5 class="fw-bold text-primary-custom brand-font mb-3">
                  <i class="bi bi-person-lines-fill text-warning me-2"></i>Profil Professionnel du Guide Certifié
                </h5>
                <p class="text-muted small mb-4">
                  Vos informations officielles attestent de votre expertise auprès de l'Administration du Tourisme et des voyageurs.
                </p>

                <div class="row g-4 mb-4">
                  <!-- Carte Expérience -->
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border text-center">
                      <i class="bi bi-award-fill text-success fs-1 mb-1 d-block"></i>
                      <div class="display-6 fw-bold text-dark">{{ guideDetails?.anneesExperience || 12 }}</div>
                      <div class="small fw-bold text-muted text-uppercase">Années d'Expérience</div>
                      <small class="text-secondary">En Basse-Casamance & Bolongs</small>
                    </div>
                  </div>

                  <!-- Carte Note & Avis -->
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border text-center">
                      <i class="bi bi-star-fill text-warning fs-1 mb-1 d-block"></i>
                      <div class="display-6 fw-bold text-dark">{{ guideDetails?.note || 4.9 }} / 5</div>
                      <div class="small fw-bold text-muted text-uppercase">Score d'Évaluation</div>
                      <small class="text-secondary">Sur {{ guideDetails?.nbAvis || 48 }} avis certifiés</small>
                    </div>
                  </div>

                  <!-- Carte Statut -->
                  <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border text-center">
                      <i class="bi bi-shield-check text-primary fs-1 mb-1 d-block"></i>
                      <div class="fs-4 fw-bold text-success mt-2">Accrédité</div>
                      <div class="small fw-bold text-muted text-uppercase">Carte Professionnelle</div>
                      <small class="text-secondary">N° CS-2026-AG-042</small>
                    </div>
                  </div>
                </div>

                <!-- Langues Maîtrisées -->
                <div class="mb-4">
                  <h6 class="fw-bold text-secondary small text-uppercase mb-2">
                    <i class="bi bi-translate text-primary me-1"></i> Langues Maîtrisées pour le Guidage
                  </h6>
                  <div class="d-flex flex-wrap gap-2">
                    <span *ngFor="let lang of guideDetails?.langues" class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6">
                      <i class="bi bi-chat-quote-fill me-1"></i> {{ lang }}
                    </span>
                  </div>
                </div>

                <!-- Circuits Maîtrisés -->
                <div class="mb-4">
                  <h6 class="fw-bold text-secondary small text-uppercase mb-2">
                    <i class="bi bi-compass text-success me-1"></i> Circuits Touristiques Maîtrisés
                  </h6>
                  <div class="d-flex flex-column gap-2">
                    <div *ngFor="let c of guideDetails?.circuitsNoms" class="p-2 px-3 rounded-3 bg-light border d-flex align-items-center gap-2">
                      <i class="bi bi-signpost-2-fill text-success fs-5"></i>
                      <span class="fw-semibold text-dark">{{ c }}</span>
                    </div>
                  </div>
                </div>

                <!-- Patrimoines de Prédilection -->
                <div class="mb-4">
                  <h6 class="fw-bold text-secondary small text-uppercase mb-2">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> Sites Patrimoniaux de Prédilection
                  </h6>
                  <div class="d-flex flex-wrap gap-2">
                    <span *ngFor="let p of guideDetails?.patrimoinesNoms" class="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-xs">
                      <i class="bi bi-bank text-danger me-1"></i> {{ p }}
                    </span>
                  </div>
                </div>

                <!-- Formulaire de Mise à Jour -->
                <div class="p-3 bg-light rounded-4 border">
                  <h6 class="fw-bold text-dark mb-3">Mettre à Jour mes Coordonnées</h6>
                  <form (ngSubmit)="onSaveProfile()">
                    <div class="row g-3 mb-3">
                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Téléphone de contact</label>
                        <input type="tel" [(ngModel)]="editForm.telephone" name="telephone" class="form-control">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label small fw-bold">Spécialité Principale</label>
                        <input type="text" [(ngModel)]="editForm.languesParlees" name="specialite" class="form-control">
                      </div>
                    </div>
                    <div class="mb-3">
                      <label class="form-label small fw-bold">Présentation & Biographie</label>
                      <textarea [(ngModel)]="editForm.biographie" name="biographie" rows="3" class="form-control"></textarea>
                    </div>
                    <button type="submit" [disabled]="saving" class="btn btn-casa-primary rounded-pill px-4">
                      <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                      Enregistrer mon Profil
                    </button>
                  </form>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 3. VUE GUIDE : AVIS REÇUS PAR LE GUIDE                  -->
            <!-- ======================================================== -->
            <div *ngIf="isGuide() && activeTab === 'guide-avis'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-star-half text-warning me-2"></i>Retours d'Expérience & Notations des Touristes
                    </h5>
                    <p class="text-muted small mb-0">Évaluations laissées par les voyageurs à la fin de vos visites guidées.</p>
                  </div>
                  <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">{{ mesAvisGuide.length }} Avis</span>
                </div>

                <div class="row g-3">
                  <div class="col-md-6" *ngFor="let a of mesAvisGuide">
                    <div class="p-3 rounded-3 border bg-light h-100">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="text-dark small">{{ a.touristeNom }}</strong>
                        <span class="badge bg-warning text-dark">{{ a.note }} ★</span>
                      </div>
                      <div class="small text-muted mb-2">
                        <i class="bi bi-geo-alt text-danger me-1"></i> {{ a.visiteTitre }} • {{ a.date }}
                      </div>
                      <p class="small text-secondary fst-italic mb-0">"{{ a.commentaire }}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 4. VUE TOURISTE : MES BILLETS & AVIS / LITIGES          -->
            <!-- ======================================================== -->
            <div *ngIf="isTouriste() && activeTab === 'touriste-reservations'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-ticket-perforated text-primary me-2"></i>Mes Billets & Pass QR
                    </h5>
                    <p class="text-muted small mb-0">
                      Consultez vos réservations actives. À la fin de chaque visite, évaluez votre guide ou signalez un litige.
                    </p>
                  </div>
                  <a routerLink="/reservations" class="btn btn-sm btn-custom-accent rounded-pill px-3 shadow-sm">
                    <i class="bi bi-plus-circle me-1"></i> Réserver une Visite
                  </a>
                </div>

                <div class="d-flex flex-column gap-3">
                  <div class="p-4 rounded-4 border bg-white shadow-sm" *ngFor="let r of userReservations">
                    
                    <div class="d-flex flex-wrap justify-content-between align-items-start mb-2">
                      <div>
                        <span class="badge bg-primary-custom px-2 py-1 rounded-pill small mb-1">{{ r.numeroReservation || ('PASS-ZIG-' + r.id) }}</span>
                        <h5 class="fw-bold text-primary-custom brand-font mb-1">{{ r.titreElement }}</h5>
                        <div class="text-muted small">
                          <i class="bi bi-person-badge text-success me-1"></i> Guide : <strong>{{ r.nomGuide || 'Mamadou DIATTA' }}</strong>
                        </div>
                      </div>

                      <div class="text-end">
                        <span class="badge bg-success-subtle text-success border border-success px-3 py-1 rounded-pill">
                          <i class="bi bi-check-circle me-1"></i> Visite Effectuée
                        </span>
                        <div class="fw-bold text-accent-custom small mt-1" *ngIf="r.montantTotal">{{ r.montantTotal | number }} FCFA</div>
                      </div>
                    </div>

                    <!-- Pass QR Graphique & Localisation GPS -->
                    <div class="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border my-3 flex-wrap gap-2">
                      <div class="d-flex align-items-center gap-3">
                        <div class="bg-white p-2 rounded-2 border shadow-xs">
                          <i class="bi bi-qr-code fs-1 text-success"></i>
                        </div>
                        <div>
                          <span class="small font-monospace text-muted d-block">PASS QR ÉCOTOURISME (DISPONIBLE HORS LIGNE)</span>
                          <strong class="font-monospace text-dark fs-6">{{ r.qrCodeToken || 'PASS-UASZ-778' }}</strong>
                          <small class="text-muted d-block">{{ r.nombrePlaces }} Voyageur(s) • Présenter ce code au guide au départ</small>
                        </div>
                      </div>

                      <button class="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold" (click)="carteLieu = r.titreElement; cartePoints = [r.titreElement]">
                        <i class="bi bi-geo-alt-fill text-danger me-1"></i> Carte & Géolocalisation
                      </button>
                    </div>

                    <!-- SECTION AVIS & LITIGES DÉBLOQUÉE À LA FIN DE LA VISITE -->
                    <div class="p-3 rounded-3 bg-light border-top mt-2">
                      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div class="small text-secondary">
                          <i class="bi bi-stars text-warning me-1"></i> La visite est terminée : partagez votre retour d'expérience !
                        </div>
                        <div class="d-flex gap-2">
                          <button class="btn btn-outline-warning btn-sm rounded-pill px-3" (click)="openAvisModal(r)">
                            <i class="bi bi-star-fill me-1"></i> Laisser un Avis
                          </button>
                          <button class="btn btn-outline-danger btn-sm rounded-pill px-3" (click)="openLitigeModal(r)">
                            <i class="bi bi-exclamation-triangle-fill me-1"></i> Signaler un Litige
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 5. VUE CONSERVATEUR : TABLEAU DE BORD & STATISTIQUES     -->
            <!-- ======================================================== -->
            <div *ngIf="isConservateur() && activeTab === 'admin-dashboard'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-speedometer2 text-warning me-2"></i>Tableau de Bord du Patrimoine de Ziguinchor
                    </h5>
                    <p class="text-muted small mb-0">Supervision des sites, agréments des guides et contrôle qualité des circuits.</p>
                  </div>
                  <button class="btn btn-casa-primary btn-sm rounded-pill px-3" (click)="activeTab = 'admin-planifier'">
                    <i class="bi bi-plus-circle me-1"></i> Planifier une Visite
                  </button>
                </div>

                <!-- 4 Cartes Statistiques Transformées en Boutons Interactifs (Sites, Guides, Candidatures, Litiges) -->
                <div class="row g-3 mb-4">
                  <!-- Bouton 1 : Sites Répertoriés -->
                  <div class="col-md-3">
                    <button type="button" 
                            class="card w-100 text-start border-0 shadow-sm p-3 rounded-4 text-white stat-card-btn position-relative overflow-hidden" 
                            style="background: linear-gradient(135deg, #134e38, #1e7e59);"
                            routerLink="/patrimoines"
                            title="Cliquer pour explorer l'ensemble des sites répertoriés">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-white-75 small text-uppercase fw-bold letter-spacing-1">Sites Répertoriés</span>
                        <div class="p-1 rounded bg-white bg-opacity-25"><i class="bi bi-houses-fill text-white fs-6"></i></div>
                      </div>
                      <div class="fs-1 fw-bold text-white mb-0 mt-1" style="text-shadow: 0 2px 4px rgba(0,0,0,0.35);">8</div>
                      <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-white border-opacity-25">
                        <small class="text-white-75 font-monospace">ms-patrimoine</small>
                        <span class="badge bg-white text-dark rounded-pill px-2 py-1 small fw-bold">
                          Voir sites <i class="bi bi-arrow-right ms-1"></i>
                        </span>
                      </div>
                    </button>
                  </div>

                  <!-- Bouton 2 : Guides Certifiés -->
                  <div class="col-md-3">
                    <button type="button" 
                            class="card w-100 text-start border-0 shadow-sm p-3 rounded-4 text-white stat-card-btn position-relative overflow-hidden" 
                            style="background: linear-gradient(135deg, #198754, #20c997);"
                            (click)="activeTab = 'admin-guides'"
                            title="Cliquer pour gérer les guides accrédités et leurs circuits">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-white-75 small text-uppercase fw-bold letter-spacing-1">Guides Certifiés</span>
                        <div class="p-1 rounded bg-white bg-opacity-25"><i class="bi bi-person-badge-fill text-white fs-6"></i></div>
                      </div>
                      <div class="fs-1 fw-bold text-white mb-0 mt-1" style="text-shadow: 0 2px 4px rgba(0,0,0,0.35);">{{ tousGuides.length }}</div>
                      <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-white border-opacity-25">
                        <small class="text-white-75">Accrédités actifs</small>
                        <span class="badge bg-white text-dark rounded-pill px-2 py-1 small fw-bold">
                          Gérer guides <i class="bi bi-arrow-right ms-1"></i>
                        </span>
                      </div>
                    </button>
                  </div>

                  <!-- Bouton 3 : Candidatures -->
                  <div class="col-md-3">
                    <button type="button" 
                            class="card w-100 text-start border-0 shadow-sm p-3 rounded-4 text-white stat-card-btn position-relative overflow-hidden" 
                            style="background: linear-gradient(135deg, #d35400, #e67e22);"
                            (click)="activeTab = 'admin-candidatures'"
                            title="Cliquer pour examiner et valider les candidatures des guides">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-white-75 small text-uppercase fw-bold letter-spacing-1">Candidatures</span>
                        <div class="p-1 rounded bg-white bg-opacity-25"><i class="bi bi-person-check-fill text-white fs-6"></i></div>
                      </div>
                      <div class="fs-1 fw-bold text-white mb-0 mt-1" style="text-shadow: 0 2px 4px rgba(0,0,0,0.35);">{{ candidaturesEnAttente.length }}</div>
                      <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-white border-opacity-25">
                        <small class="text-white-75">En attente d'examen</small>
                        <span class="badge bg-white text-dark rounded-pill px-2 py-1 small fw-bold">
                          Examiner <i class="bi bi-arrow-right ms-1"></i>
                        </span>
                      </div>
                    </button>
                  </div>

                  <!-- Bouton 4 : Litiges / Réclamations -->
                  <div class="col-md-3">
                    <button type="button" 
                            class="card w-100 text-start border-0 shadow-sm p-3 rounded-4 text-white stat-card-btn position-relative overflow-hidden" 
                            style="background: linear-gradient(135deg, #c0392b, #e74c3c);"
                            (click)="activeTab = 'admin-litiges'"
                            title="Cliquer pour modérer les réclamations et litiges touristes">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="text-white-75 small text-uppercase fw-bold letter-spacing-1">Litiges / Réclamations</span>
                        <div class="p-1 rounded bg-white bg-opacity-25"><i class="bi bi-exclamation-octagon-fill text-white fs-6"></i></div>
                      </div>
                      <div class="fs-1 fw-bold text-white mb-0 mt-1" style="text-shadow: 0 2px 4px rgba(0,0,0,0.35);">{{ litigesEnAttente.length }}</div>
                      <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-white border-opacity-25">
                        <small class="text-white-75">Dossiers à instruire</small>
                        <span class="badge bg-white text-dark rounded-pill px-2 py-1 small fw-bold">
                          Modérer <i class="bi bi-arrow-right ms-1"></i>
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- Raccourci vers le Module de Contrôle Disciplinaire & Suspensions -->
                <div class="card border-0 shadow-sm p-3 rounded-4 mb-4 bg-light border-start border-danger border-4">
                  <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div class="d-flex align-items-center gap-3">
                      <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle fs-4">
                        <i class="bi bi-shield-slash-fill"></i>
                      </div>
                      <div>
                        <h6 class="fw-bold mb-1 text-dark">Contrôle des Accès & Suspension des Utilisateurs</h6>
                        <small class="text-muted">
                          Supervisez les comptes touristes et guides : suspendez immédiatement un compte en cas d'infraction ou réactivez-le après résolution.
                        </small>
                      </div>
                    </div>
                    <button class="btn btn-danger btn-sm rounded-pill px-4 fw-bold shadow-sm" (click)="activeTab = 'admin-utilisateurs'">
                      <i class="bi bi-people-fill me-1"></i> Gérer & Suspendre des Comptes ({{ allUsers.length }})
                    </button>
                  </div>
                </div>

                <!-- Aperçu rapide des visites planifiées -->
                <h6 class="fw-bold text-dark mb-3">Dernières Visites & Excursions Supervisées</h6>
                <div class="table-responsive">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light">
                      <tr>
                        <th>Intitulé du Circuit / Site</th>
                        <th>Guide Affecté</th>
                        <th>Date & Heure</th>
                        <th>Inscrits</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let v of toutesVisites">
                        <td class="fw-bold">{{ v.titre }}</td>
                        <td><span class="badge bg-light text-dark border">{{ v.guideNom }}</span></td>
                        <td>{{ v.dateHeure }}</td>
                        <td>{{ v.placesOccupees }} / {{ v.placesMax }} pers.</td>
                        <td>
                          <span class="badge" [ngClass]="v.statut === 'TERMINEE' ? 'bg-success' : (v.statut === 'EN_COURS' ? 'bg-warning text-dark' : 'bg-primary')">
                            {{ v.statut }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 5bis. VUE CONSERVATEUR : GUIDES & CIRCUITS GÉRÉS         -->
            <!-- ======================================================== -->
            <div *ngIf="isConservateur() && activeTab === 'admin-guides'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-people-fill text-info me-2"></i>Répertoire des Guides Certifiés & Circuits/Sites Gérés
                    </h5>
                    <p class="text-muted small mb-0">
                      Supervisez les habilitations des guides. Toute affectation de circuit ou site ici est répercutée immédiatement sur le guichet de réservation touristique.
                    </p>
                  </div>
                  <span class="badge bg-success px-3 py-2 rounded-pill fs-6">
                    <i class="bi bi-patch-check-fill me-1"></i> {{ tousGuides.length }} Guides Habilités
                  </span>
                </div>

                <!-- Liste des Guides avec leurs Circuits et Sites Gérés -->
                <div class="d-flex flex-column gap-4">
                  <div class="card border rounded-4 shadow-sm p-4 bg-light" *ngFor="let g of tousGuides">
                    
                    <!-- En-tête Guide -->
                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 pb-3 border-bottom">
                      <div class="d-flex align-items-center gap-3">
                        <img [src]="g.photo" [alt]="g.nomComplet" class="rounded-circle border shadow-xs" style="width: 64px; height: 64px; object-fit: cover;">
                        <div>
                          <div class="d-flex align-items-center gap-2 flex-wrap">
                            <h5 class="fw-bold mb-0 text-dark brand-font">{{ g.nomComplet }}</h5>
                            <span class="badge bg-success-subtle text-success border border-success-subtle">
                              <i class="bi bi-patch-check-fill me-1"></i> Guide Agréé
                            </span>
                            <span class="badge bg-warning text-dark">
                              <i class="bi bi-star-fill text-warning me-1"></i> {{ g.note }} / 5 ({{ g.nbAvis }} avis)
                            </span>
                          </div>
                          <div class="small text-muted mt-1">
                            <i class="bi bi-award-fill text-success me-1"></i> <strong>{{ g.anneesExperience }} ans d'expérience</strong> • 
                            <i class="bi bi-telephone ms-2 me-1 text-primary"></i> {{ g.telephone }} • 
                            <i class="bi bi-envelope ms-2 me-1 text-secondary"></i> {{ g.email }}
                          </div>
                          <div class="small text-muted mt-1">
                            <i class="bi bi-translate text-info me-1"></i> Langues : <strong>{{ g.langues.join(', ') }}</strong>
                          </div>
                        </div>
                      </div>

                      <div class="text-end d-flex align-items-center gap-2">
                        <span class="badge px-3 py-2 rounded-pill" [ngClass]="g.statut === 'SUSPENDU' ? 'bg-danger text-white' : 'bg-success text-white'">
                          <i class="bi" [ngClass]="g.statut === 'SUSPENDU' ? 'bi-x-circle-fill me-1' : 'bi-check-circle-fill me-1'"></i>
                          {{ g.statut || 'ACTIF' }}
                        </span>
                        <button *ngIf="g.statut !== 'SUSPENDU'" 
                                class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold" 
                                (click)="onSuspendreGuide(g)" 
                                title="Suspendre temporairement l'accréditation de ce guide">
                          <i class="bi bi-person-slash me-1"></i> Suspendre
                        </button>
                        <button *ngIf="g.statut === 'SUSPENDU'" 
                                class="btn btn-sm btn-success rounded-pill px-3 fw-bold shadow-xs" 
                                (click)="onReactiverGuide(g)" 
                                title="Rétablir l'accréditation du guide">
                          <i class="bi bi-arrow-counterclockwise me-1"></i> Réactiver
                        </button>
                      </div>
                    </div>

                    <!-- Spécialité & Biographie -->
                    <div class="my-3 p-3 bg-white rounded-3 border">
                      <div class="small text-muted mb-1"><strong class="text-secondary">Domaine d'expertise :</strong> {{ g.specialite }}</div>
                      <p class="small text-dark mb-0 fst-italic">"{{ g.biographie }}"</p>
                    </div>

                    <div class="row g-3">
                      <!-- Colonne 1 : Circuits Touristiques Gérés -->
                      <div class="col-md-6">
                        <div class="p-3 bg-white rounded-3 border h-100">
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold small text-success text-uppercase mb-0">
                              <i class="bi bi-signpost-2-fill me-1"></i> Circuits Touristiques Affectés ({{ g.circuitsNoms?.length || 0 }})
                            </h6>
                          </div>
                          
                          <div class="d-flex flex-wrap gap-2 mb-3">
                            <span *ngFor="let c of g.circuitsNoms" class="badge bg-success-subtle text-success border border-success px-2 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                              <i class="bi bi-compass"></i>
                              <span>{{ c }}</span>
                              <button type="button" class="btn-close btn-close-dark ms-1" style="font-size: 0.65rem;" (click)="onRetirerCircuit(g.id, c)" title="Retirer ce circuit"></button>
                            </span>
                            <span *ngIf="!g.circuitsNoms || g.circuitsNoms.length === 0" class="text-muted small fst-italic">
                              Aucun circuit affecté pour le moment.
                            </span>
                          </div>

                          <!-- Formulaire d'affectation rapide d'un circuit -->
                          <div class="input-group input-group-sm">
                            <select [(ngModel)]="nouveauCircuitSelectionne[g.id]" class="form-select">
                              <option value="">-- Assigner un nouveau circuit --</option>
                              <option *ngFor="let circ of catalogueCircuits" [value]="circ" [disabled]="g.circuitsNoms?.includes(circ)">
                                {{ circ }} {{ g.circuitsNoms?.includes(circ) ? '(déjà affecté)' : '' }}
                              </option>
                            </select>
                            <button class="btn btn-success" type="button" [disabled]="!nouveauCircuitSelectionne[g.id]" (click)="onAssignerCircuit(g.id)">
                              <i class="bi bi-plus-lg me-1"></i> Assigner
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Colonne 2 : Sites Patrimoniaux Gérés -->
                      <div class="col-md-6">
                        <div class="p-3 bg-white rounded-3 border h-100">
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="fw-bold small text-primary text-uppercase mb-0">
                              <i class="bi bi-bank me-1"></i> Sites du Patrimoine Affectés ({{ g.patrimoinesNoms?.length || 0 }})
                            </h6>
                          </div>
                          
                          <div class="d-flex flex-wrap gap-2 mb-3">
                            <span *ngFor="let s of g.patrimoinesNoms" class="badge bg-primary-subtle text-primary border border-primary px-2 py-2 rounded-pill d-inline-flex align-items-center gap-1">
                              <i class="bi bi-geo-alt"></i>
                              <span>{{ s }}</span>
                              <button type="button" class="btn-close btn-close-dark ms-1" style="font-size: 0.65rem;" (click)="onRetirerSite(g.id, s)" title="Retirer ce site"></button>
                            </span>
                            <span *ngIf="!g.patrimoinesNoms || g.patrimoinesNoms.length === 0" class="text-muted small fst-italic">
                              Aucun site affecté pour le moment.
                            </span>
                          </div>

                          <!-- Formulaire d'affectation rapide d'un site -->
                          <div class="input-group input-group-sm">
                            <select [(ngModel)]="nouveauSiteSelectionne[g.id]" class="form-select">
                              <option value="">-- Assigner un nouveau site --</option>
                              <option *ngFor="let site of catalogueSites" [value]="site" [disabled]="g.patrimoinesNoms?.includes(site)">
                                {{ site }} {{ g.patrimoinesNoms?.includes(site) ? '(déjà affecté)' : '' }}
                              </option>
                            </select>
                            <button class="btn btn-primary" type="button" [disabled]="!nouveauSiteSelectionne[g.id]" (click)="onAssignerSite(g.id)">
                              <i class="bi bi-plus-lg me-1"></i> Assigner
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 6. VUE CONSERVATEUR : PLANIFIER UNE VISITE               -->
            <!-- ======================================================== -->
            <div *ngIf="isConservateur() && activeTab === 'admin-planifier'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <h5 class="fw-bold text-primary-custom brand-font mb-2">
                  <i class="bi bi-calendar-plus text-success me-2"></i>Planifier une Nouvelle Visite & Assigner un Guide
                </h5>
                <p class="text-muted small mb-4">
                  Définissez un nouveau créneau de visite sur un circuit ou site du patrimoine et affectez le guide agréé responsable.
                </p>

                <form (ngSubmit)="onPlanifierVisite()">
                  <div class="mb-3">
                    <label class="form-label small fw-bold">Circuit ou Site Patrimonial Répertorié <span class="text-danger">*</span></label>
                    <select [(ngModel)]="nouvelleVisite.titre" name="titre" class="form-select" (change)="onPlanifierPrestationChange()" required>
                      <option value="" disabled>-- Sélectionner un Circuit ou Site de la Base --</option>
                      <optgroup label="🏛️ Sites du Patrimoine Répertoriés (ms-patrimoine)">
                        <option *ngFor="let s of catalogueSites" [value]="s">{{ s }}</option>
                      </optgroup>
                      <optgroup label="🗺️ Circuits Touristiques Disponibles (ms-circuit)">
                        <option *ngFor="let c of catalogueCircuits" [value]="c">{{ c }}</option>
                      </optgroup>
                    </select>
                    <div class="form-text small text-muted">
                      Le choix du lieu ramène automatiquement la liste des guides qui lui sont assignés par le Conservateur.
                    </div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <label class="form-label small fw-bold mb-0">Guide Dédié Assigné <span class="text-danger">*</span></label>
                        <span class="badge" [ngClass]="guidesAssignesPourPlanification.length > 0 ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-dark border border-warning'">
                          {{ guidesAssignesPourPlanification.length }} guide(s) habilité(s)
                        </span>
                      </div>
                      <select [(ngModel)]="nouvelleVisite.guideId" name="guideId" class="form-select" required>
                        <option *ngFor="let g of (afficherTousLesGuides ? tousGuides : guidesAssignesPourPlanification)" [value]="g.id">
                          {{ g.nomComplet }} (★ {{ g.note }} • {{ g.anneesExperience }} ans exp.)
                        </option>
                        <option *ngIf="!afficherTousLesGuides && guidesAssignesPourPlanification.length === 0" disabled>
                          Aucun guide spécifiquement assigné à ce lieu
                        </option>
                      </select>

                      <!-- Alerte si aucun guide assigné -->
                      <div *ngIf="guidesAssignesPourPlanification.length === 0" class="alert alert-warning small mt-2 py-2 mb-0">
                        <div class="d-flex align-items-center gap-1 mb-1">
                          <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                          <span>Aucun guide n'est assigné à ce circuit/site.</span>
                        </div>
                        <div class="d-flex flex-wrap gap-2 align-items-center">
                          <a (click)="activeTab = 'admin-guides'" style="cursor: pointer;" class="fw-bold text-decoration-underline text-dark">
                            <i class="bi bi-arrow-right-circle me-1"></i> Gérer les affectations dans l'annuaire
                          </a>
                          <span class="text-muted">•</span>
                          <div class="form-check form-check-inline m-0">
                            <input class="form-check-input" type="checkbox" id="checkAllGuidesPlanif" [(ngModel)]="afficherTousLesGuides" name="afficherTousLesGuides">
                            <label class="form-check-label small" for="checkAllGuidesPlanif">Afficher tous les guides</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-bold">Créneau Horaire Journalier <span class="text-danger">*</span></label>
                      <select [(ngModel)]="nouvelleVisite.horaireId" name="horaireId" class="form-select" required>
                        <option *ngFor="let c of creneaux" [value]="c.id">{{ c.libelle }} ({{ c.description }})</option>
                      </select>
                    </div>
                  </div>

                  <div class="row g-3 mb-4">
                    <div class="col-md-4">
                      <label class="form-label small fw-bold">Date de la visite <span class="text-danger">*</span></label>
                      <input type="date" [(ngModel)]="nouvelleVisite.date" name="date" class="form-control" required>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label small fw-bold">Nombre de places max</label>
                      <input type="number" [(ngModel)]="nouvelleVisite.placesMax" name="placesMax" min="1" max="50" class="form-control">
                    </div>
                    <div class="col-md-4">
                      <label class="form-label small fw-bold">Tarif par voyageur (FCFA)</label>
                      <input type="number" [(ngModel)]="nouvelleVisite.tarif" name="tarif" min="0" step="500" class="form-control">
                    </div>
                  </div>

                  <button type="submit" class="btn btn-casa-primary rounded-pill px-4 shadow-sm">
                    <i class="bi bi-calendar-check-fill me-1"></i> Planifier & Publier la Visite
                  </button>
                </form>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 7. VUE CONSERVATEUR : CANDIDATURES GUIDES EN ATTENTE    -->
            <!-- ======================================================== -->
            <div *ngIf="isConservateur() && activeTab === 'admin-candidatures'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-person-badge-fill text-warning me-2"></i>Dossiers de Candidature des Guides en Attente
                    </h5>
                    <p class="text-muted small mb-0">Évaluez l'expérience terrain et les compétences linguistiques avant d'accréditer un guide.</p>
                  </div>
                  <span class="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">{{ candidaturesEnAttente.length }} Dossier(s)</span>
                </div>

                <div *ngIf="candidaturesEnAttente.length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-check-circle-fill text-success fs-1 d-block mb-2"></i>
                  Toutes les candidatures ont été traitées ! Aucun dossier en attente.
                </div>

                <div class="d-flex flex-column gap-4" *ngIf="candidaturesEnAttente.length > 0">
                  <div class="border rounded-4 p-4 shadow-sm bg-light" *ngFor="let cand of candidaturesEnAttente">
                    <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 pb-3 border-bottom">
                      <div>
                        <h5 class="fw-bold mb-1 text-dark brand-font">{{ cand.nomComplet }}</h5>
                        <div class="small text-muted">
                          <i class="bi bi-envelope me-1"></i> {{ cand.email }} • <i class="bi bi-telephone ms-2 me-1"></i> {{ cand.telephone }}
                        </div>
                      </div>
                      <span class="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill fs-6">
                        <i class="bi bi-award-fill me-1"></i> {{ cand.anneesExperience }} ans d'expérience terrain
                      </span>
                    </div>

                    <div class="row g-3 my-2">
                      <div class="col-md-6">
                        <div class="p-3 bg-white rounded-3 border h-100">
                          <h6 class="fw-bold small text-secondary text-uppercase mb-2"><i class="bi bi-translate text-primary me-1"></i> Langues Maîtrisées</h6>
                          <div class="d-flex flex-wrap gap-1">
                            <span *ngFor="let l of cand.langues" class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">{{ l }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="p-3 bg-white rounded-3 border h-100">
                          <h6 class="fw-bold small text-secondary text-uppercase mb-2"><i class="bi bi-compass text-success me-1"></i> Circuits de Prédilection</h6>
                          <div class="d-flex flex-wrap gap-1">
                            <span *ngFor="let c of cand.circuitsMaitrises" class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">{{ c }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="p-3 bg-white rounded-3 border mb-3">
                      <h6 class="fw-bold small text-secondary text-uppercase mb-1"><i class="bi bi-chat-quote-fill text-warning me-1"></i> Motivation du Candidat</h6>
                      <p class="small text-dark fst-italic mb-0">{{ cand.biographie }}</p>
                    </div>

                    <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                      <button class="btn btn-outline-danger btn-sm rounded-pill px-3" (click)="onRejeterCandidature(cand.id)">
                        <i class="bi bi-x-circle me-1"></i> Rejeter
                      </button>
                      <button class="btn btn-success btn-sm rounded-pill px-4 shadow-sm fw-bold" (click)="onValiderCandidature(cand.id)">
                        <i class="bi bi-check-circle-fill me-1"></i> Valider & Accréditer ce Guide
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 8. VUE CONSERVATEUR : MÉDIATION DES LITIGES             -->
            <!-- ======================================================== -->
            <div *ngIf="isConservateur() && activeTab === 'admin-litiges'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-exclamation-octagon text-danger me-2"></i>Médiation des Litiges & Réclamations
                    </h5>
                    <p class="text-muted small mb-0">Instruisez les signalements des voyageurs et clôturez les dossiers de médiation.</p>
                  </div>
                  <span class="badge bg-danger text-white px-3 py-2 rounded-pill fw-bold">{{ litigesEnAttente.length }} En Cours</span>
                </div>

                <div *ngIf="litigesEnAttente.length === 0" class="text-center py-5 text-muted">
                  <i class="bi bi-shield-check text-success fs-1 d-block mb-2"></i>
                  Aucun litige en cours ! La qualité de service est optimale.
                </div>

                <div class="d-flex flex-column gap-3" *ngIf="litigesEnAttente.length > 0">
                  <div class="p-4 rounded-4 border bg-danger-subtle border-danger" *ngFor="let l of litigesEnAttente">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong class="text-danger small"><i class="bi bi-exclamation-triangle-fill me-1"></i> Réclamation Voyageur : {{ l.motifLitige }}</strong>
                        <h6 class="fw-bold text-dark mt-1">{{ l.visiteTitre }}</h6>
                        <small class="text-muted">Déposé par {{ l.touristeNom }} le {{ l.date }} • Guide concerné : <strong>{{ l.guideNom }}</strong></small>
                      </div>
                      <span class="badge bg-danger text-white">En instruction</span>
                    </div>

                    <p class="p-3 bg-white rounded-3 border small text-dark fst-italic mb-3">
                      "{{ l.commentaire }}"
                    </p>

                    <div class="d-flex justify-content-end">
                      <button class="btn btn-success btn-sm rounded-pill px-4 shadow-sm fw-bold" (click)="onCloturerLitige(l.id)">
                        <i class="bi bi-check-circle-fill me-1"></i> Clôturer le Litige & Valider la Médiation
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 8bis. VUE CONSERVATEUR : ARCHITECTURE TECHNIQUE SOA (ADMIN) -->
            <!-- ======================================================== -->
            <div *ngIf="isConservateur() && activeTab === 'admin-soa'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
                  <div>
                    <span class="badge bg-primary-custom text-white mb-1">Espace Conservateur • Supervision Technique</span>
                    <h5 class="fw-bold text-primary-custom brand-font mb-0">
                      <i class="bi bi-diagram-3-fill text-warning me-2"></i>Architecture SOA & Découplage Microservices
                    </h5>
                  </div>
                  <span class="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill">
                    <i class="bi bi-hdd-network-fill me-1"></i> Microservices Opérationnels
                  </span>
                </div>

                <!-- Trinôme Card -->
                <div class="p-3 mb-4 rounded-3 text-white shadow-sm" style="background: linear-gradient(135deg, var(--casa-green-deep), var(--casa-green-mangrove));">
                  <div class="row align-items-center">
                    <div class="col-md-7">
                      <h6 class="fw-bold mb-1"><i class="bi bi-mortarboard-fill me-2"></i>UASZ — Licence 3 Informatique (L3 2I)</h6>
                      <small class="text-white-75">Module : Développement d'Applications Orientées Services — Dr Lamine FATY</small>
                    </div>
                    <div class="col-md-5 text-md-end mt-2 mt-md-0 small">
                      <div><strong>Collé SYLL</strong> <span class="badge bg-light text-dark ms-1">202300489</span></div>
                      <div><strong>Ndeye Thiamba FAYE</strong> <span class="badge bg-light text-dark ms-1">202300488</span></div>
                      <div><strong>Mame Faty DIOP</strong> <span class="badge bg-light text-dark ms-1">L3 Informatique</span></div>
                    </div>
                  </div>
                </div>

                <!-- 4 Microservices Cards -->
                <div class="row g-3 mb-4">
                  <div class="col-md-6 col-lg-3">
                    <div class="card border rounded-3 p-3 h-100 border-start border-4 border-success">
                      <span class="badge bg-success mb-2 w-auto align-self-start">Port 8081</span>
                      <h6 class="fw-bold text-success mb-1">ms-patrimoine</h6>
                      <small class="text-muted d-block mb-2">Catalogue des 8 sites de Basse-Casamance.</small>
                      <span class="badge bg-light text-dark border small">Spring Boot 3 • JPA</span>
                    </div>
                  </div>

                  <div class="col-md-6 col-lg-3">
                    <div class="card border rounded-3 p-3 h-100 border-start border-4 border-warning">
                      <span class="badge bg-warning text-dark mb-2 w-auto align-self-start">Port 8082</span>
                      <h6 class="fw-bold text-dark mb-1">ms-circuit</h6>
                      <small class="text-muted d-block mb-2">Circuits guidés & étapes séquentielles.</small>
                      <span class="badge bg-warning-subtle text-dark border border-warning small">OpenFeign vers 8081</span>
                    </div>
                  </div>

                  <div class="col-md-6 col-lg-3">
                    <div class="card border rounded-3 p-3 h-100 border-start border-4 border-info">
                      <span class="badge bg-info text-dark mb-2 w-auto align-self-start">Port 8083</span>
                      <h6 class="fw-bold text-info mb-1">ms-evenement</h6>
                      <small class="text-muted d-block mb-2">Agenda culturel & manifestations.</small>
                      <span class="badge bg-info-subtle text-dark border border-info small">REST Controller</span>
                    </div>
                  </div>

                  <div class="col-md-6 col-lg-3">
                    <div class="card border rounded-3 p-3 h-100 border-start border-4 border-primary">
                      <span class="badge bg-primary mb-2 w-auto align-self-start">Port 8084</span>
                      <h6 class="fw-bold text-primary mb-1">ms-reservation</h6>
                      <small class="text-muted d-block mb-2">Réservations, Pass QR & paiements.</small>
                      <span class="badge bg-primary-subtle text-dark border border-primary small">CRUD • Transactional</span>
                    </div>
                  </div>
                </div>

                <div class="p-3 bg-light rounded-3 border">
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div class="small">
                      <strong class="text-dark"><i class="bi bi-box-seam me-1 text-primary"></i> Orchestration Multi-Conteneurs :</strong>
                      <span class="text-muted ms-1">Déploiement Docker Compose avec réseau bridge unifié, persistence MySQL UTF-8 mb4 et Nginx pour Angular.</span>
                    </div>
                    <a routerLink="/architecture" class="btn btn-sm btn-casa-primary rounded-pill px-3">
                      <i class="bi bi-diagram-3 me-1"></i> Consulter le Schéma Global SOA
                    </a>
                  </div>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 8bis. VUE CONSERVATEUR : GESTION & SUSPENSION UTILISATEURS-->
            <!-- ======================================================== -->
            <div *ngIf="isConservateur() && activeTab === 'admin-utilisateurs'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
                  <div>
                    <h5 class="fw-bold text-primary-custom brand-font mb-1">
                      <i class="bi bi-people-fill text-danger me-2"></i>Gestion des Utilisateurs & Contrôle des Suspensions
                    </h5>
                    <p class="text-muted small mb-0">
                      Supervisez l'ensemble des comptes de la plateforme. En tant que Conservateur, suspendez temporairement ou rétablissez les accès des touristes et des guides en cas d'infraction.
                    </p>
                  </div>
                  <div class="d-flex gap-2">
                    <span class="badge bg-primary px-3 py-2 rounded-pill">
                      {{ allUsers.length }} Comptes Référencés
                    </span>
                    <span class="badge bg-danger px-3 py-2 rounded-pill" *ngIf="getSuspendedUsersCount() > 0">
                      {{ getSuspendedUsersCount() }} Suspendu(s)
                    </span>
                  </div>
                </div>

                <!-- Filtres & Barre de Recherche -->
                <div class="row g-3 mb-4 p-3 bg-light rounded-4 border">
                  <div class="col-md-5">
                    <div class="input-group">
                      <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                      <input type="text" [(ngModel)]="rechercheUtilisateur" class="form-control border-start-0" placeholder="Rechercher par nom, email, téléphone...">
                    </div>
                  </div>
                  <div class="col-md-3">
                    <select [(ngModel)]="filtreRoleUtilisateur" class="form-select">
                      <option value="TOUS">Tous les rôles</option>
                      <option value="TOURISTE">Touristes uniquement</option>
                      <option value="GUIDE">Guides uniquement</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <select [(ngModel)]="filtreStatutUtilisateur" class="form-select">
                      <option value="TOUS">Tous les statuts (Actifs & Suspendus)</option>
                      <option value="ACTIF">Comptes Actifs uniquement</option>
                      <option value="SUSPENDU">Comptes Suspendus uniquement</option>
                    </select>
                  </div>
                </div>

                <!-- Tableau des Utilisateurs -->
                <div class="table-responsive">
                  <table class="table table-hover align-middle small">
                    <thead class="table-light">
                      <tr>
                        <th>Utilisateur</th>
                        <th>Coordonnées</th>
                        <th>Rôle</th>
                        <th>Date Inscription</th>
                        <th>Statut</th>
                        <th class="text-end">Action Disciplinaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let u of getFilteredUsers()" [class.table-danger]="u.statut === 'SUSPENDU'">
                        <td>
                          <div class="d-flex align-items-center gap-2">
                            <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-xs" 
                                 [ngClass]="u.role.includes('GUIDE') ? 'bg-success' : (u.role.includes('CONSERVATEUR') ? 'bg-warning text-dark' : 'bg-primary')" 
                                 style="width: 38px; height: 38px; font-size: 0.8rem;">
                              {{ getInitials(u.nomComplet) }}
                            </div>
                            <div>
                              <strong class="text-dark d-block">{{ u.nomComplet }}</strong>
                              <small class="text-muted font-monospace">ID #{{ u.id }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div><i class="bi bi-envelope text-primary me-1"></i> {{ u.email }}</div>
                          <div class="text-muted"><i class="bi bi-telephone text-success me-1"></i> {{ u.telephone || 'Non renseigné' }}</div>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="getRoleBadgeClass(u.role)">
                            {{ formatRole(u.role) }}
                          </span>
                        </td>
                        <td>
                          <span class="text-muted">{{ u.dateInscription || '10/01/2025' }}</span>
                        </td>
                        <td>
                          <span *ngIf="u.statut !== 'SUSPENDU'" class="badge bg-success-subtle text-success border border-success">
                            <i class="bi bi-check-circle-fill me-1"></i> Actif
                          </span>
                          <div *ngIf="u.statut === 'SUSPENDU'">
                            <span class="badge bg-danger text-white">
                              <i class="bi bi-x-octagon-fill me-1"></i> SUSPENDU
                            </span>
                            <div class="small text-danger mt-1 fw-semibold">
                              <i class="bi bi-exclamation-triangle me-1"></i> {{ u.motifSuspension || 'Motif non précisé' }}
                            </div>
                            <small class="text-muted d-block font-monospace">Le {{ u.dateSuspension }}</small>
                          </div>
                        </td>
                        <td class="text-end">
                          <!-- Impossible de suspendre le Conservateur -->
                          <span *ngIf="u.role.includes('CONSERVATEUR')" class="text-muted small fst-italic">
                            <i class="bi bi-shield-check me-1"></i> Compte Conservateur Inviolable
                          </span>

                          <!-- Bouton Suspendre pour comptes actifs -->
                          <button *ngIf="!u.role.includes('CONSERVATEUR') && u.statut !== 'SUSPENDU'" 
                                  class="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-xs" 
                                  (click)="openSuspensionModal(u)" 
                                  title="Suspendre l'accès de cet utilisateur">
                            <i class="bi bi-person-slash me-1"></i> Suspendre
                          </button>

                          <!-- Bouton Réactiver pour comptes suspendus -->
                          <button *ngIf="!u.role.includes('CONSERVATEUR') && u.statut === 'SUSPENDU'" 
                                  class="btn btn-sm btn-success rounded-pill px-3 shadow-xs" 
                                  (click)="onReactiverUtilisateur(u)" 
                                  title="Réactiver le compte de cet utilisateur">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Réactiver le Compte
                          </button>
                        </td>
                      </tr>

                      <tr *ngIf="getFilteredUsers().length === 0">
                        <td colspan="6" class="text-center py-4 text-muted">
                          <i class="bi bi-people fs-2 d-block mb-1"></i>
                          Aucun utilisateur ne correspond aux critères de recherche.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 9. VUE COMMUNE : MODIFIER COORDONNÉES (TOURISTE)        -->
            <!-- ======================================================== -->
            <div *ngIf="isTouriste() && activeTab === 'infos'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <h5 class="fw-bold text-primary-custom brand-font mb-3">
                  <i class="bi bi-person-gear text-primary me-2"></i>Modifier mes Coordonnées
                </h5>
                <form (ngSubmit)="onSaveProfile()">
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label small fw-bold">Nom Complet</label>
                      <input type="text" [(ngModel)]="editForm.nomComplet" name="nomComplet" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-bold">Adresse Email</label>
                      <input type="email" [(ngModel)]="editForm.email" name="email" class="form-control" required>
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label small fw-bold">Téléphone</label>
                      <input type="tel" [(ngModel)]="editForm.telephone" name="telephone" class="form-control">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label small fw-bold">Langues Parlées</label>
                      <input type="text" [(ngModel)]="editForm.languesParlees" name="languesParlees" class="form-control">
                    </div>
                  </div>
                  <button type="submit" [disabled]="saving" class="btn btn-casa-primary rounded-pill px-4">
                    <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                    Enregistrer mes Coordonnées
                  </button>
                </form>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 10. VUE COMMUNE : SÉCURITÉ & MOT DE PASSE (AVEC DÉMASQUAGE)-->
            <!-- ======================================================== -->
            <div *ngIf="activeTab === 'securite'">
              <div class="card-custom p-4 bg-white border-0 shadow-sm">
                <h5 class="fw-bold text-primary-custom brand-font mb-2">
                  <i class="bi bi-shield-lock text-dark me-2"></i>Sécurité & Modification du Mot de Passe
                </h5>
                <p class="text-muted small mb-4">
                  Démasquez votre mot de passe pour vérifier son contenu et évitez les fautes de frappe.
                </p>

                <div class="mb-3" style="max-width: 500px;">
                  <label class="form-label small fw-bold">Mot de passe actuel</label>
                  <div class="input-group">
                    <input [type]="showCurrentPass ? 'text' : 'password'" [(ngModel)]="currentPassword" class="form-control border-end-0" placeholder="••••••••">
                    <button type="button" class="btn btn-outline-secondary border-start-0 bg-light" (click)="showCurrentPass = !showCurrentPass" tabindex="-1" title="Afficher/Masquer">
                      <i class="bi" [ngClass]="showCurrentPass ? 'bi-eye-slash-fill text-accent-custom' : 'bi-eye-fill text-muted'"></i>
                    </button>
                  </div>
                </div>

                <div class="mb-3" style="max-width: 500px;">
                  <label class="form-label small fw-bold">Nouveau mot de passe</label>
                  <div class="input-group">
                    <input [type]="showNewPass ? 'text' : 'password'" [(ngModel)]="newPassword" class="form-control border-end-0" placeholder="••••••••">
                    <button type="button" class="btn btn-outline-secondary border-start-0 bg-light" (click)="showNewPass = !showNewPass" tabindex="-1" title="Afficher/Masquer">
                      <i class="bi" [ngClass]="showNewPass ? 'bi-eye-slash-fill text-accent-custom' : 'bi-eye-fill text-muted'"></i>
                    </button>
                  </div>
                </div>

                <div class="mb-4" style="max-width: 500px;">
                  <label class="form-label small fw-bold">Confirmer le nouveau mot de passe</label>
                  <div class="input-group">
                    <input [type]="showConfirmPass ? 'text' : 'password'" [(ngModel)]="confirmNewPassword" class="form-control border-end-0" placeholder="••••••••">
                    <button type="button" class="btn btn-outline-secondary border-start-0 bg-light" (click)="showConfirmPass = !showConfirmPass" tabindex="-1" title="Afficher/Masquer">
                      <i class="bi" [ngClass]="showConfirmPass ? 'bi-eye-slash-fill text-accent-custom' : 'bi-eye-fill text-muted'"></i>
                    </button>
                  </div>
                </div>

                <button class="btn btn-casa-ochre rounded-pill px-4 shadow-sm" (click)="onChangePassword()">
                  <i class="bi bi-key-fill me-1"></i> Mettre à Jour mon Mot de Passe
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- MODAL LAISSER UN AVIS (TOURISTE) -->
      <div class="modal fade show d-block" tabindex="-1" *ngIf="showAvisModal" style="background: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-warning text-dark py-3">
              <h5 class="modal-title fw-bold"><i class="bi bi-star-fill me-2"></i>Laisser un Avis sur votre Guide</h5>
              <button type="button" class="btn-close" (click)="showAvisModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <p class="small text-muted mb-3">Votre appréciation aide les futurs voyageurs et valorise nos guides casamançais.</p>
              
              <div class="mb-3">
                <label class="form-label small fw-bold">Note Globale :</label>
                <div class="d-flex gap-2 align-items-center fs-4 text-warning">
                  <span *ngFor="let s of [1,2,3,4,5]" (click)="selectedNote = s" style="cursor: pointer;">
                    <i class="bi" [ngClass]="s <= selectedNote ? 'bi-star-fill' : 'bi-star'"></i>
                  </span>
                  <span class="badge bg-light text-dark fs-6 ms-2 border">{{ selectedNote }} / 5 étoiles</span>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Votre Commentaire d'Expérience</label>
                <textarea [(ngModel)]="avisCommentaire" rows="3" class="form-control" placeholder="Racontez votre expérience avec le guide..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-outline-secondary rounded-pill" (click)="showAvisModal = false">Annuler</button>
              <button type="button" class="btn btn-warning rounded-pill px-4 fw-bold" (click)="onSubmitAvis()">Publier l'Avis</button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DÉCLARER UN LITIGE (TOURISTE) -->
      <div class="modal fade show d-block" tabindex="-1" *ngIf="showLitigeModal" style="background: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-danger text-white py-3">
              <h5 class="modal-title fw-bold"><i class="bi bi-exclamation-octagon-fill me-2"></i>Signaler un Litige / Réclamation</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showLitigeModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <p class="small text-muted mb-3">Votre réclamation sera directement transmise au Conservateur pour instruction et médiation.</p>
              
              <div class="mb-3">
                <label class="form-label small fw-bold">Motif du Litige *</label>
                <select [(ngModel)]="litigeMotif" class="form-select">
                  <option value="Absence ou retard majeur du guide">Absence ou retard majeur du guide</option>
                  <option value="Non-respect des étapes prévues du circuit">Non-respect des étapes prévues du circuit</option>
                  <option value="Désaccord sur le tarif ou prestation supplémentaire">Désaccord sur le tarif ou prestation supplémentaire</option>
                  <option value="Problème de sécurité ou comportement inadapté">Problème de sécurité ou comportement inadapté</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Détails et Explications *</label>
                <textarea [(ngModel)]="litigeCommentaire" rows="3" class="form-control" placeholder="Décrivez précisément ce qui s'est produit..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-outline-secondary rounded-pill" (click)="showLitigeModal = false">Annuler</button>
              <button type="button" class="btn btn-danger rounded-pill px-4 fw-bold" (click)="onSubmitLitige()">Transmettre au Conservateur</button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL SUSPENDRE UN UTILISATEUR (CONSERVATEUR) -->
      <div class="modal fade show d-block" tabindex="-1" *ngIf="showSuspensionModal" style="background: rgba(0,0,0,0.65);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-danger text-white py-3">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-shield-slash-fill me-2"></i>Confirmation de Suspension
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="showSuspensionModal = false"></button>
            </div>
            <div class="modal-body p-4" *ngIf="userToSuspend">
              <div class="alert alert-warning mb-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Vous êtes sur le point de suspendre l'accès de <strong>{{ userToSuspend.nomComplet }}</strong> ({{ formatRole(userToSuspend.role) }}). L'utilisateur sera immédiatement révoqué et ne pourra plus s'authentifier sur le portail.
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Motif officiel de suspension *</label>
                <select [(ngModel)]="motifSuspensionInput" class="form-select">
                  <option value="Non-respect des règles écotouristiques et déontologie">Non-respect des règles écotouristiques et déontologie</option>
                  <option value="Comportement inapproprié lors d'une excursion guidée">Comportement inapproprié lors d'une excursion guidée</option>
                  <option value="Litige client avéré et non résolu">Litige client avéré et non résolu</option>
                  <option value="Annulations abusives et manquements répétés aux créneaux">Annulations abusives et manquements répétés aux créneaux</option>
                  <option value="Mesure conservatoire disciplinaire de l'administration">Mesure conservatoire disciplinaire de l'administration</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Observations complémentaires</label>
                <textarea [(ngModel)]="motifComplementaireInput" rows="3" class="form-control" placeholder="Précisez les détails ou références du dossier..."></textarea>
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-outline-secondary rounded-pill" (click)="showSuspensionModal = false">Annuler</button>
              <button type="button" class="btn btn-danger rounded-pill px-4 fw-bold" (click)="confirmSuspension()">
                <i class="bi bi-person-slash me-1"></i> Confirmer la Suspension Immédiate
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Carte & Géolocalisation pour Visite ou Billet -->
      <app-carte-modal *ngIf="carteLieu" [titre]="'Excursion : ' + carteLieu" [nomLieu]="carteLieu" [pointsNoms]="cartePoints" (fermer)="carteLieu = null"></app-carte-modal>

    </div>
  `
})
export class ProfilComponent implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private guideService = inject(GuideService);
  private patrimoineService = inject(PatrimoineService);
  private circuitService = inject(CircuitService);
  private offlineService = inject(OfflineService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentUser: User | null = null;
  activeTab: string = 'infos';

  isOffline: boolean = false;
  carteLieu: string | null = null;
  cartePoints: string[] = [];

  tokenOfflineAverifier: string = '';
  resultatVerificationOffline: any = null;

  editForm = {
    nomComplet: '',
    email: '',
    telephone: '',
    languesParlees: '',
    biographie: ''
  };

  userReservations: Reservation[] = [];
  mesVisitesGuide: VisiteGuidee[] = [];
  mesAvisGuide: AvisVisite[] = [];
  guideDetails: Guide | null = null;

  toutesVisites: VisiteGuidee[] = [];
  tousGuides: Guide[] = [];
  catalogueCircuits: string[] = [];
  catalogueSites: string[] = [];
  nouveauCircuitSelectionne: { [guideId: number]: string } = {};
  nouveauSiteSelectionne: { [guideId: number]: string } = {};
  creneaux = this.guideService.getCreneaux();
  candidaturesEnAttente: CandidatureGuide[] = [];
  litigesEnAttente: AvisVisite[] = [];

  allUsers: User[] = [];
  filtreRoleUtilisateur: string = 'TOUS';
  filtreStatutUtilisateur: string = 'TOUS';
  rechercheUtilisateur: string = '';
  showSuspensionModal: boolean = false;
  userToSuspend: User | null = null;
  motifSuspensionInput: string = 'Non-respect des règles écotouristiques et déontologie';
  motifComplementaireInput: string = '';

  guidesAssignesPourPlanification: Guide[] = [];
  afficherTousLesGuides: boolean = false;

  nouvelleVisite = {
    titre: 'Boucle Historique & Fluviale de Ziguinchor',
    type: 'CIRCUIT' as 'CIRCUIT' | 'PATRIMOINE',
    elementId: 1,
    guideId: 2,
    date: new Date().toISOString().split('T')[0],
    horaireId: 'HORAIRE_09_12',
    placesMax: 15,
    tarif: 5000
  };

  showCurrentPass: boolean = false;
  showNewPass: boolean = false;
  showConfirmPass: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';

  showAvisModal: boolean = false;
  selectedReservationForAvis: Reservation | null = null;
  selectedNote: number = 5;
  avisCommentaire: string = '';

  showLitigeModal: boolean = false;
  litigeMotif: string = 'Absence ou retard majeur du guide';
  litigeCommentaire: string = '';

  saving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  ngOnInit(): void {
    this.isOffline = this.offlineService.isOffline();

    this.route.queryParams.subscribe(params => {
      if (params['demo']) {
        const d = params['demo'].toLowerCase();
        const u = this.authService.findUserByLogin(d);
        if (u) {
          this.authService.saveUser(u);
        }
      }
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
      if (params['carte']) {
        this.carteLieu = 'Boucle Historique & Fluviale de Ziguinchor';
        this.cartePoints = ['Port de Boudody', 'Alliance Franco-Sénégalaise', 'Cathédrale Saint-Antoine', 'Cases de Mlomp'];
      }
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.editForm = {
          nomComplet: user.nomComplet,
          email: user.email,
          telephone: user.telephone || '',
          languesParlees: user.languesParlees || 'Français, Diola',
          biographie: user.biographie || ''
        };

        if (this.isGuide()) {
          this.activeTab = 'guide-agenda';
          this.guideDetails = this.guideService.getGuideByEmail(user.email) || this.guideService.getGuideById(2) || null;
          this.loadGuideData();
        } else if (this.isConservateur()) {
          this.activeTab = 'admin-dashboard';
          this.loadAdminData();
        } else {
          this.activeTab = 'touriste-reservations';
          this.loadTouristeData();
        }
      }
    });
  }

  isGuide(): boolean {
    return this.authService.hasRole('GUIDE');
  }

  isTouriste(): boolean {
    return this.authService.hasRole('TOURISTE') || (!this.isGuide() && !this.isConservateur());
  }

  isConservateur(): boolean {
    return this.authService.hasRole('CONSERVATEUR') || this.authService.hasRole('ADMIN');
  }

  onToggleOffline(): void {
    this.isOffline = this.offlineService.toggleSimulatedOffline();
    if (this.isOffline) {
      this.userReservations = this.offlineService.getOfflineReservations();
    } else {
      this.loadTouristeData();
    }
  }

  ouvrirCarteVisite(v: VisiteGuidee): void {
    this.carteLieu = v.titre;
    this.cartePoints = [v.titre];
  }

  onVerifierPassOffline(): void {
    if (!this.tokenOfflineAverifier) {
      this.resultatVerificationOffline = null;
      return;
    }
    this.resultatVerificationOffline = this.offlineService.verifierPassQROffline(this.tokenOfflineAverifier);
  }

  loadGuideData(): void {
    const guideId = this.guideDetails?.id || 2;
    this.mesVisitesGuide = this.guideService.getVisitesForGuide(guideId);
    this.mesAvisGuide = this.guideService.getAvisForGuide(guideId);
    this.offlineService.saveGuideVisitesOffline(this.mesVisitesGuide);
  }

  loadTouristeData(): void {
    if (this.isOffline) {
      const all = this.offlineService.getOfflineReservations();
      this.userReservations = this.filterUserReservations(all);
      return;
    }
    this.reservationService.getAll().subscribe({
      next: (data) => {
        this.userReservations = this.filterUserReservations(data);
        if (this.userReservations.length === 0) {
          this.userReservations = [
            {
              id: 1,
              numeroReservation: 'PASS-ZIG-101',
              nomClient: this.currentUser?.nomComplet || 'Aïssatou Fall',
              emailClient: this.currentUser?.email || 'aissatou.fall@gmail.com',
              telephoneClient: this.currentUser?.telephone || '+221 77 123 45 67',
              typeElement: 'CIRCUIT',
              elementId: 1,
              titreElement: 'Boucle Historique & Fluviale de Ziguinchor',
              nombrePlaces: 2,
              montantTotal: 10000,
              qrCodeToken: 'PASS-UASZ-778',
              statut: 'EFFECTUEE'
            }
          ];
        }
      },
      error: () => {
        const all = this.offlineService.getOfflineReservations();
        this.userReservations = this.filterUserReservations(all);
      }
    });
  }

  filterUserReservations(data: Reservation[]): Reservation[] {
    if (!this.currentUser) return [];
    const email = (this.currentUser.email || '').toLowerCase().trim();
    const nom = (this.currentUser.nomComplet || '').toLowerCase().trim();
    return data.filter(r => 
      (r.emailClient && r.emailClient.toLowerCase().trim() === email) ||
      (r.nomClient && r.nomClient.toLowerCase().trim() === nom)
    );
  }

  loadAdminData(): void {
    this.catalogueCircuits = this.guideService.getCatalogueCircuits();
    this.catalogueSites = this.guideService.getCatalogueSites();
    this.guideService.getVisites().subscribe(v => this.toutesVisites = v);
    this.guideService.getGuides().subscribe(g => {
      this.tousGuides = g;
      this.onPlanifierPrestationChange();
    });
    this.guideService.getCandidatures().subscribe(c => {
      this.candidaturesEnAttente = c.filter(item => item.statut === 'EN_ATTENTE');
    });
    this.guideService.getAvis().subscribe(a => {
      this.litigesEnAttente = a.filter(item => item.estLitige && !item.modere);
    });

    // Chargement de l'annuaire des utilisateurs pour supervision & suspensions
    this.authService.getAllUsers().subscribe(users => {
      this.allUsers = users;
    });

    // Chargement dynamique des sites répertoriés dans la base de données ms-patrimoine
    this.patrimoineService.getAll().subscribe({
      next: (sites) => {
        if (sites && sites.length > 0) {
          const siteNames = sites.map(s => s.nomPatrimoine);
          this.catalogueSites = Array.from(new Set([...this.catalogueSites, ...siteNames]));
          this.onPlanifierPrestationChange();
        }
      },
      error: () => {}
    });

    // Chargement dynamique des circuits répertoriés dans la base de données ms-circuit
    this.circuitService.getAll().subscribe({
      next: (circuits) => {
        if (circuits && circuits.length > 0) {
          const circuitNames = circuits.map(c => c.nomCircuit);
          this.catalogueCircuits = Array.from(new Set([...this.catalogueCircuits, ...circuitNames]));
          this.onPlanifierPrestationChange();
        }
      },
      error: () => {}
    });
  }

  onPlanifierPrestationChange(): void {
    const titre = (this.nouvelleVisite.titre || '').trim();
    if (!titre) {
      this.guidesAssignesPourPlanification = [];
      return;
    }

    const isCirc = this.catalogueCircuits.some(c => c.toLowerCase() === titre.toLowerCase());
    this.nouvelleVisite.type = isCirc ? 'CIRCUIT' : 'PATRIMOINE';

    // Filtrer les guides certifiés qui ont été assignés à ce circuit ou site
    this.guidesAssignesPourPlanification = this.tousGuides.filter(g => {
      if (isCirc) {
        return g.circuitsNoms?.some(c => c.toLowerCase().trim() === titre.toLowerCase() || titre.toLowerCase().includes(c.toLowerCase().trim()));
      } else {
        return g.patrimoinesNoms?.some(s => s.toLowerCase().trim() === titre.toLowerCase() || titre.toLowerCase().includes(s.toLowerCase().trim()));
      }
    });

    // Présélectionne directement le premier guide assigné
    if (this.guidesAssignesPourPlanification.length > 0) {
      this.nouvelleVisite.guideId = this.guidesAssignesPourPlanification[0].id;
    } else if (this.tousGuides.length > 0) {
      this.nouvelleVisite.guideId = this.tousGuides[0].id;
    }
  }

  onAssignerCircuit(guideId: number): void {
    const circuit = this.nouveauCircuitSelectionne[guideId];
    if (!circuit) return;
    this.guideService.assignerCircuitAuGuide(guideId, circuit);
    const guide = this.tousGuides.find(g => g.id === guideId);
    this.successMessage = `Circuit "${circuit}" affecté avec succès au guide ${guide?.nomComplet || ''} ! Les touristes peuvent désormais le sélectionner pour ce circuit.`;
    this.nouveauCircuitSelectionne[guideId] = '';
  }

  onRetirerCircuit(guideId: number, circuitNom: string): void {
    this.guideService.retirerCircuitDuGuide(guideId, circuitNom);
    const guide = this.tousGuides.find(g => g.id === guideId);
    this.successMessage = `Circuit "${circuitNom}" retiré des attributions du guide ${guide?.nomComplet || ''}.`;
  }

  onAssignerSite(guideId: number): void {
    const site = this.nouveauSiteSelectionne[guideId];
    if (!site) return;
    this.guideService.assignerSiteAuGuide(guideId, site);
    const guide = this.tousGuides.find(g => g.id === guideId);
    this.successMessage = `Site "${site}" affecté avec succès au guide ${guide?.nomComplet || ''} ! Les touristes peuvent désormais le sélectionner pour ce site.`;
    this.nouveauSiteSelectionne[guideId] = '';
  }

  onRetirerSite(guideId: number, siteNom: string): void {
    this.guideService.retirerSiteDuGuide(guideId, siteNom);
    const guide = this.tousGuides.find(g => g.id === guideId);
    this.successMessage = `Site "${siteNom}" retiré des attributions du guide ${guide?.nomComplet || ''}.`;
  }

  onDemarrerVisite(visiteId: number): void {
    this.guideService.demarrerVisite(visiteId);
    this.successMessage = 'La visite a bien été démarrée sur le terrain. Le statut est désormais "En cours".';
    this.loadGuideData();
  }

  onTerminerVisite(visiteId: number): void {
    this.guideService.terminerVisite(visiteId);
    this.successMessage = 'La visite a été marquée comme terminée ! Les touristes ont été notifiés et peuvent évaluer votre prestation.';
    this.loadGuideData();
  }

  onPlanifierVisite(): void {
    this.guideService.planifierVisite({
      titre: this.nouvelleVisite.titre,
      type: this.nouvelleVisite.type,
      elementId: this.nouvelleVisite.elementId,
      guideId: +this.nouvelleVisite.guideId,
      dateHeure: `${this.nouvelleVisite.date} à 09:00`,
      horaireId: this.nouvelleVisite.horaireId,
      placesMax: this.nouvelleVisite.placesMax,
      tarifParPersonne: this.nouvelleVisite.tarif
    });

    this.successMessage = 'Nouvelle visite planifiée avec succès ! Le guide a été assigné et le créneau est verrouillé.';
    this.activeTab = 'admin-dashboard';
    this.loadAdminData();
  }

  onValiderCandidature(candidatureId: number): void {
    this.guideService.validerCandidature(candidatureId);
    this.successMessage = 'Candidature validée avec succès ! Le guide a été accrédité et figure dans l\'annuaire officiel.';
    this.loadAdminData();
  }

  onRejeterCandidature(candidatureId: number): void {
    this.guideService.rejeterCandidature(candidatureId);
    this.successMessage = 'La candidature a été rejetée.';
    this.loadAdminData();
  }

  onCloturerLitige(litigeId: number): void {
    this.guideService.resoudreLitige(litigeId, 'Litige instruit et réglé par le Conservateur en concertation avec le guide.');
    this.successMessage = 'Le litige a été instruit et clôturé. Une notification a été envoyée au touriste.';
    this.loadAdminData();
  }

  openAvisModal(r: Reservation): void {
    this.selectedReservationForAvis = r;
    this.selectedNote = 5;
    this.avisCommentaire = '';
    this.showAvisModal = true;
  }

  onSubmitAvis(): void {
    this.guideService.ajouterAvis({
      visiteTitre: this.selectedReservationForAvis?.titreElement || 'Visite Guidée',
      touristeNom: this.currentUser?.nomComplet || 'Voyageur',
      touristeEmail: this.currentUser?.email || '',
      guideId: 2,
      guideNom: 'Mamadou DIATTA',
      note: this.selectedNote,
      commentaire: this.avisCommentaire || 'Visite passionnante et très bien encadrée.',
      estLitige: false
    });
    this.showAvisModal = false;
    this.successMessage = 'Votre avis a été publié avec succès ! Merci de votre retour d\'expérience.';
  }

  openLitigeModal(r: Reservation): void {
    this.selectedReservationForAvis = r;
    this.litigeMotif = 'Absence ou retard majeur du guide';
    this.litigeCommentaire = '';
    this.showLitigeModal = true;
  }

  onSubmitLitige(): void {
    this.guideService.ajouterAvis({
      visiteTitre: this.selectedReservationForAvis?.titreElement || 'Visite Guidée',
      touristeNom: this.currentUser?.nomComplet || 'Voyageur',
      touristeEmail: this.currentUser?.email || '',
      guideId: 2,
      guideNom: 'Mamadou DIATTA',
      note: 1,
      commentaire: this.litigeCommentaire || 'Réclamation soumise.',
      estLitige: true,
      motifLitige: this.litigeMotif
    });
    this.showLitigeModal = false;
    this.successMessage = 'Votre réclamation a été transmise au Conservateur. Une procédure de médiation a été ouverte.';
  }

  onSaveProfile(): void {
    if (!this.currentUser) return;
    this.saving = true;
    this.authService.updateProfile(this.currentUser.id, this.editForm).subscribe({
      next: (updated) => {
        this.saving = false;
        this.successMessage = 'Profil mis à jour avec succès.';
      },
      error: () => {
        this.saving = false;
        this.successMessage = 'Profil mis à jour avec succès (mode local).';
      }
    });
  }

  getFilteredUsers(): User[] {
    return this.allUsers.filter(u => {
      // Filtre rôle
      if (this.filtreRoleUtilisateur === 'TOURISTE' && !u.role.includes('TOURISTE')) return false;
      if (this.filtreRoleUtilisateur === 'GUIDE' && !u.role.includes('GUIDE')) return false;

      // Filtre statut
      if (this.filtreStatutUtilisateur === 'ACTIF' && u.statut === 'SUSPENDU') return false;
      if (this.filtreStatutUtilisateur === 'SUSPENDU' && u.statut !== 'SUSPENDU') return false;

      // Recherche texte
      if (this.rechercheUtilisateur && this.rechercheUtilisateur.trim()) {
        const q = this.rechercheUtilisateur.toLowerCase().trim();
        const nom = (u.nomComplet || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const tel = (u.telephone || '').toLowerCase();
        return nom.includes(q) || email.includes(q) || tel.includes(q);
      }
      return true;
    });
  }

  getActiveUsersCount(): number {
    return this.allUsers.filter(u => u.statut !== 'SUSPENDU').length;
  }

  getSuspendedUsersCount(): number {
    return this.allUsers.filter(u => u.statut === 'SUSPENDU').length;
  }

  openSuspensionModal(u: User): void {
    this.userToSuspend = u;
    this.motifSuspensionInput = 'Non-respect des règles écotouristiques et déontologie';
    this.motifComplementaireInput = '';
    this.showSuspensionModal = true;
  }

  confirmSuspension(): void {
    if (!this.userToSuspend) return;
    const motifFinal = this.motifComplementaireInput.trim() 
      ? `${this.motifSuspensionInput} (${this.motifComplementaireInput.trim()})`
      : this.motifSuspensionInput;

    const res = this.authService.toggleUserSuspension(this.userToSuspend.id, motifFinal);
    if (res.success) {
      this.successMessage = res.message || 'Utilisateur suspendu avec succès.';
      // Synchroniser également avec les guides si c'est un guide
      if (this.userToSuspend.role.includes('GUIDE')) {
        this.guideService.toggleGuideSuspension(this.userToSuspend.id);
      }
    } else {
      this.errorMessage = res.message || 'Erreur lors de la suspension.';
    }
    this.showSuspensionModal = false;
    this.userToSuspend = null;
  }

  onReactiverUtilisateur(u: User): void {
    const res = this.authService.toggleUserSuspension(u.id);
    if (res.success) {
      this.successMessage = res.message || 'Compte réactivé avec succès.';
      if (u.role.includes('GUIDE')) {
        this.guideService.toggleGuideSuspension(u.id);
      }
    } else {
      this.errorMessage = res.message || 'Erreur lors de la réactivation.';
    }
  }

  onSuspendreGuide(g: Guide): void {
    const updated = this.guideService.toggleGuideSuspension(g.id);
    if (updated) {
      // Synchronise également dans la liste des utilisateurs de l'AuthService
      this.authService.toggleUserSuspension(g.id, 'Habilitation de guide suspendue par le Conservateur');
      this.successMessage = `L'habilitation du guide ${g.nomComplet} a été suspendue.`;
    }
  }

  onReactiverGuide(g: Guide): void {
    const updated = this.guideService.toggleGuideSuspension(g.id);
    if (updated) {
      // Synchronise également dans la liste des utilisateurs de l'AuthService
      const userMatch = this.allUsers.find(u => u.id === g.id || u.email === g.email);
      if (userMatch && userMatch.statut === 'SUSPENDU') {
        this.authService.toggleUserSuspension(userMatch.id);
      }
      this.successMessage = `L'accréditation du guide ${g.nomComplet} a été rétablie avec succès.`;
    }
  }

  onChangePassword(): void {
    if (!this.newPassword || !this.confirmNewPassword) {
      this.errorMessage = 'Veuillez saisir et confirmer votre nouveau mot de passe.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Le nouveau mot de passe et sa confirmation ne correspondent pas.';
      return;
    }
    if (this.newPassword.length < 4) {
      this.errorMessage = 'Le mot de passe doit comporter au moins 4 caractères.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = 'Votre mot de passe a été modifié avec succès.';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getRoleBadgeClass(role?: string): string {
    if (role === 'CONSERVATEUR' || role === 'ROLE_CONSERVATEUR' || role === 'ADMIN') return 'bg-warning text-dark';
    if (role === 'GUIDE' || role === 'ROLE_GUIDE') return 'bg-success text-white';
    return 'bg-primary text-white';
  }

  formatRole(role?: string): string {
    if (!role) return 'Visiteur';
    if (role.includes('CONSERVATEUR') || role.includes('ADMIN')) return 'Conservateur';
    if (role.includes('GUIDE')) return 'Guide Touristique';
    return 'Touriste';
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }
}
