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
    <div class="page">
      <div class="page-header">
        <div class="container">
          <h1><mat-icon>swap_horiz</mat-icon> Historique des transferts</h1>
          <p>Traçabilité des déplacements de véhicules entre fourrières</p>
        </div>
      </div>

      <div class="container">
        <mat-card>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Fourrière (source ou destination)</mat-label>
              <mat-select [(ngModel)]="filterFourriereId" (selectionChange)="reload()">
                <mat-option [value]="null">Toutes</mat-option>
                <mat-option *ngFor="let f of fourrieres" [value]="f.id">{{ f.nom }}</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-stroked-button (click)="reset()">
              <mat-icon>refresh</mat-icon> Réinitialiser
            </button>
          </div>

          <mat-card-content>
            <div *ngIf="loading" class="loading"><app-loading-spinner></app-loading-spinner></div>

            <div *ngIf="!loading" class="table-wrap">
              <table mat-table [dataSource]="data">
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let t">{{ t.dateTransfert | dateFr:'long' }}</td>
                </ng-container>

                <ng-container matColumnDef="vehicule">
                  <th mat-header-cell *matHeaderCellDef>Véhicule</th>
                  <td mat-cell *matCellDef="let t">
                    <span class="plate">{{ t.vehiculeImmatriculation }}</span>
                    <span class="vmodel">{{ t.vehiculeMarque }} {{ t.vehiculeModele }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="trajet">
                  <th mat-header-cell *matHeaderCellDef>Trajet</th>
                  <td mat-cell *matCellDef="let t">
                    <span>{{ t.fourriereSourceNom }}</span>
                    <mat-icon class="arrow">arrow_forward</mat-icon>
                    <span>{{ t.fourriereDestinationNom }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="motif">
                  <th mat-header-cell *matHeaderCellDef>Motif</th>
                  <td mat-cell *matCellDef="let t">{{ t.motifLibelle }}</td>
                </ng-container>

                <ng-container matColumnDef="par">
                  <th mat-header-cell *matHeaderCellDef>Par</th>
                  <td mat-cell *matCellDef="let t">{{ t.effectuePar || '—' }}</td>
                </ng-container>

                <ng-container matColumnDef="commentaire">
                  <th mat-header-cell *matHeaderCellDef>Commentaire</th>
                  <td mat-cell *matCellDef="let t">
                    <span [matTooltip]="t.commentaire">{{ (t.commentaire | slice:0:40) || '—' }}</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="cols"></tr>
                <tr mat-row *matRowDef="let row; columns: cols;"></tr>
              </table>

              <div *ngIf="data.length === 0" class="empty">
                <mat-icon>inbox</mat-icon>
                <p>Aucun transfert enregistré</p>
              </div>
            </div>

            <mat-paginator
              [length]="total"
              [pageSize]="pageSize"
              [pageSizeOptions]="[10, 25, 50]"
              (page)="onPage($event)"
            ></mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header { background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)); color: white; padding: 32px 0; margin-bottom: 24px; }
    .page-header h1 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .page-header p { opacity: .85; margin: 4px 0 0; }
    .filters { display: flex; gap: 16px; align-items: center; padding: 16px; }
    .filters mat-form-field { min-width: 280px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; }
    .plate { display: inline-block; font-family: 'Courier New', monospace; font-weight: 600; background: var(--color-primary-50); color: var(--color-primary-dark); padding: 2px 8px; border-radius: 4px; margin-right: 8px; }
    .vmodel { color: var(--color-text-muted); font-size: .9em; }
    .arrow { vertical-align: middle; font-size: 18px; width: 18px; height: 18px; margin: 0 6px; color: var(--color-primary); }
    .loading { padding: 40px; display: flex; justify-content: center; }
    .empty { text-align: center; padding: 40px; color: var(--color-text-muted); }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .5; }
  `]
})
export class TransfertsComponent implements OnInit {
  private transfertService = inject(TransfertService);
  private fourriereService = inject(FourriereService);

  cols = ['date', 'vehicule', 'trajet', 'motif', 'par', 'commentaire'];
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
