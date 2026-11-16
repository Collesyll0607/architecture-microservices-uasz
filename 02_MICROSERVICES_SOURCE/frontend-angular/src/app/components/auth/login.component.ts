import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-9">
          <div class="card-custom overflow-hidden shadow-lg border-0">
            <div class="row g-0">
              
              <!-- Panneau Visuel Gauche (Casamance Écotourisme) -->
              <div class="col-md-5 d-none d-md-block text-white p-4 p-lg-5 position-relative" style="background: url('/assets/images/casamance/bras_de_mer.jpg') center/cover;">
                <div class="position-absolute top-0 start-0 w-100 h-100" style="background: linear-gradient(135deg, rgba(22, 56, 44, 0.92) 0%, rgba(15, 38, 30, 0.95) 100%);"></div>
                <div class="position-relative d-flex flex-column justify-content-between h-100" style="z-index: 2;">
                  <div>
                    <span class="badge bg-accent-custom px-3 py-2 rounded-pill mb-3">PORTAIL OFFICIEL</span>
                    <h3 class="fw-bold brand-font mb-2">Bienvenue en Casamance</h3>
                    <p class="small text-white-75 mb-4">
                      Connectez-vous pour gérer vos réservations écotouristiques, réserver un guide ou administrer le patrimoine.
                    </p>
                    
                    <ul class="list-unstyled small text-white-75 d-flex flex-column gap-2 mb-0">
                      <li><i class="bi bi-check-circle-fill text-warning me-2"></i> Circuits guidés certifiés</li>
                      <li><i class="bi bi-check-circle-fill text-warning me-2"></i> Guides attitrés avec plannings horaires</li>
                      <li><i class="bi bi-check-circle-fill text-warning me-2"></i> Pass QR de réservation sécurisé</li>
                    </ul>
                  </div>

                  <div class="pt-4 border-top border-white border-opacity-25 small text-white-50">
                    <div>Université Assane Seck de Ziguinchor</div>
                    <small>Développement d'Applications Orientées Services</small>
                  </div>
                </div>
              </div>

              <!-- Formulaire de Connexion Droit -->
              <div class="col-md-7 p-4 p-lg-5 bg-white d-flex flex-column justify-content-center">
                <div class="text-center text-md-start mb-4">
                  <h3 class="fw-bold text-primary-custom mb-1">Connexion</h3>
                  <p class="text-muted small">Accédez à votre espace voyageur, guide ou conservateur</p>
                </div>

                <div *ngIf="errorMessage" 
                     class="alert py-3 px-3 rounded-3 shadow-xs d-flex align-items-start gap-2 mb-3"
                     [ngClass]="isSuspended ? 'alert-danger border-start border-danger border-4 bg-danger bg-opacity-10 text-danger' : 'alert-danger py-2 small d-flex align-items-center gap-2'">
                  <i class="bi fs-5 flex-shrink-0" [ngClass]="isSuspended ? 'bi-shield-slash-fill text-danger' : 'bi-exclamation-triangle-fill text-danger'"></i>
                  <div>
                    <strong *ngIf="isSuspended" class="d-block mb-1 text-danger">
                      <i class="bi bi-person-slash me-1"></i> Accès Refusé — Compte Suspendu
                    </strong>
                    <div>{{ errorMessage }}</div>
                    <div *ngIf="isSuspended" class="small mt-2 pt-2 border-top border-danger border-opacity-25 text-dark">
                      <i class="bi bi-info-circle me-1 text-primary"></i> 
                      Pour réactiver votre compte ou faire appel de cette décision, veuillez contacter l'administration du Conservateur du Patrimoine de Ziguinchor.
                    </div>
                  </div>
                </div>

                <div *ngIf="resetSuccessMessage" class="alert alert-success py-2 small">
                  <i class="bi bi-check-circle-fill text-success me-1"></i> {{ resetSuccessMessage }}
                </div>

                <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
                  <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Nom d'utilisateur ou Adresse Email</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
                      <input type="text" [(ngModel)]="credentials.email" name="email" class="form-control border-start-0" required placeholder="ex: touriste, guide, conservateur ou email">
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label small fw-bold text-secondary mb-0">Mot de passe</label>
                      <button type="button" class="btn btn-link p-0 small text-accent-custom text-decoration-none" (click)="showResetModal = true">
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
                      <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="credentials.motDePasse" name="motDePasse" class="form-control border-start-0 border-end-0" required placeholder="••••••••">
                      <button type="button" class="btn btn-outline-secondary border-start-0 bg-light" (click)="showPassword = !showPassword" tabindex="-1" title="Afficher/Masquer le mot de passe">
                        <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill text-accent-custom' : 'bi-eye-fill text-muted'"></i>
                      </button>
                    </div>
                  </div>

                  <button type="submit" [disabled]="!loginForm.form.valid || loading" class="btn btn-custom-accent w-100 py-2 fw-bold rounded-pill mb-3">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!loading" class="bi bi-box-arrow-in-right me-1"></i> Se connecter
                  </button>
                </form>

                <div class="text-center small text-muted mb-4">
                  Pas encore de compte ? 
                  <a routerLink="/register" class="text-accent-custom fw-bold text-decoration-none ms-1">
                    Créer un compte <i class="bi bi-arrow-right-short"></i>
                  </a>
                </div>

                <!-- Comptes Démo Rapides (1-Clic pour évaluation) -->
                <div class="p-3 bg-light rounded-3 border">
                  <div class="small fw-bold text-muted mb-2 d-flex justify-content-between">
                    <span><i class="bi bi-lightning-charge-fill text-warning me-1"></i> Profils de Test (cliquez pour remplir) :</span>
                    <span class="badge bg-white text-dark border font-monospace">Pass: passer123</span>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-xs btn-outline-success rounded-pill px-2 py-1 small" (click)="fillDemo('touriste', 'passer123')">
                      👤 Touriste (Aïssatou)
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-primary rounded-pill px-2 py-1 small" (click)="fillDemo('guide', 'passer123')">
                      🧭 Guide (Mamadou)
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-dark rounded-pill px-2 py-1 small" (click)="fillDemo('conservateur', 'passer123')">
                      🏛️ Conservateur (Dr Badji)
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Mot de Passe Oublié -->
      <div class="modal fade show d-block" *ngIf="showResetModal" style="background: rgba(0,0,0,0.5);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 rounded-4 shadow">
            <div class="modal-header bg-primary-custom text-white">
              <h5 class="modal-title fw-bold"><i class="bi bi-key me-2"></i>Réinitialisation du Mot de Passe</h5>
              <button type="button" class="btn-close btn-close-white" (click)="showResetModal = false"></button>
            </div>
            <div class="modal-body p-4">
              <p class="small text-muted mb-3">
                Entrez votre adresse email ou identifiant ainsi que votre nouveau mot de passe pour mettre à jour votre compte.
              </p>
              <div class="mb-3">
                <label class="form-label small fw-bold">Email / Identifiant</label>
                <input type="text" [(ngModel)]="resetEmail" class="form-control" placeholder="ex: touriste@zig.sn">
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold">Nouveau mot de passe</label>
                <div class="input-group">
                  <input [type]="showResetPassword ? 'text' : 'password'" [(ngModel)]="resetNewPassword" class="form-control border-end-0" placeholder="••••••••">
                  <button type="button" class="btn btn-outline-secondary border-start-0 bg-light" (click)="showResetPassword = !showResetPassword" tabindex="-1">
                    <i class="bi" [ngClass]="showResetPassword ? 'bi-eye-slash-fill text-accent-custom' : 'bi-eye-fill text-muted'"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="modal-footer bg-light border-0">
              <button type="button" class="btn btn-secondary rounded-pill px-3" (click)="showResetModal = false">Annuler</button>
              <button type="button" class="btn btn-custom-accent rounded-pill px-4" (click)="onResetPassword()">
                Confirmer la Réinitialisation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: '',
    motDePasse: ''
  };

  loading: boolean = false;
  showPassword: boolean = false;
  showResetPassword: boolean = false;
  errorMessage: string = '';
  isSuspended: boolean = false;
  resetSuccessMessage: string = '';

  showResetModal: boolean = false;
  resetEmail: string = '';
  resetNewPassword: string = '';

  fillDemo(login: string, pass: string): void {
    this.credentials.email = login;
    this.credentials.motDePasse = pass;
    this.errorMessage = '';
    this.isSuspended = false;
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.isSuspended = false;

    // 1. Détection préventive si le compte est marqué suspendu dans l'annuaire
    const userCheck = this.authService.findUserByLogin(this.credentials.email);
    if (userCheck && userCheck.statut === 'SUSPENDU') {
      this.loading = false;
      this.isSuspended = true;
      this.errorMessage = `Ce compte a été suspendu par le Conservateur du Patrimoine.${userCheck.motifSuspension ? ' Motif : ' + userCheck.motifSuspension : ''}`;
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/profil']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.message || (typeof err === 'string' ? err : '');
        if (msg && (msg.toLowerCase().includes('suspendu') || msg.toLowerCase().includes('suspension'))) {
          this.isSuspended = true;
          this.errorMessage = msg;
        } else if (err?.error?.message) {
          this.isSuspended = false;
          this.errorMessage = err.error.message;
        } else {
          this.isSuspended = false;
          this.errorMessage = 'Identifiant ou mot de passe incorrect. Vérifiez vos paramètres.';
        }
      }
    });
  }

  onResetPassword(): void {
    if (!this.resetEmail || !this.resetNewPassword) {
      alert('Veuillez renseigner tous les champs.');
      return;
    }

    this.authService.resetPassword(this.resetEmail, this.resetNewPassword).subscribe({
      next: () => {
        this.showResetModal = false;
        this.resetSuccessMessage = 'Votre mot de passe a été mis à jour avec succès. Vous pouvez vous connecter.';
        this.credentials.email = this.resetEmail;
        this.credentials.motDePasse = this.resetNewPassword;
      }
    });
  }
}
