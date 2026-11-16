import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Guide, CreneauHoraire, GuidePlanning, VisiteGuidee, AvisVisite, CandidatureGuide } from '../models/guide.model';

@Injectable({
  providedIn: 'root'
})
export class GuideService {

  // Créneaux horaires d'excursions standardisés
  private creneaux: CreneauHoraire[] = [
    {
      id: 'HORAIRE_09_12',
      libelle: '09h00 - 12h00',
      periode: 'MATIN',
      description: 'Matinée fraîche : idéal pour la marche, les forêts sacrées et le marché aux poissons.'
    },
    {
      id: 'HORAIRE_14_17',
      libelle: '14h30 - 17h30',
      periode: 'APRES_MIDI',
      description: 'Après-midi culturelle : visite des musées, ateliers d\'artisanat et cases à étages.'
    },
    {
      id: 'HORAIRE_17_19',
      libelle: '17h30 - 19h30',
      periode: 'COUCHER_SOLEIL',
      description: 'Crépuscule féerique : navigation en pirogue et observation des oiseaux sur les bolongs.'
    }
  ];

  // Référentiel des Guides Certifiés de Casamance avec expérience et circuits maîtrisés
  private guides: Guide[] = [
    {
      id: 2,
      nom: 'DIATTA',
      prenom: 'Mamadou',
      nomComplet: 'Mamadou DIATTA',
      specialite: 'Faune & Flore des Bolongs, Histoire coloniale & Forêts sacrées',
      langues: ['Français', 'Diola', 'Anglais', 'Mandingue'],
      telephone: '+221 77 555 12 34',
      email: 'guide@zig-tourisme.sn',
      note: 4.9,
      nbAvis: 48,
      anneesExperience: 12,
      statut: 'ACTIF',
      photo: '/assets/images/casamance/pirogue_fleuve.jpg',
      biographie: 'Guide assermenté avec 12 ans d\'expérience dans l\'estuaire de Ziguinchor, le quartier Escale et les villages du royaume d\'Oussouye.',
      circuitsAssignes: [1, 2],
      circuitsNoms: ['Boucle Historique & Fluviale de Ziguinchor', 'Immersion Insulaire : Pirogue vers l\'Île de Carabane'],
      patrimoinesNoms: ['Alliance Franco-Sénégalaise', 'Port de Boudody', 'Cathédrale Saint-Antoine de Padoue', 'Île de Carabane']
    },
    {
      id: 4,
      nom: 'SADIO',
      prenom: 'Bakary',
      nomComplet: 'Bakary SADIO',
      specialite: 'Navigation fluviale en pirogue, Observation ornithologique & Mangrove',
      langues: ['Français', 'Diola', 'Wolof'],
      telephone: '+221 78 333 45 67',
      email: 'bakary.sadio@zig-tourisme.sn',
      note: 5.0,
      nbAvis: 62,
      anneesExperience: 8,
      statut: 'ACTIF',
      photo: '/assets/images/casamance/bolong_mangrove.jpg',
      biographie: 'Piroguier émérite et guide écotouristique formé aux sanctuaires d\'oiseaux et au dédale des bolongs de Basse-Casamance.',
      circuitsAssignes: [2],
      circuitsNoms: ['Immersion Insulaire : Pirogue vers l\'Île de Carabane'],
      patrimoinesNoms: ['Port de Boudody', 'Île de Carabane']
    },
    {
      id: 5,
      nom: 'SANÉ',
      prenom: 'Fatou',
      nomComplet: 'Fatou SANÉ',
      specialite: 'Architecture de terre crue, Cases à impluvium & Rituels Diolas',
      langues: ['Français', 'Diola', 'Anglais'],
      telephone: '+221 77 888 99 00',
      email: 'fatou.sane@zig-tourisme.sn',
      note: 4.8,
      nbAvis: 31,
      anneesExperience: 6,
      statut: 'ACTIF',
      photo: '/assets/images/casamance/cases_mlomp.jpg',
      biographie: 'Historienne de formation et médiatrice du patrimoine, spécialiste du génie architectural de Mlomp et Enampore.',
      circuitsAssignes: [3],
      circuitsNoms: ['Patrimoine Architectural Diola : Cases à Étages de Mlomp'],
      patrimoinesNoms: ['Cases à Étages de Mlomp', 'Marché Saint-Maur des Fossés']
    },
    {
      id: 6,
      nom: 'COLY',
      prenom: 'Lamine',
      nomComplet: 'Lamine COLY',
      specialite: 'Patrimoine matériel, Muséographie & Artisanat traditionnel',
      langues: ['Français', 'Mandingue', 'Wolof', 'Diola'],
      telephone: '+221 76 111 22 33',
      email: 'lamine.coly@zig-tourisme.sn',
      note: 4.7,
      nbAvis: 24,
      anneesExperience: 5,
      statut: 'ACTIF',
      photo: '/assets/images/casamance/marche_saint_maur.jpg',
      biographie: 'Animateur culturel et guide urbain sur les artères historiques et marchés traditionnels de Ziguinchor.',
      circuitsAssignes: [1, 3],
      circuitsNoms: ['Boucle Historique & Fluviale de Ziguinchor', 'Patrimoine Architectural Diola : Cases à Étages de Mlomp'],
      patrimoinesNoms: ['Alliance Franco-Sénégalaise', 'Gouvernance de Ziguinchor', 'Marché Saint-Maur des Fossés']
    }
  ];
  private guidesSubject = new BehaviorSubject<Guide[]>(this.guides);

