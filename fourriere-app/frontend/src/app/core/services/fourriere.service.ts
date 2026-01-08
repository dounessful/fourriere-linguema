import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fourriere, FourriereRequest } from '../models/fourriere.model';

@Injectable({
  providedIn: 'root'
})
export class FourriereService {
  private apiUrl = `${environment.apiUrl}/admin/fourrieres`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Fourriere[]> {
    return this.http.get<Fourriere[]>(this.apiUrl);
  }

  getAllActive(): Observable<Fourriere[]> {
    return this.http.get<Fourriere[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<Fourriere> {
    return this.http.get<Fourriere>(`${this.apiUrl}/${id}`);
  }

  create(fourriere: FourriereRequest): Observable<Fourriere> {
    return this.http.post<Fourriere>(this.apiUrl, fourriere);
  }

  update(id: number, fourriere: FourriereRequest): Observable<Fourriere> {
    return this.http.put<Fourriere>(`${this.apiUrl}/${id}`, fourriere);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<Fourriere> {
    return this.http.patch<Fourriere>(`${this.apiUrl}/${id}/toggle-active`, {});
  }
}
