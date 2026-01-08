import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vehicule, VehiculeRequest, PageResponse, Stats } from '../models/vehicule.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  recherche(immatriculation: string): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.apiUrl}/vehicules/recherche`, {
      params: { immatriculation }
    });
  }

  getById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.apiUrl}/vehicules/${id}`);
  }

  getAll(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'dateEntree',
    sortDir: string = 'desc',
    filters?: {
      immatriculation?: string;
      recupere?: boolean;
      dateDebut?: string;
      dateFin?: string;
    }
  ): Observable<PageResponse<Vehicule>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    if (filters?.immatriculation) {
      params = params.set('immatriculation', filters.immatriculation);
    }
    if (filters?.recupere !== undefined) {
      params = params.set('recupere', filters.recupere.toString());
    }
    if (filters?.dateDebut) {
      params = params.set('dateDebut', filters.dateDebut);
    }
    if (filters?.dateFin) {
      params = params.set('dateFin', filters.dateFin);
    }

    return this.http.get<PageResponse<Vehicule>>(`${this.apiUrl}/admin/vehicules`, { params });
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/admin/vehicules/stats`);
  }

  create(vehicule: VehiculeRequest): Observable<Vehicule> {
    return this.http.post<Vehicule>(`${this.apiUrl}/admin/vehicules`, vehicule);
  }

  update(id: number, vehicule: VehiculeRequest): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.apiUrl}/admin/vehicules/${id}`, vehicule);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/vehicules/${id}`);
  }

  marquerSortie(id: number): Observable<Vehicule> {
    return this.http.patch<Vehicule>(`${this.apiUrl}/admin/vehicules/${id}/sortie`, {});
  }

  uploadPhoto(id: number, file: File): Observable<Vehicule> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Vehicule>(`${this.apiUrl}/admin/vehicules/${id}/photos`, formData);
  }

  deletePhoto(id: number, index: number): Observable<Vehicule> {
    return this.http.delete<Vehicule>(`${this.apiUrl}/admin/vehicules/${id}/photos/${index}`);
  }
}