  // Plannings journaliers
  private initialPlannings: GuidePlanning[] = [
    {
      id: 101,
      guideId: 2,
      date: new Date().toISOString().split('T')[0],
      horaireId: 'HORAIRE_09_12',
      horaireLibelle: '09h00 - 12h00',
      statut: 'OCCUPE',
      circuitId: 1,
      circuitNom: 'Boucle Historique & Fluviale de Ziguinchor',
      clientNom: 'Groupe Découverte Dakar (Aïssatou Fall)'
    },
    {
      id: 102,
      guideId: 4,
      date: new Date().toISOString().split('T')[0],
      horaireId: 'HORAIRE_14_17',
      horaireLibelle: '14h30 - 17h30',
      statut: 'OCCUPE',
      circuitId: 2,
      circuitNom: 'Immersion Insulaire : Pirogue vers l\'Île de Carabane',
      clientNom: 'Famille Ba (Cap Skirring)'
    }
  ];
  private planningsSubject = new BehaviorSubject<GuidePlanning[]>(this.initialPlannings);

  // Visites Guidées confiées aux Guides (Comme guide/espace.html de la version 1)
  private visites: VisiteGuidee[] = [
    {
      id: 1,
      titre: 'Boucle Historique & Fluviale de Ziguinchor',
      type: 'CIRCUIT',
      elementId: 1,
      guideId: 2,
      guideNom: 'Mamadou DIATTA',
      dateHeure: 'Aujourd\'hui à 09:00',
      horaireId: 'HORAIRE_09_12',
      horaireLibelle: '09h00 - 12h00',
      placesMax: 15,
      placesOccupees: 4,
      tarifParPersonne: 5000,
      statut: 'EN_COURS',
      participants: [
        { clientNom: 'Aïssatou Fall', email: 'touriste@zig-tourisme.sn', telephone: '+221 77 123 45 67', nombrePlaces: 2, qrCodeToken: 'PASS-AF-778', statutReservation: 'CONFIRMEE' },
        { clientNom: 'Jean Mendy', email: 'jean.mendy@uasz.sn', telephone: '+221 76 999 11 22', nombrePlaces: 2, qrCodeToken: 'PASS-JM-412', statutReservation: 'CONFIRMEE' }
      ]
    },
    {
      id: 2,
      titre: 'Immersion Insulaire : Pirogue vers l\'Île de Carabane',
      type: 'CIRCUIT',
      elementId: 2,
      guideId: 2,
      guideNom: 'Mamadou DIATTA',
      dateHeure: 'Demain à 14:30',
      horaireId: 'HORAIRE_14_17',
      horaireLibelle: '14h30 - 17h30',
      placesMax: 12,
      placesOccupees: 3,
      tarifParPersonne: 7500,
      statut: 'PROGRAMMEE',
      participants: [
        { clientNom: 'Mame Diarra Ndiaye', email: 'diarra.nd@gmail.com', telephone: '+221 70 888 22 11', nombrePlaces: 3, qrCodeToken: 'PASS-MD-905', statutReservation: 'CONFIRMEE' }
      ]
    },
    {
      id: 3,
      titre: 'Patrimoine Architectural Diola : Cases à Étages de Mlomp',
      type: 'CIRCUIT',
      elementId: 3,
      guideId: 2,
      guideNom: 'Mamadou DIATTA',
      dateHeure: 'Hier à 09:00',
      horaireId: 'HORAIRE_09_12',
      horaireLibelle: '09h00 - 12h00',
      placesMax: 10,
      placesOccupees: 5,
      tarifParPersonne: 4000,
      statut: 'TERMINEE',
      participants: [
        { clientNom: 'Touriste Démo', email: 'touriste@zig-tourisme.sn', telephone: '+221 77 123 45 67', nombrePlaces: 2, qrCodeToken: 'PASS-DEMO-001', statutReservation: 'EFFECTUEE' }
      ]
    }
  ];
  private visitesSubject = new BehaviorSubject<VisiteGuidee[]>(this.visites);

