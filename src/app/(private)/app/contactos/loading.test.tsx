import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ContactsLoading from "./loading";

describe("carga del directorio", () => {
  it("identifica la carga mientras cambian los filtros", () => {
    const markup = renderToStaticMarkup(<ContactsLoading />);
    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("Cargando contactos");
  });
});
