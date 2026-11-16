import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';
import { GuideService } from '../../services/guide.service';
import { AuthService } from '../../services/auth.service';
import { OfflineService } from '../../services/offline.service';
import { Reservation } from '../../models/reservation.model';
import { Guide, CreneauHoraire } from '../../models/guide.model';
import { User } from '../../models/user.model';
import { CarteModalComponent } from '../carte-modal/carte-modal.component';

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CarteModalComponent],
  template: `
    <div class="container py-4">
      <!-- Header avec statut Hors Ligne / En Ligne -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <span class="badge bg-primary-custom text-white mb-2">Guichet Officiel Écotouristique</span>
          <h2 class="fw-bold mb-1 brand-font text-primary-custom">Espace Réservation, Paiement Mobile & Billetterie</h2>
          <p class="text-muted mb-0">
            Réservez votre circuit avec les guides certifiés, payez via Wave ou Orange Money, et accédez à votre e-Pass même hors ligne.
          </p>
        </div>

        <!-- Indicateur de connectivité & bouton de test hors ligne -->
        <div class="d-flex align-items-center gap-2">
          <span class="badge py-2 px-3 rounded-pill" [ngClass]="isOffline ? 'bg-warning text-dark border border-warning' : 'bg-success-subtle text-success border border-success'">
            <i class="bi" [ngClass]="isOffline ? 'bi-wifi-off me-1' : 'bi-wifi me-1'"></i>
            {{ isOffline ? 'Mode Hors Ligne Actif (Cache Local)' : 'En Ligne (Synchronisé)' }}
          </span>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 shadow-xs" (click)="onToggleOffline()" title="Basculer le mode déconnecté">
            <i class="bi bi-arrow-repeat me-1"></i> {{ isOffline ? 'Mode En Ligne' : 'Simuler Hors Ligne' }}
          </button>
        </div>
      </div>

      <!-- 1. ÉCRAN LORSQU'AUCUN UTILISATEUR N'EST CONNECTÉ : AUCUNE RÉSERVATION N'EST VISIBLE -->
      <div *ngIf="!currentUser" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
        <div class="mb-3">
          <div class="rounded-circle d-inline-flex align-items-center justify-content-center p-4 bg-light text-primary-custom" style="width: 80px; height: 80px;">
            <i class="bi bi-person-lock fs-1 text-primary-custom"></i>
          </div>
        </div>
        <h3 class="fw-bold brand-font text-dark mb-2">Espace Billetterie & Réservations Privé</h3>
        <p class="text-muted mb-4" style="max-width: 620px; margin: 0 auto;">
          Les réservations de visites et les e-Pass QR sont strictement personnels et confidentiels. Pour effectuer une réservation ou consulter vos billets, veuillez vous connecter avec votre compte Touriste.
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <a routerLink="/login" class="btn btn-casa-primary rounded-pill px-4 shadow-sm">
            <i class="bi bi-box-arrow-in-right me-1"></i> Se Connecter
          </a>
          <a routerLink="/register" class="btn btn-casa-ochre rounded-pill px-4 shadow-sm">
            <i class="bi bi-person-plus me-1"></i> Créer un Compte Touriste
          </a>
          <a routerLink="/patrimoines" class="btn btn-outline-secondary rounded-pill px-4">
            <i class="bi bi-houses me-1"></i> Explorer les Sites
          </a>
          <a routerLink="/circuits" class="btn btn-outline-secondary rounded-pill px-4">
            <i class="bi bi-compass me-1"></i> Explorer les Circuits
          </a>
        </div>
      </div>

      <!-- 2. ESPACE RÉSERVÉ AUX UTILISATEURS CONNECTÉS (TOURISTE / GUIDE / CONSERVATEUR) -->
      <div *ngIf="currentUser">

      <!-- BANNIÈRE D'INFORMATION POUR GUIDE (Pas de réservations à effectuer) -->
      <div *ngIf="isGuide()" class="card border-0 shadow-sm rounded-4 p-4 mb-4 text-white" style="background: linear-gradient(135deg, var(--casa-green-deep), var(--casa-green-mangrove));">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <span class="badge bg-white text-success fw-bold px-3 py-2 rounded-pill mb-2">
              <i class="bi bi-person-badge-fill me-1"></i> Espace Professionnel Guide
            </span>
            <h4 class="fw-bold mb-1">Accès Réservé aux Touristes pour les Réservations</h4>
            <p class="text-white-75 mb-0" style="max-width: 680px;">
              En tant que Guide Touristique certifié, vous n'avez pas besoin de réserver des visites. Vous pouvez consulter l'ensemble des sites et circuits en mode aperçu, ou piloter vos visites assignées et vérifier les pass QR dans votre agenda.
            </p>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <a routerLink="/patrimoines" class="btn btn-outline-light rounded-pill px-3">
              <i class="bi bi-houses me-1"></i> Aperçu des Sites
            </a>
            <a routerLink="/circuits" class="btn btn-outline-light rounded-pill px-3">
              <i class="bi bi-compass me-1"></i> Aperçu des Circuits
            </a>
            <a routerLink="/profil" class="btn btn-warning rounded-pill px-4 fw-bold shadow-sm">
              <i class="bi bi-calendar-check me-1"></i> Mon Agenda de Guide
            </a>
          </div>
        </div>
      </div>

      <!-- BANNIÈRE D'INFORMATION POUR CONSERVATEUR (Pas de réservations à effectuer) -->
      <div *ngIf="isConservateur()" class="card border-0 shadow-sm rounded-4 p-4 mb-4 text-white" style="background: linear-gradient(135deg, #7a3e14, #d97724);">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <span class="badge bg-white text-dark fw-bold px-3 py-2 rounded-pill mb-2">
              <i class="bi bi-shield-lock-fill me-1"></i> Espace Conservateur du Patrimoine
            </span>
            <h4 class="fw-bold mb-1">Guichet Voyageurs — Accès Réservé aux Touristes</h4>
            <p class="text-white-90 mb-0" style="max-width: 680px;">
              En tant que Conservateur, vous supervisez l'ensemble du patrimoine de Ziguinchor. Vous disposez de la consultation des sites et circuits en mode aperçu. Pour planifier des visites officielles ou affecter les guides certifiés, utilisez votre tableau de bord.
            </p>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <a routerLink="/patrimoines" class="btn btn-outline-light rounded-pill px-3">
              <i class="bi bi-houses me-1"></i> Aperçu des Sites
            </a>
            <a routerLink="/circuits" class="btn btn-outline-light rounded-pill px-3">
              <i class="bi bi-compass me-1"></i> Aperçu des Circuits
            </a>
            <a routerLink="/profil" class="btn btn-light rounded-pill px-4 fw-bold shadow-sm text-dark">
              <i class="bi bi-speedometer2 me-1"></i> Dashboard Conservateur
            </a>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Formulaire de Réservation : Réservé aux Touristes et Visiteurs -->
        <div class="col-lg-6" *ngIf="isTouriste()">
          <div class="card-custom p-4 shadow-sm border-0 bg-white">
            <h5 class="fw-bold text-primary-custom mb-3">
              <i class="bi bi-pencil-square me-2"></i> Formulaire de Réservation & Règlement
            </h5>

            <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
              <div class="d-flex align-items-start gap-2">
                <i class="bi bi-check-circle-fill fs-3 text-success"></i>
                <div>
                  <h6 class="fw-bold mb-1">Réservation & Paiement Confirmés !</h6>
                  <div>{{ successMessage }}</div>
                  <div class="small mt-2 pt-2 border-top d-flex gap-2 align-items-center flex-wrap">
                    <span class="badge bg-success"><i class="bi bi-shield-check me-1"></i> e-Pass Sécurisé</span>
                    <button class="btn btn-xs btn-outline-dark rounded-pill py-1 px-2 small" (click)="carteLieu = newReservation.titreElement">
                      <i class="bi bi-geo-alt-fill text-danger me-1"></i> Voir le Lieu sur la Carte GPS
                    </button>
                  </div>
                </div>
              </div>
              <button type="button" class="btn-close" (click)="successMessage = ''"></button>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage }}
            </div>

            <form (ngSubmit)="onSubmit()" #resForm="ngForm">
              
              <!-- Coordonnées Client -->
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Nom Complet *</label>
                  <input type="text" [(ngModel)]="newReservation.nomClient" name="nomClient" class="form-control" required placeholder="Ex: Aïssatou Fall">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Numéro de Téléphone *</label>
                  <input type="tel" [(ngModel)]="newReservation.telephoneClient" name="telephoneClient" class="form-control" required placeholder="+221 77 123 45 67">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Adresse Email *</label>
                <input type="email" [(ngModel)]="newReservation.emailClient" name="emailClient" class="form-control" required placeholder="client@exemple.sn">
              </div>

              <!-- Choix de la Prestation -->
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Type de Prestation</label>
                  <select [(ngModel)]="newReservation.typeElement" name="typeElement" class="form-select" (change)="onPrestationTypeChange()">
                    <option value="CIRCUIT">Circuit Guidé</option>
                    <option value="PATRIMOINE">Visite de Site</option>
                    <option value="EVENEMENT">Événement Culturel</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Nombre de Voyageurs</label>
                  <input type="number" [(ngModel)]="newReservation.nombrePlaces" name="nombrePlaces" min="1" max="25" class="form-control" required>
                </div>
              </div>

              <!-- Intitulé / Choix du Circuit ou Site synchronisé avec le catalogue -->
              <div class="mb-3" *ngIf="newReservation.typeElement === 'CIRCUIT'">
                <label class="form-label small fw-bold">Circuit Touristique Choisi *</label>
                <select [(ngModel)]="newReservation.titreElement" name="titreElement" class="form-select" (change)="onPrestationTitreChange()" required>
                  <option *ngFor="let c of circuitsCatalogue" [value]="c">{{ c }}</option>
                </select>
              </div>

              <div class="mb-3" *ngIf="newReservation.typeElement === 'PATRIMOINE'">
                <label class="form-label small fw-bold">Site du Patrimoine Choisi *</label>
                <select [(ngModel)]="newReservation.titreElement" name="titreElement" class="form-select" (change)="onPrestationTitreChange()" required>
                  <option *ngFor="let s of sitesCatalogue" [value]="s">{{ s }}</option>
                </select>
              </div>

              <div class="mb-3" *ngIf="newReservation.typeElement === 'EVENEMENT'">
                <label class="form-label small fw-bold">Intitulé de l'Événement *</label>
                <input type="text" [(ngModel)]="newReservation.titreElement" name="titreElement" class="form-control" required (input)="onPrestationTitreChange()" placeholder="Ex: Festival des Arts et Rythmes">
              </div>

              <!-- SECTION SYNCHRONISÉE : AFFECTATION DU GUIDE & CRÉNEAU HORAIRE -->
              <div class="bg-light p-3 rounded-3 border mb-4">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                  <span class="fw-bold small text-primary-custom">
                    <i class="bi bi-person-badge-fill text-accent-custom me-1"></i> Guide Habilité & Créneau Horaire
                  </span>
                  <button type="button" class="btn btn-xs btn-outline-primary rounded-pill py-0 px-2 small" (click)="carteLieu = newReservation.titreElement">
                    <i class="bi bi-geo-alt-fill text-danger me-1"></i> Carte du Lieu
                  </button>
                </div>

                <div class="row g-3 mb-3">
                  <!-- Sélection du Guide : filtré selon les circuits/sites gérés -->
                  <div class="col-md-6">
                    <label class="form-label small fw-bold d-flex justify-content-between align-items-center">
                      <span>Guide Touristique</span>
                      <small class="text-success fw-normal">({{ guidesEligibles.length }} habilité(s))</small>
                    </label>
                    <select [(ngModel)]="selectedGuideId" name="selectedGuideId" class="form-select" (change)="onGuideOrDateChange()">
                      <option *ngFor="let g of guidesEligibles" [value]="g.id">
                        {{ g.nomComplet }} (★ {{ g.note }})
                      </option>
                      <option *ngIf="guidesEligibles.length === 0" disabled>
                        Aucun guide spécifiquement affecté
                      </option>
                    </select>
                  </div>

                  <!-- Date de Visite -->
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Date de la Visite</label>
                    <input type="date" [(ngModel)]="selectedDate" name="selectedDate" class="form-control" (change)="onGuideOrDateChange()">
                  </div>
                </div>

                <!-- Créneau Horaire -->
                <div class="mb-3">
                  <label class="form-label small fw-bold">Horaire Souhaité</label>
                  <select [(ngModel)]="selectedHoraireId" name="selectedHoraireId" class="form-select" (change)="onGuideOrDateChange()">
                    <option *ngFor="let cr of creneaux" [value]="cr.id">
                      {{ cr.libelle }} — {{ cr.description }}
                    </option>
                  </select>
                </div>

                <!-- FICHE DU GUIDE SÉLECTIONNÉ -->
                <div *ngIf="selectedGuide" class="p-3 bg-white rounded-3 border mb-3">
                  <div class="d-flex align-items-center gap-3 mb-2">
                    <img [src]="selectedGuide.photo" [alt]="selectedGuide.nomComplet" class="rounded-circle border" style="width: 52px; height: 52px; object-fit: cover;">
                    <div>
                      <div class="fw-bold text-dark d-flex align-items-center gap-2 flex-wrap">
                        {{ selectedGuide.nomComplet }}
                        <span class="badge bg-warning text-dark"><i class="bi bi-star-fill text-warning me-1"></i>{{ selectedGuide.note }} / 5</span>
                        <span class="badge bg-success-subtle text-success small">Certifié Casamance</span>
                      </div>
                      <small class="text-muted d-block">
                        <i class="bi bi-award-fill text-success me-1"></i>{{ selectedGuide.anneesExperience }} ans d'expérience • <i class="bi bi-translate text-primary me-1"></i>{{ selectedGuide.langues.join(', ') }}
                      </small>
                    </div>
                  </div>

                  <div class="small pt-2 border-top">
                    <strong class="text-secondary d-block mb-1">
                      <i class="bi bi-compass text-success me-1"></i> Circuits & Sites gérés par ce guide :
                    </strong>
                    <div class="d-flex flex-wrap gap-1">
                      <span *ngFor="let c of selectedGuide.circuitsNoms" class="badge rounded-pill"
                            [ngClass]="c === newReservation.titreElement ? 'bg-success text-white' : 'bg-light text-dark border'">
                        <i class="bi bi-signpost-2 me-1"></i> {{ c }}
                      </span>
                      <span *ngFor="let p of selectedGuide.patrimoinesNoms" class="badge rounded-pill"
                            [ngClass]="p === newReservation.titreElement ? 'bg-primary text-white' : 'bg-light text-dark border'">
                        <i class="bi bi-geo-alt me-1"></i> {{ p }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- ALERTE DYNAMIQUE DISPONIBILITÉ (LIBRE / OCCUPÉ) -->
                <div class="p-2 rounded-2 d-flex align-items-center gap-2 small" [ngClass]="guideDispo.disponible ? 'alert-success' : 'alert-danger'">
                  <i class="bi" [ngClass]="guideDispo.disponible ? 'bi-check-circle-fill text-success fs-5' : 'bi-x-circle-fill text-danger fs-5'"></i>
                  <div>
                    <strong>Statut du Guide : </strong>
                    <span class="badge ms-1" [ngClass]="guideDispo.disponible ? 'bg-success' : 'bg-danger'">
                      {{ guideDispo.disponible ? 'LIBRE' : 'OCCUPÉ' }}
                    </span>
                    <div class="small mt-1">{{ guideDispo.motif }}</div>
                  </div>
                </div>
              </div>

              <!-- ======================================================== -->
              <!-- MODULE PAIEMENT SÉNÉGAL : WAVE & ORANGE MONEY           -->
              <!-- ======================================================== -->
              <div class="p-3 rounded-3 border mb-4 bg-light">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold small text-primary-custom">
                    <i class="bi bi-credit-card-2-front-fill text-accent-custom me-1"></i> Mode de Règlement & Validation e-Pass
                  </span>
                  <span class="badge bg-dark text-white px-3 py-1 fs-6">
                    Total : {{ montantTotal | number }} FCFA
                  </span>
                </div>
                <small class="text-muted d-block mb-3">Sélectionnez votre moyen de paiement mobile sénégalais sécurisé :</small>

                <!-- Choix Moyen de Paiement Mobile -->
                <div class="row g-2 mb-3">
                  <!-- Wave -->
                  <div class="col-4">
                    <div class="p-2 rounded-3 border text-center h-100"
                         [ngClass]="moyenPaiement === 'WAVE' ? 'border-primary bg-primary-subtle text-primary fw-bold shadow-xs' : 'bg-white text-secondary'"
                         (click)="moyenPaiement = 'WAVE'" style="cursor: pointer;">
                      <div class="fs-4 mb-1">🌊</div>
                      <div class="small fw-bold">Wave</div>
                      <small class="d-block text-muted" style="font-size: 0.65rem;">0% Frais</small>
                    </div>
                  </div>

                  <!-- Orange Money -->
                  <div class="col-4">
                    <div class="p-2 rounded-3 border text-center h-100"
                         [ngClass]="moyenPaiement === 'ORANGE_MONEY' ? 'border-warning bg-warning-subtle text-dark fw-bold shadow-xs' : 'bg-white text-secondary'"
                         (click)="moyenPaiement = 'ORANGE_MONEY'" style="cursor: pointer;">
                      <div class="fs-4 mb-1">🍊</div>
                      <div class="small fw-bold">Orange Money</div>
                      <small class="d-block text-muted" style="font-size: 0.65rem;">#144#391#</small>
                    </div>
                  </div>

                  <!-- Sur Place -->
                  <div class="col-4">
                    <div class="p-2 rounded-3 border text-center h-100"
                         [ngClass]="moyenPaiement === 'SUR_PLACE' ? 'border-success bg-success-subtle text-success fw-bold shadow-xs' : 'bg-white text-secondary'"
                         (click)="moyenPaiement = 'SUR_PLACE'" style="cursor: pointer;">
                      <div class="fs-4 mb-1">💵</div>
                      <div class="small fw-bold">Sur Place</div>
                      <small class="d-block text-muted" style="font-size: 0.65rem;">Espèces</small>
                    </div>
                  </div>
                </div>

                <!-- Détails formulaire Wave -->
                <div *ngIf="moyenPaiement === 'WAVE'" class="p-3 bg-white rounded-3 border mb-2">
                  <div class="d-flex align-items-center gap-2 mb-2 text-primary">
                    <i class="bi bi-qr-code-scan fs-5"></i>
                    <strong class="small">Paiement Mobile Wave Sénégal</strong>
                  </div>
                  <div class="mb-2">
                    <label class="form-label small text-muted mb-1">Numéro Wave pour le débit (+221)</label>
                    <input type="tel" [(ngModel)]="numeroPaiementMobile" name="numeroWave" class="form-control form-control-sm" placeholder="77 / 78 / 76 / 70..." required>
                  </div>
                  <small class="text-muted d-block">Une notification push Wave sera transmise à ce numéro pour valider la transaction de <strong>{{ montantTotal | number }} FCFA</strong>.</small>
                </div>

                <!-- Détails formulaire Orange Money -->
                <div *ngIf="moyenPaiement === 'ORANGE_MONEY'" class="p-3 bg-white rounded-3 border mb-2">
                  <div class="d-flex align-items-center gap-2 mb-2 text-warning">
                    <i class="bi bi-phone-fill fs-5"></i>
                    <strong class="small">Paiement Orange Money Sénégal</strong>
                  </div>
                  <div class="row g-2 mb-2">
                    <div class="col-md-7">
                      <label class="form-label small text-muted mb-1">Numéro Orange (+221)</label>
                      <input type="tel" [(ngModel)]="numeroPaiementMobile" name="numeroOM" class="form-control form-control-sm" placeholder="77 / 78..." required>
                    </div>
                    <div class="col-md-5">
                      <label class="form-label small text-muted mb-1">Code secret OTP (#144#391#)</label>
                      <input type="password" [(ngModel)]="codeOtpOM" name="codeOtpOM" class="form-control form-control-sm font-monospace" placeholder="••••" maxlength="6">
                    </div>
                  </div>
                  <small class="text-muted d-block">Générez votre code d'autorisation temporaire en composant <code>#144#391#</code> sur votre mobile Orange.</small>
                </div>

                <!-- Détails Sur Place -->
                <div *ngIf="moyenPaiement === 'SUR_PLACE'" class="p-3 bg-white rounded-3 border mb-2 small text-muted">
                  <i class="bi bi-info-circle-fill text-success me-1"></i>
                  Le paiement de <strong>{{ montantTotal | number }} FCFA</strong> sera remis en espèces au guide certifié au point de rendez-vous avant le départ de la visite.
                </div>
              </div>

              <!-- Bouton de validation -->
              <button type="submit" [disabled]="!resForm.form.valid || submitting || !guideDispo.disponible" class="btn btn-custom-accent w-100 py-2 fw-bold rounded-pill shadow-sm">
                <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!submitting" class="bi bi-shield-check me-1"></i>
                {{ guideDispo.disponible ? (moyenPaiement === 'SUR_PLACE' ? 'Valider la Réservation (Paiement sur place)' : 'Régler via ' + (moyenPaiement === 'WAVE' ? 'Wave' : 'Orange Money') + ' & Confirmer') : 'Guide Occupé sur ce Créneau' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Liste des Réservations et e-Pass QR -->
        <div [ngClass]="isTouriste() ? 'col-lg-6' : 'col-12'">
          <div class="card-custom p-4 shadow-sm border-0 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold text-primary-custom mb-0">
                  <i class="bi" [ngClass]="isTouriste() ? 'bi-ticket-perforated text-primary me-2' : (isGuide() ? 'bi-calendar-check text-success me-2' : 'bi-card-checklist text-warning me-2')"></i>
                  {{ isTouriste() ? 'Mes Billets & e-Pass Personnels' : (isGuide() ? 'Réservations des Voyageurs pour mes Circuits' : 'Registre Général des Réservations') }} ({{ reservations.length }})
                </h5>
                <small class="text-success" *ngIf="isTouriste()">
                  <i class="bi bi-shield-check me-1"></i> Vos e-Pass QR confidentiels (accessibles hors ligne)
                </small>
                <small class="text-success" *ngIf="isGuide()">
                  <i class="bi bi-person-badge me-1"></i> Voyageurs inscrits pour vos prestations de guidage
                </small>
                <small class="text-muted" *ngIf="isConservateur()">
                  <i class="bi bi-shield-lock me-1"></i> Supervision administrative globale des réservations
                </small>
              </div>
              <button class="btn btn-sm btn-outline-secondary rounded-pill" (click)="loadReservations()">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            <div *ngIf="loading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
              <span class="ms-2 small text-muted">Chargement...</span>
            </div>

            <div *ngIf="!loading && reservations.length === 0" class="text-center py-4 text-muted">
              <span *ngIf="isTouriste()">Vous n'avez effectué aucune réservation pour le moment. Choisissez une prestation à gauche pour obtenir votre premier e-Pass QR !</span>
              <span *ngIf="isGuide()">Aucune réservation enregistrée pour vos circuits actuellement.</span>
              <span *ngIf="isConservateur()">Aucune réservation enregistrée dans le système.</span>
            </div>

            <!-- Liste des Cartes Réservations -->
            <div class="d-flex flex-column gap-3" *ngIf="!loading && reservations.length > 0">
              <div class="p-3 rounded-3 border bg-light shadow-2xs" *ngFor="let r of reservations">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span class="badge bg-primary-custom font-monospace">{{ r.numeroReservation || ('MS-RES-' + r.id) }}</span>
                    <span class="badge bg-secondary-subtle text-secondary ms-2 small">{{ r.typeElement }}</span>
                  </div>
                  <span class="badge bg-success-subtle text-success border border-success-subtle">
                    <i class="bi bi-check2-circle me-1"></i>{{ r.statut || 'CONFIRMÉE' }}
                  </span>
                </div>

                <h6 class="fw-bold text-primary-custom mb-1">{{ r.titreElement }}</h6>
                <div class="small text-muted mb-2">
                  <span><i class="bi bi-person me-1"></i> {{ r.nomClient }}</span> • 
                  <span><i class="bi bi-telephone me-1"></i> {{ r.telephoneClient }}</span> • 
                  <span><strong>{{ r.nombrePlaces }} place(s)</strong></span>
                </div>

                <div class="pt-2 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span class="font-monospace small text-dark">
                    <i class="bi bi-qr-code text-accent-custom me-1"></i> {{ r.qrCodeToken || 'QR-PASS-OK' }}
                  </span>
                  
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-xs btn-outline-primary rounded-pill px-2 py-1 small" (click)="carteLieu = r.titreElement">
                      <i class="bi bi-geo-alt-fill text-danger me-1"></i> Carte GPS
                    </button>
                    <span class="fw-bold text-accent-custom small" *ngIf="r.montantTotal">
                      {{ r.montantTotal | number }} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      </div> <!-- Fin div *ngIf="currentUser" -->

      <!-- Modal Carte & Géolocalisation Interactive -->
      <app-carte-modal *ngIf="carteLieu" [titre]="'Localisation : ' + carteLieu" [nomLieu]="carteLieu" (fermer)="carteLieu = null"></app-carte-modal>

    </div>
  `
})
export class ReservationComponent implements OnInit, OnDestroy {
  private reservationService = inject(ReservationService);
  private guideService = inject(GuideService);
  private authService = inject(AuthService);
  private offlineService = inject(OfflineService);
  private route = inject(ActivatedRoute);

