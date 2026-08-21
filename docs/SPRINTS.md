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
- **Estado:** publicado y mergeado
- **Issue:** [#20](https://github.com/daifernandez/odontosync/issues/20)
- **Rama:** `codex/sprint-003-cierre-turnos`
- **Publicación:** [PR #21](https://github.com/daifernandez/odontosync/pull/21),
  merge commit `fbd1498`

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

## Sprint 004 — Cancelación de turnos confirmados

- **Fecha:** 20 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#23](https://github.com/daifernandez/odontosync/issues/23)
- **Rama:** `codex/sprint-004-cancelar-confirmados`
- **Publicación:** [PR #24](https://github.com/daifernandez/odontosync/pull/24),
  merge commit `0f75fb9`

### Objetivo

Permitir que un turno propio confirmado y todavía no iniciado pueda cancelarse
de forma segura, liberando el horario sin eliminar el registro.

### Resultado

- La cancelación existente admite turnos pendientes y confirmados futuros.
- La interfaz ofrece la acción destructiva únicamente antes de la hora de
  inicio, explica la consecuencia y exige una confirmación explícita.
- Un turno en curso permanece en modo de lectura y, al finalizar, conserva
  solamente las acciones de atendido o ausente.
- PostgreSQL valida la transición `confirmed → cancelled` con el tiempo de la
  base y mantiene irreversibles los estados finales.
- RLS restringe la actualización al propietario y a los turnos gestionables;
  el trigger vuelve a validar estado, campos y tiempo ante carreras.
- Se corrigió un aviso de hidratación causado por diferencias de puntuación en
  la fecha localizada entre servidor y navegador.
- La migración `20260821022153_cancel_confirmed_appointments` se aplicó al
  Supabase enlazado.

### Criterios verificados

- El usuario autenticado puede cancelar un turno propio confirmado futuro.
- Un turno iniciado, ajeno, inexistente o en otro estado no puede cancelarse.
- La cancelación libera la ocupación sin eliminar el registro.
- La Server Action valida sesión e identificador y comunica éxito o error sin
  filtrar detalles internos.
- La interfaz distingue la acción destructiva, muestra la confirmación y
  permite volver sin enviar el formulario.
- El flujo se revisó con datos ficticios no persistidos en escritorio y móvil,
  sin desbordamiento horizontal ni errores nuevos de consola; no se ejecutó
  ninguna cancelación durante QA.

### Skills aplicadas

- Next.js para Server Actions, renderizado y el ajuste de hidratación.
- Supabase, `supabase-postgres-best-practices` y `security-sprint-review` para
  transición, RLS, tiempo de base y casos negativos.
- `usability-review` y `react-best-practices` para confirmación, feedback,
  accesibilidad y estructura del componente.
- Browser para la revisión visual y responsive sin escrituras persistentes.
- `odontosync-release-check` para la batería final y el control previo a
  publicación.

### Verificaciones

- Pruebas: 16 archivos y 86 casos aprobados.
- RLS: tres suites aprobadas sobre Supabase enlazado.
- Prisma: esquema válido y base al día con 12 migraciones.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Reprogramar turnos confirmados.
- Cancelar turnos una vez iniciados.
- Reabrir turnos cancelados o estados históricos.
- Incorporar vistas diaria y mensual.

## Sprint 005 — Reprogramación de turnos confirmados

- **Fecha:** 21 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#26](https://github.com/daifernandez/odontosync/issues/26)
- **Rama:** `codex/sprint-005-reprogramar-confirmados`
- **Publicación:** [PR #27](https://github.com/daifernandez/odontosync/pull/27),
  merge commit `823ed1f`

### Objetivo

Permitir que un turno propio confirmado y todavía no iniciado pueda
reprogramarse de forma segura, conservando el original y creando un nuevo
turno pendiente vinculado.

### Resultado

- La interfaz permite elegir una nueva fecha y hora sin modificar paciente,
  especialidad, duración ni acondicionamiento.
- El turno original pasa a `rescheduled` y el sucesor se crea como
  `pending_confirmation`, unido por `rescheduled_from_id`.
- La operación se ejecuta mediante una función PostgreSQL atómica: si falla la
  creación del sucesor, el original conserva su estado confirmado.
- PostgreSQL bloquea la fila original, usa `CURRENT_TIMESTAMP` y rechaza
  turnos ajenos, iniciados, inexistentes, repetidos o en otro estado.
- Una superposición exige un segundo envío explícito. Un bloqueo transaccional
  por usuario evita carreras y los turnos superpuestos continúan bloqueando
  futuras escrituras no confirmadas.
- Los indicadores internos de transición, vínculo y superposición no pueden
  escribirse directamente mediante la Data API.
- La agenda abre la semana del nuevo turno y comunica que quedó pendiente de
  confirmación.
- Las migraciones `20260821032517_reschedule_confirmed_appointments`,
  `20260821033356_reset_rescheduling_context` y
  `20260821033704_guard_rescheduling_link` se aplicaron al Supabase enlazado.

### Criterios verificados

- Un usuario autenticado puede reprogramar un turno propio confirmado futuro.
- El original libera el horario, queda como reprogramado y conserva un único
  sucesor pendiente con trazabilidad y datos administrativos equivalentes.
- Usuario anónimo, usuario ajeno, sesión vencida, identificador inválido,
  turno iniciado y repetición de la operación son rechazados.
- Una superposición sin confirmar revierte la operación completa; con
  confirmación explícita queda registrada y no debilita controles posteriores.
- La fecha y hora se validan contra la configuración en servidor y contra el
  reloj de PostgreSQL en la base.
- La interfaz distingue horarios ocupados con texto, anuncia errores, evita
  envíos duplicados y conserva controles nativos accesibles.
- Al gestionar turnos simultáneos, la interfaz descuenta únicamente el turno
  seleccionado y conserva los demás como ocupados.
- El panel se revisó con datos ficticios no persistidos en un viewport de 558
  px, con foco de teclado, sin desbordamiento horizontal ni errores o
  advertencias de consola. No se reprogramaron turnos reales durante QA.

### Skills aplicadas

- Next.js para la Server Action, el manejo del resultado y la redirección a la
  nueva semana.
- Supabase y `supabase-postgres-best-practices` para el RPC atómico, RLS,
  privilegios mínimos, integridad, concurrencia y migraciones.
- `security-sprint-review` para autorización, casos negativos, rollback,
  repetición y aislamiento entre usuarios.
- `usability-review` y `react-best-practices` para confirmación progresiva,
  feedback, accesibilidad y estructura de los componentes.
- Browser para la revisión local del panel, el viewport, el foco y la consola
  sin escrituras persistentes.
- `odontosync-release-check` para la batería final y el control previo a
  publicación.

### Verificaciones

- Pruebas: 16 archivos y 98 casos aprobados.
- RLS: tres suites aprobadas sobre Supabase enlazado.
- Prisma: esquema válido y base al día con 15 migraciones.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Reprogramar turnos pendientes, iniciados, cancelados o históricos.
- Cambiar paciente, especialidad, duración o acondicionamiento durante la
  reprogramación.
- Reabrir turnos reprogramados.
- Incorporar vistas diaria y mensual.
