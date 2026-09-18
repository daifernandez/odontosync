"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Memory belongs to the current app session; nothing is stored on disk.
const DraftContext = createContext<Map<string, unknown> | null>(null);

export function ConfigurationDraftProvider({ children }: { children: ReactNode }) {
  const [drafts] = useState(() => new Map<string, unknown>());
  useEffect(() => {
    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      if (drafts.size === 0) return;
      event.preventDefault();
      event.returnValue = "Tenés cambios sin guardar.";
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [drafts]);
  return <DraftContext.Provider value={drafts}>{children}</DraftContext.Provider>;
}

export function useConfigurationDraft<T>(key: string, initial: T, saveState: { status: string }) {
  const drafts = useContext(DraftContext);
  const [restored] = useState(() => drafts?.has(key) ?? false);
  const [value, setValue] = useState<T>(() => drafts?.has(key) ? drafts.get(key) as T : initial);

  useEffect(() => {
    if (saveState.status === "success") drafts?.delete(key);
  }, [drafts, key, saveState]);

  function setDraft(next: T) {
    drafts?.set(key, next);
    setValue(next);
  }

  function discardDraft(next: T) {
    drafts?.delete(key);
    setValue(next);
  }

  return { value, setDraft, discardDraft, restored };
}
