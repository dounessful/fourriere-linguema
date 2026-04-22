import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommuneService } from '../../../core/services/commune.service';
import { Commune, CommuneRequest } from '../../../core/models/commune.model';

@Component({
  selector: 'app-commune-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data ? 'edit' : 'add' }}</mat-icon>
      {{ data ? 'Modifier la commune' : 'Nouvelle commune' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="commune-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nom de la commune</mat-label>
            <input matInput formControlName="nom" placeholder="Dakar-Plateau">
            @if (form.get('nom')?.hasError('required')) {
              <mat-error>Le nom est obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Région</mat-label>
            <input matInput formControlName="region" placeholder="Dakar">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone" placeholder="+221 XX XXX XX XX">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="contact@commune.sn">
            @if (form.get('email')?.hasError('email')) {
              <mat-error>Format d'email invalide</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse</mat-label>
          <input matInput formControlName="adresse" placeholder="Hôtel de ville">
        </mat-form-field>

        <mat-slide-toggle formControlName="active" color="primary">Commune active</mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid || saving">
        {{ saving ? 'Enregistrement...' : (data ? 'Modifier' : 'Créer') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex; align-items: center; gap: var(--s-2);
      font-size: 18px; font-weight: 600; color: var(--text);
      margin: 0; padding: var(--s-5) var(--s-6) var(--s-3);
      mat-icon { color: var(--brand); font-size: 20px; width: 20px; height: 20px; }
    }
    .commune-form { display: flex; flex-direction: column; gap: var(--s-2); min-width: 500px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3); }
    .full-width { width: 100%; }
    mat-form-field { width: 100%; }
    mat-dialog-actions {
      padding: var(--s-4) var(--s-6);
      border-top: 1px solid var(--border);
      gap: var(--s-2);
    }
    button[mat-button] {
      border: 1px solid var(--border-strong);
      border-radius: var(--r-md);
      height: 40px;
      padding: 0 var(--s-4);
      color: var(--text);
    }
    button[mat-button]:hover { background: var(--bg-subtle); }
  `]
})
export class CommuneDialogComponent {
  private fb = inject(FormBuilder);
  private communeService = inject(CommuneService);
  private dialogRef = inject(MatDialogRef<CommuneDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data: Commune | null = inject(MAT_DIALOG_DATA, { optional: true });

  saving = false;
  form = this.fb.group({
    nom: [this.data?.nom ?? '', [Validators.required, Validators.maxLength(120)]],
    region: [this.data?.region ?? ''],
    telephone: [this.data?.telephone ?? ''],
    email: [this.data?.email ?? '', [Validators.email]],
    adresse: [this.data?.adresse ?? ''],
    active: [this.data?.active ?? true]
  });

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const req = this.form.value as CommuneRequest;
    const action = this.data
      ? this.communeService.update(this.data.id, req)
      : this.communeService.create(req);
    action.subscribe({
      next: (res) => {
        this.snackBar.open(this.data ? 'Commune mise à jour' : 'Commune créée', 'OK', { duration: 2500 });
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err?.error?.message || 'Erreur', 'OK', { duration: 3000 });
      }
    });
  }
}
