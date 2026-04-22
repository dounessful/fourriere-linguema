import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicule, PageResponse } from '../models/vehicule.model';

@Injectable({ providedIn: 'root' })
export class AgentVehiculeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/agent/vehicules`;

  getAll(
    page = 0,
    size = 10,
    sortBy = 'dateEntree',
    sortDir: 'asc' | 'desc' = 'desc',
    filters?: { immatriculation?: string; recupere?: boolean }
  ): Observable<PageResponse<Vehicule>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (filters?.immatriculation) params = params.set('immatriculation', filters.immatriculation);
    if (filters?.recupere !== undefined) params = params.set('recupere', String(filters.recupere));
    return this.http.get<PageResponse<Vehicule>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.apiUrl}/${id}`);
  }
}