  // Avis et Litiges déposés par les Touristes (Comme touriste/reservations.html de la version 1)
  private avis: AvisVisite[] = [
    {
      id: 1,
      visiteId: 3,
      visiteTitre: 'Patrimoine Architectural Diola : Cases à Étages de Mlomp',
      reservationId: 1,
      touristeNom: 'Dr. Cheikh Sarr',
      touristeEmail: 'cheikh.sarr@uasz.sn',
      guideId: 2,
      guideNom: 'Mamadou DIATTA',
      note: 5,
      commentaire: 'Excellente visite ! Mamadou maîtrise parfaitement les secrets des cases à étages et les traditions Diolas.',
      date: '14/11/2026',
      estLitige: false
    },
    {
      id: 2,
      visiteId: 2,
      visiteTitre: 'Immersion Insulaire : Pirogue vers l\'Île de Carabane',
      touristeNom: 'Sophie Dupont',
      touristeEmail: 'sophie.dupont@orange.fr',
      guideId: 4,
      guideNom: 'Bakary SADIO',
      note: 5,
      commentaire: 'Traversée en pirogue magique au milieu des dauphins et oiseaux de mangrove. Guide très ponctuel et attentionné.',
      date: '12/11/2026',
      estLitige: false
    }
  ];
  private avisSubject = new BehaviorSubject<AvisVisite[]>(this.avis);

  // Dossiers de Candidature des Guides en attente d'évaluation par le Conservateur
  private candidatures: CandidatureGuide[] = [
    {
      id: 201,
      nomComplet: 'Ousmane SONKO (Guide Naturaliste)',
      email: 'ousmane.sonko.guide@gmail.com',
      telephone: '+221 77 444 88 99',
      anneesExperience: 4,
      langues: ['Français', 'Diola', 'Anglais'],
      specialite: 'Botanique des forêts classées, ornithologie & sentiers de randonnée pédestre',
      circuitsMaitrises: ['Sentier écologique de Kalounayes', 'Boucle des Baobabs séculaires'],
      sitesMaitrises: ['Forêt de Bayottes', 'Forêt Classée de Bissine'],
      biographie: 'Passionné de préservation écologique et diplômé en gestion des espaces naturels, je souhaite accompagner les visiteurs dans la découverte respectueuse de notre biodiversité.',
      dateSoumission: '13/11/2026 14:20',
      statut: 'EN_ATTENTE'
    },
    {
      id: 202,
      nomComplet: 'Awa DIÉDHIOU',
      email: 'awa.diedhiou@casamance-tour.sn',
      telephone: '+221 76 555 77 11',
      anneesExperience: 6,
      langues: ['Français', 'Mandingue', 'Wolof', 'Espagnol'],
      specialite: 'Artisanat d\'art Diola, vannerie traditionnelle & poterie d\'Edioungou',
      circuitsMaitrises: ['Route des Artisanes d\'Oussouye', 'Marchés Vivants de Casamance'],
      sitesMaitrises: ['Marché Saint-Maur des Fossés', 'Ateliers d\'Edioungou'],
      biographie: 'Originaire d\'Oussouye, je transmets depuis 6 ans les savoir-faire ancestraux de la vannerie et poterie aux voyageurs du monde entier.',
      dateSoumission: '14/11/2026 18:45',
      statut: 'EN_ATTENTE'
    }
  ];
  private candidaturesSubject = new BehaviorSubject<CandidatureGuide[]>(this.candidatures);

