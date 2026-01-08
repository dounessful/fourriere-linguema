import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <mat-card class="not-found-card">
        <mat-card-content>
          <mat-icon>error_outline</mat-icon>
          <h1>404</h1>
          <h2>Page non trouvée</h2>
          <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
          <a mat-raised-button color="primary" routerLink="/">
            <mat-icon>home</mat-icon>
            Retour à l'accueil
          </a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-card {
      text-align: center;
      padding: 48px;
      max-width: 500px;
      margin: 48px auto;
    }

    mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f44336;
    }

    h1 {
      font-size: 4rem;
      color: #3f51b5;
      margin: 16px 0 8px;
    }

    h2 {
      color: #666;
      margin-bottom: 16px;
    }

    p {
      color: #888;
      margin-bottom: 24px;
    }
  `]
})
export class NotFoundComponent {}