  currentUser: User | null = null;

  reservations: Reservation[] = [];
  guides: Guide[] = [];
  guidesEligibles: Guide[] = [];
  creneaux: CreneauHoraire[] = [];
  selectedGuide: Guide | null = null;

  circuitsCatalogue: string[] = [];
  sitesCatalogue: string[] = [];

  loading: boolean = true;
  submitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  selectedGuideId: number = 2; // Par défaut Mamadou Diatta
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedHoraireId: string = 'HORAIRE_09_12';

  // Paiement Wave et Orange Money
  moyenPaiement: 'WAVE' | 'ORANGE_MONEY' | 'SUR_PLACE' = 'WAVE';
  numeroPaiementMobile: string = '';
  codeOtpOM: string = '';

  // Mode Hors Ligne
  isOffline: boolean = false;
  carteLieu: string | null = null;

  guideDispo: {
    disponible: boolean;
    motif?: string;
    planning?: any;
  } = {
    disponible: true,
    motif: 'Guide disponible sur ce créneau'
  };

  newReservation: Reservation = {
    nomClient: '',
    emailClient: '',
    telephoneClient: '',
    typeElement: 'CIRCUIT',
    elementId: 1,
    titreElement: 'Boucle Historique & Fluviale de Ziguinchor',
    nombrePlaces: 2
  };

