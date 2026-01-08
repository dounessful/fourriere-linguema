import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehiculeService } from '../../../core/services/vehicule.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <main class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-background">
          <div class="hero-pattern"></div>
          <div class="hero-gradient"></div>
        </div>

        <div class="container hero-content">
          <div class="hero-text">
            <span class="hero-badge">Linguema Assistance</span>
            <h1>Retrouvez votre véhicule en fourrière</h1>
            <p class="hero-description">
              Rechercher votre véhicule en fourrière en utilisant la plaque d'immatriculation ou le N° de série.
            </p>
          </div>

          <div class="search-container">
            <mat-card class="search-card">
              <mat-card-content>
                <form (ngSubmit)="rechercher()" class="search-form">
                  <div class="search-input-wrapper">
                    <div class="input-icon">
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z"/>
                      </svg>
                    </div>
                    <mat-form-field appearance="outline" class="search-field">
                      <mat-label>Plaque d'immatriculation</mat-label>
                      <input
                        matInput
                        [(ngModel)]="immatriculation"
                        name="immatriculation"
                        placeholder="Ex: AA-123-BB ou AA123BB"
                        (input)="sanitizeInput()"
                        [disabled]="loading"
                        autocomplete="off"
                        class="search-input"
                      />
                    </mat-form-field>
                  </div>

                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    [disabled]="loading || !immatriculation"
                    class="search-button"
                  >
                    @if (loading) {
                      <mat-spinner diameter="22" color="accent"></mat-spinner>
                    } @else {
                      <mat-icon>search</mat-icon>
                      <span>Rechercher</span>
                    }
                  </button>
                </form>

                @if (error) {
                  <div class="error-alert">
                    <mat-icon>error_outline</mat-icon>
                    <span>{{ error }}</span>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,90 1440,60 L1440,120 L0,120 Z" fill="var(--color-background)"/>
          </svg>
        </div>
      </section>

      <!-- How it works Section -->
      <section class="how-it-works">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Simple et rapide</span>
            <h2>Comment ça marche ?</h2>
            <p>Trois étapes simples pour retrouver et récupérer votre véhicule</p>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number">1</div>
              <div class="step-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </div>
              <h3>Recherchez</h3>
              <p>Entrez la plaque d'immatriculation de votre véhicule dans le champ de recherche</p>
            </div>

            <div class="step-connector">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 L90,10 M85,5 L95,10 L85,15" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>

            <div class="step-card">
              <div class="step-number">2</div>
              <div class="step-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              <h3>Consultez</h3>
              <p>Retrouvez les informations sur votre véhicule, la fourrière et les frais estimés</p>
            </div>

            <div class="step-connector">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0,10 L90,10 M85,5 L95,10 L85,15" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>

            <div class="step-card">
              <div class="step-number">3</div>
              <div class="step-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z"/>
                </svg>
              </div>
              <h3>Récupérez</h3>
              <p>Rendez-vous à la fourrière avec les documents nécessaires pour récupérer votre véhicule</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Info Section -->
      <section class="info-section">
        <div class="container">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <h4>Disponible 24h/24</h4>
              <p>Accédez aux informations sur votre véhicule à tout moment</p>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              </div>
              <h4>Données sécurisées</h4>
              <p>Vos recherches sont confidentielles et sécurisées</p>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h4>Localisation précise</h4>
              <p>Trouvez facilement la fourrière sur la carte interactive</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Ad Banner -->
      <section class="container">
        <div class="ad-banner">
          Espace publicitaire
        </div>
      </section>
    </main>
  `,
  styles: [`
    .home-page {
      overflow-x: hidden;
    }

    // Hero Section
    .hero-section {
      position: relative;
      padding: var(--space-16) 0 var(--space-12);
      min-height: 520px;
      display: flex;
      align-items: center;

      @media (max-width: 768px) {
        padding: var(--space-10) 0 var(--space-8);
        min-height: auto;
      }
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 0;
    }

    .hero-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(212, 160, 23, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 105, 62, 0.15) 0%, transparent 50%);
    }

    .hero-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg,
        rgba(0, 105, 62, 0.03) 0%,
        rgba(232, 245, 233, 0.5) 50%,
        rgba(212, 160, 23, 0.05) 100%
      );
    }

    .hero-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .hero-text {
      max-width: 700px;
      margin-bottom: var(--space-8);
    }

    .hero-badge {
      display: inline-block;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
      color: white;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-4);
    }

    .hero-text h1 {
      font-size: 3rem;
      font-weight: 700;
      color: var(--color-primary-dark);
      margin-bottom: var(--space-4);
      line-height: 1.2;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .hero-description {
      font-size: 1.15rem;
      color: var(--color-text-secondary);
      line-height: 1.7;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }

    .search-container {
      width: 100%;
      max-width: 640px;
    }

    .search-card {
      background: white;
      border-radius: var(--radius-xl) !important;
      box-shadow: var(--shadow-xl) !important;
      border: none;
      overflow: visible;
    }

    .search-form {
      display: flex;
      gap: var(--space-4);
      align-items: center;

      @media (max-width: 600px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .search-input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .input-icon {
      width: 56px;
      height: 56px;
      background: var(--color-primary-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
      flex-shrink: 0;

      @media (max-width: 600px) {
        display: none;
      }
    }

    .search-field {
      flex: 1;

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    }

    .search-button {
      height: 56px;
      min-width: 160px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);

      @media (max-width: 600px) {
        width: 100%;
      }

      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-4);
      padding: var(--space-3) var(--space-4);
      background: #fff3e0;
      border-radius: var(--radius-md);
      color: var(--color-warn);
      font-size: 0.9rem;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .hero-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      overflow: hidden;

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    // How it works Section
    .how-it-works {
      padding: var(--space-16) 0;
      background: var(--color-background);

      @media (max-width: 768px) {
        padding: var(--space-10) 0;
      }
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--space-12);

      @media (max-width: 768px) {
        margin-bottom: var(--space-8);
      }
    }

    .section-tag {
      display: inline-block;
      color: var(--color-primary);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: var(--space-3);
    }

    .section-header h2 {
      font-size: 2.25rem;
      color: var(--color-text-primary);
      margin-bottom: var(--space-3);

      @media (max-width: 768px) {
        font-size: 1.75rem;
      }
    }

    .section-header p {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
    }

    .steps-grid {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 0;

      @media (max-width: 900px) {
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
      }
    }

    .step-card {
      flex: 1;
      max-width: 280px;
      text-align: center;
      padding: var(--space-6);
      position: relative;
    }

    .step-number {
      position: absolute;
      top: var(--space-4);
      right: var(--space-4);
      width: 28px;
      height: 28px;
      background: var(--color-accent);
      color: var(--color-primary-dark);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .step-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto var(--space-5);
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 24px rgba(0, 105, 62, 0.25);
    }

    .step-card h3 {
      font-size: 1.25rem;
      color: var(--color-primary-dark);
      margin-bottom: var(--space-3);
    }

    .step-card p {
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .step-connector {
      width: 60px;
      height: 20px;
      color: var(--color-primary-light);
      margin-top: 50px;
      flex-shrink: 0;

      @media (max-width: 900px) {
        display: none;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    // Info Section
    .info-section {
      padding: var(--space-12) 0;
      background: linear-gradient(135deg, var(--color-primary-50) 0%, #f0f7f4 100%);

      @media (max-width: 768px) {
        padding: var(--space-8) 0;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-6);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
    }

    .info-card {
      background: white;
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      text-align: center;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
    }

    .info-icon {
      width: 56px;
      height: 56px;
      margin: 0 auto var(--space-4);
      background: var(--color-primary-50);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
    }

    .info-card h4 {
      font-size: 1.1rem;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .info-card p {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    // Ad Banner in container
    .container .ad-banner {
      margin: var(--space-8) 0 var(--space-12);
    }
  `]
})
export class HomeComponent {
  private vehiculeService = inject(VehiculeService);
  private router = inject(Router);

  immatriculation = '';
  loading = false;
  error = '';

  sanitizeInput(): void {
    this.immatriculation = this.immatriculation.replace(/[^A-Za-z0-9-]/g, '');
  }

  private cleanPlateForSearch(plate: string): string {
    return plate.replace(/-/g, '').toUpperCase();
  }

  rechercher(): void {
    if (!this.immatriculation) return;

    this.loading = true;
    this.error = '';

    const cleanedPlate = this.cleanPlateForSearch(this.immatriculation);
    this.vehiculeService.recherche(cleanedPlate).subscribe({
      next: (vehicule) => {
        this.loading = false;
        this.router.navigate(['/resultat', vehicule.id]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.error = 'Aucun véhicule trouvé avec cette plaque d\'immatriculation';
        } else if (err.status === 429) {
          this.error = 'Trop de recherches. Veuillez patienter avant de réessayer.';
        } else {
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}
