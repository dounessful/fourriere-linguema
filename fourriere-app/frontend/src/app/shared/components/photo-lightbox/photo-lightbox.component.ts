import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-photo-lightbox',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open && photos.length > 0) {
      <div class="overlay" (click)="onBackdrop($event)" role="dialog" aria-modal="true" aria-label="Galerie de photos">
        <button class="ctrl close" (click)="close()" aria-label="Fermer" type="button">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        @if (photos.length > 1) {
          <button class="ctrl prev" (click)="prev()" aria-label="Photo précédente" type="button">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="ctrl next" (click)="next()" aria-label="Photo suivante" type="button">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        }

        <figure class="stage" (click)="$event.stopPropagation()">
          <img [src]="photos[index]" [alt]="'Photo ' + (index + 1) + ' sur ' + photos.length" />
          @if (photos.length > 1) {
            <figcaption class="counter">{{ index + 1 }} / {{ photos.length }}</figcaption>
          }
        </figure>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(15, 15, 15, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .stage {
      max-width: min(1100px, 100%);
      max-height: 100%;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .stage img {
      max-width: 100%;
      max-height: calc(100vh - 120px);
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
      user-select: none;
    }
    .counter {
      color: rgba(255, 255, 255, 0.78);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctrl {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.15s ease;
    }
    .ctrl:hover { background: rgba(255, 255, 255, 0.22); }
    .ctrl:active { transform: scale(0.96); }

    .close { top: 20px; right: 20px; }
    .prev { left: 24px; top: 50%; transform: translateY(-50%); }
    .next { right: 24px; top: 50%; transform: translateY(-50%); }
    .prev:active, .next:active { transform: translateY(-50%) scale(0.96); }

    @media (max-width: 600px) {
      .overlay { padding: 12px; }
      .ctrl { width: 38px; height: 38px; }
      .close { top: 12px; right: 12px; }
      .prev { left: 8px; }
      .next { right: 8px; }
    }
  `]
})
export class PhotoLightboxComponent implements OnChanges {
  @Input() photos: string[] = [];
  @Input() open = false;
  @Input() startIndex = 0;
  @Output() openChange = new EventEmitter<boolean>();

  index = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.index = Math.max(0, Math.min(this.startIndex, this.photos.length - 1));
      document.body.style.overflow = 'hidden';
    } else if (changes['open']?.currentValue === false) {
      document.body.style.overflow = '';
    }
  }

  close(): void {
    this.open = false;
    document.body.style.overflow = '';
    this.openChange.emit(false);
  }

  prev(): void {
    this.index = (this.index - 1 + this.photos.length) % this.photos.length;
  }

  next(): void {
    this.index = (this.index + 1) % this.photos.length;
  }

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('overlay')) {
      this.close();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (!this.open) return;
    if (event.key === 'Escape') { event.preventDefault(); this.close(); }
    else if (event.key === 'ArrowLeft' && this.photos.length > 1) { event.preventDefault(); this.prev(); }
    else if (event.key === 'ArrowRight' && this.photos.length > 1) { event.preventDefault(); this.next(); }
  }
}