  getCreneaux(): CreneauHoraire[] {
    return this.creneaux;
  }

  getGuides(): Observable<Guide[]> {
    return this.guidesSubject.asObservable();
  }

  getAllGuides(): Guide[] {
    return this.guidesSubject.value;
  }

  getGuideById(id: number): Guide | undefined {
    return this.guidesSubject.value.find(g => g.id === id);
  }

  getGuideByEmail(email: string): Guide | undefined {
    return this.guidesSubject.value.find(g => g.email.toLowerCase() === email.toLowerCase());
  }

  getGuidesForCircuit(circuitId: number): Guide[] {
    return this.guidesSubject.value.filter(g => g.circuitsAssignes.includes(circuitId));
  }

  /**
   * Retourne la liste des guides qui gèrent le circuit ou le patrimoine sélectionné par le touriste.
   */
  getGuidesPourElement(typeElement: string, titreElement: string): Guide[] {
    const titre = (titreElement || '').toLowerCase().trim();
    if (!titre) return this.guidesSubject.value;

    const matched = this.guidesSubject.value.filter(g => {
      if (typeElement === 'CIRCUIT') {
        return g.circuitsNoms?.some(c => c.toLowerCase().includes(titre) || titre.includes(c.toLowerCase()));
      } else if (typeElement === 'PATRIMOINE') {
        return g.patrimoinesNoms?.some(p => p.toLowerCase().includes(titre) || titre.includes(p.toLowerCase()));
      }
      return true;
    });

    return matched.length > 0 ? matched : this.guidesSubject.value;
  }

  /**
   * Retourne la liste officielle des circuits disponibles pour affectation
   */
  getCatalogueCircuits(): string[] {
    return [
      'Boucle Historique & Fluviale de Ziguinchor',
      'Immersion Insulaire : Pirogue vers l\'Île de Carabane',
      'Patrimoine Architectural Diola : Cases à Étages de Mlomp'
    ];
  }

  /**
   * Retourne la liste officielle des sites du patrimoine pour affectation
   */
  getCatalogueSites(): string[] {
    return [
      'Alliance Franco-Sénégalaise',
      'Port de Boudody',
      'Cathédrale Saint-Antoine de Padoue',
      'Île de Carabane',
      'Cases à Étages de Mlomp',
      'Marché Saint-Maur des Fossés',
      'Gouvernance de Ziguinchor',
      'Forêt Sacrée de Bayottes'
    ];
  }

  /**
   * Permet au Conservateur d'assigner un circuit à un guide
   */
  assignerCircuitAuGuide(guideId: number, circuitNom: string): void {
    const list = this.guidesSubject.value;
    const guide = list.find(g => g.id === guideId);
    if (guide && circuitNom) {
      if (!guide.circuitsNoms) guide.circuitsNoms = [];
      if (!guide.circuitsNoms.includes(circuitNom)) {
        guide.circuitsNoms.push(circuitNom);
        this.guides = list;
        this.guidesSubject.next([...list]);
      }
    }
  }

  /**
   * Permet au Conservateur de retirer un circuit à un guide
   */
  retirerCircuitDuGuide(guideId: number, circuitNom: string): void {
    const list = this.guidesSubject.value;
    const guide = list.find(g => g.id === guideId);
    if (guide && guide.circuitsNoms) {
      guide.circuitsNoms = guide.circuitsNoms.filter(c => c !== circuitNom);
      this.guides = list;
      this.guidesSubject.next([...list]);
    }
  }

  /**
   * Permet au Conservateur d'assigner un site à un guide
   */
  assignerSiteAuGuide(guideId: number, siteNom: string): void {
    const list = this.guidesSubject.value;
    const guide = list.find(g => g.id === guideId);
    if (guide && siteNom) {
      if (!guide.patrimoinesNoms) guide.patrimoinesNoms = [];
      if (!guide.patrimoinesNoms.includes(siteNom)) {
        guide.patrimoinesNoms.push(siteNom);
        this.guides = list;
        this.guidesSubject.next([...list]);
      }
    }
  }

