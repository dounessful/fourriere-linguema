import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommuneService } from '../../../core/services/commune.service';
import { Commune } from '../../../core/models/commune.model';
import { CommuneDialogComponent } from './commune-dialog.component';
import { ConfirmDialogComponent } from '../dashboard/confirm-dialog.component';

@Component({
  selector: 'app-communes',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule,
    MatChipsModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="communes-container">
      <mat-card class="communes-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>apartment</mat-icon>
            Gestion des communes
          </mat-card-title>
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            Nouvelle commune
          </button>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container"><mat-spinner diameter="40"></mat-spinner></div>
          } @else {
            <table mat-table [dataSource]="communes()" class="communes-table">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let c">{{ c.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="region">
                <th mat-header-cell *matHeaderCellDef>Région</th>
                <td mat-cell *matCellDef="let c">{{ c.region || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let c">{{ c.telephone || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let c">
                  <mat-chip [class.active]="c.active" [class.inactive]="!c.active">
                    {{ c.active ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let c">
                  <button mat-icon-button color="primary" matTooltip="Modifier" (click)="openDialog(c)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button [color]="c.active ? 'warn' : 'accent'"
                          [matTooltip]="c.active ? 'Désactiver' : 'Activer'" (click)="toggleActive(c)">
                    <mat-icon>{{ c.active ? 'toggle_off' : 'toggle_on' }}</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Supprimer" (click)="confirmDelete(c)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (communes().length === 0) {
              <div class="empty-state">
                <mat-icon>apartment</mat-icon>
                <p>Aucune commune enregistrée</p>
                <button mat-stroked-button color="primary" (click)="openDialog()">Ajouter une commune</button>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .communes-container { padding: var(--s-6) var(--s-4); max-width: var(--content-max); margin: 0 auto; }
    .communes-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-1);
      mat-card-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: var(--s-5) var(--s-6); border-bottom: 1px solid var(--border);
        mat-card-title {
          display: flex; align-items: center; gap: var(--s-2); margin: 0;
          font-size: 22px; font-weight: 600; color: var(--text);
          mat-icon { color: var(--brand); }
        }
        button[mat-raised-button] {
          background: var(--brand) !important; color: #fff !important;
          border-radius: var(--r-md); font-weight: 500;
        }
        button[mat-raised-button]:hover { background: var(--brand-hover) !important; }
      }
    }
    .communes-table { width: 100%; border-collapse: collapse; }
    :host ::ng-deep .communes-table th.mat-header-cell {
      font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--text-muted); border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4); background: var(--surface);
    }
    :host ::ng-deep .communes-table td.mat-cell {
      color: var(--text-2); font-size: 14px;
      border-bottom: 1px solid var(--border); padding: var(--s-3) var(--s-4);
    }
    :host ::ng-deep .communes-table tr.mat-row:hover { background: var(--bg-subtle); }
    .loading-container { display: flex; justify-content: center; padding: var(--s-12); }
    .empty-state { text-align: center; padding: var(--s-12); color: var(--text-muted); }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: .35; margin-bottom: var(--s-3); }
    :host ::ng-deep mat-chip.active { background: #ecfdf5 !important; color: #059669 !important; }
    :host ::ng-deep mat-chip.inactive { background: var(--bg-subtle) !important; color: var(--text-muted) !important; }
    :host ::ng-deep .mat-column-actions {
      width: 130px; min-width: 130px; max-width: 130px;
      overflow: visible !important; text-overflow: clip !important;
    }
    :host ::ng-deep button.mat-icon-button { width: 30px; height: 30px; line-height: 30px; }
    :host ::ng-deep button.mat-icon-button .mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class CommunesComponent implements OnInit {
  private communeService = inject(CommuneService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  communes = signal<Commune[]>([]);
  loading = signal(true);
  displayedColumns = ['nom', 'region', 'telephone', 'statut', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.communeService.getAll().subscribe({
      next: (list) => { this.communes.set(list); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openDialog(commune?: Commune): void {
    const ref = this.dialog.open(CommuneDialogComponent, { data: commune ?? null });
    ref.afterClosed().subscribe((res) => { if (res) this.load(); });
  }

  toggleActive(c: Commune): void {
    this.communeService.toggleActive(c.id).subscribe({
      next: () => { this.snackBar.open('Statut mis à jour', 'OK', { duration: 2000 }); this.load(); },
      error: () => this.snackBar.open('Erreur', 'OK', { duration: 2500 })
    });
  }

  confirmDelete(c: Commune): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Supprimer la commune', message: `Supprimer la commune « ${c.nom} » ?` }
    });
    ref.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.communeService.delete(c.id).subscribe({
        next: () => { this.snackBar.open('Commune supprimée', 'OK', { duration: 2500 }); this.load(); },
        error: (e) => this.snackBar.open(e?.error?.message || 'Suppression impossible', 'OK', { duration: 3000 })
      });
    });
  }
}
