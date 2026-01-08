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
                    <mat-icon>{{ f.active ? 'visibility_off' : 'visibility' }}</mat-icon>
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
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .fourrieres-card {
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-4);

        mat-card-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin: 0;

          mat-icon {
            color: var(--color-primary);
          }
        }
      }
    }

    .fourrieres-table {
      width: 100%;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: var(--space-8);
    }

    .empty-state {
      text-align: center;
      padding: var(--space-8);
      color: var(--color-text-muted);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: var(--space-4);
      }

      p {
        margin-bottom: var(--space-4);
      }
    }

    mat-chip.active {
      background-color: var(--color-success-light) !important;
      color: var(--color-success) !important;
    }

    mat-chip.inactive {
      background-color: var(--color-warn-light) !important;
      color: var(--color-warn) !important;
    }
  `]
})
export class FourriereListComponent implements OnInit {
  private fourriereService = inject(FourriereService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  fourrieres = signal<Fourriere[]>([]);
  loading = signal(true);

  displayedColumns = ['nom', 'adresse', 'ville', 'telephone', 'tarif', 'statut', 'actions'];

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