  /**
   * Permet au Conservateur de retirer un site à un guide
   */
  retirerSiteDuGuide(guideId: number, siteNom: string): void {
    const list = this.guidesSubject.value;
    const guide = list.find(g => g.id === guideId);
    if (guide && guide.patrimoinesNoms) {
      guide.patrimoinesNoms = guide.patrimoinesNoms.filter(s => s !== siteNom);
      this.guides = list;
      this.guidesSubject.next([...list]);
    }
  }

  /**
   * Permet au Conservateur de suspendre ou réactiver l'accréditation d'un guide
   */
  toggleGuideSuspension(guideId: number): Guide | null {
    const list = this.guidesSubject.value;
    const guide = list.find(g => g.id === guideId);
    if (guide) {
      guide.statut = guide.statut === 'SUSPENDU' ? 'ACTIF' : 'SUSPENDU';
      this.guides = list;
      this.guidesSubject.next([...list]);
      return guide;
    }
    return null;
  }

  // Plannings
  getPlannings(): Observable<GuidePlanning[]> {
    return this.planningsSubject.asObservable();
  }

  checkDisponibilite(guideId: number, dateStr: string, horaireId: string): { disponible: boolean; motif?: string; planning?: GuidePlanning } {
    const plannings = this.planningsSubject.value;
    const existant = plannings.find(p => p.guideId === guideId && p.date === dateStr && p.horaireId === horaireId && p.statut === 'OCCUPE');

    if (existant) {
      return {
        disponible: false,
        motif: `Occupé sur "${existant.circuitNom}" (${existant.clientNom || 'Visite en cours'})`,
        planning: existant
      };
    }

    return {
      disponible: true,
      motif: 'Guide disponible sur ce créneau horaire'
    };
  }

  reserverCreneau(guideId: number, circuitId: number, circuitNom: string, dateStr: string, horaireId: string, clientNom: string): void {
    const creneau = this.creneaux.find(c => c.id === horaireId) || this.creneaux[0];
    const newPlanning: GuidePlanning = {
      id: Date.now(),
      guideId: guideId,
      date: dateStr,
      horaireId: horaireId,
      horaireLibelle: creneau.libelle,
      statut: 'OCCUPE',
      circuitId: circuitId,
      circuitNom: circuitNom,
      clientNom: clientNom
    };
    this.planningsSubject.next([...this.planningsSubject.value, newPlanning]);
  }

  // Gestion des Visites Guidées
  getVisites(): Observable<VisiteGuidee[]> {
    return this.visitesSubject.asObservable();
  }

  getVisitesForGuide(guideId: number): VisiteGuidee[] {
    return this.visitesSubject.value.filter(v => v.guideId === guideId);
  }

  demarrerVisite(visiteId: number): boolean {
    const list = this.visitesSubject.value;
    const target = list.find(v => v.id === visiteId);
    if (target) {
      target.statut = 'EN_COURS';
      this.visitesSubject.next([...list]);
      return true;
    }
    return false;
  }

  terminerVisite(visiteId: number): boolean {
    const list = this.visitesSubject.value;
    const target = list.find(v => v.id === visiteId);
    if (target) {
      target.statut = 'TERMINEE';
      this.visitesSubject.next([...list]);
      return true;
    }
    return false;
  }

