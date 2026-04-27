import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';

interface TempPasswordData {
  title: string;
  subtitle: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-temp-password-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatTooltipModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p class="subtitle">{{ data.subtitle }}</p>

      <div class="warn">
        <mat-icon>warning</mat-icon>
        <span>Ce mot de passe ne sera <strong>plus jamais affiché</strong>. Copiez-le maintenant et transmettez-le à l'utilisateur par un canal sécurisé.</span>
      </div>

      <div class="field">
        <label>Email</label>
        <div class="value">{{ data.email }}</div>
      </div>

      <div class="field">
        <label>Mot de passe temporaire</label>
        <div class="password-row">
          <code>{{ data.password }}</code>
          <button mat-icon-button (click)="copy()" matTooltip="Copier">
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
      </div>

      <p class="info">
        L'utilisateur devra définir son propre mot de passe à la première connexion.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="dialogRef.close()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host ::ng-deep h2[mat-dialog-title] {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0;
      padding: var(--s-5) var(--s-6) var(--s-2);
    }
    :host ::ng-deep mat-dialog-content {
      padding: var(--s-2) var(--s-6);
      min-width: 400px;
    }
    .subtitle {
      color: var(--text-2);
      margin-bottom: var(--s-4);
    }
    .warn {
      display: flex;
      gap: var(--s-2);
      align-items: flex-start;
      padding: var(--s-3);
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: var(--r-md);
      font-size: 13px;
      color: #78350f;
      margin-bottom: var(--s-4);
    }
    .warn mat-icon {
      color: #b45309;
      flex-shrink: 0;
    }
    .field {
      margin-bottom: var(--s-3);
    }
    .field label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .field .value {
      font-size: 14px;
      color: var(--text-2);
    }
    .password-row {
      display: flex;
      align-items: center;
      gap: var(--s-2);
    }
    .password-row code {
      flex: 1;
      padding: var(--s-2) var(--s-3);
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 14px;
      color: var(--text);
      word-break: break-all;
    }
    .info {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: var(--s-2);
    }
    :host ::ng-deep mat-dialog-actions {
      padding: var(--s-4) var(--s-6);
      border-top: 1px solid var(--border);
    }
    :host ::ng-deep mat-dialog-actions button[mat-raised-button] {
      background: var(--brand) !important;
      color: #fff !important;
      border-radius: var(--r-md);
    }
  `]
})
export class TempPasswordDialogComponent {
  dialogRef = inject(MatDialogRef<TempPasswordDialogComponent>);
  data: TempPasswordData = inject(MAT_DIALOG_DATA);
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  copy(): void {
    this.clipboard.copy(this.data.password);
    this.snackBar.open('Mot de passe copié', 'OK', { duration: 2000 });
  }
}
