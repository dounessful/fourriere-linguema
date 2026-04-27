import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Utilisateur,
  UtilisateurRequest,
  UtilisateurCreatedResponse,
  TemporaryPasswordResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = `${environment.apiUrl}/admin/utilisateurs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(this.apiUrl);
  }

  getById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`);
  }

  create(utilisateur: UtilisateurRequest): Observable<UtilisateurCreatedResponse> {
    return this.http.post<UtilisateurCreatedResponse>(this.apiUrl, utilisateur);
  }

  update(id: number, utilisateur: UtilisateurRequest): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${this.apiUrl}/${id}`, utilisateur);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resetPassword(id: number): Observable<TemporaryPasswordResponse> {
    return this.http.post<TemporaryPasswordResponse>(`${this.apiUrl}/${id}/reset-password`, {});
  }
}
