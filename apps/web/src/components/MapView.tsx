'use client';

import { useEffect, useRef } from 'react';

export type MapMarker = {
  id: string;
  author_id: string;
  category_name: string;
  worker_name: string | null;
  phone?: string;
  area_text: string | null;
  images: string[] | null;
  lat: number;
  lng: number;
  distance_m: number;
  availability: boolean;
  avg_rating: number | null;
};

type MapViewProps = {
  center: [number, number];
  markers: MapMarker[];
  selectedId: string | null;
  onSelectMarker: (id: string | null) => void;
  onMapMove?: (lat: number, lng: number) => void;
};

export default function MapView({
  center,
  markers,
  selectedId,
  onSelectMarker,
  onMapMove,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<{ map: L.Map; layer: L.LayerGroup } | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    const map = L.map(mapRef.current).setView(center, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    if (onMapMove) {
      map.on('moveend', () => {
        const c = map.getCenter();
        onMapMove(c.lat, c.lng);
      });
    }

    leafletRef.current = { map, layer };

    return () => {
      map.remove();
      leafletRef.current = null;
    };
  }, [center[0], center[1], onMapMove]);

  useEffect(() => {
    const leaf = leafletRef.current;
    if (!leaf) return;

    const L = require('leaflet');
    leaf.layer.clearLayers();

    const icon = L.divIcon({
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: 'map-marker',
      html: '<div style="width:24px;height:24px;border-radius:50%;background:#059669;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>',
    });

    const selectedIcon = L.divIcon({
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: 'map-marker-selected',
      html: '<div style="width:32px;height:32px;border-radius:50%;background:#047857;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
    });

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: m.id === selectedId ? selectedIcon : icon,
      })
        .addTo(leaf.layer)
        .on('click', () => {
          onSelectMarker(m.id);
        });
      marker.bindTooltip(`${m.worker_name || 'Helper'} — ${m.category_name}`, {
        permanent: false,
        direction: 'top',
      });
    });
  }, [markers, selectedId, onSelectMarker]);

  useEffect(() => {
    const leaf = leafletRef.current;
    if (!leaf) return;
    leaf.map.setView(center, leaf.map.getZoom());
  }, [center[0], center[1]]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px]" />;
}
