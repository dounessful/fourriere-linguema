import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipe, EquipeRequest } from '../models/equipe.model';

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private apiUrl = `${environment.apiUrl}/admin/equipes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(this.apiUrl);
  }

  getAllActive(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.apiUrl}/${id}`);
  }

  getByFourriere(fourriereId: number): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${this.apiUrl}/fourriere/${fourriereId}`);
  }

  create(equipe: EquipeRequest): Observable<Equipe> {
    return this.http.post<Equipe>(this.apiUrl, equipe);
  }

  update(id: number, equipe: EquipeRequest): Observable<Equipe> {
    return this.http.put<Equipe>(`${this.apiUrl}/${id}`, equipe);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<Equipe> {
    return this.http.patch<Equipe>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
