import { Component, OnInit, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehiculeService } from '../../../core/services/vehicule.service';
import { FourriereService } from '../../../core/services/fourriere.service';
import { Vehicule, VehiculeRequest, MotifEnlevement, MotifEnlevementLabels } from '../../../core/models/vehicule.model';
import { Fourriere } from '../../../core/models/fourriere.model';
import { CarteLeafletComponent } from '../../../shared/components/carte-leaflet/carte-leaflet.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    CarteLeafletComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>{{ isEdit ? 'Modifier le véhicule' : 'Nouveau véhicule' }}</h1>
        <a mat-button routerLink="/admin/dashboard">
          <mat-icon>arrow_back</mat-icon>
          Retour
        </a>
      </div>

      @if (pageLoading) {
        <app-loading-spinner></app-loading-spinner>
      } @else {
        <form (ngSubmit)="save()" #vehiculeForm="ngForm">
          <div class="form-grid">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Informations du véhicule</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Immatriculation</mat-label>
                    <input
                      matInput
                      [(ngModel)]="vehicule.immatriculation"
                      name="immatriculation"
                      required
                      placeholder="AA-123-BB"
                    />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>N° de série (optionnel)</mat-label>
                    <input matInput [(ngModel)]="vehicule.numeroSerie" name="numeroSerie" placeholder="VIN / Chassis" />
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Marque</mat-label>
                    <input matInput [(ngModel)]="vehicule.marque" name="marque" required />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Modèle</mat-label>
                    <input matInput [(ngModel)]="vehicule.modele" name="modele" required />
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Couleur</mat-label>
                    <input matInput [(ngModel)]="vehicule.couleur" name="couleur" required />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Date d'entrée</mat-label>
                    <input
                      matInput
                      [matDatepicker]="picker"
                      [(ngModel)]="dateEntree"
                      name="dateEntree"
                      required
                    />
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Motif d'enlèvement</mat-label>
                  <mat-select [(ngModel)]="vehicule.motifEnlevement" name="motifEnlevement" required>
                    @for (motif of motifs; track motif.value) {
                      <mat-option [value]="motif.value">{{ motif.label }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-card-title>Fourrière</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Sélectionner une fourrière</mat-label>
                  <mat-select [(ngModel)]="vehicule.fourriereId" name="fourriereId" required (selectionChange)="onFourriereChange()">
                    @for (f of fourrieres(); track f.id) {
                      <mat-option [value]="f.id">
                        {{ f.nom }} - {{ f.ville || f.adresse }}
                      </mat-option>
                    }
                  </mat-select>
                  <mat-hint>Les informations seront remplies automatiquement</mat-hint>
                </mat-form-field>

                @if (selectedFourriere()) {
                  <div class="fourriere-info">
                    <div class="info-row">
                      <mat-icon>location_on</mat-icon>
                      <span>{{ selectedFourriere()?.adresse }}</span>
                    </div>
                    @if (selectedFourriere()?.telephone) {
                      <div class="info-row">
                        <mat-icon>phone</mat-icon>
                        <span>{{ selectedFourriere()?.telephone }}</span>
                      </div>
                    }
                    @if (selectedFourriere()?.tarifJournalier) {
                      <div class="info-row">
                        <mat-icon>payments</mat-icon>
                        <span>{{ selectedFourriere()?.tarifJournalier | number:'1.0-0' }} FCFA/jour</span>
                      </div>
                    }
                  </div>

                  <div class="map-section">
                    <p>Emplacement de la fourrière :</p>
                    <app-carte-leaflet
                      [latitude]="selectedFourriere()?.latitude ?? null"
                      [longitude]="selectedFourriere()?.longitude ?? null"
                      [interactive]="false"
                    ></app-carte-leaflet>
                  </div>
                } @else {
                  <div class="no-fourriere-message">
                    <mat-icon>info</mat-icon>
                    <p>Sélectionnez une fourrière pour voir ses informations et son emplacement sur la carte.</p>
                  </div>
                }
              </mat-card-content>
            </mat-card>

            @if (isEdit && existingVehicule) {
              <mat-card class="photos-card">
                <mat-card-header>
                  <mat-card-title>Photos</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="photos-grid">
                    @for (photo of existingVehicule.photos; track photo; let i = $index) {
                      <div class="photo-item">
                        <img [src]="photo" alt="Photo véhicule" />
                        <button mat-icon-button color="warn" (click)="deletePhoto(i)" type="button">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    }
                    @if (!existingVehicule.photos || existingVehicule.photos.length < 5) {
                      <div class="photo-upload">
                        <input type="file" #fileInput accept="image/*" (change)="uploadPhoto($event)" hidden />
                        <button mat-stroked-button type="button" (click)="fileInput.click()" [disabled]="uploading">
                          @if (uploading) {
                            <mat-spinner diameter="20"></mat-spinner>
                          } @else {
                            <mat-icon>add_photo_alternate</mat-icon>
                            Ajouter
                          }
                        </button>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/admin/dashboard">Annuler</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="saving || !vehiculeForm.valid">
              @if (saving) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ isEdit ? 'Enregistrer' : 'Créer' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: var(--content-max);
      margin: 0 auto;
      padding: var(--s-6) var(--s-4);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--s-6);
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-5);

      @media (max-width: 820px) { grid-template-columns: 1fr; }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-4);
      margin-bottom: var(--s-3);

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .full-width { width: 100%; margin-bottom: var(--s-3); }

    mat-form-field {
      width: 100%;
      // Rétablir le subscript pour laisser de l'espace entre les champs dans les formulaires
      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: block;
      }
    }

    .fourriere-info {
      margin-top: var(--s-4);
      padding: var(--s-4);
      background: var(--brand-soft);
      border: 1px solid var(--brand-soft-2);
      border-radius: var(--r-md);
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin-bottom: var(--s-2);
      font-size: 14px;
      color: var(--text-2);

      mat-icon {
        color: var(--brand);
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      &:last-child { margin-bottom: 0; }
    }

    .no-fourriere-message {
      display: flex;
      align-items: flex-start;
      gap: var(--s-3);
      padding: var(--s-4);
      background: var(--bg-subtle);
      border: 1px dashed var(--border);
      border-radius: var(--r-md);
      margin-top: var(--s-4);

      mat-icon { color: var(--text-faint); flex-shrink: 0; }
      p { margin: 0; color: var(--text-muted); font-size: 14px; }
    }

    .map-section { margin-top: var(--s-4); }
    .map-section p {
      margin-bottom: var(--s-2);
      font-size: 13px;
      color: var(--text-muted);
    }
    .map-section ::ng-deep .leaflet-container {
      height: 200px;
      border-radius: var(--r-md);
      border: 1px solid var(--border);
    }

    .photos-card { grid-column: 1 / -1; }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--s-3);
    }

    .photo-item {
      position: relative;
      border-radius: var(--r-md);
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .photo-item img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      display: block;
    }
    .photo-item button {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--surface);
      border-radius: 50%;
      box-shadow: var(--shadow-1);
    }

    .photo-upload {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 110px;
      border: 2px dashed var(--border);
      border-radius: var(--r-md);
      background: var(--bg-subtle);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--s-3);
      margin-top: var(--s-6);
      padding-top: var(--s-5);
      border-top: 1px solid var(--border);
    }
  `]
})
export class VehiculeFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehiculeService = inject(VehiculeService);
  private fourriereService = inject(FourriereService);
  private snackBar = inject(MatSnackBar);

  @ViewChild(CarteLeafletComponent) carteLeaflet!: CarteLeafletComponent;

  isEdit = false;
  pageLoading = false;
  saving = false;
  uploading = false;

  existingVehicule: Vehicule | null = null;
  dateEntree = new Date();

  fourrieres = signal<Fourriere[]>([]);
  selectedFourriere = signal<Fourriere | null>(null);

  vehicule: VehiculeRequest = {
    immatriculation: '',
    numeroSerie: '',
    marque: '',
    modele: '',
    couleur: '',
    dateEntree: '',
    motifEnlevement: MotifEnlevement.STATIONNEMENT_INTERDIT,
    fourriereId: 0
  };

  motifs = Object.entries(MotifEnlevementLabels).map(([value, label]) => ({ value, label }));

  ngOnInit(): void {
    this.loadFourrieres();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loadVehicule(+id);
    }
  }

  private loadFourrieres(): void {
    this.fourriereService.getAllActive().subscribe({
      next: (data) => {
        this.fourrieres.set(data);
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des fourrières', 'OK', { duration: 3000 });
      }
    });
  }

  private loadVehicule(id: number): void {
    this.pageLoading = true;
    this.vehiculeService.getById(id).subscribe({
      next: (v) => {
        this.existingVehicule = v;
        this.vehicule = {
          immatriculation: v.immatriculation,
          numeroSerie: v.numeroSerie,
          marque: v.marque,
          modele: v.modele,
          couleur: v.couleur,
          dateEntree: v.dateEntree,
          motifEnlevement: v.motifEnlevement,
          fourriereId: v.fourriereId || 0
        };
        this.dateEntree = new Date(v.dateEntree);

        // Sélectionner la fourrière si elle existe
        if (v.fourriereId) {
          const fourriere = this.fourrieres().find(f => f.id === v.fourriereId);
          if (fourriere) {
            this.selectedFourriere.set(fourriere);
          }
        }

        this.pageLoading = false;
      },
      error: () => {
        this.snackBar.open('Véhicule non trouvé', 'OK', { duration: 3000 });
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  onFourriereChange(): void {
    const fourriere = this.fourrieres().find(f => f.id === this.vehicule.fourriereId);
    this.selectedFourriere.set(fourriere || null);
  }

  save(): void {
    this.saving = true;
    this.vehicule.dateEntree = this.dateEntree.toISOString();

    const request = this.isEdit
      ? this.vehiculeService.update(this.existingVehicule!.id, this.vehicule)
      : this.vehiculeService.create(this.vehicule);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.isEdit ? 'Véhicule modifié' : 'Véhicule créé', 'OK', { duration: 3000 });
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.saving = false;
        const message = err.error?.message || 'Erreur lors de l\'enregistrement';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      }
    });
  }

  uploadPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.existingVehicule) return;

    const file = input.files[0];
    this.uploading = true;

    this.vehiculeService.uploadPhoto(this.existingVehicule.id, file).subscribe({
      next: (v) => {
        this.existingVehicule = v;
        this.uploading = false;
        this.snackBar.open('Photo ajoutée', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.uploading = false;
        const message = err.error?.message || 'Erreur lors de l\'upload';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      }
    });

    input.value = '';
  }

  deletePhoto(index: number): void {
    if (!this.existingVehicule) return;

    this.vehiculeService.deletePhoto(this.existingVehicule.id, index).subscribe({
      next: (v) => {
        this.existingVehicule = v;
        this.snackBar.open('Photo supprimée', 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Erreur lors de la suppression', 'OK', { duration: 3000 });
      }
    });
  }
}
