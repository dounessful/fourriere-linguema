import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { Vehicule } from '../../../core/models/vehicule.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CarteLeafletComponent } from '../../../shared/components/carte-leaflet/carte-leaflet.component';
import { DateFrPipe } from '../../../shared/pipes/date-fr.pipe';

@Component({
  selector: 'app-resultat',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    LoadingSpinnerComponent,
    CarteLeafletComponent,
    DateFrPipe
  ],
  template: `
    <div class="result-page">
      @if (loading) {
        <div class="loading-container">
          <app-loading-spinner></app-loading-spinner>
        </div>
      } @else if (vehicule) {
        <!-- Hero Banner -->
        <div class="result-hero">
          <div class="hero-bg"></div>
          <div class="container">
            <a routerLink="/" class="back-link">
              <mat-icon>arrow_back</mat-icon>
              <span>Retour à la recherche</span>
            </a>

            <div class="hero-content">
              <div class="vehicle-badge">
                @if (vehicule.recupere) {
                  <span class="badge badge-success">
                    <mat-icon>check_circle</mat-icon>
                    Récupéré
                  </span>
                } @else {
                  <span class="badge badge-warning">
                    <mat-icon>local_parking</mat-icon>
                    En fourrière
                  </span>
                }
              </div>

              <h1 class="vehicle-title">{{ vehicule.marque }} {{ vehicule.modele }}</h1>

              <div class="plate-display">
                <div class="plate">
                  <span class="plate-number">{{ vehicule.immatriculation }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="hero-wave">
            <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
              <path d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-background)"/>
            </svg>
          </div>
        </div>

        <!-- Main Content -->
        <div class="container">
          <div class="result-grid">
            <div class="main-column">
              <!-- Vehicle Details Card -->
              <mat-card class="detail-card">
                <div class="card-header">
                  <div class="header-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z"/>
                    </svg>
                  </div>
                  <h2>Informations du véhicule</h2>
                </div>
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Couleur</span>
                      <span class="info-value">{{ vehicule.couleur }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Date d'entrée</span>
                      <span class="info-value">{{ vehicule.dateEntree | dateFr:'long' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Motif d'enlèvement</span>
                      <span class="info-value">{{ vehicule.motifEnlevementLibelle }}</span>
                    </div>
                    <div class="info-item highlight">
                      <span class="info-label">Jours en fourrière</span>
                      <span class="info-value days">{{ vehicule.joursEnFourriere }} <small>jour(s)</small></span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Cost Card -->
              @if (vehicule.tarifJournalier && vehicule.coutEstime) {
                <mat-card class="detail-card cost-card">
                  <div class="card-header">
                    <div class="header-icon accent">
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                      </svg>
                    </div>
                    <h2>Estimation des frais</h2>
                  </div>
                  <mat-card-content>
                    <div class="cost-breakdown">
                      <div class="cost-row">
                        <span>Tarif journalier</span>
                        <span class="cost-value">{{ vehicule.tarifJournalier | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
                      </div>
                      <div class="cost-row">
                        <span>Nombre de jours</span>
                        <span class="cost-value">{{ vehicule.joursEnFourriere }}</span>
                      </div>
                      <mat-divider></mat-divider>
                      <div class="cost-row total">
                        <span>Coût total estimé</span>
                        <span class="cost-value total-amount">{{ vehicule.coutEstime | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
                      </div>
                    </div>
                    <p class="cost-note">
                      <mat-icon>info</mat-icon>
                      Ce montant est une estimation. Le coût final peut varier selon les frais administratifs.
                    </p>
                  </mat-card-content>
                </mat-card>
              }

              <!-- Photos Card -->
              @if (vehicule.photos && vehicule.photos.length > 0) {
                <mat-card class="detail-card">
                  <div class="card-header">
                    <div class="header-icon">
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                    <h2>Photos du véhicule</h2>
                  </div>
                  <mat-card-content>
                    <div class="photos-grid">
                      @for (photo of vehicule.photos; track photo) {
                        <div class="photo-item" (click)="openPhoto(photo)">
                          <img [src]="photo" alt="Photo du véhicule" />
                          <div class="photo-overlay">
                            <mat-icon>zoom_in</mat-icon>
                          </div>
                        </div>
                      }
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>

            <div class="side-column">
              <!-- Fourriere Location Card -->
              <mat-card class="detail-card location-card">
                <div class="card-header">
                  <div class="header-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <h2>Lieu de la fourrière</h2>
                </div>
                <mat-card-content>
                  <h3 class="fourriere-name">{{ vehicule.nomFourriere }}</h3>

                  <div class="location-info">
                    <div class="info-row">
                      <mat-icon>place</mat-icon>
                      <span>{{ vehicule.adresseFourriere }}</span>
                    </div>
                    @if (vehicule.telephone) {
                      <div class="info-row">
                        <mat-icon>phone</mat-icon>
                        <a [href]="'tel:' + vehicule.telephone">{{ vehicule.telephone }}</a>
                      </div>
                    }
                  </div>

                  @if (vehicule.latitude && vehicule.longitude) {
                    <div class="map-container">
                      <app-carte-leaflet
                        [latitude]="vehicule.latitude"
                        [longitude]="vehicule.longitude"
                        [adresse]="vehicule.nomFourriere"
                      ></app-carte-leaflet>
                    </div>
                  }

                  <a
                    mat-raised-button
                    color="primary"
                    class="directions-btn"
                    [href]="'https://www.google.com/maps/dir/?api=1&destination=' + vehicule.latitude + ',' + vehicule.longitude"
                    target="_blank"
                  >
                    <mat-icon>directions</mat-icon>
                    Obtenir l'itinéraire
                  </a>
                </mat-card-content>
              </mat-card>

              <!-- Ad Banner -->
              <div class="ad-banner side-ad">
                Espace publicitaire
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Not Found -->
        <div class="container">
          <div class="not-found">
            <div class="not-found-icon">
              <svg viewBox="0 0 24 24" width="80" height="80">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2>Véhicule non trouvé</h2>
            <p>Aucun véhicule ne correspond à cette recherche.</p>
            <a mat-raised-button color="primary" routerLink="/">
              <mat-icon>arrow_back</mat-icon>
              Retour à la recherche
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .result-page {
      min-height: calc(100vh - 72px - 200px);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    // Hero Section
    .result-hero {
      position: relative;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
      padding: var(--space-6) 0 var(--space-12);
      color: white;
      overflow: hidden;
    }

    .hero-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      font-size: 0.9rem;
      margin-bottom: var(--space-6);
      transition: color var(--transition-fast);

      &:hover {
        color: white;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .hero-content {
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .vehicle-badge {
      margin-bottom: var(--space-4);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      font-size: 0.9rem;
      font-weight: 600;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      &.badge-success {
        background: rgba(46, 125, 50, 0.9);
        color: white;
      }

      &.badge-warning {
        background: var(--color-accent);
        color: var(--color-primary-dark);
      }
    }

    .vehicle-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: var(--space-5);

      @media (max-width: 768px) {
        font-size: 1.75rem;
      }
    }

    .plate-display {
      display: flex;
      justify-content: center;
    }

    .plate {
      background: white;
      border: 3px solid var(--color-primary-dark);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-6);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .plate-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary-dark);
      letter-spacing: 0.1em;
      font-family: 'Courier New', monospace;
    }

    .hero-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50px;

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    // Main Content Grid
    .result-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: var(--space-6);
      padding: var(--space-8) 0;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .main-column {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .side-column {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);

      @media (max-width: 1024px) {
        order: -1;
      }
    }

    // Cards
    .detail-card {
      border-radius: var(--radius-lg) !important;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-5) var(--space-5) 0;
      margin-bottom: var(--space-4);

      h2 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
      }
    }

    .header-icon {
      width: 40px;
      height: 40px;
      background: var(--color-primary-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);

      &.accent {
        background: #fff8e1;
        color: var(--color-accent-dark);
      }
    }

    // Info Grid
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-4);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .info-item {
      padding: var(--space-4);
      background: var(--color-background);
      border-radius: var(--radius-md);

      &.highlight {
        background: var(--color-primary-50);
      }
    }

    .info-label {
      display: block;
      font-size: 0.8rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-1);
    }

    .info-value {
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-text-primary);

      &.days {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-primary);

        small {
          font-size: 0.9rem;
          font-weight: 500;
        }
      }
    }

    // Cost Card
    .cost-breakdown {
      background: var(--color-background);
      border-radius: var(--radius-md);
      padding: var(--space-4);
    }

    .cost-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) 0;
      font-size: 0.95rem;
      color: var(--color-text-secondary);

      &.total {
        padding-top: var(--space-4);
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .cost-value {
      font-weight: 600;
      color: var(--color-text-primary);

      &.total-amount {
        font-size: 1.5rem;
        color: var(--color-primary);
      }
    }

    .cost-note {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      margin-top: var(--space-4);
      padding: var(--space-3);
      background: #fff8e1;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      color: var(--color-text-secondary);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--color-accent-dark);
        flex-shrink: 0;
      }
    }

    // Photos Grid
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-3);
    }

    .photo-item {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 4/3;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-base);
      }

      &:hover {
        img {
          transform: scale(1.05);
        }

        .photo-overlay {
          opacity: 1;
        }
      }
    }

    .photo-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transition-fast);

      mat-icon {
        color: white;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    // Location Card
    .fourriere-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: var(--space-4);
    }

    .location-info {
      margin-bottom: var(--space-4);
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-2) 0;
      color: var(--color-text-secondary);
      font-size: 0.95rem;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--color-primary);
        flex-shrink: 0;
        margin-top: 2px;
      }

      a {
        color: var(--color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .map-container {
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--space-4);
    }

    .directions-btn {
      width: 100%;
      height: 48px;
      font-weight: 600;

      mat-icon {
        margin-right: var(--space-2);
      }
    }

    // Side Ad
    .side-ad {
      position: sticky;
      top: 90px;
    }

    // Not Found
    .not-found {
      text-align: center;
      padding: var(--space-16) var(--space-4);
    }

    .not-found-icon {
      color: var(--color-warn);
      margin-bottom: var(--space-6);
    }

    .not-found h2 {
      font-size: 1.75rem;
      color: var(--color-text-primary);
      margin-bottom: var(--space-3);
    }

    .not-found p {
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }
  `]
})
export class ResultatComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehiculeService = inject(VehiculeService);

  vehicule: Vehicule | null = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehicule(+id);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadVehicule(id: number): void {
    this.vehiculeService.getById(id).subscribe({
      next: (vehicule) => {
        this.vehicule = vehicule;
        this.loading = false;
      },
      error: () => {
        this.vehicule = null;
        this.loading = false;
      }
    });
  }

  openPhoto(url: string): void {
    window.open(url, '_blank');
  }
}
