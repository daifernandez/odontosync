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

## Sprint 006 — Bloqueos excepcionales de agenda

- **Fecha:** 22 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#29](https://github.com/daifernandez/odontosync/issues/29)
- **Rama:** `codex/sprint-006-bloqueos-excepcionales`
- **Publicación:** [PR #30](https://github.com/daifernandez/odontosync/pull/30),
  merge commit `9b55451`

### Objetivo

Permitir registrar períodos excepcionales sin atención y evitar que se creen,
editen o reprogramen turnos dentro de esos bloqueos.

### Resultado

- Se incorporaron bloqueos por vacaciones, feriados, asuntos personales u
  otros motivos, con creación, listado y eliminación desde la agenda.
- La grilla semanal representa cada período con el texto “No disponible” y su
  motivo, y deja de ofrecer los horarios que lo intersectan.
- Crear, editar y reprogramar turnos reutiliza la misma regla de disponibilidad
  en la interfaz y en las Server Actions.
- PostgreSQL conserva la autoridad final ante carreras: usa rangos semiabiertos,
  un bloqueo transaccional por usuario y rechaza turnos dentro de un bloqueo con
  un error específico no confirmable.
- Confirmar una superposición durante la reprogramación no permite atravesar un
  bloqueo excepcional y, ante el rechazo, el turno original queda intacto.
- La tabla aplica RLS forzada, políticas de propiedad y privilegios mínimos;
  los roles anónimo y de servicio no reciben acceso mediante la Data API.
- La migración `20260822031334_add_exceptional_availability_blocks` se aplicó al
  Supabase enlazado.

### Criterios verificados

- Un usuario autenticado puede crear, consultar y eliminar únicamente sus
  propios bloqueos futuros o en curso.
- No pueden coexistir bloqueos superpuestos ni crearse uno sobre un turno
  pendiente o confirmado.
- Un turno no puede crearse, editarse ni reprogramarse dentro de un bloqueo,
  incluso cuando se confirme explícitamente una superposición.
- Usuario anónimo, rol de servicio, usuario ajeno, sesión vencida, identificador
  inválido y operaciones no permitidas son rechazados sin filtrar detalles
  internos.
- Eliminar un bloqueo restaura la disponibilidad del período sin modificar
  turnos existentes.
- La agenda comunica el bloqueo con texto además de color y conserva controles
  nativos accesibles en el formulario.
- El panel se revisó en escritorio y en un viewport de 390 px sin desbordamiento
  ni errores de consola. No se guardaron datos reales durante el QA visual.

### Skills aplicadas

- Next.js para Server Actions, renderizado del App Router y carga paralela de
  los datos de agenda.
- Supabase y `security-sprint-review` para RLS, privilegios mínimos, integridad,
  concurrencia, rollback y casos negativos entre identidades.
- `usability-review` y `react-best-practices` para feedback, accesibilidad,
  claridad del panel y comportamiento responsive.
- Browser para revisar el flujo local, el viewport móvil y la consola sin
  escrituras persistentes.
- `odontosync-release-check` para la batería final y el control previo a
  publicación.

### Verificaciones

- Pruebas: 20 archivos y 122 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado.
- Prisma: esquema válido y base al día con 16 migraciones.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Editar un bloqueo existente; por ahora se elimina y se crea uno nuevo.
- Incorporar vistas diaria y mensual.
- Activar la protección contra contraseñas filtradas antes de que resulte
  indispensable para el proyecto.

## Sprint 007 — Vista diaria de agenda

- **Fecha:** 22 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#32](https://github.com/daifernandez/odontosync/issues/32)
- **Rama:** `codex/sprint-007-vista-diaria`
- **Publicación:** [PR #33](https://github.com/daifernandez/odontosync/pull/33),
  merge commit `5aac573`

### Objetivo

Permitir que un usuario autenticado consulte y gestione la agenda de un día
específico, reutilizando las reglas y operaciones existentes de la vista
semanal.

### Resultado

- Se incorporó un selector entre las vistas semanal y diaria; la vista semanal
  continúa siendo la opción predeterminada.
- La vista y la fecha seleccionadas se conservan en la URL, con una
  recuperación segura ante parámetros ausentes o inválidos.
- La navegación diaria permite avanzar, retroceder y volver a hoy, incluyendo
  días no laborables con un estado vacío explícito.
- La grilla diaria muestra únicamente los horarios, turnos, bloqueos y
  disponibilidad de la fecha elegida.
- Crear, editar, confirmar, cancelar, cerrar y reprogramar turnos conserva el
  contexto diario; una reprogramación abre la nueva fecha correspondiente.
- El panel de bloqueos excepcionales también mantiene la vista y la fecha
  seleccionadas.
- No se modificaron reglas de negocio, persistencia, esquema, migraciones,
  políticas RLS ni privilegios.

### Criterios verificados

- Cambiar entre semana y día conserva la fecha, y la URL permite recargar o
  compartir el mismo contexto.
- La navegación anterior, siguiente y hoy selecciona la fecha correcta.
- La vista diaria respeta los horarios configurados, representa los estados de
  los turnos con texto y mantiene los bloqueos como no disponibles.
- Los formularios y operaciones de gestión preservan el contexto diario.
- Los parámetros inválidos se normalizan sin interrumpir la agenda.
- La interfaz se revisó en escritorio y en un viewport de 390 × 844 px sin
  desbordamiento horizontal; los controles de navegación son enlaces nativos,
  tienen nombres accesibles y reciben foco.
- El QA visual no creó ni modificó datos persistentes.

### Skills aplicadas

- Next.js para los parámetros asíncronos del App Router, los límites entre
  servidor y cliente y la conservación del contexto en enlaces y formularios.
- `usability-review` para navegación, URL compartible, estados vacíos,
  accesibilidad y comportamiento responsive.
- `react-best-practices` para revisar la estructura y el comportamiento de los
  componentes TSX modificados.
- Browser para verificar la agenda real en escritorio y móvil, los parámetros
  inválidos y la consola sin escrituras persistentes.
- Supabase y `security-sprint-review` para comprobar que la vista reutiliza los
  controles de datos y seguridad existentes sin cambios.
- `odontosync-release-check` para la batería final y el control previo a
  publicación.

### Verificaciones

- Pruebas: 20 archivos y 131 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado.
- Prisma: esquema válido y base al día con 16 migraciones.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Incorporar una vista mensual.
- Recordar la última vista fuera de la URL o entre dispositivos.
- Editar un bloqueo excepcional existente.
- Gestionar la agenda mediante instrucciones en lenguaje natural.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 008 — Dashboard autenticado con datos reales

- **Fecha:** 22 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/dashboard-real-usuarios`
- **Publicación:** [PR #37](https://github.com/daifernandez/odontosync/pull/37),
  merge commit `2e0a6e1`

### Objetivo

Reemplazar los valores estáticos del inicio autenticado por un resumen
calculado con los datos reales del usuario, sin alterar la demostración pública.

### Resultado

- El inicio calcula los turnos del día, la cantidad de confirmados y los
  horarios disponibles según la configuración, los turnos activos y los
  bloqueos excepcionales.
- El próximo turno y la lista de hasta tres turnos futuros provienen de
  Supabase; cuando no existen, la interfaz muestra un estado vacío explícito.
- Cada turno del resumen enlaza su fecha, vista diaria e identificador exactos
  para abrir el contexto correcto en la agenda.
- Las lecturas agregan un filtro explícito por `user_id` además de las políticas
  RLS existentes.
- La ruta `/demo` conserva sus datos ficticios y su comportamiento previo.
- No se modificaron registros existentes, esquema, migraciones, políticas RLS
  ni privilegios.

### Criterios verificados

- El usuario autenticado ve únicamente cantidades y turnos derivados de sus
  propios datos.
- Los límites del día se calculan en la zona horaria de Argentina.
- Los espacios libres respetan horarios habituales, duración,
  acondicionamiento, ocupación y bloqueos excepcionales.
- Una cuenta sin turnos futuros no recibe pacientes, horarios ni cantidades
  inventados y dispone de una acción clara para crear el primero.
- Crear un turno desde el estado vacío abre el formulario real de Agenda.
- La sesión evaluadora se revisó localmente en un viewport móvil, sin errores ni
  advertencias de consola y sin escrituras persistentes.

### Skills aplicadas

- Next.js para el renderizado de servidor, la sesión autenticada y los enlaces
  con contexto de la vista diaria.
- Supabase, `supabase-postgres-best-practices` y `security-sprint-review` para
  aislamiento por usuario, RLS y revisión de las consultas.
- `usability-review` para los estados vacíos, claridad del resumen,
  accesibilidad y comportamiento responsive.
- Browser y `verification` para recorrer sesión, datos, respuesta y navegación
  con la cuenta evaluadora.
- `odontosync-release-check` para la batería final y la publicación.

### Verificaciones

- Pruebas: 26 archivos y 157 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Preparar un conjunto evaluador con turnos futuros para recorrer visualmente
  el resumen poblado sin utilizar datos reales.
- Revisar y depurar los registros ficticios actuales antes de la entrega.
- Incorporar una vista mensual y los módulos todavía marcados como próximos.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 009 — Ficha administrativa y turnos del paciente

- **Fecha:** 22 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-009-detalle-paciente`
- **Publicación:** [PR #39](https://github.com/daifernandez/odontosync/pull/39),
  merge commit `155ead5`

### Objetivo

Permitir que un usuario autenticado abra la ficha administrativa de un
paciente y consulte sus próximos turnos y su historial asociado.

### Resultado

- El directorio de pacientes abre una ruta propia y recargable para cada ficha.
- La ficha muestra nombre, estado activo o inactivo, teléfono y correo
  electrónico, con acceso a la edición existente.
- Los turnos se separan entre próximos e históricos y muestran fecha, hora,
  especialidad, duración y estado mediante texto.
- Cada turno enlaza la fecha, vista diaria e identificador exactos para abrirlo
  directamente en Agenda.
- Los pacientes activos disponen de una acción para crear un nuevo turno.
- Se agregaron estados vacíos diferenciados y una respuesta de ficha no
  encontrada que no revela si el recurso pertenece a otra cuenta.
- Las lecturas filtran explícitamente por paciente y `user_id`, además de las
  políticas RLS forzadas existentes.
- No se modificaron el esquema, las migraciones, las políticas RLS, los
  privilegios ni los datos persistentes.

### Criterios verificados

- Un usuario autenticado solo puede consultar fichas y turnos de su propia
  cuenta.
- Un identificador inválido, un recurso inexistente o ajeno y una sesión
  vencida no exponen datos.
- El enlace desde el directorio abre la ficha correcta y el enlace de cada
  turno abre su día y panel exactos en Agenda.
- La ficha comunica datos ausentes, estado del paciente, listas vacías y
  estados de los turnos sin depender únicamente del color.
- El recorrido se verificó con la cuenta y los datos ficticios de evaluación
  en escritorio y en un viewport de 390 × 844 px, sin escrituras persistentes,
  desbordamiento horizontal ni errores o advertencias de consola.

### Skills aplicadas

- Next.js para la ruta dinámica, parámetros asíncronos, renderizado de servidor
  y estados de recurso no encontrado.
- Supabase, `supabase-postgres-best-practices` y `security-sprint-review` para
  aislamiento por usuario, RLS, consultas indexadas y casos negativos.
- `usability-review` para navegación, estados vacíos, claridad, accesibilidad y
  comportamiento responsive.
- `react-best-practices` para revisar paralelización, inmutabilidad y estructura
  de los componentes TSX.
- Browser para recorrer la ficha y Agenda en escritorio y móvil con datos
  ficticios.
- `odontosync-release-check` para la batería final y la publicación.

### Verificaciones

- Pruebas: 28 archivos y 165 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Incorporar al historial visible los registros internos cancelados y
  reprogramados.
- Agregar paginación cuando el volumen real de turnos por paciente lo requiera.
- Incorporar la vista mensual de Agenda y recordar la última vista elegida.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 010 — Vista mensual de Agenda

- **Fecha:** 22 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-010-vista-mensual`
- **Publicación:** [PR #41](https://github.com/daifernandez/odontosync/pull/41),
  merge commit `1f295a8`

### Objetivo

Permitir que un usuario autenticado consulte la actividad de su Agenda en una
vista mensual y abra cualquier fecha en su Agenda diaria exacta.

### Resultado

- Se agregó una grilla mensual estable de 42 días, organizada de lunes a
  domingo e identificada mediante una URL recargable y compartible.
- Cada día resume la cantidad de turnos y bloqueos excepcionales del usuario y
  enlaza su fecha exacta en la vista diaria.
- La navegación permite ir al mes anterior, al siguiente o al mes actual, y
  cambiar entre las vistas semanal, diaria y mensual.
- Los meses sin actividad muestran un estado vacío explícito.
- La vista mensual funciona como consulta: la creación y gestión de turnos se
  realizan desde la Agenda diaria.
- Las lecturas mensuales se limitan al rango solicitado y filtran
  explícitamente por `user_id`, además de las políticas RLS existentes.
- No se modificaron el esquema, las migraciones, las políticas RLS, los
  privilegios ni los datos persistentes.

### Criterios verificados

- Una sesión vencida se redirige antes de consultar información privada.
- Los límites del mes se calculan con la zona horaria de Argentina y los
  parámetros inválidos vuelven a un mes válido.
- Los turnos y bloqueos se resumen en su fecha correspondiente sin cargar
  pacientes ni ocupación innecesaria para esta vista.
- Elegir un día con actividad abre la Agenda diaria, la semana y la fecha
  correctas; navegar entre meses y recargar conserva el contexto de la URL.
- El estado vacío y las etiquetas accesibles informan cantidades sin depender
  únicamente del color.
- El recorrido autenticado se verificó en escritorio con datos ficticios, sin
  escrituras persistentes ni errores o advertencias de aplicación en consola.
- La adaptación responsive quedó implementada y cubierta por pruebas de
  componentes; la comprobación visual manual en viewport móvil permanece
  pendiente porque la sesión autenticada no permitió emular sus dimensiones.

### Skills aplicadas

- Next.js para parámetros asíncronos, renderizado de servidor y separación de
  las lecturas necesarias para cada vista.
- Supabase, `supabase-postgres-best-practices` y `security-sprint-review` para
  aislamiento por usuario, RLS, rangos indexados y sesión vencida.
- `usability-review` para navegación, URLs compartibles, estados vacíos,
  accesibilidad y comportamiento responsive.
- `react-best-practices` para revisar paralelización, estructura de componentes
  y conteos eficientes.
- Browser para recorrer la Agenda mensual autenticada, sus enlaces, estados y
  consola sin modificar datos.
- `odontosync-release-check` para la batería final y la publicación.

### Verificaciones

- Pruebas: 30 archivos y 176 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Recordar la última vista elegida entre visitas o dispositivos.
- Crear o gestionar turnos y bloqueos directamente desde la vista mensual.
- Realizar la comprobación visual manual de la vista mensual en un viewport
  móvil autenticado.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.
