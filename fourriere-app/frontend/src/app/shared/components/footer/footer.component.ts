import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="ft">
      <div class="ft-top">
        <a routerLink="/" class="ft-brand">
          <img class="ft-logo" src="assets/logo.png" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
          <span class="ft-mark" style="display:none">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
              <circle cx="6.5" cy="16.5" r="2.5"/>
              <circle cx="16.5" cy="16.5" r="2.5"/>
            </svg>
          </span>
          <span class="ft-name">Linguema Fourrière</span>
        </a>

        <nav class="ft-nav">
          <a routerLink="/">Recherche</a>
          <span class="dot">·</span>
          <a href="#" (click)="$event.preventDefault()">Aide</a>
          <span class="dot">·</span>
          <a href="#" (click)="$event.preventDefault()">FAQ</a>
          <span class="dot">·</span>
          <a href="#" (click)="$event.preventDefault()">Mentions légales</a>
          <span class="dot">·</span>
          <a href="#" (click)="$event.preventDefault()">Confidentialité</a>
        </nav>

        <a class="ft-tel" href="tel:+221338000012" aria-label="Appeler le numéro d'aide">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          +221 33 800 00 12
        </a>
      </div>

      <div class="ft-bot">
        <span>© {{ year }} Linguema Fourrière</span>
        <span class="ft-loc">Dakar · Sénégal</span>
      </div>
    </footer>
  `,
  styles: [`
    .ft {
      border-top: 1px solid var(--border);
      background: linear-gradient(180deg, var(--bg) 0%, #ffffff 100%);
      margin-top: var(--s-12);
    }

    .ft-top {
      max-width: var(--content-max);
      margin: 0 auto;
      padding: var(--s-6) var(--s-6);
      display: flex;
      align-items: center;
      gap: var(--s-6);
      flex-wrap: wrap;

      @media (max-width: 760px) {
        padding: var(--s-5) var(--s-4);
        gap: var(--s-4);
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .ft-brand {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2);
      color: var(--text);
      &:hover { color: var(--text); }
    }
    .ft-logo {
      height: 36px;
      width: auto;
      object-fit: contain;
    }
    .ft-mark {
      width: 28px; height: 28px;
      border-radius: 7px;
      background: var(--brand);
      color: #fff;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .ft-name {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .ft-nav {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--s-3);
      flex: 1;
      justify-content: center;
      font-size: 13px;
      color: var(--text-muted);

      a {
        color: var(--text-muted);
        transition: color var(--t-fast);
        &:hover { color: var(--brand); }
      }

      .dot { color: var(--text-faint); user-select: none; }

      @media (max-width: 760px) {
        justify-content: flex-start;
        gap: var(--s-2);
      }
    }

    .ft-tel {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--surface);
      color: var(--brand-dark);
      border: 1px solid var(--brand-soft-2);
      border-radius: var(--r-pill);
      font-size: 12px;
      font-weight: 600;
      transition: all var(--t-fast);

      &:hover {
        background: var(--brand-soft);
        color: var(--brand-dark);
      }

      svg { color: var(--brand); }
    }

    .ft-bot {
      max-width: var(--content-max);
      margin: 0 auto;
      padding: var(--s-3) var(--s-6);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--text-faint);

      @media (max-width: 600px) {
        padding: var(--s-3) var(--s-4);
      }
    }

    .ft-loc { letter-spacing: 0.02em; }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
