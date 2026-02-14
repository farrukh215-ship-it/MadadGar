'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { CITY_STORAGE_KEY } from '@/lib/cities';

type CityContextValue = {
  city: string | null;
  setCity: (city: string | null) => void;
};

const CityContext = createContext<CityContextValue>({ city: null, setCity: () => {} });

/** Provider wrapper to avoid React 19 + TS Provider type mismatch */
function CityProviderInner({ value, children }: { value: CityContextValue; children: ReactNode }) {
  const Provider = CityContext.Provider as React.ComponentType<{ value: CityContextValue; children: ReactNode }>;
  return <Provider value={value}>{children}</Provider>;
}

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CITY_STORAGE_KEY);
      setCityState(stored || null);
    }
  }, []);

  const setCity = useCallback((c: string | null) => {
    setCityState(c);
    if (typeof window !== 'undefined') {
      if (c) localStorage.setItem(CITY_STORAGE_KEY, c);
      else localStorage.removeItem(CITY_STORAGE_KEY);
    }
  }, []);

  return <CityProviderInner value={{ city, setCity }}>{children}</CityProviderInner>;
}

const defaultCityValue: CityContextValue = { city: null, setCity: () => {} };

export function useCity() {
  try {
    const ctx = useContext(CityContext);
    return ctx ?? defaultCityValue;
  } catch {
    return defaultCityValue;
  }
}
