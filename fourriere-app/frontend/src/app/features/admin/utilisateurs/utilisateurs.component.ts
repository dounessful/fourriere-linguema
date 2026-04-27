import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur, Role } from '../../../core/models/auth.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../dashboard/confirm-dialog.component';
import { UtilisateurDialogComponent } from './utilisateur-dialog.component';
import { TempPasswordDialogComponent } from './temp-password-dialog.component';
import { DateFrPipe } from '../../../shared/pipes/date-fr.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    LoadingSpinnerComponent,
    DateFrPipe
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Gestion des utilisateurs</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>person_add</mat-icon>
          Nouvel utilisateur
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          @if (loading) {
            <app-loading-spinner></app-loading-spinner>
          } @else {
            <table mat-table [dataSource]="utilisateurs">
              <ng-container matColumnDef="nom">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let u">{{ u.nom }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let u">{{ u.email }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rôle</th>
                <td mat-cell *matCellDef="let u">
                  @if (u.role === 'SUPER_ADMIN') {
                    <mat-chip color="primary" selected>Super Admin</mat-chip>
                  } @else if (u.role === 'AGENT_COMMUNE') {
                    <mat-chip>Agent commune</mat-chip>
                  } @else {
                    <mat-chip>Admin</mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="commune">
                <th mat-header-cell *matHeaderCellDef>Commune</th>
                <td mat-cell *matCellDef="let u">{{ u.communeNom || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="actif">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let u">
                  @if (u.actif) {
                    <mat-chip color="accent" selected>Actif</mat-chip>
                  } @else {
                    <mat-chip color="warn" selected>Inactif</mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Créé le</th>
                <td mat-cell *matCellDef="let u">{{ u.createdAt | dateFr }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let u">
                  <button mat-icon-button (click)="openDialog(u)" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="resetPassword(u)" matTooltip="Réinitialiser le mot de passe" [disabled]="!u.keycloakId">
                    <mat-icon>key</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteUtilisateur(u)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: var(--s-6) var(--s-4);
      max-width: var(--content-max);
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--s-5);
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
    }

    .page-header button[mat-raised-button] {
      background: var(--brand) !important;
      color: #fff !important;
      border-radius: var(--r-md);
      font-weight: 500;
      transition: background var(--t-fast);
    }
    .page-header button[mat-raised-button]:hover {
      background: var(--brand-hover) !important;
    }

    :host ::ng-deep mat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    :host ::ng-deep th.mat-header-cell {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
    }

    :host ::ng-deep td.mat-cell {
      color: var(--text-2);
      font-size: 14px;
      border-bottom: 1px solid var(--border);
      padding: var(--s-3) var(--s-4);
    }

    :host ::ng-deep tr.mat-row:hover {
      background: var(--bg-subtle);
      transition: background var(--t-fast);
    }

    :host ::ng-deep mat-chip[color="primary"] {
      background-color: var(--brand-soft) !important;
      color: var(--brand) !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      min-height: 24px !important;
      padding: 0 10px !important;
      border-radius: var(--r-pill) !important;
    }

    :host ::ng-deep mat-chip:not([color]) {
      background-color: var(--bg-subtle) !important;
      color: var(--text-2) !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      min-height: 24px !important;
      padding: 0 10px !important;
      border-radius: var(--r-pill) !important;
    }

    :host ::ng-deep mat-chip[color="accent"] {
      background-color: #ecfdf5 !important;
      color: #059669 !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      min-height: 24px !important;
      padding: 0 10px !important;
      border-radius: var(--r-pill) !important;
    }

    :host ::ng-deep mat-chip[color="warn"] {
      background-color: var(--bg-subtle) !important;
      color: var(--text-muted) !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      min-height: 24px !important;
      padding: 0 10px !important;
      border-radius: var(--r-pill) !important;
    }

    /* Column ellipsis */
    :host ::ng-deep .mat-column-email {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Actions column — always visible */
    :host ::ng-deep .mat-column-actions {
      width: 160px;
      min-width: 160px;
      max-width: 160px;
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
export class UtilisateursComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['nom', 'email', 'role', 'commune', 'actif', 'actions'];
  utilisateurs: Utilisateur[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.loading = true;
    this.utilisateurService.getAll().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openDialog(utilisateur?: Utilisateur): void {
    const dialogRef = this.dialog.open(UtilisateurDialogComponent, {
      width: '400px',
      data: utilisateur ? { ...utilisateur } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUtilisateurs();
      }
    });
  }

  deleteUtilisateur(utilisateur: Utilisateur): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer l'utilisateur ${utilisateur.nom} ? Le compte Keycloak sera également supprimé.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.utilisateurService.delete(utilisateur.id).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur supprimé', 'OK', { duration: 3000 });
            this.loadUtilisateurs();
          },
          error: () => {
            this.snackBar.open('Erreur lors de la suppression', 'OK', { duration: 3000 });
          }
        });
      }
    });
  }

  resetPassword(utilisateur: Utilisateur): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Réinitialiser le mot de passe',
        message: `Générer un nouveau mot de passe temporaire pour ${utilisateur.nom} ? L'utilisateur devra le changer à sa prochaine connexion.`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.utilisateurService.resetPassword(utilisateur.id).subscribe({
          next: (result) => {
            this.dialog.open(TempPasswordDialogComponent, {
              width: '480px',
              disableClose: true,
              data: {
                title: 'Mot de passe réinitialisé',
                subtitle: 'Transmettez ce nouveau mot de passe à l\'utilisateur :',
                email: utilisateur.email,
                password: result.temporaryPassword
              }
            });
          },
          error: (err) => {
            const message = err.error?.message || 'Erreur lors de la réinitialisation';
            this.snackBar.open(message, 'OK', { duration: 5000 });
          }
        });
      }
    });
  }
}
