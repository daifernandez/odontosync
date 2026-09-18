"use client";

import { useEffect, useState } from "react";

const warningMessage =
  "Tenés cambios sin guardar. ¿Querés salir de esta sección sin guardarlos?";
const confirmedNavigationEvents = new WeakSet<Event>();

export function useUnsavedChanges(saveState: { status: string }, restored = false) {
  const [editedState, setEditedState] = useState<object | null>(restored ? saveState : null);
  const isDirty =
    editedState !== null &&
    (editedState === saveState || saveState.status === "error");

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = warningMessage;
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || confirmedNavigationEvents.has(event)) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");

      if (!link || link.getAttribute("href")?.startsWith("#")) {
        return;
      }

      if (!window.confirm(warningMessage)) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        confirmedNavigationEvents.add(event);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [isDirty]);

  return {
    clearDirty: () => setEditedState(null),
    isDirty,
    markDirty: () => setEditedState(saveState),
  };
}