  private guidesSub?: Subscription;
  private offlineSub?: Subscription;

  get montantTotal(): number {
    const places = this.newReservation.nombrePlaces || 1;
    const tarif = this.newReservation.typeElement === 'CIRCUIT' ? 5000 : 3000;
    return places * tarif;
  }

  isTouriste(): boolean {
    return !!this.currentUser && (this.currentUser.role === 'TOURISTE' || this.currentUser.role === 'ROLE_TOURISTE' || (!this.isGuide() && !this.isConservateur()));
  }

  isGuide(): boolean {
    return this.authService.hasRole('GUIDE');
  }

  isConservateur(): boolean {
    return this.authService.hasRole('CONSERVATEUR') || this.authService.hasRole('ADMIN');
  }

  ngOnInit(): void {
    this.circuitsCatalogue = this.guideService.getCatalogueCircuits();
    this.sitesCatalogue = this.guideService.getCatalogueSites();
    this.creneaux = this.guideService.getCreneaux();

    this.isOffline = this.offlineService.isOfflineActive();
    this.offlineSub = this.offlineService.isOnline$.subscribe(online => {
      this.isOffline = !online;
      this.loadReservations();
    });

    // Abonnement réactif aux modifications des guides
    this.guidesSub = this.guideService.getGuides().subscribe(list => {
      this.guides = list;
      this.updateEligibleGuides();
    });

    // Écoute de l'utilisateur connecté pour filtrage strict et pré-remplissage
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      if (u) {
        this.newReservation.nomClient = u.nomComplet;
        this.newReservation.emailClient = u.email;
        this.newReservation.telephoneClient = u.telephone || '';
        this.numeroPaiementMobile = u.telephone || '77 555 12 34';
      }
      this.loadReservations();
    });

    this.route.queryParams.subscribe(params => {
      if (params['type']) this.newReservation.typeElement = params['type'];
      if (params['id']) this.newReservation.elementId = +params['id'];
      if (params['titre']) this.newReservation.titreElement = params['titre'];
      if (params['guideId']) this.selectedGuideId = +params['guideId'];
      if (params['date']) this.selectedDate = params['date'];
      if (params['horaireId']) this.selectedHoraireId = params['horaireId'];

      this.updateEligibleGuides();
    });
  }

  ngOnDestroy(): void {
    this.guidesSub?.unsubscribe();
    this.offlineSub?.unsubscribe();
  }

  onToggleOffline(): void {
    const isNowOffline = this.offlineService.toggleSimulatedOffline();
    this.isOffline = isNowOffline;
    if (this.isOffline) {
      const all = this.offlineService.getOfflineReservations();
      this.reservations = this.filterReservationsByRole(all);
    } else {
      this.loadReservations();
    }
  }

  onPrestationTypeChange(): void {
    if (this.newReservation.typeElement === 'CIRCUIT') {
      this.newReservation.titreElement = this.circuitsCatalogue[0] || 'Boucle Historique & Fluviale de Ziguinchor';
    } else if (this.newReservation.typeElement === 'PATRIMOINE') {
      this.newReservation.titreElement = this.sitesCatalogue[0] || 'Alliance Franco-Sénégalaise';
    } else {
      this.newReservation.titreElement = 'Festival des Arts et Rythmes';
    }
    this.updateEligibleGuides();
  }

  onPrestationTitreChange(): void {
    this.updateEligibleGuides();
  }

  updateEligibleGuides(): void {
    this.guidesEligibles = this.guideService.getGuidesPourElement(
      this.newReservation.typeElement,
      this.newReservation.titreElement
    );

    const exists = this.guidesEligibles.some(g => g.id === +this.selectedGuideId);
    if (!exists && this.guidesEligibles.length > 0) {
      this.selectedGuideId = this.guidesEligibles[0].id;
    } else if (this.guidesEligibles.length === 0 && this.guides.length > 0) {
      this.selectedGuideId = this.guides[0].id;
    }

    this.onGuideOrDateChange();
  }

  onGuideOrDateChange(): void {
    this.selectedGuide = this.guides.find(g => g.id === +this.selectedGuideId) || null;

    this.guideDispo = this.guideService.checkDisponibilite(
      +this.selectedGuideId,
      this.selectedDate,
      this.selectedHoraireId
    );
  }

  filterReservationsByRole(data: Reservation[]): Reservation[] {
    if (!this.currentUser) return [];
    if (this.isConservateur()) return data;
    if (this.isGuide()) {
      const guideEmail = (this.currentUser.email || '').toLowerCase().trim();
      const guide = this.guideService.getGuideByEmail(guideEmail) || this.guideService.getGuideById(2);
      const circuits = guide?.circuitsNoms?.map(c => c.toLowerCase().trim()) || [];
      const sites = guide?.patrimoinesNoms?.map(s => s.toLowerCase().trim()) || [];
      return data.filter(r => {
        const t = (r.titreElement || '').toLowerCase().trim();
        return circuits.some(c => t.includes(c) || c.includes(t)) ||
               sites.some(s => t.includes(s) || s.includes(t)) ||
               (r.nomGuide && guide?.nomComplet && r.nomGuide.toLowerCase().includes(guide.nomComplet.toLowerCase()));
      });
    }
    // Touriste : filtrer par son email ou nom complet
    const email = (this.currentUser.email || '').toLowerCase().trim();
    const nom = (this.currentUser.nomComplet || '').toLowerCase().trim();
    return data.filter(r => 
      (r.emailClient && r.emailClient.toLowerCase().trim() === email) ||
      (r.nomClient && r.nomClient.toLowerCase().trim() === nom)
    );
  }

  loadReservations(): void {
    this.loading = true;
    if (!this.currentUser) {
      this.reservations = [];
      this.loading = false;
      return;
    }

    if (this.isOffline) {
      const all = this.offlineService.getOfflineReservations();
      this.reservations = this.filterReservationsByRole(all);
      this.loading = false;
      return;
    }

    this.reservationService.getAll().subscribe({
      next: (data) => {
        this.offlineService.saveReservationsOffline(data);
        this.reservations = this.filterReservationsByRole(data);
        this.loading = false;
      },
      error: () => {
        // En cas d'erreur réseau, bascule sur le cache hors ligne
        const all = this.offlineService.getOfflineReservations();
        this.reservations = this.filterReservationsByRole(all);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.guideDispo.disponible) {
      this.errorMessage = 'Le guide sélectionné n\'est pas disponible pour cet horaire. Veuillez choisir un autre créneau.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const guideChoisi = this.guides.find(g => g.id === +this.selectedGuideId);
    const horaireChoisi = this.creneaux.find(c => c.id === this.selectedHoraireId);
    const total = this.montantTotal;

    // Génération de la référence de paiement mobile
    const refCode = Math.floor(100000 + Math.random() * 900000);
    const refPaiement = this.moyenPaiement === 'WAVE' 
      ? `WAVE-SN-${refCode}` 
      : (this.moyenPaiement === 'ORANGE_MONEY' ? `OM-SN-${refCode}` : `SURPLACE-SN-${refCode}`);

    this.newReservation.montantTotal = total;
    this.newReservation.statut = this.moyenPaiement === 'SUR_PLACE' ? 'CONFIRMEE' : 'PAYEE';
    this.newReservation.qrCodeToken = `PASS-${refCode}`;
    if (this.currentUser) {
      this.newReservation.nomClient = this.currentUser.nomComplet || this.newReservation.nomClient;
      this.newReservation.emailClient = this.currentUser.email || this.newReservation.emailClient;
    }

    const reservationSauvegardee: Reservation = {
      ...this.newReservation,
      id: Date.now(),
      numeroReservation: `RES-${refCode}`,
      nomGuide: guideChoisi?.nomComplet
    };

    // Si hors ligne : enregistre directement dans le cache local
    if (this.isOffline) {
      setTimeout(() => {
        this.submitting = false;
        this.offlineService.addOfflineReservation(reservationSauvegardee);
        this.guideService.reserverCreneau(
          +this.selectedGuideId,
          this.newReservation.elementId || 1,
          this.newReservation.titreElement,
          this.selectedDate,
          this.selectedHoraireId,
          this.newReservation.nomClient
        );
        this.successMessage = `[HORS LIGNE] e-Pass généré (${reservationSauvegardee.qrCodeToken}) | Réf: ${refPaiement} | ${total.toLocaleString('fr-FR')} FCFA. Enregistré dans le cache local !`;
        this.loadReservations();
        this.onGuideOrDateChange();
      }, 500);
      return;
    }

    // Si en ligne : enregistre via le microservice ms-reservation ET synchronise le cache hors ligne
    this.reservationService.create(reservationSauvegardee).subscribe({
      next: (created) => {
        this.submitting = false;
        const resFinale = { ...reservationSauvegardee, id: created.id || reservationSauvegardee.id };
        this.offlineService.addOfflineReservation(resFinale);

        this.guideService.reserverCreneau(
          +this.selectedGuideId,
          this.newReservation.elementId || 1,
          this.newReservation.titreElement,
          this.selectedDate,
          this.selectedHoraireId,
          this.newReservation.nomClient
        );

        this.successMessage = `Règlement ${this.moyenPaiement} validé (${refPaiement}) | ${total.toLocaleString('fr-FR')} FCFA | Guide : ${guideChoisi?.nomComplet} (${this.selectedDate} à ${horaireChoisi?.libelle})`;
        this.loadReservations();
        this.onGuideOrDateChange();
      },
      error: (err) => {
        // En cas d'indisponibilité du backend, validation locale automatique
        this.submitting = false;
        this.offlineService.addOfflineReservation(reservationSauvegardee);
        this.successMessage = `Règlement ${this.moyenPaiement} validé en mode local (${refPaiement}) | ${total.toLocaleString('fr-FR')} FCFA | e-Pass QR généré !`;
        this.loadReservations();
        this.onGuideOrDateChange();
      }
    });
  }
}
