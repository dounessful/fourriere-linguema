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
import { CommuneService } from '../../../core/services/commune.service';
import { Utilisateur, UtilisateurRequest, Role, RoleLabels } from '../../../core/models/auth.model';
import { Commune } from '../../../core/models/commune.model';

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

  Role = Role;
  isEdit: boolean;
  saving = false;
  communes: Commune[] = [];

  utilisateur: UtilisateurRequest = {
    nom: '',
    email: '',
    password: '',
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
        password: '',
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
