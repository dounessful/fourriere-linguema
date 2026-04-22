import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EquipeService } from '../../../core/services/equipe.service';
import { FourriereService } from '../../../core/services/fourriere.service';
import { Equipe, EquipeRequest } from '../../../core/models/equipe.model';
import { Fourriere } from '../../../core/models/fourriere.model';

@Component({
  selector: 'app-equipe-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data ? 'edit' : 'add' }}</mat-icon>
      {{ data ? "Modifier l'équipe" : 'Nouvelle équipe' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="equipe-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom de l'équipe</mat-label>
          <input matInput formControlName="nom" placeholder="Équipe Dakar Centre">
          @if (form.get('nom')?.hasError('required')) {
            <mat-error>Le nom est obligatoire</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2" placeholder="Description de l'équipe"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fourrière assignée</mat-label>
          <mat-select formControlName="fourriereAssigneeId">
            <mat-option [value]="null">Aucune</mat-option>
            @for (f of fourrieres(); track f.id) {
              <mat-option [value]="f.id">{{ f.nom }} - {{ f.ville }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-slide-toggle formControlName="active" color="primary">
          Équipe active
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

    .equipe-form {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      min-width: 400px;
      padding: 0 var(--s-2);
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
      .equipe-form {
        min-width: auto;
      }
    }
  `]
})
export class EquipeDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private equipeService = inject(EquipeService);
  private fourriereService = inject(FourriereService);
  private dialogRef = inject(MatDialogRef<EquipeDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data: Equipe | null = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  saving = false;
  fourrieres = signal<Fourriere[]>([]);

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: [this.data?.nom || '', Validators.required],
      description: [this.data?.description || ''],
      fourriereAssigneeId: [this.data?.fourriereAssigneeId || null],
      active: [this.data?.active ?? true]
    });

    this.loadFourrieres();
  }

  loadFourrieres(): void {
    this.fourriereService.getAllActive().subscribe({
      next: (data) => this.fourrieres.set(data),
      error: () => this.snackBar.open('Erreur lors du chargement des fourrières', 'Fermer', { duration: 3000 })
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const request: EquipeRequest = this.form.value;

    const operation = this.data
      ? this.equipeService.update(this.data.id, request)
      : this.equipeService.create(request);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.data ? 'Équipe modifiée avec succès' : 'Équipe créée avec succès',
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
