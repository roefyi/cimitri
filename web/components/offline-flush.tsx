'use client';

import { useEffect } from 'react';
import { flushQueue } from '@/lib/offline-queue';

export function OfflineFlush() {
  useEffect(() => {
    const run = () => {
      void flushQueue();
    };
    run();
    window.addEventListener('online', run);
    return () => window.removeEventListener('online', run);
  }, []);
  return null;
}
