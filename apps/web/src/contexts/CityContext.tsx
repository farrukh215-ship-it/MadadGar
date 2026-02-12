'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CITY_STORAGE_KEY } from '@/lib/cities';

const CityContext = createContext<{
  city: string | null;
  setCity: (city: string | null) => void;
}>({ city: null, setCity: () => {} });

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CITY_STORAGE_KEY);
      setCityState(stored || null);
      setMounted(true);
    }
  }, []);

  const setCity = useCallback((c: string | null) => {
    setCityState(c);
    if (typeof window !== 'undefined') {
      if (c) localStorage.setItem(CITY_STORAGE_KEY, c);
      else localStorage.removeItem(CITY_STORAGE_KEY);
    }
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  return ctx;
}
