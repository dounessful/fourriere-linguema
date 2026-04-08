import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    LoadingSpinnerComponent,
    CarteLeafletComponent,
    DateFrPipe,
    CurrencyPipe
  ],
  template: `
    <main class="page">
      @if (loading) {
        <div class="loading"><app-loading-spinner></app-loading-spinner></div>
      } @else if (vehicule) {
        <div class="fold">
          <div class="container">
            <a routerLink="/" class="back">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Nouvelle recherche
            </a>

            <!-- ===== REWARD BADGE — englobe toutes les infos véhicule ===== -->
            <header class="badge">
              <div class="badge-strip">
                <div class="strip-left">
                  <span class="strip-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span class="strip-text">Véhicule localisé</span>
                </div>
                <div class="strip-tags">
                  @if (vehicule.recupere) {
                    <span class="tag tag-success">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Restitué
                    </span>
                  } @else {
                    <span class="tag tag-active">
                      <span class="ping"></span>
                      En fourrière
                    </span>
                  }
                  @if (vehicule.transfere) {
                    <span class="tag tag-info">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                      Transféré le {{ vehicule.derniereDateTransfert | dateFr }}
                    </span>
                  }
                </div>
              </div>

              <div class="badge-body">
                <div class="badge-plate">
                  <span class="plate-label">Plaque</span>
                  <span class="plate-value">{{ vehicule.immatriculation }}</span>
                </div>
                <div class="badge-vehicle">
                  <h1>{{ vehicule.marque }} {{ vehicule.modele }}</h1>
                  <div class="vehicle-sub">
                    <span class="sub-item">
                      <span class="sub-dot" [style.background]="colorDot(vehicule.couleur)"></span>
                      {{ vehicule.couleur }}
                    </span>
                    @if (vehicule.numeroSerie) {
                      <span class="sub-sep">·</span>
                      <span class="sub-item mono">VIN&nbsp;{{ vehicule.numeroSerie }}</span>
                    }
                  </div>
                </div>
              </div>
            </header>

            <!-- ===== CONTENT GRID ===== -->
            <section class="grid">
              <!-- LEFT : location (carte) -->
              <aside class="col-left">
                <article class="card location-card">
                  <div class="loc-head">
                    <span class="card-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </span>
                    <h2>{{ vehicule.nomFourriere }}</h2>
                  </div>

                  <div class="loc-meta">
                    @if (vehicule.adresseFourriere) {
                      <span class="meta-row">
                        <mat-icon>place</mat-icon>
                        <span>{{ vehicule.adresseFourriere }}<ng-container *ngIf="vehicule.villeFourriere">, {{ vehicule.villeFourriere }}</ng-container></span>
                      </span>
                    }
                    @if (vehicule.telephone) {
                      <span class="meta-row">
                        <mat-icon>call</mat-icon>
                        <a [href]="'tel:' + vehicule.telephone">{{ vehicule.telephone }}</a>
                      </span>
                    }
                  </div>

                  @if (vehicule.latitude && vehicule.longitude) {
                    <div class="map">
                      <app-carte-leaflet
                        [latitude]="vehicule.latitude"
                        [longitude]="vehicule.longitude"
                        [adresse]="vehicule.nomFourriere"
                      ></app-carte-leaflet>
                    </div>

                    <a class="cta" [href]="'https://www.google.com/maps/dir/?api=1&destination=' + vehicule.latitude + ',' + vehicule.longitude" target="_blank" rel="noopener">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      <span>Itinéraire GPS</span>
                    </a>
                  }
                </article>
              </aside>

              <!-- RIGHT : info + cost (fusionnés) -->
              <div class="col-right">
                <article class="card combo-card">
                  <!-- Part 1 : Informations -->
                  <div class="combo-part">
                    <div class="card-head">
                      <span class="card-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      </span>
                      <h2>Informations</h2>
                    </div>
                    <dl class="kv">
                      <div>
                        <dt>Date d'entrée</dt>
                        <dd>{{ vehicule.dateEntree | dateFr:'long' }}</dd>
                      </div>
                      <div>
                        <dt>Durée en fourrière</dt>
                        <dd>{{ vehicule.joursEnFourriere }} jour{{ vehicule.joursEnFourriere > 1 ? 's' : '' }}</dd>
                      </div>
                      <div>
                        <dt>Motif de l'enlèvement</dt>
                        <dd>{{ vehicule.motifEnlevementLibelle }}</dd>
                      </div>
                      @if (vehicule.recupere && vehicule.dateSortie) {
                        <div>
                          <dt>Date de restitution</dt>
                          <dd>{{ vehicule.dateSortie | dateFr:'long' }}</dd>
                        </div>
                      }
                    </dl>
                  </div>

                  @if (vehicule.tarifJournalier && vehicule.coutEstime != null) {
                    <!-- Separator -->
                    <div class="combo-sep"></div>

                    <!-- Part 2 : Frais -->
                    <div class="combo-part combo-cost">
                      <div class="card-head">
                        <span class="card-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </span>
                        <h2>Frais à régler</h2>
                      </div>
                      <div class="cost-amount">{{ vehicule.coutEstime | currency:'XOF':'symbol':'1.0-0':'fr' }}</div>
                      <div class="cost-detail">
                        <span class="mono">{{ vehicule.tarifJournalier | currency:'XOF':'symbol':'1.0-0':'fr' }}</span>
                        <span class="x">×</span>
                        <span class="mono">{{ vehicule.joursEnFourriere }} jr</span>
                        <span class="cost-hint">· estimation indicative</span>
                      </div>
                    </div>
                  }
                </article>
              </div>
            </section>
          </div>
        </div>
      } @else {
        <div class="empty container">
          <div class="empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <h2>Aucun véhicule trouvé</h2>
          <p>La plaque saisie ne correspond à aucun véhicule en fourrière.</p>
          <a routerLink="/" class="empty-cta">Refaire une recherche</a>
        </div>
      }
    </main>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; }
    .loading { display: flex; justify-content: center; padding: var(--s-20) 0; }

    /* ============ FOLD wrapper ============ */
    .fold {
      position: relative;
      padding: var(--s-5) 0 var(--s-6);
      background: var(--bg);

      @media (min-height: 760px) and (min-width: 900px) {
        min-height: calc(100vh - var(--header-h) - var(--s-8));
      }
    }

    .back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-2);
      margin-bottom: var(--s-4);
      padding: 5px 10px 5px 8px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      transition: all var(--t-fast);
      &:hover { color: var(--text); border-color: var(--border-strong); }
    }

    /* ============ REWARD BADGE — englobe tout ============ */
    .badge {
      position: relative;
      background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
      border: 1.5px solid var(--brand-soft-2);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: var(--s-5);
      box-shadow:
        0 16px 36px -16px rgba(127, 29, 29, 0.22),
        0 4px 10px -4px rgba(28, 25, 23, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--brand) 0%, #34d399 50%, var(--brand) 100%);
      }
    }

    @keyframes pop {
      0%   { transform: scale(0.96); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .badge-strip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-5);
      background: rgba(236, 253, 245, 0.7);
      border-bottom: 1px solid var(--brand-soft-2);
      flex-wrap: wrap;

      @media (max-width: 600px) { padding: var(--s-2) var(--s-4); }
    }

    .strip-left {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2);
    }

    .strip-check {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--brand);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px -1px rgba(185, 28, 28, 0.45);
    }

    .strip-text {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--brand-dark);
    }

    .strip-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    /* Body */
    .badge-body {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--s-6);
      align-items: center;
      padding: var(--s-5) var(--s-6);

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: var(--s-4);
        padding: var(--s-4);
        text-align: center;
        justify-items: center;
      }
    }

    .badge-plate {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: var(--s-3) var(--s-5);
      background: var(--surface);
      border: 1px solid var(--brand-soft-2);
      border-radius: 10px;
      box-shadow: 0 4px 12px -6px rgba(127, 29, 29, 0.18);
    }
    .plate-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--brand);
    }
    .plate-value {
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text);
      line-height: 1;

      @media (max-width: 600px) { font-size: 19px; }
    }

    .badge-vehicle {
      min-width: 0;

      h1 {
        font-size: clamp(22px, 2.8vw, 28px);
        letter-spacing: -0.018em;
        margin-bottom: 6px;
        line-height: 1.15;
        color: var(--text);
      }
    }

    .vehicle-sub {
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: var(--s-2);
      flex-wrap: wrap;

      @media (max-width: 600px) { justify-content: center; }
    }

    .sub-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .sub-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid rgba(28, 25, 23, 0.15);
    }

    .sub-sep { opacity: 0.4; }
    .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: var(--r-pill);
      font-size: 11px;
      font-weight: 600;
      border: 1px solid transparent;
      white-space: nowrap;
    }
    .tag-active {
      background: #fff;
      color: var(--brand-dark);
      border-color: var(--brand-soft-2);
      .ping {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--brand);
        box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.18);
        animation: pulse 2s ease-in-out infinite;
      }
    }
    .tag-success { background: #fff; color: var(--text-2); border-color: var(--border-strong); }
    .tag-info { background: #fff; color: #1d4ed8; border-color: #bfdbfe; }
    @keyframes pulse {
      0%,100% { box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.18); }
      50%     { box-shadow: 0 0 0 5px rgba(185, 28, 28, 0.08); }
    }

    /* ============ CONTENT GRID ============ */
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
      gap: var(--s-5);
      align-items: stretch;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: var(--s-4);
      }
    }

    .col-left, .col-right {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      min-width: 0;
    }

    /* Cards */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: var(--s-5);
      transition: border-color var(--t-fast);
    }
    .card-head {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin-bottom: var(--s-4);
    }
    .card-icon {
      width: 28px; height: 28px;
      border-radius: 8px;
      background: var(--brand-soft);
      color: var(--brand);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .card-head h2 {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin: 0;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* KV list */
    .kv {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-3) var(--s-4);
      margin: 0;
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .kv > div { display: flex; flex-direction: column; gap: 2px; }
    .kv dt {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .kv dd {
      margin: 0;
      font-size: 14px;
      color: var(--text);
      font-weight: 500;
      line-height: 1.4;
    }

    /* Combo card (Info + Cost) */
    .combo-card {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 0;
      overflow: hidden;
    }
    .combo-part {
      padding: var(--s-5);
    }
    .combo-sep {
      height: 1px;
      background: var(--border);
      margin: 0;
    }
    .combo-cost {
      background: linear-gradient(135deg, #ffffff 0%, #fef2f2 100%);
    }

    .cost-amount {
      font-size: clamp(30px, 4vw, 38px);
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--brand-dark);
      line-height: 1;
      margin-bottom: 6px;
    }
    .cost-detail {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      .x { opacity: 0.6; padding: 0 2px; }
      .cost-hint { color: var(--text-faint); }
    }

    /* Location card */
    .location-card {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .loc-head {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin-bottom: var(--s-3);
    }
    .loc-head h2 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
      line-height: 1.2;
      letter-spacing: -0.01em;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .loc-meta {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      margin-bottom: var(--s-3);
    }
    .meta-row {
      display: flex;
      align-items: flex-start;
      gap: var(--s-2);
      font-size: 13px;
      color: var(--text-2);
      line-height: 1.4;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--brand);
        margin-top: 1px;
        flex-shrink: 0;
      }
      a { color: var(--brand); font-weight: 500; }
    }

    .map {
      flex: 1;
      min-height: 220px;
      margin-bottom: var(--s-3);
      ::ng-deep .leaflet-container {
        height: 100%;
        min-height: 220px;
        border-radius: 8px;
      }
    }

    .cta {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2);
      width: 100%;
      justify-content: center;
      height: 38px;
      background: var(--brand);
      color: #fff;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 4px 12px -2px rgba(185, 28, 28, 0.35);
      transition: all var(--t-fast);

      &:hover {
        background: var(--brand-hover);
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 6px 16px -2px rgba(185, 28, 28, 0.45);
      }
    }

    /* Empty state */
    .empty {
      max-width: 480px;
      margin: var(--s-20) auto;
      text-align: center;
    }
    .empty-icon {
      width: 80px; height: 80px;
      margin: 0 auto var(--s-5);
      border-radius: 50%;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
    }
    .empty h2 { font-size: 22px; margin-bottom: var(--s-2); }
    .empty p { color: var(--text-muted); margin-bottom: var(--s-6); }
    .empty-cta {
      display: inline-block;
      padding: 12px 22px;
      background: var(--brand);
      color: #fff;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px -2px rgba(185, 28, 28, 0.35);
      &:hover { background: var(--brand-hover); color: #fff; }
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
    if (id) this.loadVehicule(+id);
    else this.router.navigate(['/']);
  }

  private loadVehicule(id: number): void {
    this.vehiculeService.getById(id).subscribe({
      next: (v) => { this.vehicule = v; this.loading = false; },
      error: () => { this.vehicule = null; this.loading = false; }
    });
  }

  colorDot(couleur: string): string {
    if (!couleur) return '#d6d3d1';
    const map: Record<string, string> = {
      blanc: '#f5f5f4', noir: '#1c1917', gris: '#a8a29e', argent: '#cbd5e1',
      rouge: '#dc2626', bleu: '#2563eb', vert: '#16a34a', jaune: '#fbbf24',
      orange: '#f97316', marron: '#78350f', bordeaux: '#7f1d1d', beige: '#e7d5a8',
      violet: '#7c3aed', rose: '#ec4899'
    };
    return map[couleur.trim().toLowerCase()] ?? '#d6d3d1';
  }
}
