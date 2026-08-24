"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  buildPatientDirectoryPath,
  type PatientStatus,
} from "@/modules/patients/domain/patient";

export { buildPatientDirectoryPath };

export const PATIENT_SEARCH_DELAY_MS = 300;

export function PatientDirectorySearch({
  initialSearch,
  status,
}: {
  initialSearch: string;
  status: PatientStatus;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const lastNavigatedSearch = useRef(initialSearch);

  const navigate = useCallback(
    (search: string) => {
      const normalizedSearch = search.trim();
      lastNavigatedSearch.current = normalizedSearch;
      startTransition(() => {
        router.replace(
          buildPatientDirectoryPath({ search: normalizedSearch, status }),
          { scroll: false },
        );
      });
    },
    [router, status],
  );

  useEffect(() => {
    const normalizedSearch = query.trim();

    if (
      normalizedSearch === initialSearch ||
      normalizedSearch === lastNavigatedSearch.current
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      navigate(normalizedSearch);
    }, PATIENT_SEARCH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [initialSearch, navigate, query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(query);
  }

  function clearSearch() {
    setQuery("");
    navigate("");
  }

  return (
    <form
      aria-busy={isPending}
      className="w-full max-w-md"
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor="patient-search">
        Buscar por nombre o apellido
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--color-muted)]"
          size={17}
        />
        <input
          aria-describedby="patient-search-help"
          className="min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pr-11 pl-10 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-3 focus:ring-[rgb(20_125_115/12%)]"
          id="patient-search"
          maxLength={80}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre o apellido"
          type="search"
          value={query}
        />
        {query ? (
          <button
            aria-label="Limpiar búsqueda"
            className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand-dark)]"
            onClick={clearSearch}
            type="button"
          >
            <X aria-hidden="true" size={16} />
          </button>
        ) : null}
      </div>
      <p
        aria-live="polite"
        className="mt-1.5 mb-0 text-[0.7rem] text-[var(--color-muted)]"
        id="patient-search-help"
      >
        {isPending
          ? "Actualizando resultados…"
          : "Los resultados se actualizan automáticamente."}
      </p>
    </form>
  );
}
