import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transfert, TransfertRequest } from '../models/transfert.model';
import { PageResponse } from '../models/vehicule.model';

@Injectable({ providedIn: 'root' })
export class TransfertService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  transferer(vehiculeId: number, request: TransfertRequest): Observable<Transfert> {
    return this.http.post<Transfert>(`${this.apiUrl}/admin/vehicules/${vehiculeId}/transfert`, request);
  }

  getHistoriqueVehicule(vehiculeId: number): Observable<Transfert[]> {
    return this.http.get<Transfert[]>(`${this.apiUrl}/admin/vehicules/${vehiculeId}/transferts`);
  }

  getAll(page = 0, size = 10, filters?: { fourriereId?: number; dateDebut?: string; dateFin?: string }): Observable<PageResponse<Transfert>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filters?.fourriereId != null) params = params.set('fourriereId', filters.fourriereId);
    if (filters?.dateDebut) params = params.set('dateDebut', filters.dateDebut);
    if (filters?.dateFin) params = params.set('dateFin', filters.dateFin);
    return this.http.get<PageResponse<Transfert>>(`${this.apiUrl}/admin/transferts`, { params });
  }

  getById(id: number): Observable<Transfert> {
    return this.http.get<Transfert>(`${this.apiUrl}/admin/transferts/${id}`);
  }
}
