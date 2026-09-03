export const printableDefinitions = [
  {
    id: "historia-clinica-odontologica",
    title: "Historia clínica odontológica general",
    description:
      "Cuatro páginas A4 para completar a mano: antecedentes, examen, diagnóstico y evolución.",
  },
  {
    id: "identificacion-antecedentes",
    title: "Identificación y antecedentes",
    description:
      "Una página A4 con identificación, motivo de consulta y antecedentes.",
  },
  {
    id: "examen-odontograma",
    title: "Examen y registro odontológico",
    description:
      "Dos páginas A4 para impresión doble faz: examen y odontograma al frente; diagnóstico y pronóstico al reverso.",
  },
  {
    id: "evolucion-documentacion",
    title: "Evolución y documentación",
    description:
      "Una página A4 reutilizable como anexo de evolución y actuaciones.",
  },
] as const;

export type PrintableId = (typeof printableDefinitions)[number]["id"];

export function isPrintableId(value: string): value is PrintableId {
  return printableDefinitions.some(({ id }) => id === value);
}
