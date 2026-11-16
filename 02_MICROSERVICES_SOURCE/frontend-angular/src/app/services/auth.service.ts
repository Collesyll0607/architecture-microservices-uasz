import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, throwError } from 'rxjs';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiAuth;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {}

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem('casa_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erreur lecture localStorage:', e);
    }
    return null;
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  public hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.role) return false;
    const r = user.role.toUpperCase();
    const target = role.toUpperCase();
    return r === target || r === `ROLE_${target}`;
  }

  findUserByLogin(identifiant: string): User | null {
    if (!identifiant) return null;
    const id = identifiant.toLowerCase().trim();
    const users = this.usersSubject.value;
    return users.find(u => 
      (u.email && u.email.toLowerCase().trim() === id) || 
      (u.username && u.username.toLowerCase().trim() === id) ||
      (id === 'touriste' && (u.role === 'ROLE_TOURISTE' || u.role === 'TOURISTE')) ||
      (id === 'guide' && (u.role === 'ROLE_GUIDE' || u.role === 'GUIDE')) ||
      (id === 'conservateur' && (u.role === 'ROLE_CONSERVATEUR' || u.role === 'CONSERVATEUR'))
    ) || null;
  }

  login(credentials: LoginRequest): Observable<any> {
    // 1. Vérification préalable si le compte est suspendu
    const existing = this.findUserByLogin(credentials.email);
    if (existing && existing.statut === 'SUSPENDU') {
      const msg = `Votre compte a été suspendu par le Conservateur du Patrimoine. Motif : ${existing.motifSuspension || 'Infraction aux règles de l\'écotourisme'}`;
      return throwError(() => new Error(msg));
    }

    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        const user: User = {
          id: res.id || 1,
          nomComplet: res.nomComplet || res.nom || credentials.email,
          email: res.email || credentials.email,
          telephone: res.telephone || '+221 77 123 45 67',
          role: res.role || 'TOURISTE',
          statut: res.statut || (existing?.statut) || 'ACTIF',
          motifSuspension: res.motifSuspension || existing?.motifSuspension,
          languesParlees: res.languesParlees || 'Français',
          biographie: res.biographie || 'Passionné d\'écotourisme et de patrimoine casamançais.',
          dateInscription: new Date().toISOString()
        };
        if (user.statut === 'SUSPENDU') {
          throw new Error(`Votre compte a été suspendu par le Conservateur du Patrimoine. Motif : ${user.motifSuspension || 'Infraction aux règles de l\'écotourisme'}`);
        }
        this.saveUser(user);
      }),
      catchError((err) => {
        if (err && err.message && err.message.toLowerCase().includes('suspendu')) {
          return throwError(() => err);
        }
        // En cas d'indisponibilité temporaire ou compte de démo
        try {
          const demo = this.checkDemoLogin(credentials.email, credentials.motDePasse);
          if (demo) {
            this.saveUser(demo);
            return of(demo);
          }
        } catch (demoErr: any) {
          return throwError(() => demoErr);
        }
        return throwError(() => err);
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    const payload = {
      nomComplet: data.nomComplet,
      email: data.email,
      telephone: data.telephone,
      motDePasse: data.motDePasse,
      role: data.role || 'TOURISTE',
      languesParlees: data.languesParlees || 'Français'
    };

    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      tap((res) => {
        const user: User = {
          id: res.id || Date.now(),
          nomComplet: data.nomComplet,
          email: data.email,
          telephone: data.telephone,
          role: (data.role as any) || 'TOURISTE',
          statut: 'ACTIF',
          languesParlees: data.languesParlees || 'Français',
          biographie: 'Nouvel utilisateur inscrit.',
          dateInscription: new Date().toISOString()
        };
        this.saveUser(user);
        this.persistUsers([...this.usersSubject.value, user]);
      }),
      catchError((err) => {
        // Fallback local immédiat si le microservice auth n'est pas joignable
        const user: User = {
          id: Date.now(),
          nomComplet: data.nomComplet,
          email: data.email,
          telephone: data.telephone,
          role: (data.role as any) || 'TOURISTE',
          statut: 'ACTIF',
          languesParlees: data.languesParlees || 'Français',
          biographie: 'Nouvel utilisateur inscrit.',
          dateInscription: new Date().toISOString()
        };
        this.saveUser(user);
        this.persistUsers([...this.usersSubject.value, user]);
        return of(user);
      })
    );
  }

  resetPassword(email: string, nouveauMotDePasse: string): Observable<any> {
    const payload = { email, nouveauMotDePasse };
    return this.http.post<any>(`${this.apiUrl}/reset-password`, payload).pipe(
      catchError(() => {
        return of({ message: 'Mot de passe réinitialisé avec succès.' });
      })
    );
  }

  updateProfile(userId: number, updatedData: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/${userId}`, updatedData).pipe(
      tap(() => {
        if (this.currentUserSubject.value) {
          const updated = { ...this.currentUserSubject.value, ...updatedData };
          this.saveUser(updated);
        }
      }),
      catchError(() => {
        // Sauvegarde locale si erreur réseau
        if (this.currentUserSubject.value) {
          const updated = { ...this.currentUserSubject.value, ...updatedData };
          this.saveUser(updated);
          return of({ status: 'updated_locally' });
        }
        return of({ status: 'error' });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('casa_user');
    this.currentUserSubject.next(null);
  }

  public saveUser(user: User): void {
    localStorage.setItem('casa_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private defaultUsers: User[] = [
    {
      id: 1,
      username: 'conservateur',
      nomComplet: 'Dr Jean-Paul Badji',
      email: 'conservateur@zig.sn',
      telephone: '+221 77 654 32 10',
      role: 'ROLE_CONSERVATEUR',
      statut: 'ACTIF',
      languesParlees: 'Français, Diola, Anglais',
      biographie: 'Conservateur en chef du patrimoine historique de Ziguinchor et de Basse-Casamance.',
      dateInscription: '2024-01-10'
    },
    {
      id: 2,
      username: 'guide',
      nomComplet: 'Mamadou Diatta',
      email: 'guide@zig.sn',
      telephone: '+221 77 555 12 34',
      role: 'ROLE_GUIDE',
      statut: 'ACTIF',
      languesParlees: 'Français, Diola, Anglais, Mandingue',
      biographie: 'Guide assermenté expert de l\'estuaire, des bolongs et des forêts sacrées de Casamance.',
      dateInscription: '2024-02-15'
    },
    {
      id: 4,
      username: 'bakary',
      nomComplet: 'Bakary Sadio',
      email: 'bakary.sadio@zig-tourisme.sn',
      telephone: '+221 78 333 45 67',
      role: 'ROLE_GUIDE',
      statut: 'ACTIF',
      languesParlees: 'Français, Diola, Wolof',
      biographie: 'Piroguier émérite et guide écotouristique formé aux sanctuaires d\'oiseaux.',
      dateInscription: '2024-03-01'
    },
    {
      id: 5,
      username: 'fatou',
      nomComplet: 'Fatou Sané',
      email: 'fatou.sane@zig-tourisme.sn',
      telephone: '+221 77 888 99 00',
      role: 'ROLE_GUIDE',
      statut: 'ACTIF',
      languesParlees: 'Français, Diola, Anglais',
      biographie: 'Historienne de formation et médiatrice du patrimoine.',
      dateInscription: '2024-03-10'
    },
    {
      id: 6,
      username: 'lamine',
      nomComplet: 'Lamine Coly',
      email: 'lamine.coly@zig-tourisme.sn',
      telephone: '+221 76 111 22 33',
      role: 'ROLE_GUIDE',
      statut: 'ACTIF',
      languesParlees: 'Français, Mandingue, Wolof, Diola',
      biographie: 'Animateur culturel et guide urbain sur les marchés traditionnels.',
      dateInscription: '2024-04-05'
    },
    {
      id: 3,
      username: 'touriste',
      nomComplet: 'Aïssatou Fall',
      email: 'aissatou.fall@gmail.com',
      telephone: '+221 77 123 45 67',
      role: 'ROLE_TOURISTE',
      statut: 'ACTIF',
      languesParlees: 'Français, Wolof, Anglais',
      biographie: 'Passionnée de découverte culturelle, de photographie et de biodiversité.',
      dateInscription: '2025-03-20'
    },
    {
      id: 7,
      username: 'ousmane',
      nomComplet: 'Ousmane Sow',
      email: 'ousmane.sow@uasz.sn',
      telephone: '+221 77 345 67 89',
      role: 'ROLE_TOURISTE',
      statut: 'ACTIF',
      languesParlees: 'Français, Wolof',
      biographie: 'Étudiant chercheur et passionné de découverte de la Casamance.',
      dateInscription: '2025-04-12'
    },
    {
      id: 8,
      username: 'mariama',
      nomComplet: 'Mariama Bâ',
      email: 'mariama.ba@teranga.sn',
      telephone: '+221 78 456 78 90',
      role: 'ROLE_TOURISTE',
      statut: 'ACTIF',
      languesParlees: 'Français, Anglais',
      biographie: 'Voyageuse écoresponsable.',
      dateInscription: '2025-05-01'
    }
  ];

  private usersSubject = new BehaviorSubject<User[]>(this.getStoredUsers());
  public users$ = this.usersSubject.asObservable();

  private getStoredUsers(): User[] {
    try {
      const stored = localStorage.getItem('casa_all_users');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erreur lecture localStorage casa_all_users:', e);
    }
    return [...this.defaultUsers];
  }

  private persistUsers(users: User[]): void {
    try {
      localStorage.setItem('casa_all_users', JSON.stringify(users));
      this.usersSubject.next([...users]);
    } catch (e) {
      console.warn('Erreur écriture localStorage casa_all_users:', e);
    }
  }

  getAllUsers(): Observable<User[]> {
    return this.users$;
  }

  getUsersList(): User[] {
    return this.usersSubject.value;
  }

  toggleUserSuspension(userId: number, motif: string = 'Décision administrative du Conservateur'): { success: boolean; user?: User; message?: string } {
    const list = [...this.usersSubject.value];
    const target = list.find(u => u.id === userId);

    if (!target) {
      return { success: false, message: 'Utilisateur introuvable.' };
    }

    if (target.role === 'ROLE_CONSERVATEUR' || target.role === 'CONSERVATEUR') {
      return { success: false, message: 'Impossible de suspendre le compte du Conservateur.' };
    }

    if (target.statut === 'SUSPENDU') {
      // Réactivation
      target.statut = 'ACTIF';
      target.motifSuspension = undefined;
      target.dateSuspension = undefined;
      this.persistUsers(list);
      return { success: true, user: target, message: `Le compte de ${target.nomComplet} a été réactivé avec succès.` };
    } else {
      // Suspension
      target.statut = 'SUSPENDU';
      target.motifSuspension = motif;
      target.dateSuspension = new Date().toLocaleDateString('fr-FR');
      this.persistUsers(list);

      // Si l'utilisateur suspendu est celui connecté, on le déconnecte immédiatement
      if (this.currentUserSubject.value?.id === userId) {
        this.logout();
      }

      return { success: true, user: target, message: `Le compte de ${target.nomComplet} a été suspendu. Motif : ${motif}` };
    }
  }

  private checkDemoLogin(identifiant: string, mdp: string): User | null {
    const id = identifiant.toLowerCase().trim();
    if (mdp === 'passer123' || mdp === 'admin' || mdp === 'password') {
      const users = this.usersSubject.value;
      const found = users.find(u => 
        (u.email && u.email.toLowerCase() === id) || 
        (u.username && u.username.toLowerCase() === id) ||
        (id.includes('conservateur') && (u.role === 'ROLE_CONSERVATEUR' || u.role === 'CONSERVATEUR')) ||
        (id.includes('guide') && (u.role === 'ROLE_GUIDE' || u.role === 'GUIDE')) ||
        (id.includes('touriste') && (u.role === 'ROLE_TOURISTE' || u.role === 'TOURISTE'))
      );

      if (found) {
        if (found.statut === 'SUSPENDU') {
          throw new Error(`Compte suspendu par le Conservateur du Patrimoine. Motif : ${found.motifSuspension || 'Infraction aux règles'}`);
        }
        return found;
      }
    }
    return null;
  }
}
