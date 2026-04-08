import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FourriereService } from '../../../core/services/fourriere.service';
import { Fourriere, FourriereRequest } from '../../../core/models/fourriere.model';

@Component({
  selector: 'app-fourriere-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data ? 'edit' : 'add' }}</mat-icon>
      {{ data ? 'Modifier la fourrière' : 'Nouvelle fourrière' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="fourriere-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" placeholder="Nom de la fourrière">
            @if (form.get('nom')?.hasError('required')) {
              <mat-error>Le nom est obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone" placeholder="+221 XX XXX XX XX">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Adresse</mat-label>
          <textarea matInput formControlName="adresse" rows="2" placeholder="Adresse complète"></textarea>
          @if (form.get('adresse')?.hasError('required')) {
            <mat-error>L'adresse est obligatoire</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Ville</mat-label>
            <input matInput formControlName="ville" placeholder="Dakar">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Région</mat-label>
            <input matInput formControlName="region" placeholder="Dakar">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" placeholder="contact@fourriere.sn">
          @if (form.get('email')?.hasError('email')) {
            <mat-error>Format d'email invalide</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Latitude</mat-label>
            <input matInput formControlName="latitude" type="number" step="0.000001" placeholder="14.6937">
            @if (form.get('latitude')?.hasError('required')) {
              <mat-error>La latitude est obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Longitude</mat-label>
            <input matInput formControlName="longitude" type="number" step="0.000001" placeholder="-17.4441">
            @if (form.get('longitude')?.hasError('required')) {
              <mat-error>La longitude est obligatoire</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Tarif journalier (FCFA)</mat-label>
            <input matInput formControlName="tarifJournalier" type="number" placeholder="5000">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Capacité maximale</mat-label>
            <input matInput formControlName="capaciteMax" type="number" placeholder="100">
          </mat-form-field>
        </div>

        <mat-slide-toggle formControlName="active" color="primary">
          Fourrière active
        </mat-slide-toggle>
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
      display: flex;
      align-items: center;
      gap: var(--s-2);
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
      padding: var(--s-5) var(--s-6) var(--s-3);

      mat-icon {
        color: var(--brand);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .fourriere-form {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      min-width: 500px;
      padding: 0 var(--s-2);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-4);
    }

    .full-width {
      width: 100%;
    }

    :host ::ng-deep .mat-mdc-form-field {
      font-size: 14px;
    }

    :host ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: var(--r-md) !important;
    }

    mat-slide-toggle {
      margin-top: var(--s-2);
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

    @media (max-width: 600px) {
      .fourriere-form {
        min-width: auto;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FourriereDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fourriereService = inject(FourriereService);
  private dialogRef = inject(MatDialogRef<FourriereDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data: Fourriere | null = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  saving = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: [this.data?.nom || '', Validators.required],
      adresse: [this.data?.adresse || '', Validators.required],
      ville: [this.data?.ville || ''],
      region: [this.data?.region || ''],
      telephone: [this.data?.telephone || ''],
      email: [this.data?.email || '', Validators.email],
      latitude: [this.data?.latitude || 14.6937, Validators.required],
      longitude: [this.data?.longitude || -17.4441, Validators.required],
      tarifJournalier: [this.data?.tarifJournalier || null],
      capaciteMax: [this.data?.capaciteMax || null],
      active: [this.data?.active ?? true]
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const request: FourriereRequest = this.form.value;

    const operation = this.data
      ? this.fourriereService.update(this.data.id, request)
      : this.fourriereService.create(request);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.data ? 'Fourrière modifiée avec succès' : 'Fourrière créée avec succès',
          'Fermer',
          { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(
          err.error?.message || 'Une erreur est survenue',
          'Fermer',
          { duration: 3000 }
        );
      }
    });
  }
}
