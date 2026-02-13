'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FeedHeader } from '@/components/FeedHeader';
import type { MapMarker } from '@/components/MapView';

const MapWrapper = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-stone-100">
      <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function FeedMapPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [lat, setLat] = useState(31.5204);
  const [lng, setLng] = useState(74.3587);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchMarkers = useCallback(async (centerLat: number, centerLng: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/feed/map?lat=${centerLat}&lng=${centerLng}&radius=15000&limit=80`
      );
      const data = await res.json();
      setMarkers(data.markers ?? []);
    } catch {
      setMarkers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          fetchMarkers(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          fetchMarkers(31.5204, 74.3587);
        },
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
      );
    } else {
      fetchMarkers(31.5204, 74.3587);
    }
  }, [fetchMarkers]);

  const handleMapMove = (centerLat: number, centerLng: number) => {
    fetchMarkers(centerLat, centerLng);
  };

  return (
    <div className="min-h-screen bg-surface-base">
      <FeedHeader />
      <main className="flex flex-col px-4 py-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-stone-900">Nearby helpers on map</h1>
          <Link
            href="/feed"
            className="text-sm text-brand-600 font-medium hover:underline"
          >
            List view →
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-premium bg-white">
          <div className="aspect-[4/3] min-h-[320px] relative">
            <MapWrapper
              center={[lat, lng]}
              markers={markers}
              selectedId={selectedId}
              onSelectMarker={setSelectedId}
              onMapMove={handleMapMove}
            />
          </div>
        </div>
        {loading && (
          <p className="text-sm text-stone-500 mt-2 text-center">Loading markers...</p>
        )}
        {!loading && markers.length === 0 && (
          <p className="text-sm text-stone-500 mt-4 text-center">No helpers nearby</p>
        )}
        {selectedId && (
          <div className="mt-4 p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
            {(() => {
              const m = markers.find((x) => x.id === selectedId);
              if (!m) return null;
              return (
                <>
                  <h3 className="font-semibold text-stone-900">
                    {m.worker_name || 'Helper'} — {m.category_name}
                  </h3>
                  {m.area_text && (
                    <p className="text-sm text-stone-600 mt-1">📍 {m.area_text}</p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/post/${m.id}`}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
                    >
                      View
                    </Link>
                    {m.phone && (
                      <a
                        href={`tel:${m.phone}`}
                        className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
