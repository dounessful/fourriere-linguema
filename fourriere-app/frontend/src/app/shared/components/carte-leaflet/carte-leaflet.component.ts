import { Component, Input, Output, EventEmitter, OnInit, OnChanges, AfterViewInit, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-carte-leaflet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="map-container"></div>
  `,
  styles: [`
    .map-container {
      height: 400px;
      width: 100%;
      border-radius: 8px;
      z-index: 1;
    }

    :host {
      display: block;
    }
  `]
})
export class CarteLeafletComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Input() adresse: string = '';
  @Input() interactive: boolean = false;

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngOnInit(): void {
    this.fixLeafletIcons();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && (changes['latitude'] || changes['longitude'])) {
      this.updateMarker();
    }
  }

  private fixLeafletIcons(): void {
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private initMap(): void {
    const lat = this.latitude ?? 48.8566;
    const lng = this.longitude ?? 2.3522;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: this.latitude && this.longitude ? 15 : 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    if (this.latitude && this.longitude) {
      this.addMarker(this.latitude, this.longitude);
    }

    if (this.interactive) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.addMarker(e.latlng.lat, e.latlng.lng);
        this.locationSelected.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }
  }

  private addMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);

    if (this.adresse) {
      this.marker.bindPopup(`<strong>${this.adresse}</strong>`).openPopup();
    }
  }

  private updateMarker(): void {
    if (this.latitude && this.longitude && this.map) {
      this.addMarker(this.latitude, this.longitude);
      this.map.setView([this.latitude, this.longitude], 15);
    }
  }

  public setView(lat: number, lng: number, zoom: number = 15): void {
    if (this.map) {
      this.map.setView([lat, lng], zoom);
      this.addMarker(lat, lng);
    }
  }
}
