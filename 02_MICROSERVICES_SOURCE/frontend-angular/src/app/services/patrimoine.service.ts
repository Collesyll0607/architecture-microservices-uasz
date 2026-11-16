import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patrimoine } from '../models/patrimoine.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatrimoineService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiPatrimoine;

  getAll(): Observable<Patrimoine[]> {
    return this.http.get<Patrimoine[]>(this.apiUrl);
  }

  getById(id: number): Observable<Patrimoine> {
    return this.http.get<Patrimoine>(`${this.apiUrl}/${id}`);
  }

  create(patrimoine: Patrimoine): Observable<Patrimoine> {
    return this.http.post<Patrimoine>(this.apiUrl, patrimoine);
  }
}
