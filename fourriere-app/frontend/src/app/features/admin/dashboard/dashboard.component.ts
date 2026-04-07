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
                <mat-label>Rechercher par plaque</mat-label>
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  [(ngModel)]="searchImmat"
                  (keyup.enter)="applyFilter()"
                  placeholder="Ex: AA123BB"
                />
                @if (searchImmat) {
                  <button matSuffix mat-icon-button (click)="searchImmat = ''; applyFilter()">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="status-field">
                <mat-label>Statut</mat-label>
                <mat-select [(ngModel)]="filterRecupere" (selectionChange)="applyFilter()">
                  <mat-option [value]="null">Tous les statuts</mat-option>
                  <mat-option [value]="false">En fourrière</mat-option>
                  <mat-option [value]="true">Récupérés</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-stroked-button (click)="resetFilters()" class="reset-btn" [disabled]="!searchImmat && filterRecupere === null">
                <mat-icon>refresh</mat-icon>
                <span>Réinitialiser</span>
              </button>
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
    .dashboard-page {
      min-height: calc(100vh - 72px - 200px);
      background: var(--color-background);
    }

    // Page Header
    .page-header {
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
      padding: var(--space-8) 0;
      color: white;
      margin-bottom: var(--space-6);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);

      @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
      }
    }

    .header-text h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: var(--space-1);
      color: white;
    }

    .header-subtitle {
      font-size: 1rem;
      opacity: 0.85;
    }

    .add-btn {
      height: 48px;
      padding: 0 var(--space-6) !important;
      font-weight: 600;

      mat-icon {
        margin-right: var(--space-2);
      }

      @media (max-width: 600px) {
        width: 100%;
      }
    }

    // Stats Grid
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-5);
      margin-bottom: var(--space-6);

      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      border-radius: var(--radius-lg) !important;
      border: none;
      overflow: hidden;

      mat-card-content {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-5);
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.total {
        background: var(--color-primary-50);
        color: var(--color-primary);
      }

      &.active {
        background: #fff3e0;
        color: var(--color-accent-dark);
      }

      &.recovered {
        background: #e8f5e9;
        color: var(--color-success);
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    // Table Card
    .table-card {
      border-radius: var(--radius-lg) !important;
      overflow: hidden;
      margin-bottom: var(--space-8);
    }

    .table-header {
      padding: var(--space-5);
      border-bottom: 1px solid var(--color-border-light);

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: var(--space-4);
      }
    }

    .filters {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
      align-items: flex-start;

      @media (max-width: 768px) {
        flex-direction: column;
      }
    }

    .search-field {
      flex: 1;
      min-width: 250px;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .status-field {
      min-width: 180px;

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .reset-btn {
      height: 56px;
      padding: 0 var(--space-4);

      mat-icon {
        margin-right: var(--space-2);
      }

      @media (max-width: 768px) {
        width: 100%;
      }
    }

    .loading-container {
      padding: var(--space-10);
      display: flex;
      justify-content: center;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .mat-mdc-header-cell {
      font-weight: 600;
      color: var(--color-text-primary);
      background: var(--color-primary-50);
    }

    .mat-mdc-row {
      transition: background-color var(--transition-fast);

      &:hover {
        background-color: rgba(0, 105, 62, 0.04);
      }
    }

    // Plate Badge
    .plate-badge {
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      font-size: 0.9rem;
      background: var(--color-primary-50);
      color: var(--color-primary-dark);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-sm);
      letter-spacing: 0.05em;
    }

    // Vehicle Info
    .vehicle-info {
      display: flex;
      flex-direction: column;
    }

    .vehicle-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .vehicle-color {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    // Motif
    .motif-text {
      display: inline-block;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // Status Badge
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 500;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.status-active {
        background: #fff3e0;
        color: var(--color-accent-dark);
      }

      &.status-recovered {
        background: #e8f5e9;
        color: var(--color-success);
      }
    }

    // Action Buttons
    .action-buttons {
      display: flex;
      align-items: center;

      a, button {
        color: var(--color-text-secondary);

        &:hover {
          color: var(--color-primary);
        }
      }
    }

    .mat-column-actions {
      width: 120px;
    }

    ::ng-deep .success-icon {
      color: var(--color-success) !important;
    }

    ::ng-deep .delete-action {
      color: var(--color-warn) !important;

      mat-icon {
        color: var(--color-warn) !important;
      }
    }

    // No Data
    .no-data-row td {
      padding: var(--space-10) !important;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      color: var(--color-text-muted);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.5;
      }
    }

    // Paginator
    mat-paginator {
      border-top: 1px solid var(--color-border-light);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['immatriculation', 'marque', 'dateEntree', 'motifEnlevement', 'recupere', 'actions'];
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
        recupere: this.filterRecupere ?? undefined
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

  resetFilters(): void {
    this.searchImmat = '';
    this.filterRecupere = null;
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
