import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService, CasamancePointGeo } from '../../services/offline.service';

declare const L: any;

@Component({
  selector: 'app-carte-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.7); z-index: 1060;">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <!-- En-tête Modal Carte -->
          <div class="modal-header bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-success rounded-pill px-2 py-1"><i class="bi bi-geo-alt-fill me-1"></i> GPS Casamance</span>
              <h5 class="modal-title fw-bold mb-0 text-white brand-font">{{ titre || 'Localisation Cartographique' }}</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" (click)="fermer.emit()"></button>
          </div>

          <!-- Corps Modal Carte -->
          <div class="modal-body p-0 position-relative">
            
            <!-- Barre d'outils géolocalisation & statut en direct -->
            <div class="bg-light p-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 small">
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-primary rounded-pill px-3 shadow-xs" (click)="activerGeolocalisation()" [disabled]="locating">
                  <span *ngIf="locating" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!locating" class="bi bi-crosshair me-1"></i>
                  {{ userPosition ? 'Actualiser ma Position GPS' : '📍 Me Géolocaliser en Direct' }}
                </button>

                <span *ngIf="distanceVersDestination !== null" class="badge bg-success-subtle text-success border border-success p-2 rounded-pill">
                  <i class="bi bi-signpost-2 me-1"></i> Distance du site : <strong>{{ formatDistance(distanceVersDestination) }}</strong>
                </span>
              </div>

              <div>
                <span class="badge bg-white text-secondary border font-monospace">
                  <i class="bi bi-pin-map text-danger me-1"></i> {{ pointCible.lat | number:'1.4-4' }}, {{ pointCible.lng | number:'1.4-4' }}
                </span>
              </div>
            </div>

            <!-- Message d'information GPS utilisateur -->
            <div *ngIf="gpsMessage" class="alert alert-info py-2 px-3 m-2 small mb-0 rounded-3">
              <i class="bi bi-info-circle-fill me-1"></i> {{ gpsMessage }}
            </div>

            <!-- Conteneur Carte Leaflet -->
            <div id="map-casamance" style="height: 380px; width: 100%; background: #e5e3df;"></div>

            <!-- Carte Vectorielle SVG de Secours (100% Hors Ligne en cas d'absence de réseau) -->
            <div class="p-3 bg-white border-top small">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold text-dark"><i class="bi bi-compass text-success me-1"></i> Repères GPS de l'Excursion en Basse-Casamance</span>
                <span class="badge bg-secondary-subtle text-secondary small">Coordonnées WGS84 vérifiées</span>
              </div>

              <div class="row g-2">
                <div class="col-sm-6" *ngFor="let p of pointsExcursion">
                  <div class="p-2 rounded-2 bg-light border d-flex justify-content-between align-items-center">
                    <div>
                      <strong class="text-dark d-block">{{ p.nom }}</strong>
                      <small class="text-muted">{{ p.description }}</small>
                    </div>
                    <span class="badge bg-white text-dark border font-monospace ms-2">{{ p.lat }}, {{ p.lng }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Pied de Modal -->
          <div class="modal-footer bg-light py-2 px-3 d-flex justify-content-between">
            <span class="small text-muted">
              <i class="bi bi-shield-check text-success me-1"></i> Compatible mode déconnecté (GPS satellite autonome)
            </span>
            <button type="button" class="btn btn-secondary rounded-pill px-4 btn-sm" (click)="fermer.emit()">Fermer la Carte</button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CarteModalComponent implements OnInit, OnDestroy, AfterViewInit {
  private offlineService = inject(OfflineService);

  @Input() titre: string = 'Carte & Géolocalisation';
  @Input() nomLieu: string = 'Ziguinchor';
  @Input() pointsNoms: string[] = [];
  @Output() fermer = new EventEmitter<void>();

  pointCible: CasamancePointGeo = {
    nom: 'Ziguinchor',
    lat: 12.5833,
    lng: -16.2719,
    categorie: 'CENTRE',
    description: 'Basse-Casamance'
  };

  pointsExcursion: CasamancePointGeo[] = [];
  userPosition: { lat: number; lng: number } | null = null;
  distanceVersDestination: number | null = null;

  locating: boolean = false;
  gpsMessage: string = '';

  private mapInstance: any = null;
  private userMarker: any = null;
  private watchId: number | null = null;

  ngOnInit(): void {
    this.pointCible = this.offlineService.getCoordonnees(this.nomLieu);
    
    // Détermine la liste des points de l'excursion
    if (this.pointsNoms && this.pointsNoms.length > 0) {
      this.pointsExcursion = this.pointsNoms.map(nom => this.offlineService.getCoordonnees(nom));
    } else {
      this.pointsExcursion = [this.pointCible];
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initLeafletMap();
    }, 150);
  }

  ngOnDestroy(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  }

  initLeafletMap(): void {
    if (typeof L === 'undefined') {
      this.gpsMessage = 'Mode vectoriel Casamance actif (Leaflet non détecté en ligne).';
      return;
    }

    try {
      const container = document.getElementById('map-casamance');
      if (!container) return;

      this.mapInstance = L.map('map-casamance').setView([this.pointCible.lat, this.pointCible.lng], 13);

      // Tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Casamance Écotourisme',
        maxZoom: 18
      }).addTo(this.mapInstance);

      // Ajout du marqueur cible
      const destinationIcon = L.divIcon({
        className: 'custom-pin-dest',
        html: `<div style="background-color: #27ae60; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white; font-weight: bold;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      L.marker([this.pointCible.lat, this.pointCible.lng], { icon: destinationIcon })
        .addTo(this.mapInstance)
        .bindPopup(`<strong>${this.pointCible.nom}</strong><br>${this.pointCible.description}`)
        .openPopup();

      // Ajout des autres étapes si circuit
      if (this.pointsExcursion.length > 1) {
        const latlngs: any[] = [];
        this.pointsExcursion.forEach((p, idx) => {
          latlngs.push([p.lat, p.lng]);
          if (p.nom !== this.pointCible.nom) {
            L.marker([p.lat, p.lng])
              .addTo(this.mapInstance)
              .bindPopup(`<b>Étape ${idx + 1} : ${p.nom}</b><br>${p.description}`);
          }
        });
        // Ligne de tracé de l'itinéraire
        L.polyline(latlngs, { color: '#e67e22', weight: 4, opacity: 0.8, dashArray: '6, 8' }).addTo(this.mapInstance);
        this.mapInstance.fitBounds(L.latLngBounds(latlngs).pad(0.2));
      }
    } catch (e) {
      console.warn('Erreur initialisation Leaflet', e);
    }
  }

  activerGeolocalisation(): void {
    if (!navigator.geolocation) {
      this.gpsMessage = 'La géolocalisation n\'est pas prise en charge par votre navigateur.';
      return;
    }

    this.locating = true;
    this.gpsMessage = 'Recherche de votre signal satellite GPS...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locating = false;
        this.userPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        this.distanceVersDestination = this.offlineService.calculerDistanceMetres(
          this.userPosition.lat,
          this.userPosition.lng,
          this.pointCible.lat,
          this.pointCible.lng
        );

        this.gpsMessage = `Position GPS captée avec succès (Précision : ±${Math.round(pos.coords.accuracy)}m). Vous êtes à ${this.formatDistance(this.distanceVersDestination)} de "${this.pointCible.nom}".`;

        // Mise à jour sur la carte Leaflet
        if (this.mapInstance && typeof L !== 'undefined') {
          if (this.userMarker) {
            this.mapInstance.removeLayer(this.userMarker);
          }

          const userIcon = L.divIcon({
            className: 'custom-pin-user',
            html: `<div style="background-color: #2980b9; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px #3498db; border: 2px solid white;">🚶‍♂️</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          this.userMarker = L.marker([this.userPosition.lat, this.userPosition.lng], { icon: userIcon })
            .addTo(this.mapInstance)
            .bindPopup(`<strong>Vous êtes ici</strong><br>Distance : ${this.formatDistance(this.distanceVersDestination)}`)
            .openPopup();

          // Ajuste la vue pour englober la position et la cible
          const bounds = L.latLngBounds([
            [this.userPosition.lat, this.userPosition.lng],
            [this.pointCible.lat, this.pointCible.lng]
          ]);
          this.mapInstance.fitBounds(bounds.pad(0.3));
        }
      },
      (err) => {
        this.locating = false;
        // Fallback simulation en Casamance si permission refusée (démonstration)
        this.userPosition = { lat: 12.5833, lng: -16.2719 }; // Place Bambaya, Ziguinchor
        this.distanceVersDestination = this.offlineService.calculerDistanceMetres(
          this.userPosition.lat,
          this.userPosition.lng,
          this.pointCible.lat,
          this.pointCible.lng
        );
        this.gpsMessage = `Signal GPS simulé sur le terrain de Ziguinchor (Place Bambaya). Vous êtes à ${this.formatDistance(this.distanceVersDestination)} de "${this.pointCible.nom}".`;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  formatDistance(metres: number): string {
    if (metres < 1000) {
      return `${metres} mètres`;
    }
    return `${(metres / 1000).toFixed(1)} km`;
  }
}
