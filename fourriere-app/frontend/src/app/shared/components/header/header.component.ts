import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <header class="header">
      <div class="header-container">
        <a routerLink="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z" fill="currentColor"/>
              <circle cx="7.5" cy="15.5" r="1.5" fill="var(--color-accent)"/>
              <circle cx="16.5" cy="15.5" r="1.5" fill="var(--color-accent)"/>
              <path d="M5.81 10L6.5 7H17.5L18.19 10H5.81Z" fill="var(--color-accent)" opacity="0.7"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-name">Fourriere</span>
            <span class="logo-tagline">Sénégal</span>
          </div>
        </a>

        <div class="header-actions">
          @if (authService.isAuthenticated()) {
            <button mat-button class="user-menu-trigger" [matMenuTriggerFor]="userMenu">
              <div class="user-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <span class="user-name">{{ authService.utilisateur()?.nom || authService.utilisateur()?.email }}</span>
              <mat-icon class="dropdown-icon">expand_more</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" class="user-menu">
              <div class="menu-header">
                <div class="menu-user-info">
                  <span class="menu-user-name">{{ authService.utilisateur()?.nom }}</span>
                  <span class="menu-user-email">{{ authService.utilisateur()?.email }}</span>
                </div>
              </div>
              <mat-divider></mat-divider>
              <a mat-menu-item routerLink="/admin/dashboard">
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </a>
              @if (authService.isSuperAdmin()) {
                <a mat-menu-item routerLink="/admin/fourrieres">
                  <mat-icon>warehouse</mat-icon>
                  <span>Gestion Fourrières</span>
                </a>
                <a mat-menu-item routerLink="/admin/equipes">
                  <mat-icon>groups</mat-icon>
                  <span>Gestion Équipes</span>
                </a>
                <a mat-menu-item routerLink="/admin/utilisateurs">
                  <mat-icon>people</mat-icon>
                  <span>Gestion Utilisateurs</span>
                </a>
              }
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="onLogout()" class="logout-item">
                <mat-icon>logout</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          } @else {
            <button mat-raised-button color="accent" (click)="onLogin()" class="admin-btn">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Espace Admin</span>
            </button>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
      box-shadow: 0 2px 12px rgba(0, 77, 42, 0.15);
    }

    .header-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--space-6);
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-6);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: white;
      text-decoration: none;
      transition: transform var(--transition-fast);

      &:hover {
        transform: scale(1.02);
      }
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;

      svg {
        width: 100%;
        height: 100%;
        color: white;
      }
    }

    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .logo-name {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .logo-tagline {
      font-size: 0.75rem;
      font-weight: 500;
      opacity: 0.85;
      color: var(--color-accent-light);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all var(--transition-fast);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-accent);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--color-primary-dark);
      }
    }

    .user-name {
      font-weight: 500;
      font-size: 0.9rem;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      @media (max-width: 600px) {
        display: none;
      }
    }

    .dropdown-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      opacity: 0.8;
    }

    .admin-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 600;
      background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%) !important;
      color: var(--color-primary-dark) !important;
      border: none;
      padding: 0 var(--space-5);
      height: 42px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        @media (max-width: 600px) {
          display: none;
        }
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(212, 160, 23, 0.4);
      }
    }

    // Menu styles
    ::ng-deep .user-menu {
      margin-top: var(--space-2);
      min-width: 240px;

      .menu-header {
        padding: var(--space-4);
        background: var(--color-primary-50);
      }

      .menu-user-info {
        display: flex;
        flex-direction: column;
      }

      .menu-user-name {
        font-weight: 600;
        color: var(--color-primary-dark);
      }

      .menu-user-email {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }

      .mat-mdc-menu-item {
        height: 48px;

        mat-icon {
          color: var(--color-primary);
          margin-right: var(--space-3);
        }
      }

      .logout-item {
        mat-icon {
          color: var(--color-warn);
        }
      }
    }

    @media (max-width: 768px) {
      .header-container {
        padding: 0 var(--space-4);
        height: 64px;
      }

      .logo-icon {
        width: 38px;
        height: 38px;
      }

      .logo-name {
        font-size: 1.1rem;
      }

      .logo-tagline {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  onLogin(): void {
    this.authService.login();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
