import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FourriereService } from '../../../core/services/fourriere.service';
import { EquipeService } from '../../../core/services/equipe.service';
import { TransfertService } from '../../../core/services/transfert.service';
import { Fourriere } from '../../../core/models/fourriere.model';
import { Equipe } from '../../../core/models/equipe.model';
import { MotifTransfert, MotifTransfertLabels } from '../../../core/models/transfert.model';
import { Vehicule } from '../../../core/models/vehicule.model';

export interface TransfertDialogData {
  vehicule: Vehicule;
}

@Component({
  selector: 'app-transfert-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>swap_horiz</mat-icon>
      Transférer le véhicule {{ data.vehicule.immatriculation }}
    </h2>

    <mat-dialog-content>
      <p class="source-info">
        <strong>Fourrière actuelle :</strong> {{ data.vehicule.nomFourriere }}
        <ng-container *ngIf="data.vehicule.villeFourriere"> ({{ data.vehicule.villeFourriere }})</ng-container>
      </p>

      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Fourrière de destination</mat-label>
          <mat-select formControlName="fourriereDestinationId" required>
            <mat-option *ngFor="let f of fourrieres" [value]="f.id" [disabled]="f.id === data.vehicule.fourriereId">
              {{ f.nom }} <span *ngIf="f.ville">— {{ f.ville }}</span>
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('fourriereDestinationId')?.hasError('required')">
            Champ obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Motif</mat-label>
          <mat-select formControlName="motif" required>
            <mat-option *ngFor="let m of motifs" [value]="m.value">{{ m.label }}</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('motif')?.hasError('required')">
            Champ obligatoire
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Équipe (optionnel)</mat-label>
          <mat-select formControlName="equipeTransfertId">
            <mat-option [value]="null">— Aucune —</mat-option>
            <mat-option *ngFor="let e of equipes" [value]="e.id">{{ e.nom }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Commentaire (optionnel)</mat-label>
          <textarea matInput formControlName="commentaire" rows="3" maxlength="500"></textarea>
        </mat-form-field>
      </form>

      <p *ngIf="error" class="error-msg">{{ error }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close()" [disabled]="submitting">Annuler</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid || submitting">
        <mat-icon *ngIf="!submitting">swap_horiz</mat-icon>
        <mat-spinner *ngIf="submitting" diameter="18"></mat-spinner>
        <span>Transférer</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { display: flex; align-items: center; gap: 8px; }
    .source-info { margin: 0 0 16px; color: var(--color-text-muted); }
    .form { display: flex; flex-direction: column; gap: 4px; min-width: 420px; }
    .full { width: 100%; }
    .error-msg { color: var(--color-warn); margin-top: 8px; }
    button mat-spinner { display: inline-block; margin-right: 6px; }
  `]
})
export class TransfertDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fourriereService = inject(FourriereService);
  private equipeService = inject(EquipeService);
  private transfertService = inject(TransfertService);
  private dialogRef = inject(MatDialogRef<TransfertDialogComponent>);

  fourrieres: Fourriere[] = [];
  equipes: Equipe[] = [];
  motifs = Object.entries(MotifTransfertLabels).map(([value, label]) => ({ value, label }));
  submitting = false;
  error: string | null = null;

  form = this.fb.group({
    fourriereDestinationId: [null as number | null, Validators.required],
    motif: [MotifTransfert.SURCHARGE as MotifTransfert, Validators.required],
    equipeTransfertId: [null as number | null],
    commentaire: ['']
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: TransfertDialogData) {}

  ngOnInit(): void {
    this.fourriereService.getAllActive().subscribe(list => this.fourrieres = list);
    this.equipeService.getAllActive().subscribe(list => this.equipes = list);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = null;
    const v = this.form.value;
    this.transfertService.transferer(this.data.vehicule.id, {
      fourriereDestinationId: v.fourriereDestinationId!,
      motif: v.motif!,
      equipeTransfertId: v.equipeTransfertId ?? undefined,
      commentaire: v.commentaire ?? undefined
    }).subscribe({
      next: (transfert) => {
        this.submitting = false;
        this.dialogRef.close(transfert);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || 'Erreur lors du transfert';
      }
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
