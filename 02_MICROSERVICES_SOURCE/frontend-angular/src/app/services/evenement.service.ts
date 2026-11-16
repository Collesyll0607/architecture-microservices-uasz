import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evenement } from '../models/evenement.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiEvenement;

  getAll(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(this.apiUrl);
  }

  getById(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.apiUrl}/${id}`);
  }
}
