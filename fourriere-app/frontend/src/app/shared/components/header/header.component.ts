import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <header class="hdr">
      <div class="hdr-inner">
        <a routerLink="/" class="brand" aria-label="Linguema accueil">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
              <circle cx="6.5" cy="16.5" r="2.5"/>
              <circle cx="16.5" cy="16.5" r="2.5"/>
            </svg>
          </span>
          <span class="brand-text">
            <span class="brand-name">Linguema</span>
            <span class="brand-sub">Fourrière · Sénégal</span>
          </span>
        </a>

        @if (authService.isAuthenticated()) {
          <nav class="nav">
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            <a routerLink="/admin/transferts" routerLinkActive="active" class="nav-link">Transferts</a>
            @if (authService.isSuperAdmin()) {
              <a routerLink="/admin/fourrieres" routerLinkActive="active" class="nav-link">Fourrières</a>
              <a routerLink="/admin/equipes" routerLinkActive="active" class="nav-link">Équipes</a>
              <a routerLink="/admin/utilisateurs" routerLinkActive="active" class="nav-link">Utilisateurs</a>
            }
          </nav>
        }

        <div class="hdr-end">
          @if (authService.isAuthenticated()) {
            <button class="user-btn" [matMenuTriggerFor]="userMenu" type="button">
              <span class="user-init">{{ initials() }}</span>
              <span class="user-name">{{ authService.utilisateur()?.nom || authService.utilisateur()?.email }}</span>
              <mat-icon class="caret">expand_more</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before">
              <div class="menu-head">
                <div class="menu-name">{{ authService.utilisateur()?.nom }}</div>
                <div class="menu-email">{{ authService.utilisateur()?.email }}</div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="onLogout()">
                <mat-icon>logout</mat-icon>
                <span>Se déconnecter</span>
              </button>
            </mat-menu>
          } @else {
            <button class="login-btn" (click)="onLogin()" type="button">
              Espace administration
            </button>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .hdr {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      backdrop-filter: saturate(180%) blur(8px);
    }

    .hdr-inner {
      max-width: var(--content-max);
      margin: 0 auto;
      height: var(--header-h);
      padding: 0 var(--s-6);
      display: flex;
      align-items: center;
      gap: var(--s-8);

      @media (max-width: 768px) {
        padding: 0 var(--s-4);
        gap: var(--s-4);
      }
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      color: var(--text);
      flex-shrink: 0;

      &:hover { color: var(--text); }
    }

    .brand-mark {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--brand);
      color: #fff;
      border-radius: var(--r-md);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }

    .brand-name {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .brand-sub {
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 0.02em;

      @media (max-width: 600px) { display: none; }
    }

    .nav {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      flex: 1;

      @media (max-width: 900px) { display: none; }
    }

    .nav-link {
      padding: 6px 12px;
      border-radius: var(--r-md);
      color: var(--text-2);
      font-size: 14px;
      font-weight: 500;
      transition: background var(--t-fast), color var(--t-fast);

      &:hover { background: var(--bg-subtle); color: var(--text); }
      &.active { background: var(--brand-soft); color: var(--brand-dark); }
    }

    .hdr-end {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }

    .login-btn {
      height: 36px;
      padding: 0 14px;
      background: var(--brand);
      color: #fff;
      border: none;
      border-radius: var(--r-md);
      font-size: 13px;
      font-weight: 500;
      transition: background var(--t-fast);

      &:hover { background: var(--brand-hover); }
    }

    .user-btn {
      height: 36px;
      padding: 0 10px 0 4px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      color: var(--text);
      display: inline-flex;
      align-items: center;
      gap: var(--s-2);
      font-size: 13px;
      transition: background var(--t-fast), border-color var(--t-fast);

      &:hover { background: var(--bg-subtle); border-color: var(--border-strong); }
    }

    .user-init {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      background: var(--brand);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .user-name {
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;

      @media (max-width: 600px) { display: none; }
    }

    .caret {
      font-size: 16px !important;
      width: 16px !important;
      height: 16px !important;
      color: var(--text-muted);
    }

    ::ng-deep .menu-head {
      padding: var(--s-3) var(--s-4);
    }
    ::ng-deep .menu-name { font-size: 13px; font-weight: 600; color: var(--text); }
    ::ng-deep .menu-email { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);

  initials(): string {
    const u = this.authService.utilisateur();
    const src = (u?.nom || u?.email || '').trim();
    if (!src) return '?';
    const parts = src.split(/[\s.@_-]+/).filter(Boolean);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || src[0].toUpperCase();
  }

  onLogin(): void { this.authService.login(); }
  onLogout(): void { this.authService.logout(); }
}
