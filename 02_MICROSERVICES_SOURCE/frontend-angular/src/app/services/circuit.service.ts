import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Circuit } from '../models/circuit.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CircuitService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiCircuit;

  getAll(): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(this.apiUrl);
  }

  getById(id: number): Observable<Circuit> {
    return this.http.get<Circuit>(`${this.apiUrl}/${id}`);
  }
}
