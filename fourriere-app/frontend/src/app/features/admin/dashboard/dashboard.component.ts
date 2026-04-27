import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { Vehicule, Stats } from '../../../core/models/vehicule.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DateFrPipe } from '../../../shared/pipes/date-fr.pipe';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { TransfertDialogComponent } from '../transferts/transfert-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDatepickerModule,
    LoadingSpinnerComponent,
    DateFrPipe
  ],
  template: `
    <div class="dashboard-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="container">
          <div class="header-content">
            <div class="header-text">
              <h1>Dashboard</h1>
              <p class="header-subtitle">Gérez les véhicules en fourrière</p>
            </div>
            <a mat-raised-button color="primary" routerLink="/admin/vehicule/nouveau" class="add-btn">
              <mat-icon>add</mat-icon>
              <span>Nouveau véhicule</span>
            </a>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Stats Cards -->
        @if (stats) {
          <div class="stats-grid">
            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon total">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.totalVehicules }}</span>
                  <span class="stat-label">Total véhicules</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon active">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path fill="currentColor" d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.vehiculesEnCours }}</span>
                  <span class="stat-label">En fourrière</span>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-icon recovered">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div class="stat-content">
                  <span class="stat-value">{{ stats.vehiculesRecuperesCeMois }}</span>
                  <span class="stat-label">Récupérés ce mois</span>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }

        <!-- Data Table Card -->
        <mat-card class="table-card">
          <div class="table-header">
            <h2>Liste des véhicules</h2>

            <div class="filters">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Plaque ou VIN</mat-label>
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  [(ngModel)]="searchImmat"
                  (keyup.enter)="applyFilter()"
                  placeholder="AA123BB ou SN1RFB00..."
                />
                @if (searchImmat) {
                  <button matSuffix mat-icon-button (click)="searchImmat = ''; applyFilter()">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="date-range-field">
                <mat-label>Période d'entrée</mat-label>
                <mat-date-range-input [rangePicker]="picker">
                  <input matStartDate [(ngModel)]="dateDebut" placeholder="Du" (dateChange)="onDateChange()" />
                  <input matEndDate [(ngModel)]="dateFin" placeholder="Au" (dateChange)="onDateChange()" />
                </mat-date-range-input>
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-date-range-picker #picker></mat-date-range-picker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="status-field">
                <mat-label>Statut</mat-label>
                <mat-select [(ngModel)]="filterRecupere" (selectionChange)="applyFilter()">
                  <mat-option [value]="null">Tous</mat-option>
                  <mat-option [value]="false">En fourrière</mat-option>
                  <mat-option [value]="true">Récupérés</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-stroked-button (click)="resetFilters()" class="reset-btn" [disabled]="!hasActiveFilter()">
                <mat-icon>refresh</mat-icon>
                <span>Réinitialiser</span>
              </button>
            </div>

            <div class="presets" role="group" aria-label="Plages prédéfinies">
              <button type="button" class="preset" [class.preset-active]="activePreset === 'today'" (click)="applyPreset('today')">Aujourd'hui</button>
              <button type="button" class="preset" [class.preset-active]="activePreset === '7d'" (click)="applyPreset('7d')">7 derniers jours</button>
              <button type="button" class="preset" [class.preset-active]="activePreset === '30d'" (click)="applyPreset('30d')">30 derniers jours</button>
              <button type="button" class="preset" [class.preset-active]="activePreset === 'month'" (click)="applyPreset('month')">Ce mois-ci</button>
              <button type="button" class="preset" [class.preset-active]="activePreset === 'year'" (click)="applyPreset('year')">Cette année</button>
            </div>
          </div>

          <mat-card-content>
            @if (loading) {
              <div class="loading-container">
                <app-loading-spinner></app-loading-spinner>
              </div>
            } @else {
              <div class="table-container">
                <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSort($event)">
                  <!-- Immatriculation Column -->
                  <ng-container matColumnDef="immatriculation">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Immatriculation</th>
                    <td mat-cell *matCellDef="let v">
                      <span class="plate-badge">{{ v.immatriculation }}</span>
                    </td>
                  </ng-container>

                  <!-- Vehicle Column -->
                  <ng-container matColumnDef="marque">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Véhicule</th>
                    <td mat-cell *matCellDef="let v">
                      <div class="vehicle-info">
                        <span class="vehicle-name">{{ v.marque }} {{ v.modele }}</span>
                        <span class="vehicle-color">{{ v.couleur }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Date Column -->
                  <ng-container matColumnDef="dateEntree">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Date d'entrée</th>
                    <td mat-cell *matCellDef="let v">{{ v.dateEntree | dateFr }}</td>
                  </ng-container>

                  <!-- Motif Column -->
                  <ng-container matColumnDef="motifEnlevement">
                    <th mat-header-cell *matHeaderCellDef>Motif</th>
                    <td mat-cell *matCellDef="let v">
                      <span class="motif-text" [matTooltip]="v.motifEnlevementLibelle">
                        {{ v.motifEnlevementLibelle }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="recupere">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                    <td mat-cell *matCellDef="let v">
                      @if (v.recupere) {
                        <span class="status-badge status-recovered">
                          <mat-icon>check_circle</mat-icon>
                          Récupéré
                        </span>
                      } @else {
                        <span class="status-badge status-active">
                          <mat-icon>local_parking</mat-icon>
                          En fourrière
                        </span>
                      }
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let v">
                      <div class="action-buttons">
                        <a mat-icon-button [routerLink]="['/resultat', v.id]" matTooltip="Voir détails">
                          <mat-icon>visibility</mat-icon>
                        </a>
                        <a mat-icon-button [routerLink]="['/admin/vehicule', v.id]" matTooltip="Modifier">
                          <mat-icon>edit</mat-icon>
                        </a>
                        <button mat-icon-button [matMenuTriggerFor]="moreMenu" matTooltip="Plus d'actions">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #moreMenu="matMenu">
                          @if (!v.recupere) {
                            <button mat-menu-item (click)="marquerSortie(v)">
                              <mat-icon class="success-icon">check_circle</mat-icon>
                              <span>Marquer comme récupéré</span>
                            </button>
                            <button mat-menu-item (click)="transferer(v)">
                              <mat-icon>swap_horiz</mat-icon>
                              <span>Transférer vers une autre fourrière</span>
                            </button>
                          }
                          <button mat-menu-item (click)="deleteVehicule(v)" class="delete-action">
                            <mat-icon>delete</mat-icon>
                            <span>Supprimer</span>
                          </button>
                        </mat-menu>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                  <tr class="mat-row no-data-row" *matNoDataRow>
                    <td class="mat-cell" colspan="6">
                      <div class="no-data">
                        <mat-icon>search_off</mat-icon>
                        <span>Aucun véhicule trouvé</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <mat-paginator
                [length]="totalElements"
                [pageSize]="pageSize"
                [pageSizeOptions]="[10, 25, 50, 100]"
                (page)="onPage($event)"
                showFirstLastButtons
              ></mat-paginator>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    /* Dashboard Page */
    .dashboard-page {
      min-height: calc(100vh - var(--header-h) - 200px);
      background: var(--bg);
    }

    /* Container */
    .container {
      max-width: var(--content-max);
      margin: 0 auto;
      padding: 0 var(--s-5);
    }

    /* Page Header — simple, no colored banner */
    .page-header {
      background: transparent;
      padding: var(--s-8) 0 var(--s-4);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--s-4);
    }

    .header-text h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 2px;
      line-height: 1.3;
    }

    .header-subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
    }

    .add-btn {
      height: 40px;
      padding: 0 var(--s-5) !important;
      font-weight: 600;
      font-size: 14px;
      background: var(--brand) !important;
      color: #fff !important;
      border-radius: var(--r-md) !important;
      border: none;
      box-shadow: none !important;
      transition: background var(--t-fast);

      &:hover {
        background: var(--brand-hover) !important;
      }

      mat-icon {
        margin-right: var(--s-1);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s-4);
      margin-bottom: var(--s-6);
    }

    .stat-card {
      border-radius: var(--r-lg) !important;
      border: 1px solid var(--border) !important;
      box-shadow: var(--shadow-1) !important;
      background: var(--surface) !important;
      overflow: hidden;

      mat-card-content {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        padding: var(--s-4) var(--s-5) !important;
      }
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--r-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--brand-soft);
      color: var(--brand);

      &.total {
        background: var(--brand-soft);
        color: var(--brand);
      }

      &.active {
        background: var(--brand-soft);
        color: var(--brand);
      }

      &.recovered {
        background: var(--brand-soft);
        color: var(--brand);
      }

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Table Card */
    .table-card {
      border-radius: var(--r-lg) !important;
      border: 1px solid var(--border) !important;
      box-shadow: var(--shadow-1) !important;
      background: var(--surface) !important;
      overflow: hidden;
      margin-bottom: var(--s-8);
    }

    .table-header {
      padding: var(--s-5);
      border-bottom: 1px solid var(--border);

      h2 {
        font-size: 16px;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 var(--s-4);
      }
    }

    /* Filters */
    .filters {
      display: flex;
      gap: var(--s-3);
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .search-field,
    .status-field,
    .date-range-field {
      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      ::ng-deep .mdc-notched-outline__leading,
      ::ng-deep .mdc-notched-outline__notch,
      ::ng-deep .mdc-notched-outline__trailing {
        border-color: var(--border) !important;
      }

      ::ng-deep .mat-mdc-form-field-flex {
        height: 40px;
        align-items: center;
      }

      ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0 12px;
      }
    }

    .search-field {
      flex: 1;
      min-width: 260px;
    }

    .date-range-field {
      width: 260px;
      flex-shrink: 0;
    }

    .status-field {
      width: 160px;
      flex-shrink: 0;
    }

    .reset-btn {
      height: 40px;
      padding: 0 var(--s-3) !important;
      font-size: 13px;
      color: var(--text-2) !important;
      border-color: var(--border) !important;
      border-radius: var(--r-md) !important;

      mat-icon {
        margin-right: var(--s-1);
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    /* Presets row */
    .presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: var(--s-3);
    }
    .preset {
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-2);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .preset:hover {
      border-color: var(--border-strong);
      color: var(--text);
    }
    .preset-active {
      background: var(--brand-soft);
      color: var(--brand);
      border-color: var(--brand);
    }
    .preset-active:hover {
      color: var(--brand);
    }

    /* Loading */
    .loading-container {
      padding: var(--s-10);
      display: flex;
      justify-content: center;
    }

    /* Table */
    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .mat-mdc-header-cell {
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted) !important;
      background: var(--bg-subtle) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    .mat-mdc-row {
      transition: background-color var(--t-fast);
      border-bottom: 1px solid var(--border);

      &:hover {
        background-color: var(--bg-subtle);
      }
    }

    .mat-mdc-cell {
      font-size: 14px;
      color: var(--text-2);
      border-bottom-color: var(--border) !important;
    }

    /* Plate Badge */
    .plate-badge {
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-weight: 700;
      font-size: 13px;
      background: #1c1917;
      color: #fef3c7;
      padding: 3px 8px;
      border-radius: var(--r-sm);
      letter-spacing: 0.06em;
    }

    /* Vehicle Info */
    .vehicle-info {
      display: flex;
      flex-direction: column;
      gap: 1px;
      max-width: 160px;
      overflow: hidden;
    }

    .vehicle-name {
      font-weight: 500;
      font-size: 14px;
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .vehicle-color {
      font-size: 12px;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Motif */
    .motif-text {
      display: inline-block;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      color: var(--text-2);
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 10px;
      height: 24px;
      border-radius: var(--r-pill);
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      &.status-active {
        background: var(--brand-soft);
        color: var(--brand);
      }

      &.status-recovered {
        background: #ecfdf5;
        color: #166534;
      }
    }

    /* Action Buttons — no transitions, instant */
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0;
      white-space: nowrap;
      flex-shrink: 0;

      a, button {
        transition: none !important;
      }
    }

    .mat-column-actions {
      width: 140px;
      min-width: 140px;
      max-width: 140px;
      overflow: visible !important;
      text-overflow: clip !important;
      padding-right: 8px !important;
    }

    ::ng-deep .success-icon {
      color: #166534 !important;
    }

    ::ng-deep .delete-action {
      color: var(--brand) !important;

      mat-icon {
        color: var(--brand) !important;
      }
    }

    /* No Data */
    .no-data-row td {
      padding: var(--s-10) !important;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s-3);
      color: var(--text-muted);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.4;
      }

      span {
        font-size: 14px;
      }
    }

    /* Paginator */
    mat-paginator {
      border-top: 1px solid var(--border);
      background: transparent !important;

      ::ng-deep .mat-mdc-paginator-container {
        padding: var(--s-2) var(--s-4);
        min-height: 48px;
        font-size: 13px;
        color: var(--text-muted);
      }
    }

    /* Responsive */
    @media (max-width: 900px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .add-btn {
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .search-field,
      .status-field,
      .date-range-field,
      .reset-btn {
        width: 100%;
        min-width: 0;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['immatriculation', 'marque', 'dateEntree', 'recupere', 'actions'];
  dataSource = new MatTableDataSource<Vehicule>([]);
  stats: Stats | null = null;
  loading = true;

  pageSize = 10;
  totalElements = 0;
  currentPage = 0;
  sortBy = 'dateEntree';
  sortDir = 'desc';

  searchImmat = '';
  filterRecupere: boolean | null = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;
  activePreset: 'today' | '7d' | '30d' | 'month' | 'year' | null = null;

  ngOnInit(): void {
    this.loadStats();
    this.loadVehicules();
  }

  loadStats(): void {
    this.vehiculeService.getStats().subscribe({
      next: (stats) => this.stats = stats
    });
  }

  loadVehicules(): void {
    this.loading = true;
    this.vehiculeService.getAll(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir,
      {
        immatriculation: this.searchImmat || undefined,
        recupere: this.filterRecupere ?? undefined,
        dateDebut: this.dateDebut ? this.toIsoStartOfDay(this.dateDebut) : undefined,
        dateFin: this.dateFin ? this.toIsoEndOfDay(this.dateFin) : undefined
      }
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /** Format LocalDateTime ISO sans timezone — borne basse de la journée. */
  private toIsoStartOfDay(d: Date): string {
    return `${this.fmtYmd(d)}T00:00:00`;
  }

  /** Format LocalDateTime ISO sans timezone — borne haute de la journée. */
  private toIsoEndOfDay(d: Date): string {
    return `${this.fmtYmd(d)}T23:59:59`;
  }

  private fmtYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  onPage(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadVehicules();
  }

  onSort(sort: Sort): void {
    this.sortBy = sort.active || 'dateEntree';
    this.sortDir = sort.direction || 'desc';
    this.currentPage = 0;
    this.loadVehicules();
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadVehicules();
  }

  /** Date range modifiée via le calendrier → on perd le preset actif et on relance */
  onDateChange(): void {
    this.activePreset = null;
    // Ne lance la recherche que si la plage est complète (ou totalement vidée)
    if (this.dateDebut && this.dateFin) {
      this.applyFilter();
    } else if (!this.dateDebut && !this.dateFin) {
      this.applyFilter();
    }
  }

  applyPreset(preset: 'today' | '7d' | '30d' | 'month' | 'year'): void {
    // Toggle : reclick sur le preset actif désactive
    if (this.activePreset === preset) {
      this.activePreset = null;
      this.dateDebut = null;
      this.dateFin = null;
      this.applyFilter();
      return;
    }

    const now = new Date();
    let start: Date;
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7d':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case '30d':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }

    this.activePreset = preset;
    this.dateDebut = start;
    this.dateFin = end;
    this.applyFilter();
  }

  hasActiveFilter(): boolean {
    return !!this.searchImmat || this.filterRecupere !== null || this.dateDebut !== null || this.dateFin !== null;
  }

  resetFilters(): void {
    this.searchImmat = '';
    this.filterRecupere = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.activePreset = null;
    this.currentPage = 0;
    this.loadVehicules();
  }

  marquerSortie(vehicule: Vehicule): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la sortie',
        message: `Marquer le véhicule ${vehicule.immatriculation} comme récupéré ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.vehiculeService.marquerSortie(vehicule.id).subscribe({
          next: () => {
            this.snackBar.open('Véhicule marqué comme récupéré', 'OK', { duration: 3000 });
            this.loadVehicules();
            this.loadStats();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la mise à jour', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  transferer(vehicule: Vehicule): void {
    const ref = this.dialog.open(TransfertDialogComponent, {
      data: { vehicule },
      width: '520px'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const msg = result.depassementCapacite
          ? 'Transfert effectué (avertissement : capacité de la destination dépassée)'
          : 'Transfert effectué';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
        this.loadVehicules();
      }
    });
  }

  deleteVehicule(vehicule: Vehicule): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer définitivement le véhicule ${vehicule.immatriculation} ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.vehiculeService.delete(vehicule.id).subscribe({
          next: () => {
            this.snackBar.open('Véhicule supprimé', 'OK', { duration: 3000 });
            this.loadVehicules();
            this.loadStats();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }
}
