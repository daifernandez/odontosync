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

## Sprint 011 — Preferencia de vista de Agenda

- **Fecha:** 22 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-011-preferencia-vista-agenda`
- **Publicación:** [PR #43](https://github.com/daifernandez/odontosync/pull/43),
  merge commit `3860fa5`

### Objetivo

Recordar por usuario la última vista elegida de Agenda entre Semana, Día y
Mes, sin perder la prioridad de las URLs explícitas ni romper los flujos
semanales existentes.

### Resultado

- Una entrada neutra a `/app/agenda` abre la última vista elegida por el
  usuario y usa Semana cuando todavía no existe una preferencia legible.
- El selector de vistas guarda Semana, Día o Mes antes de navegar y conserva
  enlaces normales para accesibilidad, apertura en otra pestaña y navegación
  sin JavaScript.
- Una vista válida indicada en la URL tiene prioridad para ese acceso y no
  sobrescribe por sí sola la preferencia guardada.
- Las URLs históricas con `semana=...` continúan abriendo Semana, el flujo
  `nuevo=1` sigue mostrando el formulario de nuevo turno y `vista=day` se
  acepta por compatibilidad.
- Un fallo al leer la preferencia vuelve de forma segura a Semana; un fallo al
  guardarla no impide llegar a la vista solicitada.
- La Server Action valida el valor recibido, obtiene la identidad autenticada
  en el servidor y las consultas filtran explícitamente por `user_id`, además
  de las políticas RLS forzadas existentes.
- Se reutilizó `agenda_settings.last_agenda_view`, presente desde el esquema
  inicial; no se agregaron migraciones, dependencias ni nuevos privilegios.

### Criterios verificados

- Cada usuario solo puede leer o modificar su propia preferencia de Agenda;
  una identidad ajena no observa ni actualiza la fila del propietario.
- Una sesión ausente o vencida y un valor no soportado no producen escrituras.
- Semana, Día y Mes se recuerdan entre entradas a Agenda, mientras una URL
  explícita conserva su contexto sin alterar la preferencia previa.
- Los enlaces semanales y la creación de turnos mantienen su destino aunque
  la vista preferida sea Mes.
- El recorrido autenticado se verificó con el usuario ficticio de evaluación,
  restaurando finalmente Semana y sin modificar turnos ni pacientes.
- La navegación real no produjo errores ni advertencias de aplicación en la
  consola del navegador.

### Skills aplicadas

- Next.js para parámetros asíncronos, renderizado de servidor, Server Actions
  y prioridad de las rutas explícitas.
- Supabase, `supabase-postgres-best-practices` y `security-sprint-review` para
  validación en servidor, mínimo privilegio, aislamiento por usuario y pruebas
  RLS positivas y negativas.
- `usability-review` para conservar enlaces accesibles, contexto de navegación
  y una degradación segura cuando la preferencia no está disponible.
- `react-best-practices` para revisar el límite cliente-servidor, autenticación
  de la acción y transiciones no urgentes.
- Browser para probar persistencia, prioridad de URL, compatibilidad y consola
  con el usuario ficticio.
- `odontosync-release-check` para la batería final y la publicación.

### Verificaciones

- Pruebas: 32 archivos y 189 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado.
- TypeScript, ESLint y build de producción: aprobados.
- Prisma: esquema válido y 16 migraciones sincronizadas con la base enlazada.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Crear o gestionar turnos y bloqueos directamente desde la vista mensual.
- Realizar la comprobación visual manual de la vista mensual en un viewport
  móvil autenticado.
- Gestionar la Agenda mediante instrucciones en lenguaje natural.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 012 — Acciones desde la vista mensual de Agenda

- **Fecha:** 23 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-012-acciones-vista-mensual`
- **Publicación:** [PR #45](https://github.com/daifernandez/odontosync/pull/45),
  merge commit `4d94d0e`

### Objetivo

Permitir que un usuario elija una fecha desde la vista mensual e inicie las
acciones de la Agenda diaria —abrirla, crear un turno o bloquear un horario—
sin duplicar formularios ni mutaciones en el calendario mensual.

### Resultado

- Se agregó una barra contextual que muestra el día seleccionado y sus
  acciones disponibles.
- Abrir Agenda diaria, Nuevo turno y Bloquear horario conservan la fecha exacta
  elegida al construir sus URLs.
- Nuevo turno abre el formulario diario con la fecha seleccionada y Bloquear
  horario abre el panel correspondiente de la Agenda diaria.
- Las fechas pasadas continúan disponibles para consulta y muestran una nota
  informativa, sin ofrecer acciones de creación.
- La grilla conserva los conteos mensuales, la navegación entre meses y el
  estado de selección con nombres accesibles y soporte de teclado.
- El estado interactivo quedó aislado en un componente cliente pequeño; las
  lecturas mensuales y el cálculo de conteos permanecen en el servidor.
- No se modificaron el esquema, las migraciones, las políticas RLS, los
  privilegios ni los datos persistentes.

### Criterios verificados

- Seleccionar una fecha cambia la barra contextual y marca el día con
  `aria-pressed`.
- Las tres acciones mantienen semana, vista diaria y fecha exactas en sus
  destinos.
- La fecha elegida se conserva en el formulario de Nuevo turno y en la Agenda
  diaria que contiene el panel de bloqueos.
- Una fecha pasada no muestra acciones de creación y comunica que solo es de
  consulta.
- El flujo funciona con teclado y en un viewport de 390 × 844 px sin
  desplazamiento horizontal.
- La vista autenticada se verificó con el usuario ficticio de evaluación, sin
  enviar formularios ni modificar turnos, bloqueos o pacientes.
- La consola del navegador no registró errores ni advertencias nuevas.

### Skills aplicadas

- Next.js para mantener el renderizado de servidor, las URLs exactas y el
  límite cliente-servidor.
- `usability-review` para la jerarquía de acciones, la nota de fechas pasadas,
  teclado, accesibilidad y responsive.
- `react-best-practices` para aislar el estado de selección y minimizar los
  datos serializados al componente cliente.
- Browser para verificar selección, destinos, fecha preseleccionada, teclado,
  móvil y consola con datos ficticios.
- `odontosync-release-check` para la batería final, el commit y la publicación.

### Verificaciones

- Pruebas: 32 archivos y 190 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- No aplicaron controles de Prisma, migraciones ni RLS porque el sprint no
  modificó persistencia, autenticación ni autorización.
- Permanece el aviso externo conocido de Supabase sobre protección contra
  contraseñas filtradas, postergado por decisión del proyecto.

### Fuera de alcance y próximos pasos

- Incorporar formularios o mutaciones propias dentro de la vista mensual.
- Gestionar turnos y bloqueos sin pasar por la Agenda diaria.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 013 — Navegación y contexto de acciones

- **Fecha:** 23 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-013-navegacion-estados`
- **Publicación:** [PR #47](https://github.com/daifernandez/odontosync/pull/47),
  merge commit `f830339`

### Objetivo

Verificar y corregir los destinos de las acciones activas de la aplicación
autenticada —Inicio, Agenda, Pacientes y Configuración— para que cada enlace
conserve el contexto necesario y comunique correctamente sus estados.

### Resultado

- Los accesos a turnos desde Inicio reutilizan el generador canónico de rutas
  de Agenda y conservan semana, vista diaria, fecha y turno seleccionado.
- “Crear turno” desde una ficha de paciente conserva el identificador del
  paciente en la URL y abre el formulario con ese paciente preseleccionado.
- El formulario remonta su estado cuando cambia el contexto del paciente, sin
  reutilizar accidentalmente la selección anterior.
- La navegación principal mantiene destinos válidos y estados activos para
  Inicio, Agenda, Pacientes y Configuración.
- Los módulos todavía no disponibles permanecen deshabilitados y señalizados
  como “Próximamente”.
- No se modificaron el esquema, las migraciones, las políticas RLS, los
  privilegios ni los datos persistentes.

### Criterios verificados

- Inicio → Agenda abre la ruta autenticada correcta y Agenda conserva sus
  parámetros de vista y selección.
- Agenda → Pacientes, Pacientes → ficha, ficha → Crear turno y Agenda →
  Configuración llegan a sus destinos esperados.
- El contexto del paciente se refleja en el selector y en el resumen del
  formulario de nuevo turno.
- Las anclas de Configuración (`#perfil` y `#agenda`) desplazan a sus
  secciones correspondientes.
- El menú móvil se abre correctamente y expone los enlaces activos sin errores
  de consola.
- La verificación se realizó con la cuenta ficticia de evaluación, sin enviar
  formularios ni modificar turnos, bloqueos o pacientes.

### Skills aplicadas

- Next.js para el enrutamiento App Router, parámetros de búsqueda y límites
  servidor/cliente.
- `usability-review` para contexto de navegación, estados activos, accesibilidad
  básica y feedback de acciones.
- `react-best-practices` para el estado inicial del formulario y su remonte al
  cambiar de contexto.
- Browser para probar los recorridos autenticados, el menú móvil, las anclas y
  la consola con datos ficticios.
- `odontosync-release-check` para la batería final, el commit, el PR y la
  comprobación de CI.

### Verificaciones

- Pruebas: 32 archivos y 192 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- No aplicaron controles de Prisma, migraciones ni RLS porque el sprint no
  modificó persistencia, autenticación ni autorización.
- Permanece el aviso externo conocido de Supabase sobre protección contra
  contraseñas filtradas, postergado por decisión del proyecto.

### Fuera de alcance y próximos pasos

- Implementar los módulos marcados como “Próximamente”.
- Incorporar nuevas funcionalidades de negocio en Agenda o Pacientes.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 014 — Historial de turnos y separación de gestión

- **Fecha:** 23 de agosto de 2026
- **Estado:** publicado y mergeado
- **Ramas:** `codex/sprint-014-historial-turnos` y
  `codex/fix-historial-solo-lectura`
- **Publicaciones:** [PR #49](https://github.com/daifernandez/odontosync/pull/49),
  merge commit `65e5044`; [PR #50](https://github.com/daifernandez/odontosync/pull/50),
  merge commit `eb037c5`

### Objetivo

Completar el historial de turnos de la ficha de paciente y separar con claridad
la consulta de resultados pasados de la gestión de turnos próximos.

### Resultado

- El historial muestra únicamente turnos finalizados, con su resultado visible:
  `Atendido`, `No asistió`, `Cancelado` o `Reprogramado`.
- Los turnos pasados pendientes de confirmación ya no aparecen como historial.
- Los turnos próximos pendientes de confirmación aparecen en la sección de
  próximos y enlazan a Agenda para gestionarlos.
- Los turnos próximos confirmados quedan disponibles desde Agenda y no se
  duplican en la ficha del paciente.
- Las tarjetas históricas son de solo consulta y no ofrecen acciones de edición
  ni una segunda vista de detalle.
- Se conservaron las protecciones de solo lectura para los accesos históricos
  directos a Agenda.
- No se modificaron esquema, migraciones, políticas RLS, autenticación ni datos
  persistentes.

### Criterios verificados

- Un turno próximo pendiente se muestra como próximo y permite abrir Agenda.
- Un turno próximo confirmado no aparece en el historial de la ficha.
- Un turno pasado pendiente no aparece ni como próximo ni como histórico.
- Los resultados terminales se muestran directamente en sus tarjetas históricas.
- El historial no contiene botones de edición ni enlaces de gestión.
- La verificación se realizó con la cuenta ficticia de evaluación, sin enviar
  formularios ni modificar turnos, bloqueos o pacientes.
- La consola del navegador no registró errores nuevos.

### Skills aplicadas

- Next.js para filtros de estado, parámetros de Agenda y límites
  servidor/cliente.
- `usability-review` para separar consulta y gestión, jerarquía de estados y
  claridad de las acciones.
- `react-best-practices` para mantener el renderizado condicional simple y sin
  estado cliente innecesario.
- Browser para verificar los recorridos autenticados con datos ficticios.
- `odontosync-release-check` para la batería final, los dos PR y la comprobación
  de CI.

### Verificaciones

- Pruebas: 32 archivos y 197 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobados en los PR de implementación y corrección.
- No aplicaron controles de Prisma, migraciones ni RLS porque el sprint no
  modificó persistencia, autenticación ni autorización.
- Permanece el aviso externo conocido de Supabase sobre protección contra
  contraseñas filtradas, postergado por decisión del proyecto.

### Fuera de alcance y próximos pasos

- Incorporar una auditoría detallada de cambios de cada turno.
- Mostrar turnos próximos confirmados dentro de la ficha del paciente; su lugar
  de gestión sigue siendo Agenda.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 015 — Cierre de turnos y Agenda del paciente

- **Fecha:** 24 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-015-cierre-turnos-agenda`
- **Publicación:** [PR #52](https://github.com/daifernandez/odontosync/pull/52),
  merge commit `0e23932`

### Objetivo

Cerrar el comportamiento completo de los turnos y su representación en Agenda
y en la ficha del paciente antes de avanzar a otros módulos.

### Resultado

- Se auditó la matriz de estados para turnos futuros, en curso, finalizados,
  atendidos, ausentes, cancelados y reprogramados.
- Los turnos pendientes futuros conservan sus acciones de edición,
  confirmación y cancelación.
- Un turno pendiente que ya comenzó queda temporalmente en modo de consulta y
  no puede confirmarse, cancelarse ni reprogramarse durante su horario.
- Al finalizar todo el tiempo reservado, el turno aparece como `Pendiente de
  cierre` y permite registrar únicamente `Atendido`, `No asistió` o
  `Cancelado`.
- La ficha del paciente incorpora la sección “Turnos pendientes de cierre”,
  separada de “Próximos turnos” e “Historial de turnos”. Al registrar el
  resultado, la ficha se invalida para reflejar el cambio sin depender de una
  recarga manual.
- La Agenda semanal y diaria muestran “Registrar resultado” para los pendientes
  finalizados, y la vista mensual aclara que en fechas pasadas se puede
  consultar o registrar resultados pendientes, sin habilitar nuevas reservas.
- El historial continúa mostrando solamente resultados terminales y no admite
  modificaciones.
- PostgreSQL impide crear pendientes en el pasado, protege los pendientes en
  curso y permite cerrar un pendiente solamente después de finalizar su tiempo
  reservado. RLS mantiene el aislamiento por propietario y el trigger vuelve a
  validar cada transición.
- Las migraciones `20260824023037_lock_started_pending_appointments` y
  `20260824025706_resolve_finished_pending_appointments` se aplicaron al
  Supabase enlazado.
- Los turnos existentes no recibieron resultados automáticos ni fueron
  modificados durante la implementación o el QA.

### Incidencia resuelta antes del cierre

La primera corrección dejó los turnos pendientes vencidos en modo de solo
lectura. La revisión visual mostró que seguían contándose en Agenda, pero no
podían incorporarse al historial porque todavía no tenían un resultado. Antes
del merge se agregó el estado operativo `Pendiente de cierre`, sus tres
resultados permitidos y la sección correspondiente en la ficha del paciente.

### Criterios verificados

- Un pendiente futuro puede gestionarse y uno en curso permanece protegido
  hasta finalizar el acondicionamiento.
- Un pendiente finalizado permite registrar atendido, ausente o cancelado, sin
  habilitar edición, confirmación o reprogramación.
- Un resultado registrado sale de pendientes de cierre y pasa al historial del
  paciente con su estado terminal.
- Los turnos históricos no pueden editarse, reabrirse ni intercambiar su
  resultado.
- Un usuario anónimo, otro propietario, un recurso inexistente o una transición
  fuera de tiempo no puede modificar el turno.
- Los días pasados no permiten crear turnos ni bloqueos nuevos.
- Los turnos ficticios del 3 y 11 de agosto se verificaron visualmente como
  pendientes de cierre, con las tres acciones correctas y sin ejecutar ninguna
  de ellas.

### Skills aplicadas

- Next.js para Server Actions, renderizado de servidor, navegación e
  invalidación de la ficha del paciente.
- Supabase y `security-sprint-review` para políticas RLS, trigger de estados,
  mínimo privilegio y casos negativos sobre la base enlazada.
- `usability-review` para separar gestión, cierre e historial y mantener textos
  y acciones consistentes entre vistas.
- `react-best-practices` para derivar estados durante el renderizado y preservar
  límites cliente-servidor simples.
- Browser para verificar Agenda mensual y diaria, el panel de resultados y la
  ficha del paciente con datos ficticios y sin escrituras.
- `odontosync-release-check` para la batería final, las migraciones, el commit,
  el PR y la comprobación de CI.

### Verificaciones

- Pruebas: 32 archivos y 205 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado.
- Prisma: esquema válido y base al día con 18 migraciones.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR de publicación.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.

### Fuera de alcance y próximos pasos

- Incorporar una auditoría detallada de cambios de cada turno.
- Resolver varios turnos pendientes de cierre mediante una operación masiva.
- Realizar una comprobación visual manual del flujo completo en un viewport
  móvil autenticado.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 016 — Directorio de pacientes escalable

- **Fecha:** 24 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-016-directorio-pacientes`
- **Publicación:** [PR #54](https://github.com/daifernandez/odontosync/pull/54),
  merge commit `3097a9b`

### Objetivo

Preparar el directorio de pacientes para un volumen creciente mediante una
vista de lista compacta y una búsqueda instantánea, sin incorporar todavía
paginación ni ordenamiento configurable.

### Resultado

- Las tarjetas del directorio se reemplazaron por una lista de filas compactas
  con nombre, teléfono, correo electrónico y acceso a la ficha.
- Cada fila adapta su distribución al espacio disponible y conserva el botón
  `Ver ficha` dentro del panel, sin desbordes en anchos intermedios.
- La búsqueda existente por nombre o apellido se actualiza automáticamente
  300 ms después de dejar de escribir y mantiene la lectura de datos en el
  servidor.
- La búsqueda y el estado de pacientes activos o inactivos se conservan en la
  URL al alternar entre ambas vistas.
- El buscador permite limpiar el texto con un único control accesible. Se
  ocultó el control nativo duplicado que algunos navegadores agregan a los
  campos de tipo búsqueda.
- Durante la navegación se anuncia que los resultados se están actualizando y
  continúan disponibles los estados vacíos y la acción para limpiar una
  búsqueda sin coincidencias.
- El directorio conserva el orden fijo existente por apellido y nombre, de
  forma ascendente.
- No se modificaron esquema, migraciones, políticas RLS, autenticación ni datos
  persistentes.

### Incidencias resueltas antes del cierre

La primera composición en columnas utilizaba anchos mínimos vinculados al
viewport y no al ancho real del panel. En espacios intermedios, el botón
`Ver ficha` se desplazaba fuera del contenedor y el correo se truncaba demasiado
pronto. Las filas se simplificaron para agrupar la información del paciente y
mantener la acción alineada dentro del panel. Luego se eliminó la doble cruz
del buscador conservando solamente el control accesible de la aplicación.

### Criterios verificados

- El directorio presenta pacientes activos e inactivos como una lista y cada
  fila enlaza a la ficha correcta.
- Al escribir un nombre o apellido, la URL y los resultados se actualizan sin
  exigir el botón `Buscar`.
- Cambiar entre activos e inactivos conserva la búsqueda actual.
- Limpiar la búsqueda conserva el filtro de estado y vuelve a mostrar el
  conjunto correspondiente.
- Las búsquedas con y sin coincidencias muestran feedback comprensible.
- El botón `Ver ficha` permanece dentro del panel y teléfono y correo tienen
  nombres accesibles.
- El campo muestra una sola acción para limpiar la búsqueda.
- La verificación se realizó con la cuenta ficticia de evaluación y no creó ni
  modificó pacientes.
- La consola del navegador no registró errores nuevos.

### Skills aplicadas

- Next.js para conservar la consulta en el Server Component y aislar el control
  interactivo en un Client Component.
- `react-best-practices` para mantener una transición no bloqueante, limitar el
  estado cliente y evitar consultas innecesarias mientras se escribe.
- `usability-review` para definir la jerarquía de la lista, los estados vacíos,
  el feedback de actualización, la navegación por filtros y la accesibilidad
  del control de limpieza.
- Browser para verificar búsqueda, limpieza, cambio de estado, composición
  visual y errores de consola con datos ficticios.
- `odontosync-release-check` para la batería final, los commits, el PR y la
  comprobación de CI.

### Verificaciones

- Pruebas: 34 archivos y 208 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado después de la implementación y nuevamente después
  de corregir el control duplicado del buscador.
- No aplicaron controles de Prisma, migraciones, Supabase ni RLS porque el
  sprint no modificó persistencia, autenticación ni autorización.

### Fuera de alcance y próximos pasos

- Incorporar paginación cuando el volumen real de pacientes lo requiera.
- Ampliar la búsqueda a teléfono o correo solamente si aparece esa necesidad.
- El ordenamiento configurable fue evaluado y descartado para este sprint; el
  directorio mantiene un orden fijo por apellido y nombre.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 017 — Jerarquía del menú de cuenta

- **Fecha:** 24 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/sprint-017-jerarquia-menu-cuenta`
- **Publicación:** [PR #56](https://github.com/daifernandez/odontosync/pull/56),
  merge commit `5e9786d`

### Objetivo

Corregir la jerarquía visual y semántica del bloque inferior del menú para
asociar Configuración con la cuenta del usuario y separar el control propio de
la interfaz.

### Resultado

- El bloque inferior presenta primero la identidad del usuario, seguida por
  `Configuración` y `Cerrar sesión`.
- `Contraer menú` permanece como última acción y se separa visualmente del
  grupo de cuenta.
- El mismo orden se conserva en los modos autenticado y demo.
- El menú contraído mantiene títulos y nombres accesibles para Configuración,
  Cerrar sesión y Expandir menú.
- No se modificaron rutas, estados activos, contenido de Configuración,
  autenticación, cierre de sesión ni datos persistentes.

### Criterios verificados

- La identidad aparece antes que Configuración en el orden del documento.
- Cerrar sesión aparece después de Configuración.
- Contraer menú es la última acción disponible del bloque inferior.
- Configuración continúa enlazando a `/app/configuracion` y conserva su estado
  activo.
- El modo demo no expone Configuración como una ruta funcional.
- El menú contraído conserva acciones reconocibles mediante sus nombres
  accesibles.
- La verificación visual autenticada confirmó la composición esperada sin
  realizar escrituras.

### Incidencia observada durante la verificación

El primer acceso a localhost devolvió un error transitorio al leer la
configuración inicial. Una recarga recuperó la aplicación sin cambios ni
intervención sobre datos. El fallo no fue reproducible y no estuvo relacionado
con el reordenamiento del componente.

### Skills aplicadas

- `usability-review` para separar identidad, acciones de cuenta y controles de
  interfaz con un orden de teclado coherente.
- Browser para verificar la vista autenticada, la jerarquía semántica y el menú
  contraído con datos ficticios.
- `odontosync-release-check` para la batería final, el commit, el PR y la
  comprobación de CI.

### Verificaciones

- Pruebas: 34 archivos y 209 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR funcional.
- No aplicaron controles de Prisma, migraciones, Supabase ni RLS porque el
  sprint no modificó persistencia, autenticación ni autorización.

### Fuera de alcance y próximos pasos

- Cambiar el contenido o la organización interna de Configuración.
- Modificar la autenticación o el comportamiento de Cerrar sesión.
- Retomar la demostración pública cuando la aplicación real esté finalizada.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 018 — Alta de turnos desde espacios libres

- **Fecha:** 25 de agosto de 2026
- **Estado:** publicado y mergeado
- **Rama:** `codex/agenda-new-appointment-flow`
- **Publicación:** [PR #59](https://github.com/daifernandez/odontosync/pull/59),
  merge commit `f596c40`

### Objetivo

Completar el alta de turnos desde la agenda para aprovechar la fecha y hora del
espacio libre seleccionado y volver a la agenda inmediatamente después de
guardar.

### Resultado

- Los espacios libres abren el panel de nuevo turno con fecha y hora ya
  seleccionadas.
- El usuario puede completar paciente, área odontológica y duración sin volver
  a elegir el horario; el acondicionamiento conserva su valor habitual y sigue
  siendo editable.
- Después de guardar, el panel se cierra y la agenda muestra el turno creado
  junto con el mensaje de éxito.
- Cerrar el panel sin guardar elimina de la URL los parámetros transitorios del
  alta.
- No se modificaron persistencia, reglas de disponibilidad, estados de turnos,
  migraciones, autenticación ni permisos.

### Criterios verificados

- Un espacio libre conserva su fecha y hora al abrir el formulario.
- La selección inicial aparece tanto en los campos como en el resumen previo a
  confirmar.
- El redirect posterior al alta no vuelve a abrir el panel.
- El mensaje de éxito se presenta en la agenda y no dentro del diálogo.
- El turno creado queda visible en el bloque horario y en el listado semanal.
- Las regresiones automatizadas cubren la precarga del espacio seleccionado y
  el regreso a la agenda con el panel cerrado.
- La verificación funcional creó, con autorización, un turno ficticio para
  `Paciente, Lucía Prueba` el 26 de agosto de 2026 a las 11:15.

### Skills aplicadas

- Next.js para conservar el contexto de la agenda en la URL y respetar el
  redirect de la Server Action.
- `react-best-practices` para retirar estado y referencias que dejaron de ser
  necesarios al mover el éxito fuera del formulario.
- `usability-review` para verificar la precarga del horario, el cierre del
  panel y el feedback posterior al guardado.
- Browser para comprobar el recorrido autenticado con un paciente ficticio.
- `odontosync-release-check` para la batería final, el commit, el PR y la
  comprobación de CI.

### Verificaciones

- Pruebas: 34 archivos y 212 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR funcional.
- No aplicaron controles de Prisma, migraciones, Supabase ni RLS porque el
  sprint no modificó persistencia, autenticación ni autorización.

### Riesgo residual y próximos pasos

- El cierre automático conserva el redirect existente de la Server Action; la
  lógica de persistencia no cambió.
- Las reglas de disponibilidad y los flujos de confirmar, reprogramar o
  cancelar turnos permanecen fuera de este sprint.
- El turno ficticio utilizado para QA permanece en la cuenta de evaluación.

## Sprint 019 — Seguimiento temporal filtrable de turnos

- **Fecha:** 25 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#61](https://github.com/daifernandez/odontosync/issues/61)
- **Rama:** `codex/agenda-status-timeline`
- **Publicación:** [PR #62](https://github.com/daifernandez/odontosync/pull/62),
  merge commit `537da3f`

### Objetivo

Convertir el listado semanal de turnos en un seguimiento temporal claro y
operable, que permita consultar estados y días sin recurrir a paginación y
mantenga visibles los turnos cancelados o reprogramados.

### Resultado

- La agenda presenta una línea temporal agrupada por día con hora, paciente,
  especialidad, duración, estado y acción contextual de cada turno.
- Los estados se comunican mediante texto y color para distinguir pendientes,
  confirmados, atendidos, ausentes, cancelados y reprogramados sin depender
  solamente de señales visuales.
- Los filtros de estado agrupan los turnos en `Todos`, `En curso`,
  `Finalizados` y `Cambios`; la vista semanal agrega un filtro horizontal por
  día.
- Los filtros omiten contadores dentro de cada opción y el total se anuncia de
  forma accesible sin competir con la jerarquía visual del sector.
- Cada día puede contraerse para reducir la extensión del listado y los
  resultados se actualizan sin paginación.
- Las acciones se adaptan al estado: gestionar, registrar resultado, ver el
  turno, consultar el historial o ver el cambio.
- Los turnos cancelados y reprogramados se conservan en el seguimiento, pero
  no ocupan espacios en la grilla de disponibilidad.
- La composición de cada turno se mantiene compacta en escritorio y pasa a una
  disposición vertical en anchos intermedios y móviles para evitar columnas
  comprimidas y textos fragmentados.
- No se modificaron esquema, migraciones, políticas RLS, autenticación ni
  permisos.

### Criterios verificados

- Los seis estados operativos muestran una etiqueta textual y un punto de
  color consistente.
- Los filtros de estado y día se combinan y exponen su selección mediante
  `aria-pressed`.
- La vista diaria no repite el filtro de día y conserva las mismas opciones de
  estado.
- Los días agrupados pueden expandirse y contraerse, y los estados vacíos
  explican cuándo no existen turnos o no hay coincidencias con los filtros.
- Los filtros no muestran cifras ambiguas ni se presenta un total visual
  aislado sobre ellos.
- Los turnos cancelados y reprogramados aparecen en `Cambios`, conservan su
  historial y liberan el horario para nuevas reservas.
- La verificación responsive cubrió móvil, ancho intermedio y escritorio sin
  desbordes ni fragmentación de los datos del turno.
- Las regresiones automatizadas cubren la agrupación de estados, la combinación
  de filtros, la accesibilidad, el seguimiento histórico y la exclusión de
  cancelados y reprogramados de la ocupación de la agenda.

### Skills aplicadas

- `project-sprint-workflow` para acordar el alcance, separar la publicación
  funcional del cierre documental y mantener la trazabilidad con el issue.
- `usability-review` para definir la jerarquía de la línea temporal, los
  filtros, el uso redundante de color y texto, los estados vacíos y la
  adaptación responsive.
- Next.js y `react-best-practices` para integrar la vista interactiva sin mover
  al cliente la consulta de turnos ni agregar estado innecesario.
- Supabase y `security-sprint-review` para verificar que los cambios de
  consulta respetaran el aislamiento existente y que las suites RLS
  continuaran aprobadas.
- Browser para recorrer filtros, estados, acciones y composiciones responsive
  con datos ficticios.
- `odontosync-release-check` para la batería final, el commit, el PR y la
  comprobación de CI.

### Verificaciones

- Pruebas: 35 archivos y 217 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado; cada ejecución completó
  su rollback.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR funcional.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.
- No aplicaron controles de Prisma ni migraciones porque el sprint no modificó
  el esquema persistente.

### Riesgo residual y próximos pasos

- La acción de reprogramar libera el horario y conserva el turno anterior como
  cambio, pero el vínculo detallado entre el turno original y el nuevo, junto
  con quién realizó el cambio, cuándo y por qué, queda para un próximo sprint.
- La búsqueda de pacientes dentro del seguimiento y la paginación quedan fuera
  de alcance hasta que el volumen real demuestre su necesidad.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 020 — Próximos turnos activos de hoy

- **Fecha:** 25 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#64](https://github.com/daifernandez/odontosync/issues/64)
- **Rama:** `codex/dashboard-todays-upcoming`
- **Publicación:** [PR #65](https://github.com/daifernandez/odontosync/pull/65),
  merge commit `5c962e5`

### Objetivo

Transformar el bloque de próximos turnos del inicio en un resumen operativo de
los turnos activos que todavía quedan durante el día actual.

### Resultado

- El inicio muestra como máximo los próximos tres turnos pendientes de
  confirmación o confirmados del día, ordenados por horario.
- Cada fila presenta hora, paciente, especialidad, duración y estado mediante
  texto y color, sin repetir la fecha ni depender solamente de señales
  visuales.
- Toda la fila abre el turno correspondiente en la vista diaria de la agenda.
- `Ver agenda de hoy` abre directamente el día actual, incluso cuando no quedan
  turnos en el resumen.
- El estado vacío explica que no quedan turnos pendientes ni confirmados y
  conserva las acciones para ver la agenda o crear un turno.
- La composición mantiene visibles los estados en mobile y se adapta a anchos
  intermedios y escritorio sin desbordes.
- El modo demo conserva la misma estructura con tres turnos ficticios y
  cantidades consistentes.
- El resumen se deriva de la lectura diaria existente y elimina una consulta
  duplicada a Supabase.
- No se crearon ni modificaron turnos durante QA y no hubo cambios de esquema,
  migraciones, políticas RLS, autenticación ni permisos.

### Criterios verificados

- Los turnos cuya hora ya pasó y los estados finalizados o modificados no
  aparecen en el resumen.
- Los turnos activos se ordenan cronológicamente y el resultado se limita a
  tres elementos.
- La fecha y la zona horaria de Argentina delimitan el día mostrado.
- Los estados pendiente de confirmación y confirmado usan texto y puntos de
  color consistentes con la agenda.
- Cada fila es un enlace accesible al día y turno correctos.
- El acceso general abre la vista diaria aun cuando el resumen está vacío.
- La presentación fue verificada en 390 px, 950 px y escritorio sin scroll
  horizontal.
- Las regresiones automatizadas cubren filtrado, orden, límite, contenido,
  navegación, estado vacío y modo demo.

### Skills aplicadas

- `project-sprint-workflow` para definir, aprobar, implementar y publicar el
  cambio como un sprint independiente.
- `usability-review` para mantener la jerarquía operativa, el uso redundante de
  color y texto, el estado vacío, los objetivos táctiles y la adaptación
  responsive.
- Next.js y `react-best-practices` para conservar la lectura en el Server
  Component, evitar estado cliente y eliminar una consulta paralela
  innecesaria.
- Supabase y `security-sprint-review` para verificar el aislamiento existente y
  ejecutar las suites RLS enlazadas.
- Browser para revisar los estados normal y vacío, la navegación, los anchos
  responsive y la consola sin modificar datos.
- `odontosync-release-check` para la batería final, el commit, el PR y la
  comprobación de CI.

### Verificaciones

- Pruebas: 35 archivos y 216 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado; cada ejecución completó
  su rollback.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR funcional.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas, postergado por decisión del
  proyecto.
- No aplicaron controles de Prisma ni migraciones porque el sprint no modificó
  el esquema persistente.

### Riesgo residual y próximos pasos

- Después del último turno activo, el bloque queda vacío aunque existan turnos
  finalizados durante el día; esta consecuencia fue aceptada para mantener el
  inicio enfocado en las próximas acciones.
- Los turnos atendidos, ausentes, cancelados y reprogramados continúan
  disponibles en la agenda y no se duplican en este resumen.
- Incorporar más elementos, filtros o paginación solamente si el volumen real
  demuestra su necesidad.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 021 — Resumen operativo de hoy

- **Fecha:** 26 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#67](https://github.com/daifernandez/odontosync/issues/67)
- **Rama:** `codex/sprint-021-dashboard-summary`
- **Publicación:** [PR #68](https://github.com/daifernandez/odontosync/pull/68),
  merge commit `d0d7b0b`

### Objetivo

Convertir las tarjetas superiores del inicio en un resumen operativo claro de
la jornada, priorizando el próximo turno y las confirmaciones pendientes sin
alterar las reglas de la agenda.

### Resultado

- `Turnos de hoy` conserva el total diario y la cantidad confirmada.
- `Próximo turno` muestra hora, paciente, fecha y especialidad completas, y
  abre directamente su panel de gestión en la vista diaria.
- Cuando no existe un próximo turno activo, la tarjeta muestra únicamente un
  estado vacío claro y no se comporta como enlace.
- `Espacios libres` fue reemplazado por `Confirmaciones pendientes`, calculado
  a partir de los turnos pendientes del día.
- El inicio dejó de consultar ocupación y bloqueos excepcionales para calcular
  una disponibilidad que ya no se presenta.
- Las tarjetas se apilan en mobile y tablet; desde escritorio se distribuyen en
  columnas y reservan más ancho para el próximo turno.
- La composición conserva los textos completos, permite crecer en altura y
  mantiene estados visibles de hover, foco y pulsación.
- No se modificaron esquema, migraciones, políticas RLS, autenticación,
  permisos ni persistencia.

### Criterios verificados

- El próximo turno activo de hoy presenta hora, paciente, fecha y especialidad
  sin truncado ni desbordamiento horizontal.
- La tarjeta abre mediante mouse, teclado o interacción táctil el turno y día
  correctos de la agenda.
- El estado vacío no presenta datos residuales, flecha ni navegación.
- Las confirmaciones pendientes excluyen otros estados y el modo demo conserva
  cantidades consistentes.
- La alineación entre horario y paciente, y la separación entre paciente y
  detalle, se mantienen en anchos representativos desde 320 px.
- Las regresiones automatizadas cubren contenido, navegación, responsive y
  estado vacío.
- El turno ficticio temporal utilizado para revisar la tarjeta fue eliminado;
  los tres turnos de prueba anteriores permanecieron intactos.

### Skills aplicadas

- `project-sprint-workflow` para definir, publicar y separar el cambio
  funcional de su cierre documental.
- `usability-review` para revisar jerarquía, alineación, contenido completo,
  interacción, estado vacío y adaptación responsive.
- Supabase y `security-sprint-review` para verificar que el cambio de lectura
  conservara el aislamiento existente y que las suites RLS siguieran
  aprobadas.
- Browser para revisar navegación, composición real, estado vacío y ausencia
  de desbordes desde 320 px.
- `odontosync-release-check` para la batería final, publicación y comprobación
  de CI.

### Verificaciones

- Pruebas: 35 archivos y 218 casos aprobados.
- RLS: cuatro suites aprobadas sobre Supabase enlazado; cada ejecución completó
  su rollback.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR funcional.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas desactivada.
- No aplicaron controles de Prisma ni migraciones porque el sprint no modificó
  el esquema persistente.

### Riesgo residual y próximos pasos

- Los nombres de paciente y especialidades extensos aumentan la altura de la
  tarjeta en lugar de truncarse; esta decisión prioriza la información
  completa.
- El historial detallado del vínculo entre turnos reprogramados continúa fuera
  de este sprint.
- Activar la protección contra contraseñas filtradas cuando resulte
  indispensable para el proyecto.

## Sprint 022 — Especialidades en agenda mensual

- **Fecha:** 28 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#70](https://github.com/daifernandez/odontosync/issues/70)
- **Rama:** `codex/sprint-022-monthly-specialties`
- **Publicación:** [PR #71](https://github.com/daifernandez/odontosync/pull/71),
  merge commit `81862f5`

### Objetivo

Actualizar el catálogo odontológico y reemplazar el total genérico de cada día
de la agenda mensual por un resumen coloreado de turnos por especialidad.

### Resultado

- Cada día de la agenda mensual muestra hasta tres etiquetas de especialidad,
  ordenadas por cantidad, y resume el excedente como `+N especialidades`.
- Cada etiqueta comunica especialidad y cantidad mediante texto además del
  color; la descripción accesible conserva el desglose completo aunque exista
  un resumen visual.
- Se incorporaron Control, Estética y Blanqueamiento como especialidades
  persistentes mediante la migración
  `20260827030000_add_control_aesthetic_whitening`.
- Operatoria / restauradora reemplazó a Odontología general en turnos nuevos.
  Los turnos históricos de General se conservan, pueden mantener su valor al
  editarse y se agrupan visualmente dentro de Operatoria en el mes.
- Las abreviaturas y colores permanecen estables; Ortodoncia se presenta como
  `Ortod.`.
- Los bloqueos, la selección del día, las acciones diarias y los estados
  incluidos en el mes conservaron su comportamiento.

### Criterios verificados

- Los formularios de alta y edición aceptan las tres especialidades nuevas y
  no ofrecen General para nuevos turnos.
- Un turno histórico de General puede conservarse o cambiar a otra
  especialidad durante la edición.
- General y Operatoria se suman bajo una sola etiqueta de Operatoria en la
  agenda mensual.
- Cada día limita el resumen a tres especialidades y aplica correctamente el
  singular o plural del excedente.
- El lector de pantalla recibe el desglose completo de especialidades y
  cantidades.
- La grilla mensual fue revisada en escritorio y a 320 px sin desbordamiento
  horizontal ni regresiones en la selección del día.
- Las regresiones automatizadas cubren el catálogo, la compatibilidad
  histórica, la agrupación, el orden, el límite visual y la accesibilidad.

### Skills aplicadas

- `project-sprint-workflow` para acordar el alcance, publicar el cambio
  funcional y separar su cierre documental.
- `usability-review` para definir jerarquía, etiquetas, abreviaturas, uso
  redundante de color y texto y adaptación responsive.
- Next.js y `react-best-practices` para integrar el resumen sin mover la
  consulta al cliente ni agregar estado innecesario.
- Supabase, `supabase-postgres-best-practices` y `security-sprint-review` para
  ampliar el enum de forma aditiva y verificar el aislamiento existente.
- Browser para revisar escritorio, mobile, contenido accesible y el catálogo
  disponible en el formulario.
- `odontosync-release-check` para la batería final, publicación y comprobación
  de CI.

### Verificaciones

- Pruebas: 35 archivos y 221 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Prisma: esquema válido y migración aditiva incluida; no se aplicó
  manualmente a la base enlazada durante el sprint.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en el PR funcional.
- RLS: las cuatro suites enlazadas aprobaron en la verificación inicial. En la
  repetición previa a publicar, el fixture de turnos colisionó con un turno
  real por usar `CURRENT_TIMESTAMP`; las otras suites aprobaron y la rama no
  modificó esa prueba ni la base enlazada.
- Asesor de Supabase: sin errores; permanece el aviso externo conocido de
  protección contra contraseñas filtradas desactivada.

### Riesgo residual y próximos pasos

- La migración debe aplicarse en el entorno correspondiente antes de persistir
  Control, Estética o Blanqueamiento allí.
- La prueba RLS de turnos depende de horarios relativos del primer usuario real
  y puede colisionar con datos existentes; conviene aislar su fixture en un
  sprint posterior.
- Los filtros por especialidad, los colores por estado y cualquier cambio en
  las vistas diaria o semanal permanecen fuera de alcance.

## Sprint 023 — Agenda mensual adaptable

- **Fecha:** 29 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#73](https://github.com/daifernandez/odontosync/issues/73)
- **Rama:** `codex/sprint-023-monthly-responsive`
- **Publicación:** [PR #74](https://github.com/daifernandez/odontosync/pull/74),
  merge commit `77a83a9`

### Objetivo

Adaptar la agenda mensual al ancho real disponible junto a la navegación de la
aplicación, manteniendo la grilla de siete columnas y el resumen coloreado por
especialidad sin cortes ni compresión.

### Resultado

- La agenda mensual usa consultas de contenedor y deja de decidir su
  composición solamente por el ancho total de la ventana.
- El encabezado, el selector de vistas, la navegación mensual y las acciones
  del día se apilan cuando el ancho disponible no permite una fila legible.
- En espacios reducidos, `Abrir agenda diaria` ocupa una fila y `Nuevo turno`
  y `Bloquear horario` comparten la siguiente; en anchos amplios las tres
  acciones recuperan una sola fila.
- Los días y especialidades alternan entre nombres completos y abreviaturas
  según el ancho del calendario, conservando color, texto y cantidad.
- Cada celda reserva una franja superior estable para el número del día, de
  modo que las etiquetas nunca lo desplacen.
- No se modificaron fechas, datos, especialidades, vistas diaria o semanal,
  autenticación, permisos, dependencias ni persistencia.

### Criterios verificados

- La grilla conserva los siete días de la semana sin desbordamiento horizontal
  ni controles recortados en ancho reducido.
- El menú lateral abierto o cerrado ya no activa prematuramente la composición
  amplia dentro de un área angosta.
- Las etiquetas compactas y completas mantienen especialidad y cantidad sin
  depender solamente del color.
- Seleccionar un día, abrir su agenda, crear un turno y bloquear un horario
  conservan sus destinos y comportamiento.
- El foco visible, los nombres accesibles y el estado seleccionado del día se
  mantienen sin cambios.
- Las regresiones automatizadas comprueban el contrato de consultas de
  contenedor, los puntos de recomposición, las etiquetas y la franja reservada
  para la fecha.

### Skills aplicadas

- `project-sprint-workflow` para acordar el alcance, separar el cambio
  funcional del cierre documental y conservar la vista diaria fuera del PR.
- `usability-review` para priorizar legibilidad, objetivos táctiles, adaptación
  al ancho real, teclado y ausencia de desbordamiento.
- `odontosync-release-check` para revisar el diff, ejecutar la batería completa,
  publicar la rama y comprobar GitHub Actions.

### Verificaciones

- Pruebas: 35 archivos y 222 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en 53 segundos en el PR funcional.
- La revisión visual en ancho reducido y con navegación lateral fue aprobada
  por Dai mediante capturas de la aplicación local.
- No aplicaron controles de Prisma, Supabase ni RLS porque el sprint no cambió
  esquema, persistencia, consultas, permisos o autenticación.

### Riesgo residual y próximos pasos

- La vista diaria conserva breakpoints basados en la ventana y puede comprimir
  acciones y el selector de vistas cuando la navegación lateral reduce el ancho
  real; se acordó tratarla en un sprint independiente.
- Durante el cierre se observó una advertencia de hidratación en la línea
  temporal diaria: servidor y navegador producen espacios distintos en
  `a. m.`. Debe reproducirse y corregirse junto con la revisión diaria, sin
  mezclarlo con este sprint ya publicado.
- No se identificó por ahora un problema funcional con las fechas.

## Sprint 024 — Agenda diaria adaptable

- **Fecha:** 29 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#76](https://github.com/daifernandez/odontosync/issues/76)
- **Rama:** `codex/sprint-024-daily-responsive`
- **Publicación:** [PR #77](https://github.com/daifernandez/odontosync/pull/77),
  merge commit `93bcb1c`

### Objetivo

Adaptar la agenda diaria al ancho real disponible junto a la navegación de la
aplicación, evitando recortes sin alterar la grilla clínica ni el
comportamiento de los turnos.

### Resultado

- La agenda diaria usa consultas de contenedor y deja de recomponer el
  encabezado, las métricas y los controles según el ancho total de la ventana.
- En ancho reducido, `Nuevo turno` ocupa una fila y `Bloquear horario` y
  `Ajustar horarios` comparten la siguiente; en espacios amplios las acciones
  recuperan una sola fila.
- La fecha seleccionada, el selector de vistas y la navegación diaria se
  separan cuando no entran de forma legible, manteniendo completas las tres
  etiquetas de vista.
- Las métricas conservan tres columnas cuando el contenedor lo permite y se
  apilan únicamente en mobile angosto.
- Las tarjetas de seguimiento cambian a su composición amplia según el espacio
  real disponible y evitan comprimir especialidad, estado y acción.
- El horario localizado normaliza sus espacios para producir el mismo texto en
  servidor y cliente y evitar la advertencia de hidratación observada.
- No se modificaron fechas, datos, reglas, estados, autenticación, permisos,
  dependencias ni persistencia.

### Criterios verificados

- Las acciones, el selector de vistas y la navegación permanecen completos y
  sin desplazamiento horizontal accidental en ancho reducido.
- La grilla horaria y los bloques de turnos conservan sus proporciones y
  destinos de navegación.
- Los controles mantienen texto, nombre accesible, foco visible y objetivos
  táctiles equivalentes a los existentes.
- La composición semanal compartida conserva su contenido y comportamiento.
- Las regresiones automatizadas comprueban los puntos de recomposición por
  contenedor y la normalización del texto horario.

### Skills aplicadas

- `project-sprint-workflow` para acordar el alcance, separar la implementación
  del cierre documental y conservar el issue abierto hasta este PR.
- `usability-review` para priorizar claridad, ausencia de recortes, jerarquía
  de acciones y adaptación al ancho real.
- Browser para preparar la revisión local; la automatización de `localhost`
  fue bloqueada y la validación visual final fue realizada por Dai.
- `odontosync-release-check` para revisar el diff, ejecutar la batería completa,
  publicar la rama y comprobar GitHub Actions.

### Verificaciones

- Pruebas: 35 archivos y 223 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en 1 minuto y 1 segundo en el PR funcional.
- La revisión visual local en ancho reducido fue aprobada por Dai.
- No aplicaron controles de Prisma, Supabase ni RLS porque el sprint no cambió
  esquema, persistencia, consultas, permisos o autenticación.

### Riesgo residual y próximos pasos

- La política del navegador impidió automatizar la comprobación visual de
  `localhost`; la cobertura disponible combina pruebas de regresión, build de
  producción y aprobación visual manual.
- No se identificaron cambios pendientes en fechas ni reglas de turnos dentro
  de este sprint.

## Sprint 025 — Fixture RLS de turnos aislado

- **Fecha:** 30 de agosto de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#79](https://github.com/daifernandez/odontosync/issues/79)
- **Rama:** `codex/sprint-025-isolated-appointments-rls`
- **Publicación:** [PR #80](https://github.com/daifernandez/odontosync/pull/80),
  merge commit `6d42b13`

### Objetivo

Evitar que la prueba RLS de turnos dependa del primer usuario real del proyecto
y colisione con sus turnos al construir escenarios relativos a la hora actual.

### Resultado

- El fixture crea una identidad de Supabase Auth propia con un identificador
  aleatorio dentro de la transacción de prueba.
- El perfil, los pacientes y los turnos del fixture pertenecen únicamente a esa
  identidad temporal y se revierten con el `ROLLBACK` existente.
- Se eliminó la selección de `auth.users LIMIT 1`, por lo que los turnos reales
  dejaron de influir en la verificación.
- Una regresión automatizada protege el contrato de aislamiento, la marca del
  fixture y la conservación del rollback.
- No se modificaron políticas, permisos, migraciones, esquema, interfaz ni
  comportamiento productivo.

### Criterios verificados

- La prueba enlazada de turnos aprueba aunque existan turnos reales para los
  usuarios del proyecto.
- Se conservan los casos de usuario anónimo, identidad ajena, propietario,
  estados, superposición y reprogramación.
- Las cuatro suites RLS enlazadas aprueban.
- Una consulta posterior a la ejecución confirmó cero identidades de fixture
  persistentes.
- La batería completa del proyecto permanece aprobada.

### Skills aplicadas

- `project-sprint-workflow` para acordar el cambio, aislar la implementación y
  separar el cierre documental.
- Supabase y `supabase-postgres-best-practices` para verificar el uso de RLS,
  transacciones y datos de prueba.
- `security-sprint-review` para conservar los casos negativos y comprobar que
  el fixture no deje datos persistentes.
- `odontosync-release-check` para revisar el diff, ejecutar la batería final,
  publicar la rama y comprobar GitHub Actions.

### Verificaciones

- Pruebas: 36 archivos y 224 casos aprobados.
- TypeScript, ESLint, Prisma y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- Las cuatro suites RLS enlazadas y el asesor de seguridad: aprobados sin
  errores.
- GitHub Actions: aprobado en 53 segundos en el PR funcional.
- La consulta posterior al rollback informó 0 usuarios marcados como fixture.

### Riesgo residual y próximos pasos

- Permanece la advertencia externa conocida de protección contra contraseñas
  filtradas desactivada, postergada en el issue #19 hasta contar con un plan de
  Supabase compatible o cambiar las condiciones del proyecto.
- No quedaron cambios funcionales, visuales ni de datos pendientes dentro de
  este sprint.

## Sprint 027 — Indicaciones imprimibles base

- **Fecha:** 2 de septiembre de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#84](https://github.com/daifernandez/odontosync/issues/84)
- **Rama:** `codex/sprint-027-indicaciones-base`
- **Publicación:** [PR #86](https://github.com/daifernandez/odontosync/pull/86),
  merge commit `41ed2b1`

### Objetivo

Permitir que cada odontólogo cree, edite, organice y reutilice indicaciones
generales, con una hoja clara para imprimir o guardar como PDF y sin asociarlas
a pacientes ni turnos.

### Resultado

- Se incorporó una biblioteca privada de plantillas agrupadas por especialidad,
  con búsqueda, filtro y estados vacío, carga y error.
- El profesional puede definir título, introducción opcional, puntos extensos y
  elegir entre listas numeradas, guiones, viñetas, checks o ícono OdontoSync.
- Las plantillas pueden crearse, editarse y reutilizarse con distintos pacientes
  sin guardar información clínica individual.
- La vista final presenta una hoja A4 minimalista con datos profesionales,
  contenido completo y una firma de marca OdontoSync discreta.
- La biblioteca, el editor, los controles de impresión y la hoja se adaptaron a
  escritorio y mobile, incluyendo anchos de 319 y 634 píxeles.
- La persistencia aplica permisos mínimos y RLS forzada para que cada usuario
  sólo pueda leer, crear y modificar sus propias plantillas.
- Se actualizaron `fast-uri` y el `mysql2` transitivo de Prisma a versiones sin
  los avisos detectados, sin degradar Prisma ni relajar el audit.

### Criterios verificados

- Una plantilla guardada reaparece en la biblioteca y puede editarse e
  imprimirse posteriormente.
- Se exige título, especialidad y al menos una indicación; los textos largos se
  conservan sin recortes.
- La aplicación no solicita ni persiste datos de pacientes en este flujo.
- Un usuario anónimo o una identidad distinta no puede acceder a las plantillas
  del propietario; tampoco se permite eliminarlas en este sprint.
- La vista previa conserva el contenido y la jerarquía de la hoja imprimible.
- El recorrido responsive no presenta desbordamiento horizontal y fue aprobado
  visualmente por Dai.

### Skills aplicadas

- `project-sprint-workflow` para delimitar la entrega, separar el PR funcional
  del cierre documental y conservar las ideas futuras fuera del alcance.
- `usability-review` para iterar la jerarquía, densidad, controles, biblioteca y
  experiencia responsive.
- Supabase y `security-sprint-review` para persistencia, RLS, permisos mínimos y
  pruebas de aislamiento entre profesionales.
- Browser para revisar el flujo real y sus composiciones de escritorio y mobile.
- `odontosync-release-check` para comprobar dependencias, Prisma, pruebas,
  build, publicación y GitHub Actions.

### Verificaciones

- Pruebas: 46 archivos y 255 casos aprobados.
- TypeScript, ESLint, Prisma y build de producción: aprobados.
- Base vinculada al día con 19 migraciones.
- Las cinco suites RLS vinculadas y el asesor de seguridad de Supabase se
  ejecutaron sin errores.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en 1 minuto y 5 segundos en el PR funcional.
- Revisión visual aprobada en escritorio y en anchos de 319 y 634 píxeles.

### Riesgo residual y próximos pasos

- La personalización de logo, encabezado, colores y firma de marca permanece en
  el backlog de producto [#85](https://github.com/daifernandez/odontosync/issues/85)
  y no forma parte de esta entrega base.
- Supabase continúa informando que la protección contra contraseñas filtradas
  está desactivada; el seguimiento general permanece en el issue #19.
- Eliminar o duplicar plantillas, almacenar PDFs y asociar indicaciones con
  pacientes o turnos quedaron fuera de alcance.

## Sprint 028 — Pulido UX de indicaciones

- **Fecha:** 2 de septiembre de 2026
- **Estado:** publicado y mergeado
- **Issue:** [#88](https://github.com/daifernandez/odontosync/issues/88)
- **Rama:** `codex/sprint-028-pulido-ux-indicaciones`
- **Publicación:** [PR #89](https://github.com/daifernandez/odontosync/pull/89),
  merge commit `08ec359`

### Objetivo

Pulir la biblioteca de indicaciones para que sus controles y estados sean
claros, compactos y consistentes en escritorio y mobile, sin sumar nuevas
funciones ni alterar los datos guardados.

### Resultado

- Se quitó de la interfaz el contador redundante `N resultados` al buscar o
  filtrar plantillas.
- La cantidad filtrada permanece disponible como anuncio no visible para
  tecnologías de asistencia.
- El botón para restablecer filtros conserva la estética secundaria aprobada y
  deja de competir visualmente con el contenido de la biblioteca.
- Los estados de biblioteca vacía, búsqueda sin coincidencias y error utilizan
  menos altura, tipografía y espaciado en mobile sin reducir las acciones
  táctiles esenciales.
- El estado de carga replica la estructura y las dimensiones responsive de la
  biblioteca actual para reducir saltos al aparecer el contenido.
- No se modificaron plantillas, esquema, persistencia, autenticación, permisos
  ni RLS.

### Criterios verificados

- El contador de resultados no aparece visualmente al aplicar una búsqueda o
  especialidad.
- Las actualizaciones de resultados conservan un anuncio accesible y los
  controles mantienen nombre semántico y foco nativo.
- Los estados vacío, sin coincidencias, carga y error son compactos en mobile y
  mantienen su siguiente acción visible.
- La biblioteca no presenta desplazamiento horizontal accidental a 320 ni a
  1280 píxeles.
- El recorrido de buscar, filtrar, restablecer, abrir una nueva plantilla,
  editar y acceder a la vista imprimible continúa funcionando.

### Skills aplicadas

- `project-sprint-workflow` para acordar el alcance, separar la implementación
  del cierre documental y conservar abierto el issue hasta este PR.
- `usability-review` para convertir densidad, estados, feedback, mobile y
  accesibilidad básica en criterios observables.
- Next.js y React Best Practices para mantener correctos los estados especiales
  del App Router y revisar los componentes TSX modificados.
- Browser para comprobar el flujo real, las dimensiones responsive, la consola
  y el desbordamiento horizontal.
- `odontosync-release-check` para revisar el diff, ejecutar la batería completa,
  publicar la rama y comprobar GitHub Actions.

### Verificaciones

- Pruebas: 48 archivos y 259 casos aprobados.
- TypeScript, ESLint y build de producción: aprobados.
- Dependencias: 0 vulnerabilidades reportadas por `npm audit`.
- GitHub Actions: aprobado en 1 minuto y 3 segundos en el PR funcional.
- Revisión visual aprobada por Dai después de comprobar 320 y 1280 píxeles.
- La consola no presentó errores durante el recorrido verificado.
- No aplicaron controles de Prisma, Supabase ni RLS porque el sprint no cambió
  esquema, persistencia, consultas, permisos o autenticación.

### Riesgo residual y próximos pasos

- No se identificaron riesgos bloqueantes dentro del alcance del sprint.
- La personalización premium de logo, encabezado, colores y firma continúa
  separada en el backlog de producto
  [#85](https://github.com/daifernandez/odontosync/issues/85).
