import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-casamance py-3 sticky-top">
      <div class="container">
        <!-- Brand avec Logo Culturel (Exactement comme layout.html de la version 1) -->
        <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" routerLink="/">
          <div class="rounded-circle d-flex align-items-center justify-content-center" 
               style="width: 42px; height: 42px; background: linear-gradient(135deg, var(--casa-ochre), var(--casa-terracotta)); box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
            <i class="bi bi-compass text-white fs-5"></i>
          </div>
          <div>
            <span class="navbar-brand-title d-block mb-0">Ziguinchor <span>Tourisme</span></span>
            <small class="text-white-50 d-block" style="font-size: 0.72rem; letter-spacing: 1px; text-transform: uppercase;">Perle de Casamance</small>
          </div>
        </a>

        <!-- Bouton hamburger mobile -->
        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <!-- Liens de navigation SANS numéros de ports -->
          <ul class="navbar-nav me-auto ms-lg-4 gap-1">
            <li class="nav-item">
              <a class="nav-link nav-link-custom" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                <i class="bi bi-house-door me-1 text-warning"></i> Accueil
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-link-custom" routerLink="/patrimoines" routerLinkActive="active">
                <i class="bi bi-houses me-1 text-warning"></i> Sites
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-link-custom" routerLink="/circuits" routerLinkActive="active">
                <i class="bi bi-compass me-1 text-info"></i> Circuits & Guides
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-link-custom" routerLink="/evenements" routerLinkActive="active">
                <i class="bi bi-calendar-event me-1 text-success"></i> Événements
              </a>
            </li>
            <!-- Réservations visible UNIQUEMENT pour le touriste connecté -->
            <li class="nav-item" *ngIf="currentUser && isTouriste()">
              <a class="nav-link nav-link-custom" routerLink="/reservations" routerLinkActive="active">
                <i class="bi bi-ticket-perforated me-1 text-info"></i> Mes Réservations
              </a>
            </li>
            <!-- Raccourci Agenda pour le Guide (pas de réservation touristique) -->
            <li class="nav-item" *ngIf="isGuide()">
              <a class="nav-link nav-link-custom" routerLink="/profil" routerLinkActive="active">
                <i class="bi bi-calendar-check me-1 text-success"></i> Mon Agenda Guide
              </a>
            </li>
            <!-- Raccourci Dashboard pour le Conservateur (pas de réservation touristique) -->
            <li class="nav-item" *ngIf="isConservateur()">
              <a class="nav-link nav-link-custom" routerLink="/profil" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-1 text-warning"></i> Espace Conservateur
              </a>
            </li>
            <!-- Architecture SOA : Visible UNIQUEMENT par le Conservateur (côté Admin) -->
            <li class="nav-item" *ngIf="isConservateur()">
              <a class="nav-link nav-link-custom" routerLink="/architecture" routerLinkActive="active">
                <i class="bi bi-diagram-3 me-1 text-warning"></i> Architecture SOA
              </a>
            </li>
          </ul>

          <!-- Espace Authentification & Profil -->
          <ul class="navbar-nav ms-auto align-items-center gap-2">
            <!-- Anonyme : Inscription & Connexion -->
            <li class="nav-item d-flex align-items-center gap-2" *ngIf="!currentUser">
              <a class="btn btn-sm btn-outline-light px-3 rounded-pill" routerLink="/login">
                <i class="bi bi-box-arrow-in-right me-1"></i> Connexion
              </a>
              <a class="btn btn-sm btn-casa-ochre px-3 rounded-pill shadow-sm" routerLink="/register">
                <i class="bi bi-person-plus me-1"></i> S'inscrire
              </a>
            </li>

            <!-- Menu Utilisateur Connecté -->
            <li class="nav-item dropdown" *ngIf="currentUser">
              <a class="btn btn-sm btn-light dropdown-toggle fw-semibold rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" 
                 href="#" role="button" data-bs-toggle="dropdown">
                <div class="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center" style="width: 24px; height: 24px; font-size: 0.72rem;">
                  {{ getInitials(currentUser.nomComplet) }}
                </div>
                <span>{{ currentUser.nomComplet }}</span>
                <span class="badge bg-success-subtle text-success border border-success-subtle" style="font-size: 0.65rem;">
                  {{ formatRole(currentUser.role) }}
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-2">
                <li class="dropdown-item-text text-muted small border-bottom pb-2">
                  <div class="fw-bold text-dark">{{ currentUser.nomComplet }}</div>
                  <div>{{ currentUser.email }}</div>
                </li>
                <li>
                  <a class="dropdown-item py-2 small" routerLink="/profil">
                    <i class="bi bi-person-gear me-2 text-primary"></i> Mon Profil & Paramètres
                  </a>
                </li>
                <li *ngIf="isTouriste()">
                  <a class="dropdown-item py-2 small" routerLink="/profil">
                    <i class="bi bi-ticket-perforated me-2 text-primary"></i> Mes Billets & Pass QR
                  </a>
                </li>
                <li *ngIf="isGuide()">
                  <a class="dropdown-item py-2 small" routerLink="/profil">
                    <i class="bi bi-calendar-check me-2 text-success"></i> Mon Agenda & Visites Confiées
                  </a>
                </li>
                <li *ngIf="isConservateur()">
                  <a class="dropdown-item py-2 small" routerLink="/profil">
                    <i class="bi bi-speedometer2 me-2 text-warning"></i> Dashboard Conservateur
                  </a>
                </li>
                <li><hr class="dropdown-divider my-1"></li>
                <li>
                  <button type="button" class="dropdown-item text-danger d-flex align-items-center py-2 small" (click)="onLogout()">
                    <i class="bi bi-box-arrow-right me-2"></i> Déconnexion
                  </button>
                </li>
              </ul>
            </li>
          </ul>

        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: User | null = null;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
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

  formatRole(role?: string): string {
    if (!role) return 'Visiteur';
    if (role === 'TOURISTE' || role === 'ROLE_TOURISTE') return 'Touriste';
    if (role === 'GUIDE' || role === 'ROLE_GUIDE') return 'Guide';
    if (role === 'CONSERVATEUR' || role === 'ROLE_CONSERVATEUR') return 'Conservateur';
    return role;
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
