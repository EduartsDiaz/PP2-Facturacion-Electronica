import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import connectivityService from '../services/connectivity/connectivityService';
import storageService, { KEYS } from '../services/storage/storageService';
import dteService from '../services/dte/dteService';
import type { CompanySettings } from '../types';

interface ConnectivityCtx {
  isOnline: boolean;
  queueCount: number;
  refreshQueue: () => void;
  processQueue: () => Promise<number>;
}

const ConnectivityContext = createContext<ConnectivityCtx | null>(null);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(() => connectivityService.isOnline());
  const [queueCount, setQueueCount] = useState(() => connectivityService.getQueue().length);

  const refreshQueue = useCallback(() => {
    setQueueCount(connectivityService.getQueue().length);
  }, []);

  const processQueue = useCallback(async (): Promise<number> => {
    const q = connectivityService.getQueue();
    let processed = 0;
    for (const item of q) {
      const dte = dteService.getById(item.dteId);
      if (!dte) { connectivityService.removeFromQueue(item.dteId); continue; }
      const updated = await dteService.simulateTransmission(dte);
      dteService.update(updated);
      connectivityService.removeFromQueue(item.dteId);
      processed++;
    }
    setQueueCount(0);
    return processed;
  }, []);

  useEffect(() => {
    const unsub = connectivityService.subscribe((online) => {
      setIsOnline(online);
      refreshQueue();
    });
    // Poll simulateOffline changes
    const interval = setInterval(() => {
      const s = storageService.get<CompanySettings>(KEYS.SETTINGS);
      const sim = !!(s?.simulateOffline);
      const online = sim ? false : navigator.onLine;
      setIsOnline(online);
    }, 2000);
    return () => { unsub(); clearInterval(interval); };
  }, [refreshQueue]);

  return (
    <ConnectivityContext.Provider value={{ isOnline, queueCount, refreshQueue, processQueue }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity(): ConnectivityCtx {
  const ctx = useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be within ConnectivityProvider');
  return ctx;
}
