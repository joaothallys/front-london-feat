import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { store } from "@shared/store/local-store.js";

const Ctx = createContext(null);

export function AppStateProvider({ children }) {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => {
    store.persist();
    setTick((n) => n + 1);
  }, []);
  const value = useMemo(() => ({
    state: store.get(),
    refresh,
    tick
  }), [refresh, tick]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState precisa do AppStateProvider");
  return ctx;
}
