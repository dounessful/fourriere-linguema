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

              <ng-container matColumnDef="zone">
                <th mat-header-cell *matHeaderCellDef>Zone</th>
                <td mat-cell *matCellDef="let e">{{ e.zone || '-' }}</td>
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
                    <mat-icon>{{ e.active ? 'visibility_off' : 'visibility' }}</mat-icon>
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
      padding: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .equipes-card {
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

    .equipes-table {
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
export class EquipeListComponent implements OnInit {
  private equipeService = inject(EquipeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  equipes = signal<Equipe[]>([]);
  loading = signal(true);

  displayedColumns = ['nom', 'description', 'zone', 'fourriere', 'statut', 'actions'];

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
