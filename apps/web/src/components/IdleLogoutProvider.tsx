'use client';

import { usePathname } from 'next/navigation';
import { useIdleLogout } from '@/hooks/useIdleLogout';

const PROTECTED_PREFIXES = ['/feed', '/post', '/profile', '/chat'];

function IdleWatcher() {
  useIdleLogout();
  return null;
}

export function IdleLogoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return (
    <>
      {isProtected && <IdleWatcher />}
      {children}
    </>
  );
}
