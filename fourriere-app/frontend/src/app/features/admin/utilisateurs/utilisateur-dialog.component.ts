import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur, UtilisateurRequest, Role } from '../../../core/models/auth.model';

@Component({
  selector: 'app-utilisateur-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h2>
    <mat-dialog-content>
      <form #form="ngForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom</mat-label>
          <input matInput [(ngModel)]="utilisateur.nom" name="nom" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" [(ngModel)]="utilisateur.email" name="email" required email />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe' }}</mat-label>
          <input
            matInput
            type="password"
            [(ngModel)]="utilisateur.password"
            name="password"
            [required]="!isEdit"
            minlength="6"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Rôle</mat-label>
          <mat-select [(ngModel)]="utilisateur.role" name="role" required>
            <mat-option [value]="Role.ADMIN">Admin</mat-option>
            <mat-option [value]="Role.SUPER_ADMIN">Super Admin</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-checkbox [(ngModel)]="utilisateur.actif" name="actif">
          Compte actif
        </mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Annuler</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="saving || !form.valid">
        @if (saving) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEdit ? 'Enregistrer' : 'Créer' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    mat-checkbox {
      margin-top: 8px;
    }
  `]
})
export class UtilisateurDialogComponent {
  dialogRef = inject(MatDialogRef<UtilisateurDialogComponent>);
  data: Utilisateur | null = inject(MAT_DIALOG_DATA);
  private utilisateurService = inject(UtilisateurService);
  private snackBar = inject(MatSnackBar);

  Role = Role;
  isEdit: boolean;
  saving = false;

  utilisateur: UtilisateurRequest = {
    nom: '',
    email: '',
    password: '',
    role: Role.ADMIN,
    actif: true
  };

  constructor() {
    this.isEdit = !!this.data;
    if (this.data) {
      this.utilisateur = {
        nom: this.data.nom,
        email: this.data.email,
        password: '',
        role: this.data.role,
        actif: this.data.actif
      };
    }
  }

  save(): void {
    this.saving = true;

    const request = this.isEdit
      ? this.utilisateurService.update(this.data!.id, this.utilisateur)
      : this.utilisateurService.create(this.utilisateur);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.isEdit ? 'Utilisateur modifié' : 'Utilisateur créé', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        const message = err.error?.message || 'Erreur lors de l\'enregistrement';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      }
    });
  }
}
