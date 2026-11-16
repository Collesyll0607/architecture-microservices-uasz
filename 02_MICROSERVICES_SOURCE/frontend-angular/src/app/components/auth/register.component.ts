import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-xl-7">
          <div class="card-custom p-4 p-md-5 shadow-lg border-0 bg-white">
            <div class="text-center mb-4">
              <span class="badge bg-primary-custom text-white px-3 py-2 rounded-pill mb-2">REJOINDRE LA PLATEFORME</span>
              <h2 class="fw-bold brand-font text-primary-custom mb-1">Créer un Compte</h2>
              <p class="text-muted small">Inscrivez-vous pour explorer ou guider les voyageurs en Basse-Casamance</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger py-2 small d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
              <div>{{ errorMessage }}</div>
            </div>

            <form (ngSubmit)="onSubmit()" #regForm="ngForm">
              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary">Nom Complet *</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
                  <input type="text" [(ngModel)]="newUser.nomComplet" name="nomComplet" class="form-control border-start-0" required placeholder="Ex: Fatou Badji">
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Adresse Email *</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                    <input type="email" [(ngModel)]="newUser.email" name="email" class="form-control border-start-0" required placeholder="nom@exemple.sn">
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Numéro de Téléphone *</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0"><i class="bi bi-telephone text-muted"></i></span>
                    <input type="tel" [(ngModel)]="newUser.telephone" name="telephone" class="form-control border-start-0" required placeholder="+221 77 000 00 00">
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Profil / Rôle</label>
                  <select [(ngModel)]="newUser.role" name="role" class="form-select">
                    <option value="TOURISTE">Voyageur / Touriste</option>
                    <option value="GUIDE">Guide Touristique Local</option>
                    <option value="CONSERVATEUR">Conservateur de Site</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Langues Parlées</label>
                  <input type="text" [(ngModel)]="newUser.languesParlees" name="languesParlees" class="form-control" placeholder="Ex: Français, Diola, Anglais">
                </div>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Mot de passe *</label>
                  <div class="input-group">
                    <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="newUser.motDePasse" name="motDePasse" class="form-control border-end-0" required placeholder="••••••••" minlength="4">
                    <button type="button" class="btn btn-outline-secondary border-start-0 bg-light" (click)="showPassword = !showPassword" tabindex="-1" title="Afficher/Masquer le mot de passe">
                      <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill text-accent-custom' : 'bi-eye-fill text-muted'"></i>
                    </button>
                  </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold text-secondary">Confirmer le mot de passe *</label>
                  <div class="input-group">
                    <input [type]="showConfirmPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" class="form-control border-end-0" required placeholder="••••••••">
                    <button type="button" class="btn btn-outline-secondary border-start-0 bg-light" (click)="showConfirmPassword = !showConfirmPassword" tabindex="-1" title="Afficher/Masquer le mot de passe">
                      <i class="bi" [ngClass]="showConfirmPassword ? 'bi-eye-slash-fill text-accent-custom' : 'bi-eye-fill text-muted'"></i>
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" [disabled]="!regForm.form.valid || loading" class="btn btn-custom-accent w-100 py-2 fw-bold rounded-pill mb-3">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!loading" class="bi bi-person-check-fill me-1"></i> Créer mon Compte
              </button>
            </form>

            <div class="text-center small text-muted">
              Vous avez déjà un compte ?
              <a routerLink="/login" class="text-accent-custom fw-bold text-decoration-none ms-1">
                Se connecter <i class="bi bi-arrow-right-short"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  newUser: RegisterRequest = {
    nomComplet: '',
    email: '',
    telephone: '',
    motDePasse: '',
    role: 'TOURISTE',
    languesParlees: 'Français, Diola'
  };

  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  onSubmit(): void {
    if (this.newUser.motDePasse !== this.confirmPassword) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.newUser).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/profil']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de la création du compte. Vérifiez vos données.';
      }
    });
  }
}
