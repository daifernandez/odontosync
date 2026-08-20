# Registro de sprints

## Sprint 001 — Confirmación de turnos

- **Fecha:** 20 de agosto de 2026
- **Estado técnico:** implementado y verificado
- **Issue:** [#17](https://github.com/daifernandez/odontosync/issues/17)
- **Rama:** `codex/sprint-001-confirmar-turnos`
- **Publicación:** [PR borrador #18](https://github.com/daifernandez/odontosync/pull/18)

### Objetivo

Permitir que un turno propio pendiente pase a confirmado de forma segura,
visible y probada.

### Resultado

- Se agregó la acción de confirmar turnos pendientes.
- La operación exige una sesión válida y restringe la transición al dueño del
  turno mediante aplicación y RLS.
- Los turnos confirmados se distinguen en la agenda y quedan en modo de solo
  lectura, sin acciones incompatibles.
- La migración `20260820202133_confirm_appointments` se aplicó al Supabase
  enlazado.

### Criterios verificados

- El usuario autenticado puede confirmar un turno propio pendiente.
- Un turno ajeno, inexistente o en otro estado no puede confirmarse.
- La interfaz comunica envío, éxito y error.
- La agenda representa el estado confirmado y conserva la ocupación horaria.
- El flujo fue revisado en escritorio y en un viewport móvil sin errores de
  consola ni desbordamiento horizontal.

### Skills aplicadas

- Next.js para la Server Action y el flujo de renderizado.
- Supabase y `security-sprint-review` para RLS, casos negativos y verificación
  sobre la base enlazada.
- `usability-review` para estados, feedback y comportamiento responsive.
- Browser para la revisión visual y de consola.
- `odontosync-release-check` para la batería final y el control previo a
  publicación.

### Verificaciones

- Pruebas: 15 archivos y 71 casos aprobados.
- RLS: tres suites aprobadas sobre Supabase enlazado.
- Prisma: esquema válido y base al día con 10 migraciones.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas desactivada.

### Fuera de alcance y próximos pasos

- Marcar turnos como atendidos o ausentes.
- Reprogramar turnos.
- Permitir acciones posteriores sobre turnos confirmados.
- Revisar el PR #18 y mergearlo cuando exista autorización explícita.
