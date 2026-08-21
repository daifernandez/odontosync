# Registro de sprints

## Sprint 001 — Confirmación de turnos

- **Fecha:** 20 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#17](https://github.com/daifernandez/odontosync/issues/17)
- **Rama:** `codex/sprint-001-confirmar-turnos`
- **Publicación:** [PR #18](https://github.com/daifernandez/odontosync/pull/18),
  merge commit `36f62ea`

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

## Sprint 003 — Cierre administrativo de turnos

- **Fecha:** 20 de agosto de 2026
- **Estado técnico:** implementado y verificado; publicación pendiente
- **Issue:** [#20](https://github.com/daifernandez/odontosync/issues/20)
- **Rama:** `codex/sprint-003-cierre-turnos`

### Objetivo

Permitir que un turno propio confirmado y finalizado pase a atendido o ausente,
con estados históricos irreversibles y controles en la base de datos.

### Resultado

- Se agregaron las acciones de cierre como `completed` (Atendido) y `no_show`
  (Ausente).
- La agenda semanal conserva los turnos históricos y muestra sus estados con
  texto, no solamente con color.
- El panel deja los turnos confirmados futuros en modo de lectura, habilita el
  cierre al finalizar el tiempo reservado y explica que la decisión es
  irreversible.
- PostgreSQL valida propiedad, estado anterior, transición y finalización con
  `CURRENT_TIMESTAMP`; la interfaz no constituye el control de seguridad.
- La migración `20260821014802_close_appointments` se aplicó al Supabase
  enlazado.

### Criterios verificados

- El usuario autenticado puede cerrar un turno propio confirmado y finalizado
  como atendido o ausente.
- Los turnos futuros, ajenos, inexistentes o en estados incompatibles no pueden
  cerrarse.
- Los estados atendido y ausente no pueden revertirse ni intercambiarse.
- La acción valida sesión, identificador y estado solicitado, y comunica éxito
  o error.
- La agenda conserva el historial de la semana sin ocupar horarios futuros.
- El flujo base de agenda y panel fue revisado en escritorio y móvil, con cierre
  por teclado, sin desbordamiento horizontal ni errores de consola. Los estados
  nuevos se verificaron con pruebas de componentes sin modificar turnos reales.

### Skills aplicadas

- Next.js para Server Actions, renderizado y manejo del resultado.
- Supabase, `supabase-postgres-best-practices` y `security-sprint-review` para
  RLS, trigger de transición y casos negativos.
- `usability-review` y `react-best-practices` para claridad, accesibilidad y
  estructura de los componentes.
- Browser para la revisión responsive, teclado y consola sin enviar acciones
  irreversibles.
- `odontosync-release-check` para la batería final y el control previo a
  publicación.

### Verificaciones

- Pruebas: 16 archivos y 80 casos aprobados.
- RLS: tres suites aprobadas sobre Supabase enlazado.
- Prisma: esquema válido y base al día con 11 migraciones.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas desactivada, postergado hasta que sea
  indispensable.

### Fuera de alcance y próximos pasos

- Cancelar turnos confirmados.
- Reprogramar turnos.
- Reabrir o corregir estados históricos.
- Incorporar vistas diaria y mensual.
- Publicar la rama y abrir el PR cuando exista autorización explícita.
