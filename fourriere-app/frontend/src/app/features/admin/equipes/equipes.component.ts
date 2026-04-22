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
import { EquipeService } from '../../../core/services/equipe.service';
import { Equipe } from '../../../core/models/equipe.model';
import { EquipeDialogComponent } from './equipe-dialog.component';
import { ConfirmDialogComponent } from '../dashboard/confirm-dialog.component';

@Component({
  selector: 'app-equipes',
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
    <div class="equipes-container">
      <mat-card class="equipes-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>groups</mat-icon>
            Gestion des Équipes
          </mat-card-title>
          <button mat-raised-button color="primary" (click)="openDialog()">
            <mat-icon>add</mat-icon>
            Nouvelle Équipe
          </button>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <table mat-table [dataSource]="equipes()" class="equipes-table">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let e">{{ e.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let e">{{ e.description || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="fourriere">
                <th mat-header-cell *matHeaderCellDef>Fourrière Assignée</th>
                <td mat-cell *matCellDef="let e">{{ e.fourriereAssigneeNom || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let e">
                  <mat-chip [class.active]="e.active" [class.inactive]="!e.active">
                    {{ e.active ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let e">
                  <button mat-icon-button color="primary" matTooltip="Modifier" (click)="openDialog(e)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button [color]="e.active ? 'warn' : 'accent'"
                          [matTooltip]="e.active ? 'Désactiver' : 'Activer'"
                          (click)="toggleActive(e)">
                    <mat-icon>{{ e.active ? 'toggle_off' : 'toggle_on' }}</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Supprimer" (click)="confirmDelete(e)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            @if (equipes().length === 0) {
              <div class="empty-state">
                <mat-icon>groups</mat-icon>
                <p>Aucune équipe enregistrée</p>
                <button mat-stroked-button color="primary" (click)="openDialog()">
                  Ajouter une équipe
                </button>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .equipes-container {
      padding: var(--s-6) var(--s-4);
      max-width: var(--content-max);
      margin: 0 auto;
    }

    .equipes-card {
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

    .equipes-table {
      width: 100%;
      border-collapse: collapse;
    }

    :host ::ng-deep .equipes-table th.mat-header-cell {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
    }

    :host ::ng-deep .equipes-table td.mat-cell {
      color: var(--text-2);
      font-size: 14px;
      border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
    }

    :host ::ng-deep .equipes-table tr.mat-row:hover {
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
    :host ::ng-deep .mat-column-description {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host ::ng-deep .mat-column-zone {
      max-width: 120px;
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
export class EquipeListComponent implements OnInit {
  private equipeService = inject(EquipeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  equipes = signal<Equipe[]>([]);
  loading = signal(true);

  displayedColumns = ['nom', 'fourriere', 'statut', 'actions'];

  ngOnInit(): void {
    this.loadEquipes();
  }

  loadEquipes(): void {
    this.loading.set(true);
    this.equipeService.getAll().subscribe({
      next: (data) => {
        this.equipes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des équipes', 'Fermer', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openDialog(equipe?: Equipe): void {
    const dialogRef = this.dialog.open(EquipeDialogComponent, {
      width: '500px',
      data: equipe
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEquipes();
      }
    });
  }

  toggleActive(equipe: Equipe): void {
    this.equipeService.toggleActive(equipe.id).subscribe({
      next: () => {
        this.loadEquipes();
        this.snackBar.open(
          equipe.active ? 'Équipe désactivée' : 'Équipe activée',
          'Fermer',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open('Erreur lors de la modification', 'Fermer', { duration: 3000 });
      }
    });
  }

  confirmDelete(equipe: Equipe): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Voulez-vous vraiment supprimer l'équipe "${equipe.nom}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.equipeService.delete(equipe.id).subscribe({
          next: () => {
            this.loadEquipes();
            this.snackBar.open('Équipe supprimée', 'Fermer', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
          }
        });
      }
    });
  }
}
