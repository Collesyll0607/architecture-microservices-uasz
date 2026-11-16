import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <main class="flex-grow-1">
      <router-outlet></router-outlet>
    </main>

    <!-- Pied de page Identité Casamance (Exactement comme fragments/layout.html version 1) -->
    <footer class="footer-casamance">
      <div class="container">
        <div class="row g-4 align-items-center text-center text-md-start">
          <div class="col-md-6">
            <div class="footer-brand mb-1">Patrimoine Touristique de Ziguinchor</div>
            <p class="footer-subtitle mb-0">Plateforme de préservation, valorisation et promotion du patrimoine culturel et naturel de la Casamance.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="d-inline-flex flex-wrap gap-2 justify-content-center justify-content-md-end">
              <span class="badge bg-dark border border-secondary px-3 py-2"><i class="bi bi-tree me-1 text-success"></i> Écotourisme Responsable</span>
              <span class="badge bg-dark border border-secondary px-3 py-2"><i class="bi bi-bank me-1 text-warning"></i> Mémoire & Histoire</span>
            </div>
          </div>
        </div>
        <div class="footer-copy text-center">
          <p class="mb-1 text-white">Licence 3 Informatique (L3 2I) — Université Assane Seck de Ziguinchor (UASZ)</p>
          <p class="mb-1 text-white-75 small">
            Trinôme de Réalisation : <strong>Collé SYLL</strong> (202300489) • <strong>Ndeye Thiamba FAYE</strong> (202300488) • <strong>Mame Faty DIOP</strong>
          </p>
          <small class="text-white-50">Projet SOA — Sous l'encadrement pédagogique de <strong>Dr. Lamine FATY</strong></small>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'frontend-angular';
}
