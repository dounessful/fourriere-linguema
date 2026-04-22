import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Commune, CommuneRequest } from '../models/commune.model';

@Injectable({ providedIn: 'root' })
export class CommuneService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/communes`;

  getAll(): Observable<Commune[]> {
    return this.http.get<Commune[]>(this.apiUrl);
  }

  getAllActive(): Observable<Commune[]> {
    return this.http.get<Commune[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<Commune> {
    return this.http.get<Commune>(`${this.apiUrl}/${id}`);
  }

  create(req: CommuneRequest): Observable<Commune> {
    return this.http.post<Commune>(this.apiUrl, req);
  }

  update(id: number, req: CommuneRequest): Observable<Commune> {
    return this.http.put<Commune>(`${this.apiUrl}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<Commune> {
    return this.http.patch<Commune>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
