import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PatrimoineListComponent } from './components/patrimoine-list/patrimoine-list.component';
import { CircuitListComponent } from './components/circuit-list/circuit-list.component';
import { EvenementListComponent } from './components/evenement-list/evenement-list.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { ArchitectureComponent } from './components/architecture/architecture.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ProfilComponent } from './components/profil/profil.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Accueil | Casamance Écotourisme' },
  { path: 'patrimoines', component: PatrimoineListComponent, title: 'Sites Écotouristiques | Casamance' },
  { path: 'circuits', component: CircuitListComponent, title: 'Circuits & Guides | Casamance' },
  { path: 'evenements', component: EvenementListComponent, title: 'Agenda Culturel | Casamance' },
  { path: 'reservations', component: ReservationComponent, title: 'Guichet Réservations | Casamance' },
  { path: 'architecture', component: ArchitectureComponent, title: 'Architecture SOA & Microservices' },
  { path: 'login', component: LoginComponent, title: 'Connexion | Casamance Écotourisme' },
  { path: 'register', component: RegisterComponent, title: 'Créer un Compte | Casamance Écotourisme' },
  { path: 'profil', component: ProfilComponent, title: 'Mon Profil & Planning Guides | Casamance' },
  { path: '**', redirectTo: '' }
];

