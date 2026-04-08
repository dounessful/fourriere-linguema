import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Annuler</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(true)">Confirmer</button>
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

    mat-dialog-content {
      padding: var(--s-2) var(--s-6) var(--s-4);
    }

    mat-dialog-content p {
      margin: 0;
      font-size: 14px;
      color: var(--text-2);
      line-height: 1.5;
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
      background: var(--danger) !important;
      color: #fff !important;
      border-radius: var(--r-md);
      font-weight: 500;
      transition: background var(--t-fast);
    }
    :host ::ng-deep mat-dialog-actions button[mat-raised-button]:hover {
      background: var(--brand-dark) !important;
    }
  `]
})
export class ConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
