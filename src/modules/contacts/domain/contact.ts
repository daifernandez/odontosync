export type ContactType = "supplier" | "laboratory" | "both";
export type ContactTypeFilter = ContactType | "all";
export type ContactStatus = "active" | "inactive";

export type Contact = {
  id: string;
  name: string;
  type: ContactType;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  specialty: string | null;
  notes: string | null;
  isActive: boolean;
};

export type ContactInput = Pick<
  Contact,
  | "name"
  | "type"
  | "contactName"
  | "phone"
  | "email"
  | "address"
  | "hours"
  | "specialty"
  | "notes"
>;

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

export type ContactFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors: ContactFieldErrors;
};

export const contactFormState: ContactFormState = {
  status: "idle",
  fieldErrors: {},
};

function normalizeText(value: unknown) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

export function validateContact(
  input: Record<keyof ContactInput, unknown>,
):
  | { success: true; data: ContactInput }
  | { success: false; fieldErrors: ContactFieldErrors } {
  const name = normalizeText(input.name);
  const type = input.type;
  const contactName = normalizeText(input.contactName);
  const phone = normalizeText(input.phone);
  const email = normalizeText(input.email).toLowerCase();
  const address = normalizeText(input.address);
  const hours = normalizeText(input.hours);
  const specialty = normalizeText(input.specialty);
  const notes = normalizeText(input.notes);
  const fieldErrors: ContactFieldErrors = {};

  if (name.length === 0 || name.length > 120) {
    fieldErrors.name = "Ingresá un nombre de hasta 120 caracteres.";
  }
  if (type !== "supplier" && type !== "laboratory" && type !== "both") {
    fieldErrors.type = "Elegí proveedor, laboratorio o ambos.";
  }
  if (contactName.length > 120) {
    fieldErrors.contactName =
      "La persona de contacto admite hasta 120 caracteres.";
  }
  if (phone.length > 30) {
    fieldErrors.phone = "El teléfono admite hasta 30 caracteres.";
  }
  if (email.length > 254) {
    fieldErrors.email = "El correo electrónico admite hasta 254 caracteres.";
  } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Ingresá un correo electrónico válido.";
  }
  if (address.length > 200) {
    fieldErrors.address = "La dirección admite hasta 200 caracteres.";
  }
  if (hours.length > 200) {
    fieldErrors.hours = "Los horarios admiten hasta 200 caracteres.";
  }
  if (specialty.length > 120) {
    fieldErrors.specialty =
      "El rubro o especialidad admite hasta 120 caracteres.";
  }
  if (notes.length > 1000) {
    fieldErrors.notes = "Las notas admiten hasta 1000 caracteres.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      name,
      type: type as ContactType,
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      hours: hours || null,
      specialty: specialty || null,
      notes: notes || null,
    },
  };
}

export function normalizeContactSearch(value: unknown) {
  return normalizeText(value)
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function normalizeContactTypeFilter(value: unknown): ContactTypeFilter {
  return value === "proveedores"
    ? "supplier"
    : value === "laboratorios"
      ? "laboratory"
      : "all";
}

export function normalizeContactStatus(value: unknown): ContactStatus {
  return value === "inactivos" ? "inactive" : "active";
}

export function validateContactId(value: unknown) {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
    ? value.toLowerCase()
    : null;
}

export function buildContactDirectoryPath({
  search,
  type,
  status,
}: {
  search: string;
  type: ContactTypeFilter;
  status: ContactStatus;
}) {
  const params = new URLSearchParams();

  if (status === "inactive") params.set("estado", "inactivos");
  if (type === "supplier") params.set("tipo", "proveedores");
  if (type === "laboratory") params.set("tipo", "laboratorios");
  if (search.trim()) params.set("buscar", search.trim());

  const query = params.toString();
  return query ? `/app/contactos?${query}` : "/app/contactos";
}
