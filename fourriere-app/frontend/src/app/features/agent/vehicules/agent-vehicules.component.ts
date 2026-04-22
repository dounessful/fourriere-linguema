import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgentVehiculeService } from '../../../core/services/agent-vehicule.service';
import { AuthService } from '../../../core/services/auth.service';
import { Vehicule } from '../../../core/models/vehicule.model';
import { DateFrPipe } from '../../../shared/pipes/date-fr.pipe';

@Component({
  selector: 'app-agent-vehicules',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, MatCardModule, MatTableModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTooltipModule, MatProgressSpinnerModule, DateFrPipe
  ],
  template: `
    <div class="agent-container">
      <div class="page-header">
        <div>
          <h1>Véhicules de ma commune</h1>
          <p class="subtitle">Consultation en lecture seule</p>
        </div>
      </div>

      <mat-card class="table-card">
        <div class="table-header">
          <div class="filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher par plaque</mat-label>
              <input matInput [(ngModel)]="searchImmat" (keyup.enter)="applyFilter()" placeholder="Ex: DK1234AB" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="filterRecupere" (selectionChange)="applyFilter()">
                <mat-option [value]="null">Tous les statuts</mat-option>
                <mat-option [value]="false">En fourrière</mat-option>
                <mat-option [value]="true">Récupérés</mat-option>
              </mat-select>
            </mat-form-field>

            <button class="reset-btn" (click)="reset()">
              <mat-icon>refresh</mat-icon>
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        <mat-card-content>
          @if (loading) {
            <div class="loading"><mat-spinner diameter="40"></mat-spinner></div>
          } @else {
            <div class="table-wrap">
              <table mat-table [dataSource]="dataSource">
                <ng-container matColumnDef="immatriculation">
                  <th mat-header-cell *matHeaderCellDef>Plaque</th>
                  <td mat-cell *matCellDef="let v">
                    <span class="plate-badge">{{ v.immatriculation }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="vehicule">
                  <th mat-header-cell *matHeaderCellDef>Véhicule</th>
                  <td mat-cell *matCellDef="let v">
                    <div class="vinfo">
                      <span class="vname">{{ v.marque }} {{ v.modele }}</span>
                      <span class="vcol">{{ v.couleur }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="fourriere">
                  <th mat-header-cell *matHeaderCellDef>Fourrière</th>
                  <td mat-cell *matCellDef="let v">{{ v.nomFourriere || '—' }}</td>
                </ng-container>

                <ng-container matColumnDef="dateEntree">
                  <th mat-header-cell *matHeaderCellDef>Date d'entrée</th>
                  <td mat-cell *matCellDef="let v">{{ v.dateEntree | dateFr }}</td>
                </ng-container>

                <ng-container matColumnDef="statut">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let v">
                    @if (v.recupere) {
                      <span class="status-badge status-recovered">
                        <mat-icon>check_circle</mat-icon> Récupéré
                      </span>
                    } @else {
                      <span class="status-badge status-active">
                        <mat-icon>local_parking</mat-icon> En fourrière
                      </span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let v">
                    <a mat-icon-button [routerLink]="['/resultat', v.id]" matTooltip="Voir les détails">
                      <mat-icon>visibility</mat-icon>
                    </a>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <tr class="mat-row no-data-row" *matNoDataRow>
                  <td class="mat-cell" colspan="6">
                    <div class="no-data">
                      <mat-icon>search_off</mat-icon>
                      <span>Aucun véhicule dans votre commune</span>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <mat-paginator
              [length]="totalElements"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50]"
              (page)="onPage($event)"
            ></mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .agent-container { padding: var(--s-6) var(--s-4); max-width: var(--content-max); margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--s-5);
    }
    h1 { font-size: 24px; font-weight: 600; margin: 0; color: var(--text); }
    .subtitle { font-size: 13px; color: var(--text-muted); margin: 4px 0 0; }
    .table-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--r-lg); box-shadow: var(--shadow-1);
    }
    .table-header { padding: var(--s-5) var(--s-5) 0; }
    .filters { display: flex; gap: var(--s-3); flex-wrap: wrap; align-items: flex-end; }
    .search-field { flex: 1; min-width: 220px; }
    .status-field { min-width: 180px; }
    .reset-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      height: 44px; padding: 0 16px;
      background: var(--surface); color: var(--text-2);
      border: 1px solid var(--border); border-radius: var(--r-md);
      font-size: 13px; font-weight: 500; cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
    .reset-btn:hover { background: var(--bg-subtle); }
    .reset-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .loading { display: flex; justify-content: center; padding: var(--s-12); }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; }
    :host ::ng-deep th.mat-mdc-header-cell {
      font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em;
      color: var(--text-muted); background: var(--surface);
      padding: var(--s-3) var(--s-4);
    }
    :host ::ng-deep td.mat-mdc-cell {
      color: var(--text-2); font-size: 14px;
      border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
    }
    :host ::ng-deep tr.mat-mdc-row:hover { background: var(--bg-subtle); }
    .plate-badge {
      font-family: 'JetBrains Mono', monospace; font-weight: 600;
      background: #1c1917; color: #fef3c7;
      padding: 3px 8px; border-radius: var(--r-sm); letter-spacing: .05em; font-size: 12px;
    }
    .vinfo { display: flex; flex-direction: column; }
    .vname { font-weight: 500; color: var(--text); }
    .vcol { font-size: 12px; color: var(--text-muted); }
    .status-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: var(--r-pill);
      font-size: 12px; font-weight: 500;
    }
    .status-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .status-active { background: var(--brand-soft); color: var(--brand-dark); }
    .status-recovered { background: #ecfdf5; color: #166534; }
    .no-data-row td { padding: var(--s-10) !important; }
    .no-data { display: flex; flex-direction: column; align-items: center; gap: var(--s-2); color: var(--text-muted); }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .4; }
    :host ::ng-deep .mat-column-actions {
      width: 80px; min-width: 80px; text-align: right;
    }
    :host ::ng-deep .mat-column-actions button { color: var(--text-muted); }
    :host ::ng-deep .mat-column-actions button:hover { color: var(--brand); }
  `]
})
export class AgentVehiculesComponent implements OnInit {
  private agentService = inject(AgentVehiculeService);
  public auth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = ['immatriculation', 'vehicule', 'fourriere', 'dateEntree', 'statut', 'actions'];
  dataSource = new MatTableDataSource<Vehicule>([]);

  loading = true;
  totalElements = 0;
  pageSize = 10;
  page = 0;
  searchImmat = '';
  filterRecupere: boolean | null = null;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.agentService.getAll(this.page, this.pageSize, 'dateEntree', 'desc', {
      immatriculation: this.searchImmat || undefined,
      recupere: this.filterRecupere ?? undefined
    }).subscribe({
      next: (res) => {
        this.dataSource.data = res.content;
        this.totalElements = res.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex;
    this.pageSize = e.pageSize;
    this.load();
  }

  applyFilter(): void {
    this.page = 0;
    this.load();
  }

  reset(): void {
    this.searchImmat = '';
    this.filterRecupere = null;
    this.page = 0;
    this.load();
  }
}
