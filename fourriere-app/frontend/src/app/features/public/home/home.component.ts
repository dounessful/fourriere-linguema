import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VehiculeService } from '../../../core/services/vehicule.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  template: `
    <main class="home">
      <!-- ============ FOLD : Hero + How visibles ensemble ============ -->
      <div class="fold">

      <!-- ============ HERO ============ -->
      <section class="hero">
        <div class="hero-bg" aria-hidden="true">
          <div class="blob blob-1"></div>
          <svg class="grid-pattern" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
        </div>

        <div class="hero-inner">
          <h1 class="hero-title">
            Retrouvez
            <span class="highlight">
              votre véhicule.
              <svg class="underline" viewBox="0 0 220 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
                <path d="M2 8 Q 55 2 110 6 T 218 5" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
              </svg>
            </span>
          </h1>

          <p class="hero-lede">Recherche par plaque d'immatriculation.</p>

          <form (ngSubmit)="rechercher()" class="search">
            <div class="search-field" [class.has-error]="!!error" [class.is-focused]="focused">
              <span class="search-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                [(ngModel)]="immatriculation"
                name="immatriculation"
                (input)="sanitizeInput()"
                (focus)="focused = true"
                (blur)="focused = false"
                [disabled]="loading"
                placeholder="DK-123-AB"
                aria-label="Plaque d'immatriculation"
                autocomplete="off"
                spellcheck="false"
              />
              <button type="submit" class="search-submit" [disabled]="loading || !immatriculation">
                @if (loading) {
                  <mat-spinner diameter="18" strokeWidth="2"></mat-spinner>
                } @else {
                  <span>Rechercher</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                }
              </button>
            </div>

            @if (error) {
              <div class="error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ error }}</span>
              </div>
            }
          </form>

          <div class="hint">
            Insensible aux espaces et tirets · essayez
            <button type="button" class="example-link" (click)="useExample('DK123AB')">DK123AB</button>
            <button type="button" class="example-link" (click)="useExample('TH-2345-CD')">TH-2345-CD</button>
          </div>
        </div>
      </section>

      <!-- ============ HOW ============ -->
      <section class="how">
        <div class="container">
          <header class="section-head">
            <h2 class="section-title">Comment ça marche</h2>
            <p class="section-sub">Trois étapes simples pour récupérer votre véhicule.</p>
          </header>

          <ol class="cols">
            <li class="col">
              <div class="col-head">
                <div class="col-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3>Recherchez</h3>
              </div>
              <p>Saisissez la plaque d'immatriculation de votre véhicule. La recherche est instantanée.</p>
            </li>

            <li class="col">
              <div class="col-head">
                <div class="col-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <polyline points="9 15 11 17 15 13"/>
                  </svg>
                </div>
                <h3>Vérifiez</h3>
              </div>
              <p>Consultez la fourrière sur la carte, le motif d'enlèvement et l'estimation des frais.</p>
            </li>

            <li class="col">
              <div class="col-head">
                <div class="col-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                </div>
                <h3>Récupérez</h3>
              </div>
              <p>Présentez-vous avec votre carte grise et une pièce d'identité valide.</p>
            </li>
          </ol>

          <a class="scroll-cue" href="#more" aria-label="Voir plus">
            <span>En savoir plus</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </a>
        </div>
      </section>

      </div>
      <!-- ============ /FOLD ============ -->

      <!-- ============ FAQ ============ -->
      <a id="more"></a>
      <section class="faq">
        <div class="container">
          <header class="section-head">
            <h2 class="section-title">Questions fréquentes</h2>
            <p class="section-sub">Tout ce que vous devez savoir avant de récupérer votre véhicule.</p>
          </header>

          <div class="faq-grid">
            <details class="faq-item">
              <summary>
                <span class="q-text">Que faire si la recherche ne trouve pas mon véhicule&nbsp;?</span>
                <span class="chev" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </summary>
              <div class="answer">Vérifiez la plaque saisie. Si votre véhicule n'apparaît pas, il n'a peut-être pas encore été enregistré ou n'est pas en fourrière. Contactez notre numéro d'aide.</div>
            </details>

            <details class="faq-item">
              <summary>
                <span class="q-text">Quels documents apporter pour récupérer mon véhicule&nbsp;?</span>
                <span class="chev" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </summary>
              <div class="answer">La <strong>carte grise originale</strong> et une <strong>pièce d'identité valide</strong>. Si vous n'êtes pas le propriétaire, une procuration signée est exigée.</div>
            </details>

            <details class="faq-item">
              <summary>
                <span class="q-text">Comment sont calculés les frais&nbsp;?</span>
                <span class="chev" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </summary>
              <div class="answer">Tarif journalier propre à chaque fourrière × nombre de jours passés en fourrière. Des frais administratifs peuvent s'ajouter.</div>
            </details>

            <details class="faq-item">
              <summary>
                <span class="q-text">Le coût affiché est-il définitif&nbsp;?</span>
                <span class="chev" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </summary>
              <div class="answer">Le coût affiché est <strong>indicatif</strong>. Le montant final peut inclure des frais administratifs ou de remorquage facturés sur place.</div>
            </details>

            <details class="faq-item">
              <summary>
                <span class="q-text">Le service de recherche est-il payant&nbsp;?</span>
                <span class="chev" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </summary>
              <div class="answer">Non. La recherche sur Linguema est <strong>entièrement gratuite et anonyme</strong>. Aucune information personnelle n'est demandée.</div>
            </details>

            <details class="faq-item">
              <summary>
                <span class="q-text">À qui m'adresser en cas de litige&nbsp;?</span>
                <span class="chev" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </span>
              </summary>
              <div class="answer">Adressez-vous directement à la fourrière concernée puis, en cas de besoin, aux services compétents de votre commune.</div>
            </details>
          </div>
        </div>
      </section>

      <!-- ============ HELP ============ -->
      <section class="help">
        <div class="container">
          <div class="help-card">
            <div class="help-text">
              <span class="eyebrow">Besoin d'aide&nbsp;?</span>
              <h2>Notre équipe est joignable du lundi au samedi.</h2>
              <p>Une question ou un problème pour récupérer votre véhicule&nbsp;? Nous vous répondons dans la journée.</p>
            </div>
            <div class="help-actions">
              <a class="help-tel" href="tel:+221338000012">
                <span class="tel-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <span class="tel-content">
                  <span class="tel-label">Numéro d'aide</span>
                  <span class="tel-num">+221 33 800 00 12</span>
                </span>
              </a>
              <a class="help-mail" href="mailto:aide@linguema.sn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                aide&#64;linguema.sn
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .home { display: flex; flex-direction: column; }

    /* ============================ FOLD ============================ */
    /* Container hero + how qui occupe la fenêtre visible
       sur écrans suffisamment hauts. Sur mobile/petits écrans : flux normal. */
    .fold {
      display: flex;
      flex-direction: column;
      position: relative;

      @media (min-height: 760px) and (min-width: 880px) {
        min-height: calc(100vh - var(--header-h));
      }
    }

    /* ============================ HERO ============================ */
    .hero {
      position: relative;
      overflow: hidden;
      padding: var(--s-12) var(--s-6) var(--s-8);
      background:
        radial-gradient(ellipse 70% 50% at 50% 0%, rgba(254, 226, 226, 0.55) 0%, transparent 70%),
        linear-gradient(180deg, #ffffff 0%, var(--bg) 100%);
      display: flex;
      align-items: center;
      justify-content: center;

      @media (min-height: 760px) and (min-width: 880px) {
        flex: 1.1;
        padding: var(--s-10) var(--s-6) var(--s-6);
      }

      @media (max-width: 768px) { padding: var(--s-16) var(--s-4) var(--s-12); }
    }

    .hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .grid-pattern { position: absolute; inset: 0; color: #b91c1c; opacity: 0.04; }
    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);
    }
    .blob-1 {
      width: 460px; height: 460px;
      background: radial-gradient(circle, #fca5a5 0%, transparent 70%);
      top: -160px; right: -120px;
      opacity: 0.4;
    }

    .hero-inner {
      position: relative;
      width: 100%;
      max-width: 720px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .hero-title {
      font-size: clamp(32px, 4.6vw, 48px);
      line-height: 1.1;
      letter-spacing: -0.025em;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: var(--s-8);
      text-wrap: balance;
    }

    .highlight {
      position: relative;
      display: inline-block;
      white-space: nowrap;
      color: var(--brand-dark);
    }
    .underline {
      position: absolute;
      left: 0; right: 0; bottom: -10px;
      width: 100%;
      height: 12px;
      color: var(--brand);
      opacity: 0.7;
      @media (max-width: 480px) { bottom: -7px; height: 9px; }
    }

    .hero-lede {
      font-size: clamp(14px, 1.5vw, 16px);
      color: var(--text-muted);
      margin-bottom: var(--s-10);
      @media (max-width: 768px) { margin-bottom: var(--s-8); }
    }

    /* ----- search field ----- */
    .search { width: 100%; max-width: 580px; display: flex; flex-direction: column; gap: var(--s-3); margin-bottom: var(--s-4); }
    .search-field {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: 8px 8px 8px var(--s-5);
      background: #ffffff;
      border: 1.5px solid var(--border-strong);
      border-radius: 14px;
      box-shadow: 0 14px 36px -12px rgba(127, 29, 29, 0.18), 0 4px 8px -4px rgba(28, 25, 23, 0.05);
      transition: all var(--t-base);
      &:hover { border-color: #fecaca; }
      &.is-focused { border-color: var(--brand); box-shadow: 0 0 0 4px rgba(185, 28, 28, 0.12), 0 14px 36px -12px rgba(127, 29, 29, 0.22); }
      &.has-error { border-color: var(--danger); }
    }
    .search-icon { color: var(--brand); display: inline-flex; flex-shrink: 0; }
    input {
      flex: 1; min-width: 0; border: 0; outline: none; background: transparent;
      font-family: inherit; font-size: 18px; font-weight: 500; color: var(--text);
      padding: 14px 0; letter-spacing: 0.04em;
      &::placeholder { color: #d6d3d1; font-weight: 400; letter-spacing: 0.08em; }
      &:disabled { opacity: 0.5; }
      @media (max-width: 640px) { font-size: 16px; padding: 12px 0; }
    }
    .search-submit {
      display: inline-flex; align-items: center; gap: var(--s-2);
      height: 48px; padding: 0 var(--s-5);
      background: var(--brand); color: #fff; border: none; border-radius: 10px;
      font-size: 14px; font-weight: 600;
      box-shadow: 0 4px 12px -2px rgba(185, 28, 28, 0.4);
      transition: all var(--t-fast); flex-shrink: 0;
      &:hover:not(:disabled) { background: var(--brand-hover); transform: translateY(-1px); box-shadow: 0 6px 16px -2px rgba(185, 28, 28, 0.5); }
      &:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
      ::ng-deep .mat-mdc-progress-spinner circle { stroke: #fff; }
      @media (max-width: 480px) { padding: 0 var(--s-3); span { display: none; } }
    }
    .error {
      display: inline-flex; align-items: center; gap: var(--s-2);
      color: var(--danger); font-size: 13px; padding: 0 var(--s-2);
      align-self: flex-start;
    }
    .hint {
      font-size: 13px; color: var(--text-muted);
      display: flex; align-items: center; flex-wrap: wrap; gap: 6px; justify-content: center;
    }
    .example-link {
      background: #ffffff; border: 1px solid var(--brand-soft-2);
      padding: 3px 8px; font: inherit; color: var(--brand-dark);
      border-radius: var(--r-sm);
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px; font-weight: 600; cursor: pointer;
      transition: all var(--t-fast);
      &:hover { background: var(--brand-soft); }
    }

    /* ============================ Sections head ============================ */
    .section-head {
      margin-bottom: var(--s-10);
      max-width: 640px;
      @media (max-width: 768px) { margin-bottom: var(--s-8); }
    }
    .section-title {
      font-size: clamp(24px, 3vw, 30px);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: #0f172a;
      margin-bottom: var(--s-2);
    }
    .section-sub { font-size: 14px; color: var(--text-muted); line-height: 1.55; }

    /* ============================ HOW ============================ */
    .how {
      padding: var(--s-8) 0 var(--s-10);
      background:
        radial-gradient(ellipse 60% 80% at 90% 100%, rgba(254, 226, 226, 0.35) 0%, transparent 60%),
        var(--bg);
      position: relative;

      @media (min-height: 760px) and (min-width: 880px) {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: var(--s-6) 0 var(--s-8);
      }

      @media (max-width: 880px) { padding: var(--s-12) 0; }
    }

    .how .section-head {
      margin-bottom: var(--s-6);
      @media (max-width: 768px) { margin-bottom: var(--s-6); }
    }
    .how .section-title { font-size: clamp(22px, 2.6vw, 26px); }

    .cols {
      list-style: none; padding: 0; margin: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--s-4);
      @media (max-width: 880px) { grid-template-columns: 1fr; gap: var(--s-4); }
    }

    .col {
      padding: var(--s-5);
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--surface);
      transition: all var(--t-base);
      &:hover {
        border-color: var(--brand-soft-2);
        transform: translateY(-3px);
        box-shadow: 0 14px 32px -16px rgba(127, 29, 29, 0.22);
        .col-icon { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-color: var(--brand); }
      }
    }

    .col-head {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      margin-bottom: var(--s-3);
    }

    .col-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 1px solid var(--brand-soft-2);
      color: var(--brand);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all var(--t-base);
    }

    .col h3 { font-size: 16px; font-weight: 600; color: var(--text); margin: 0; letter-spacing: -0.01em; }
    .col p { font-size: 13.5px; color: var(--text-muted); line-height: 1.5; }

    /* Scroll cue */
    .scroll-cue {
      display: none;
      position: absolute;
      bottom: var(--s-3);
      left: 50%;
      transform: translateX(-50%);
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-pill);
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      letter-spacing: 0.02em;
      transition: all var(--t-fast);
      animation: cue 2.4s ease-in-out infinite;

      &:hover { color: var(--brand); border-color: var(--brand-soft-2); }
      svg { color: var(--brand); }

      @media (min-height: 760px) and (min-width: 880px) {
        display: inline-flex;
      }
    }
    @keyframes cue {
      0%, 100% { transform: translate(-50%, 0); }
      50%      { transform: translate(-50%, 4px); }
    }

    /* ============================ FAQ ============================ */
    .faq {
      padding: var(--s-12) 0 var(--s-16);
      background:
        radial-gradient(ellipse 50% 60% at 0% 50%, rgba(254, 226, 226, 0.3) 0%, transparent 60%),
        var(--bg);
    }

    .faq-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-3);
      @media (max-width: 760px) { grid-template-columns: 1fr; }
    }

    .faq-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      transition: all var(--t-base);
      overflow: hidden;

      &:hover { border-color: var(--brand-soft-2); }
      &[open] {
        border-color: var(--brand-soft-2);
        background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
      }

      summary {
        display: flex; align-items: center; justify-content: space-between;
        gap: var(--s-3);
        padding: var(--s-4) var(--s-5);
        cursor: pointer;
        list-style: none;
        font-size: 14px;
        font-weight: 600;
        color: var(--text);
        line-height: 1.4;

        &::-webkit-details-marker { display: none; }
      }

      .q-text { flex: 1; }

      .chev {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--bg-subtle);
        color: var(--brand);
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: all var(--t-base);
      }

      &[open] .chev { background: var(--brand); color: #fff; transform: rotate(180deg); }

      .answer {
        padding: 0 var(--s-5) var(--s-5);
        font-size: 13.5px;
        color: var(--text-2);
        line-height: 1.6;
      }
    }

    /* ============================ HELP ============================ */
    .help {
      padding: var(--s-12) 0 var(--s-16);
      background: var(--bg);
    }
    .help-card {
      background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%);
      border-radius: 18px;
      padding: var(--s-8) var(--s-10);
      color: #fff;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--s-8);
      align-items: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -120px; right: -120px;
        width: 320px; height: 320px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
        pointer-events: none;
      }

      @media (max-width: 880px) { grid-template-columns: 1fr; padding: var(--s-6); gap: var(--s-5); }
    }
    .help-text {
      position: relative;
      .eyebrow { display: block; color: #fecaca; margin-bottom: var(--s-3); }
      h2 {
        font-size: clamp(20px, 2.4vw, 26px);
        font-weight: 700;
        line-height: 1.2;
        color: #fff;
        margin-bottom: var(--s-2);
        text-wrap: balance;
      }
      p { font-size: 14px; color: rgba(255, 255, 255, 0.85); line-height: 1.55; max-width: 50ch; }
    }
    .help-actions {
      display: flex; flex-direction: column; gap: var(--s-3);
      align-items: stretch;
      position: relative;
    }
    .help-tel {
      display: flex; align-items: center; gap: var(--s-4);
      padding: var(--s-4) var(--s-5);
      background: #fff;
      color: var(--brand-dark);
      border-radius: 12px;
      transition: transform var(--t-fast);
      &:hover { transform: translateY(-2px); color: var(--brand-dark); }
      .tel-icon {
        width: 40px; height: 40px;
        border-radius: 10px;
        background: var(--brand-soft);
        color: var(--brand);
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .tel-content { display: flex; flex-direction: column; }
      .tel-label { font-size: 11px; color: var(--text-muted); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 500; }
      .tel-num { font-size: 17px; font-weight: 700; color: var(--brand-dark); }
    }
    .help-mail {
      display: inline-flex; align-items: center; gap: var(--s-2); justify-content: center;
      padding: var(--s-3) var(--s-4);
      color: rgba(255,255,255,0.9);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 10px;
      font-size: 13px; font-weight: 500;
      transition: all var(--t-fast);
      &:hover { background: rgba(255,255,255,0.1); color: #fff; }
    }
  `]
})
export class HomeComponent {
  private vehiculeService = inject(VehiculeService);
  private router = inject(Router);

  immatriculation = '';
  loading = false;
  error = '';
  focused = false;

  sanitizeInput(): void {
    this.immatriculation = this.immatriculation.replace(/[^A-Za-z0-9 \-]/g, '');
    if (this.error) this.error = '';
  }

  useExample(plate: string): void {
    this.immatriculation = plate;
    this.rechercher();
  }

  private cleanPlateForSearch(plate: string): string {
    return plate.replace(/[\s-]/g, '').toUpperCase();
  }

  rechercher(): void {
    if (!this.immatriculation) return;
    this.loading = true;
    this.error = '';
    const cleaned = this.cleanPlateForSearch(this.immatriculation);
    this.vehiculeService.recherche(cleaned).subscribe({
      next: (v) => {
        this.loading = false;
        this.router.navigate(['/resultat', v.id]);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) this.error = 'Aucun véhicule trouvé pour cette plaque.';
        else if (err.status === 429) this.error = 'Trop de recherches. Patientez quelques instants.';
        else this.error = 'Une erreur est survenue. Réessayez.';
      }
    });
  }
}
