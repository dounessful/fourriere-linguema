import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TransfertService } from '../../../core/services/transfert.service';
import { FourriereService } from '../../../core/services/fourriere.service';
import { Transfert } from '../../../core/models/transfert.model';
import { Fourriere } from '../../../core/models/fourriere.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DateFrPipe } from '../../../shared/pipes/date-fr.pipe';

@Component({
  selector: 'app-transferts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    DateFrPipe
  ],
  template: `
    <div class="transferts-page">

      <!-- Header -->
      <div class="page-top">
        <div class="page-top-left">
          <h1>Historique des transferts</h1>
          <p class="subtitle">Tracabilite des deplacements de vehicules entre fourrieres</p>
        </div>
        <div class="page-top-right">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Fourriere</mat-label>
            <mat-select [(ngModel)]="filterFourriereId" (selectionChange)="reload()">
              <mat-option [value]="null">Toutes</mat-option>
              <mat-option *ngFor="let f of fourrieres" [value]="f.id">{{ f.nom }}</mat-option>
            </mat-select>
          </mat-form-field>
          <button class="btn-reset" (click)="reset()">Reinitialiser</button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-wrap">
        <app-loading-spinner></app-loading-spinner>
      </div>

      <!-- Table -->
      <div *ngIf="!loading" class="table-scroll">
        <table mat-table [dataSource]="data" class="transferts-table">

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let t">{{ t.dateTransfert | dateFr:'long' }}</td>
          </ng-container>

          <ng-container matColumnDef="vehicule">
            <th mat-header-cell *matHeaderCellDef>Vehicule</th>
            <td mat-cell *matCellDef="let t">
              <span class="plate">{{ t.vehiculeImmatriculation }}</span>
              <span class="vmodel">{{ t.vehiculeMarque }} {{ t.vehiculeModele }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="trajet">
            <th mat-header-cell *matHeaderCellDef>Trajet</th>
            <td mat-cell *matCellDef="let t">
              <span class="trajet-cell">
                <span>{{ t.fourriereSourceNom }}</span>
                <svg class="arrow-icon" width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5h11M9 1l3.5 4L9 9" stroke="var(--text-muted)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ t.fourriereDestinationNom }}</span>
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="motif">
            <th mat-header-cell *matHeaderCellDef>Motif</th>
            <td mat-cell *matCellDef="let t">{{ t.motifLibelle }}</td>
          </ng-container>

          <ng-container matColumnDef="par">
            <th mat-header-cell *matHeaderCellDef>Par</th>
            <td mat-cell *matCellDef="let t">{{ t.effectuePar || '\u2014' }}</td>
          </ng-container>

          <ng-container matColumnDef="commentaire">
            <th mat-header-cell *matHeaderCellDef>Commentaire</th>
            <td mat-cell *matCellDef="let t">
              <span [matTooltip]="t.commentaire">{{ (t.commentaire | slice:0:40) || '\u2014' }}</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>

        <!-- Empty state -->
        <div *ngIf="data.length === 0" class="empty-state">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="12" width="32" height="26" rx="3" stroke="var(--text-faint)" stroke-width="1.5"/>
            <path d="M8 20h32" stroke="var(--text-faint)" stroke-width="1.5"/>
            <circle cx="24" cy="31" r="4" stroke="var(--text-faint)" stroke-width="1.5"/>
            <path d="M22 33l4-4" stroke="var(--text-faint)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p class="empty-text">Aucun transfert enregistre</p>
        </div>
      </div>

      <!-- Paginator -->
      <mat-paginator
        class="transferts-paginator"
        [length]="total"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 25, 50]"
        (page)="onPage($event)"
      ></mat-paginator>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: var(--content-max, 1120px);
      margin: 0 auto;
      padding: var(--s-6, 24px) var(--s-4, 16px);
    }

    /* ---- Header row ---- */
    .page-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--s-4, 16px);
      margin-bottom: var(--s-6, 24px);
      flex-wrap: wrap;
    }

    .page-top-left h1 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text, #1c1917);
      margin: 0;
      line-height: 1.3;
    }

    .subtitle {
      font-size: 13px;
      color: var(--text-muted, #78716c);
      margin: var(--s-1, 4px) 0 0;
    }

    .page-top-right {
      display: flex;
      align-items: flex-end;
      gap: var(--s-3, 12px);
      flex-shrink: 0;
    }

    .filter-field {
      width: 220px;
    }

    /* Force same height for select field and reset button */
    :host ::ng-deep .filter-field .mat-mdc-text-field-wrapper {
      height: 44px;
    }
    :host ::ng-deep .filter-field .mat-mdc-form-field-infix {
      padding-top: 10px;
      padding-bottom: 10px;
      min-height: 44px;
    }

    .btn-reset {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-1, 4px);
      height: 44px;
      padding: 0 16px;
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-2, #44403c);
      background: var(--surface, #ffffff);
      border: 1px solid var(--border, #e7e5e4);
      border-radius: var(--r-md, 8px);
      cursor: pointer;
      transition: background var(--t-fast, 120ms), border-color var(--t-fast, 120ms);
      white-space: nowrap;
    }

    .btn-reset:hover {
      background: var(--bg-subtle, #f5f5f4);
      border-color: var(--border-strong, #d6d3d1);
    }

    /* ---- Loading ---- */
    .loading-wrap {
      display: flex;
      justify-content: center;
      padding: var(--s-16, 64px) 0;
    }

    /* ---- Table ---- */
    .table-scroll {
      overflow-x: auto;
      background: var(--surface, #ffffff);
      border: 1px solid var(--border, #e7e5e4);
      border-radius: var(--r-lg, 12px);
    }

    .transferts-table {
      width: 100%;
    }

    :host ::ng-deep .transferts-table .mat-mdc-header-row {
      background: var(--surface, #ffffff);
    }

    :host ::ng-deep .transferts-table .mat-mdc-header-cell {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted, #78716c);
      border-bottom: 1px solid var(--border, #e7e5e4);
    }

    :host ::ng-deep .transferts-table .mat-mdc-row {
      transition: background var(--t-fast, 120ms);
    }

    :host ::ng-deep .transferts-table .mat-mdc-row:hover {
      background: var(--bg-subtle, #f5f5f4);
    }

    :host ::ng-deep .transferts-table .mat-mdc-cell {
      font-size: 13px;
      color: var(--text, #1c1917);
      border-bottom: 1px solid var(--border, #e7e5e4);
      padding-top: 10px;
      padding-bottom: 10px;
    }

    /* Plate badge */
    .plate {
      display: inline-block;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: 700;
      background: #1c1917;
      color: #fef3c7;
      padding: 2px 7px;
      border-radius: var(--r-sm, 6px);
      margin-right: var(--s-2, 8px);
      letter-spacing: 0.03em;
      line-height: 1.4;
    }

    .vmodel {
      color: var(--text-muted, #78716c);
      font-size: 12px;
    }

    /* Trajet cell */
    .trajet-cell {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2, 8px);
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .arrow-icon {
      flex-shrink: 0;
    }

    /* Column ellipsis */
    .mat-column-commentaire {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mat-column-motif {
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ---- Empty state ---- */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--s-12, 48px) var(--s-4, 16px);
    }

    .empty-icon {
      margin-bottom: var(--s-3, 12px);
      opacity: 0.6;
    }

    .empty-text {
      font-size: 14px;
      color: var(--text-muted, #78716c);
      margin: 0;
    }

    /* ---- Paginator ---- */
    :host ::ng-deep .transferts-paginator.mat-mdc-paginator {
      background: transparent;
      border-top: none;
      padding-top: var(--s-2, 8px);
    }

    /* ---- Responsive ---- */
    @media (max-width: 720px) {
      .page-top {
        flex-direction: column;
      }

      .page-top-right {
        width: 100%;
      }

      .filter-field {
        flex: 1;
        width: auto;
      }

      .page-top-left h1 {
        font-size: 20px;
      }
    }
  `]
})
export class TransfertsComponent implements OnInit {
  private transfertService = inject(TransfertService);
  private fourriereService = inject(FourriereService);

  cols = ['date', 'vehicule', 'trajet', 'motif', 'par'];
  data: Transfert[] = [];
  fourrieres: Fourriere[] = [];
  loading = true;
  total = 0;
  pageSize = 10;
  page = 0;
  filterFourriereId: number | null = null;

  ngOnInit(): void {
    this.fourriereService.getAll().subscribe(list => this.fourrieres = list);
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.transfertService.getAll(this.page, this.pageSize, {
      fourriereId: this.filterFourriereId ?? undefined
    }).subscribe({
      next: (res) => {
        this.data = res.content;
        this.total = res.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPage(e: PageEvent): void {
    this.page = e.pageIndex;
    this.pageSize = e.pageSize;
    this.reload();
  }

  reset(): void {
    this.filterFourriereId = null;
    this.page = 0;
    this.reload();
  }
}
