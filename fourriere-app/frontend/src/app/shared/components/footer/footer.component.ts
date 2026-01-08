import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-wave">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0,40 C150,80 350,0 500,40 C650,80 800,20 960,40 C1120,60 1280,10 1440,40 L1440,100 L0,100 Z" fill="currentColor"/>
        </svg>
      </div>

      <div class="footer-content">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="brand-logo">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01Z" fill="currentColor"/>
                  <circle cx="7.5" cy="15.5" r="1.5" fill="var(--color-accent)"/>
                  <circle cx="16.5" cy="15.5" r="1.5" fill="var(--color-accent)"/>
                </svg>
                <span>Fourriere Sénégal</span>
              </div>
              <p class="brand-description">
                Service de recherche de véhicules en fourrière au Sénégal.
                Retrouvez rapidement votre véhicule et les informations nécessaires pour le récupérer.
              </p>
            </div>

            <div class="footer-links">
              <h4>Liens utiles</h4>
              <ul>
                <li><a routerLink="/">Rechercher un véhicule</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Guide de récupération</a></li>
              </ul>
            </div>

            <div class="footer-links">
              <h4>Légal</h4>
              <ul>
                <li><a href="#">Mentions légales</a></li>
                <li><a href="#">Politique de confidentialité</a></li>
                <li><a href="#">Conditions d'utilisation</a></li>
              </ul>
            </div>

            <div class="footer-contact">
              <h4>Contact</h4>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>Dakar, Sénégal</span>
              </div>
              <div class="contact-item">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <a href="mailto:contact@fourriere.sn">contact&#64;fourriere.sn</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div class="copyright">
              <span>&copy; {{ currentYear }} Fourrière Sénégal. Tous droits réservés.</span>
            </div>
            <div class="footer-flag">
              <div class="flag-stripe green"></div>
              <div class="flag-stripe gold">
                <svg viewBox="0 0 24 24" width="12" height="12">
                  <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="flag-stripe red"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      margin-top: auto;
      position: relative;
    }

    .footer-wave {
      height: 50px;
      overflow: hidden;
      color: var(--color-primary-dark);

      svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    .footer-content {
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
      color: white;
      padding: var(--space-10) 0 var(--space-6);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: var(--space-8);
      margin-bottom: var(--space-8);

      @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-6);
      }

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }

    .footer-brand {
      .brand-logo {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-4);

        @media (max-width: 600px) {
          justify-content: center;
        }

        svg {
          width: 36px;
          height: 36px;
          color: white;
        }

        span {
          font-size: 1.25rem;
          font-weight: 700;
        }
      }

      .brand-description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
        line-height: 1.7;
        max-width: 320px;

        @media (max-width: 600px) {
          max-width: none;
        }
      }
    }

    .footer-links {
      h4 {
        color: var(--color-accent);
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-4);
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        margin-bottom: var(--space-3);
      }

      a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        font-size: 0.9rem;
        transition: color var(--transition-fast);

        &:hover {
          color: white;
        }
      }
    }

    .footer-contact {
      h4 {
        color: var(--color-accent);
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-4);
      }

      .contact-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-3);
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;

        @media (max-width: 600px) {
          justify-content: center;
        }

        svg {
          flex-shrink: 0;
          opacity: 0.9;
        }

        a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color var(--transition-fast);

          &:hover {
            color: white;
          }
        }
      }
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-6);
      border-top: 1px solid rgba(255, 255, 255, 0.15);

      @media (max-width: 600px) {
        flex-direction: column;
        gap: var(--space-4);
      }
    }

    .copyright {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
    }

    .footer-flag {
      display: flex;
      height: 24px;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      .flag-stripe {
        width: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.green {
          background-color: #00693e;
        }

        &.gold {
          background-color: #fcd116;
          color: #00693e;
        }

        &.red {
          background-color: #e31b23;
        }
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
