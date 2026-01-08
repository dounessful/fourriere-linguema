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
import { DateFrPipe } from '../../../shared/pipes/date-fr.pipe';

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
                  } @else {
                    <mat-chip>Admin</mat-chip>
                  }
                </td>
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
                  <button mat-icon-button (click)="openDialog(u)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteUtilisateur(u)">
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
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      color: #3f51b5;
    }

    table {
      width: 100%;
    }
  `]
})
export class UtilisateursComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['nom', 'email', 'role', 'actif', 'createdAt', 'actions'];
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
        message: `Supprimer l'utilisateur ${utilisateur.nom} ?`
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
}