  planifierVisite(data: {
    titre: string;
    type: 'CIRCUIT' | 'PATRIMOINE';
    elementId: number;
    guideId: number;
    dateHeure: string;
    horaireId: string;
    placesMax: number;
    tarifParPersonne: number;
  }): VisiteGuidee {
    const guide = this.getGuideById(data.guideId) || this.guides[0];
    const creneau = this.creneaux.find(c => c.id === data.horaireId) || this.creneaux[0];

    const newVisite: VisiteGuidee = {
      id: Date.now(),
      titre: data.titre,
      type: data.type,
      elementId: data.elementId,
      guideId: guide.id,
      guideNom: guide.nomComplet,
      dateHeure: data.dateHeure,
      horaireId: creneau.id,
      horaireLibelle: creneau.libelle,
      placesMax: data.placesMax || 15,
      placesOccupees: 0,
      tarifParPersonne: data.tarifParPersonne || 5000,
      statut: 'PROGRAMMEE',
      participants: []
    };

    const currentVisites = this.visitesSubject.value;
    this.visitesSubject.next([newVisite, ...currentVisites]);

    // Marque le créneau comme occupé
    const datePart = data.dateHeure.split(' ')[0] || new Date().toISOString().split('T')[0];
    const newPlanning: GuidePlanning = {
      id: Date.now(),
      guideId: guide.id,
      date: datePart,
      horaireId: creneau.id,
      horaireLibelle: creneau.libelle,
      statut: 'OCCUPE',
      circuitId: data.elementId,
      circuitNom: data.titre,
      clientNom: 'Visite Programmée par le Conservateur'
    };
    this.planningsSubject.next([...this.planningsSubject.value, newPlanning]);

    return newVisite;
  }

  // Gestion des Avis et Litiges
  getAvis(): Observable<AvisVisite[]> {
    return this.avisSubject.asObservable();
  }

  getAvisForGuide(guideId: number): AvisVisite[] {
    return this.avisSubject.value.filter(a => a.guideId === guideId && !a.estLitige);
  }

  ajouterAvis(nouveau: Partial<AvisVisite>): AvisVisite {
    const avisComplet: AvisVisite = {
      id: Date.now(),
      visiteId: nouveau.visiteId || 1,
      visiteTitre: nouveau.visiteTitre || 'Visite Guidée',
      reservationId: nouveau.reservationId,
      touristeNom: nouveau.touristeNom || 'Voyageur',
      touristeEmail: nouveau.touristeEmail || '',
      guideId: nouveau.guideId || 2,
      guideNom: nouveau.guideNom || 'Mamadou DIATTA',
      note: nouveau.note || 5,
      commentaire: nouveau.commentaire || '',
      date: new Date().toLocaleDateString('fr-FR'),
      estLitige: !!nouveau.estLitige,
      motifLitige: nouveau.motifLitige,
      modere: false
    };

    const current = this.avisSubject.value;
    this.avisSubject.next([avisComplet, ...current]);
    return avisComplet;
  }

  resoudreLitige(avisId: number, decision: string): boolean {
    const list = this.avisSubject.value;
    const target = list.find(a => a.id === avisId);
    if (target) {
      target.modere = true;
      target.decisionModeration = decision;
      this.avisSubject.next([...list]);
      return true;
    }
    return false;
  }

  // Candidatures des Guides
  getCandidatures(): Observable<CandidatureGuide[]> {
    return this.candidaturesSubject.asObservable();
  }

  validerCandidature(candidatureId: number): boolean {
    const list = this.candidaturesSubject.value;
    const target = list.find(c => c.id === candidatureId);
    if (target) {
      target.statut = 'VALIDE';
      this.candidaturesSubject.next([...list]);

      // Ajoute le guide au référentiel des guides actifs
      const nouveauGuide: Guide = {
        id: target.id,
        nom: target.nomComplet.split(' ')[0] || target.nomComplet,
        prenom: target.nomComplet.split(' ')[1] || '',
        nomComplet: target.nomComplet,
        specialite: target.specialite,
        langues: target.langues,
        telephone: target.telephone,
        email: target.email,
        note: 5.0,
        nbAvis: 0,
        anneesExperience: target.anneesExperience,
        statut: 'ACTIF',
        photo: '/assets/images/casamance/alliance_francaise.jpg',
        biographie: target.biographie,
        circuitsAssignes: [1],
        circuitsNoms: target.circuitsMaitrises,
        patrimoinesNoms: target.sitesMaitrises
      };
      this.guides.push(nouveauGuide);
      this.guidesSubject.next([...this.guides]);
      return true;
    }
    return false;
  }

  rejeterCandidature(candidatureId: number): boolean {
    const list = this.candidaturesSubject.value;
    const target = list.find(c => c.id === candidatureId);
    if (target) {
      target.statut = 'REJETE';
      this.candidaturesSubject.next([...list]);
      return true;
    }
    return false;
  }
}
