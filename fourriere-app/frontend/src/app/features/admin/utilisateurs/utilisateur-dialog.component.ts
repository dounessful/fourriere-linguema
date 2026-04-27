import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { CommuneService } from '../../../core/services/commune.service';
import { Utilisateur, UtilisateurRequest, Role } from '../../../core/models/auth.model';
import { Commune } from '../../../core/models/commune.model';
import { TempPasswordDialogComponent } from './temp-password-dialog.component';

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
    <h2 mat-dialog-title>{{ isEdit ? 'Modifier l\\'utilisateur' : 'Nouvel utilisateur' }}</h2>
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
          <mat-label>Rôle</mat-label>
          <mat-select [(ngModel)]="utilisateur.role" name="role" required (selectionChange)="onRoleChange()">
            <mat-option [value]="Role.ADMIN">Admin</mat-option>
            <mat-option [value]="Role.SUPER_ADMIN">Super Admin</mat-option>
            <mat-option [value]="Role.AGENT_COMMUNE">Agent de commune</mat-option>
          </mat-select>
        </mat-form-field>

        @if (utilisateur.role === Role.AGENT_COMMUNE) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Commune rattachée</mat-label>
            <mat-select [(ngModel)]="utilisateur.communeId" name="communeId" required>
              @for (c of communes; track c.id) {
                <mat-option [value]="c.id">{{ c.nom }}<ng-container *ngIf="c.region"> · {{ c.region }}</ng-container></mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        <mat-checkbox [(ngModel)]="utilisateur.actif" name="actif">
          Compte actif
        </mat-checkbox>

        @if (!isEdit) {
          <p class="info">
            Un mot de passe temporaire sera généré automatiquement.
            L'utilisateur devra le changer à sa première connexion.
          </p>
        }
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
    :host ::ng-deep h2[mat-dialog-title] {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
      padding: var(--s-5) var(--s-6) var(--s-3);
    }

    .full-width {
      width: 100%;
      margin-bottom: var(--s-1);
    }

    :host ::ng-deep .mat-mdc-form-field {
      font-size: 14px;
    }

    :host ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: var(--r-md) !important;
    }

    :host ::ng-deep mat-dialog-content {
      padding: var(--s-2) var(--s-6);
    }

    mat-checkbox {
      margin-top: var(--s-2);
      color: var(--text-2);
    }

    .info {
      margin-top: var(--s-3);
      padding: var(--s-3);
      background: var(--bg-subtle);
      border-radius: var(--r-md);
      font-size: 12px;
      color: var(--text-muted);
    }

    :host ::ng-deep mat-dialog-actions {
      padding: var(--s-4) var(--s-6);
      border-top: 1px solid var(--border);
      gap: var(--s-2);
    }

    :host ::ng-deep mat-dialog-actions button[mat-button] {
      border: 1px solid var(--border-strong);
      border-radius: var(--r-md);
      color: var(--text-2);
      font-weight: 500;
    }

    :host ::ng-deep mat-dialog-actions button[mat-raised-button] {
      background: var(--brand) !important;
      color: #fff !important;
      border-radius: var(--r-md);
      font-weight: 500;
      transition: background var(--t-fast);
    }
    :host ::ng-deep mat-dialog-actions button[mat-raised-button]:hover {
      background: var(--brand-hover) !important;
    }
  `]
})
export class UtilisateurDialogComponent {
  dialogRef = inject(MatDialogRef<UtilisateurDialogComponent>);
  data: Utilisateur | null = inject(MAT_DIALOG_DATA);
  private utilisateurService = inject(UtilisateurService);
  private communeService = inject(CommuneService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  Role = Role;
  isEdit: boolean;
  saving = false;
  communes: Commune[] = [];

  utilisateur: UtilisateurRequest = {
    nom: '',
    email: '',
    role: Role.ADMIN,
    communeId: undefined,
    actif: true
  };

  constructor() {
    this.isEdit = !!this.data;
    if (this.data) {
      this.utilisateur = {
        nom: this.data.nom,
        email: this.data.email,
        role: this.data.role,
        communeId: this.data.communeId,
        actif: this.data.actif
      };
    }
    this.communeService.getAllActive().subscribe({
      next: (list) => this.communes = list
    });
  }

  onRoleChange(): void {
    if (this.utilisateur.role !== Role.AGENT_COMMUNE) {
      this.utilisateur.communeId = undefined;
    }
  }

  save(): void {
    this.saving = true;

    if (this.isEdit) {
      this.utilisateurService.update(this.data!.id, this.utilisateur).subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Utilisateur modifié', 'OK', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.utilisateurService.create(this.utilisateur).subscribe({
        next: (result) => {
          this.saving = false;
          this.dialogRef.close(true);
          // Affiche le mot de passe temporaire — visible une seule fois
          this.dialog.open(TempPasswordDialogComponent, {
            width: '480px',
            disableClose: true,
            data: {
              title: 'Utilisateur créé',
              subtitle: 'Transmettez ces identifiants à l\'utilisateur :',
              email: result.utilisateur.email,
              password: result.temporaryPassword
            }
          });
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.saving = false;
    const message = err.error?.message || 'Erreur lors de l\'enregistrement';
    this.snackBar.open(message, 'OK', { duration: 5000 });
  }
}
