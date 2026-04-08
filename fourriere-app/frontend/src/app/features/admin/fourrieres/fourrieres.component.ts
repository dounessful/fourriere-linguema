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
import { FourriereService } from '../../../core/services/fourriere.service';
import { Fourriere } from '../../../core/models/fourriere.model';
import { FourriereDialogComponent } from './fourriere-dialog.component';
import { ConfirmDialogComponent } from '../dashboard/confirm-dialog.component';

@Component({
  selector: 'app-fourrieres',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="fourrieres-container">
      <mat-card class="fourrieres-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>warehouse</mat-icon>
            Gestion des Fourrières
          </mat-card-title>
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            Nouvelle Fourrière
          </button>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <table mat-table [dataSource]="fourrieres()" class="fourrieres-table">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let f">{{ f.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="adresse">
                <th mat-header-cell *matHeaderCellDef>Adresse</th>
                <td mat-cell *matCellDef="let f">{{ f.adresse }}</td>
              </ng-container>

              <ng-container matColumnDef="ville">
                <th mat-header-cell *matHeaderCellDef>Ville</th>
                <td mat-cell *matCellDef="let f">{{ f.ville || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="telephone">
                <th mat-header-cell *matHeaderCellDef>Téléphone</th>
                <td mat-cell *matCellDef="let f">{{ f.telephone || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="tarif">
                <th mat-header-cell *matHeaderCellDef>Tarif/jour</th>
                <td mat-cell *matCellDef="let f">
                  {{ f.tarifJournalier ? (f.tarifJournalier | number:'1.0-0') + ' FCFA' : '-' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let f">
                  <mat-chip [class.active]="f.active" [class.inactive]="!f.active">
                    {{ f.active ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let f">
                  <button mat-icon-button color="primary" matTooltip="Modifier" (click)="openDialog(f)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button [color]="f.active ? 'warn' : 'accent'"
                          [matTooltip]="f.active ? 'Désactiver' : 'Activer'"
                          (click)="toggleActive(f)">
                    <mat-icon>{{ f.active ? 'toggle_off' : 'toggle_on' }}</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Supprimer" (click)="confirmDelete(f)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (fourrieres().length === 0) {
              <div class="empty-state">
                <mat-icon>warehouse</mat-icon>
                <p>Aucune fourrière enregistrée</p>
                <button mat-stroked-button color="primary" (click)="openDialog()">
                  Ajouter une fourrière
                </button>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .fourrieres-container {
      padding: var(--s-6) var(--s-4);
      max-width: var(--content-max);
      margin: 0 auto;
    }

    .fourrieres-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-1);

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--s-5) var(--s-6);
        border-bottom: 1px solid var(--border);

        mat-card-title {
          display: flex;
          align-items: center;
          gap: var(--s-2);
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          color: var(--text);

          mat-icon {
            color: var(--brand);
          }
        }

        button[mat-raised-button] {
          background: var(--brand) !important;
          color: #fff !important;
          border-radius: var(--r-md);
          font-weight: 500;
          transition: background var(--t-fast);
        }
        button[mat-raised-button]:hover {
          background: var(--brand-hover) !important;
        }
      }
    }

    .fourrieres-table {
      width: 100%;
      border-collapse: collapse;
    }

    :host ::ng-deep .fourrieres-table th.mat-header-cell {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
    }

    :host ::ng-deep .fourrieres-table td.mat-cell {
      color: var(--text-2);
      font-size: 14px;
      border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
    }

    :host ::ng-deep .fourrieres-table tr.mat-row:hover {
      background: var(--bg-subtle);
      transition: background var(--t-fast);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: var(--s-12);
    }

    .empty-state {
      text-align: center;
      padding: var(--s-12);
      color: var(--text-muted);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: var(--s-4);
        color: var(--text-faint);
      }

      p {
        margin-bottom: var(--s-4);
        font-size: 15px;
      }

      button {
        border-color: var(--brand) !important;
        color: var(--brand) !important;
        border-radius: var(--r-md);
      }
    }

    mat-chip.active {
      background-color: #ecfdf5 !important;
      color: #059669 !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      min-height: 24px !important;
      padding: 0 10px !important;
      border-radius: var(--r-pill) !important;
    }

    mat-chip.inactive {
      background-color: var(--bg-subtle) !important;
      color: var(--text-muted) !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      min-height: 24px !important;
      padding: 0 10px !important;
      border-radius: var(--r-pill) !important;
    }

    /* Column ellipsis */
    :host ::ng-deep .mat-column-adresse {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host ::ng-deep .mat-column-email {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Actions column — always visible */
    :host ::ng-deep .mat-column-actions {
      width: 130px;
      min-width: 130px;
      max-width: 130px;
      overflow: visible !important;
      text-overflow: clip !important;
    }

    :host ::ng-deep button.mat-icon-button {
      width: 30px;
      height: 30px;
      line-height: 30px;
    }
    :host ::ng-deep button.mat-icon-button .mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      transition: color var(--t-fast);
    }
    :host ::ng-deep button.mat-icon-button:hover .mat-icon {
      color: var(--text);
    }
    :host ::ng-deep button.mat-icon-button[color="warn"] .mat-icon {
      color: var(--text-muted);
    }
    :host ::ng-deep button.mat-icon-button[color="warn"]:hover .mat-icon {
      color: var(--danger);
    }

    @media (max-width: 768px) {
      :host ::ng-deep mat-card-content {
        overflow-x: auto;
      }
    }
  `]
})
export class FourriereListComponent implements OnInit {
  private fourriereService = inject(FourriereService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  fourrieres = signal<Fourriere[]>([]);
  loading = signal(true);

  displayedColumns = ['nom', 'ville', 'telephone', 'statut', 'actions'];

  ngOnInit(): void {
    this.loadFourrieres();
  }

  loadFourrieres(): void {
    this.loading.set(true);
    this.fourriereService.getAll().subscribe({
      next: (data) => {
        this.fourrieres.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des fourrières', 'Fermer', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openDialog(fourriere?: Fourriere): void {
    const dialogRef = this.dialog.open(FourriereDialogComponent, {
      width: '600px',
      data: fourriere
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadFourrieres();
      }
    });
  }

  toggleActive(fourriere: Fourriere): void {
    this.fourriereService.toggleActive(fourriere.id).subscribe({
      next: () => {
        this.loadFourrieres();
        this.snackBar.open(
          fourriere.active ? 'Fourrière désactivée' : 'Fourrière activée',
          'Fermer',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
      }
    });
  }

  confirmDelete(fourriere: Fourriere): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer la fourrière "${fourriere.nom}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.fourriereService.delete(fourriere.id).subscribe({
          next: () => {
            this.loadFourrieres();
            this.snackBar.open('Fourrière supprimée', 'Fermer', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }
}
