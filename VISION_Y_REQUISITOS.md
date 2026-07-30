# OdontoSync

## Visión y requisitos iniciales del producto

**Estado:** borrador inicial  
**Versión:** 0.1  
**Fecha:** 30 de julio de 2026

---

## 1. Propósito del documento

Este documento reúne la visión, el alcance inicial y las principales reglas de negocio de OdontoSync. Su objetivo es servir como referencia compartida antes de diseñar las pantallas, la arquitectura técnica, la base de datos y la memoria académica del proyecto final del máster.

Las ideas nuevas podrán incorporarse posteriormente, pero deberán evaluarse y priorizarse para evitar que el MVP pierda un alcance claro.

## 2. Contexto y problema

Muchos odontólogos, especialmente quienes trabajan solos o en equipos pequeños, tienen dificultades para mantener un control ordenado de las tareas administrativas y operativas del consultorio.

La información suele quedar distribuida entre agendas, mensajes, documentos impresos, planillas y anotaciones. Esto dificulta:

- Encontrar turnos disponibles con rapidez.
- Mantener organizada la información administrativa de los pacientes.
- Conservar y recuperar planes de tratamiento e indicaciones.
- Coordinar proveedores y laboratorios.
- Controlar compras, insumos e instrumental.
- Conocer el estado de los trabajos enviados al laboratorio.

OdontoSync nace a partir de la experiencia real de doce años de trabajo como asistente dental y busca resolver problemas cotidianos observados dentro del consultorio odontológico.

## 3. Visión del producto

OdontoSync será una aplicación de organización operativa para consultorios odontológicos. Centralizará pacientes, turnos, documentos, contactos y recursos del consultorio en una interfaz clara y accesible.

El sistema deberá resultar útil tanto para:

- Un odontólogo particular que trabaja sin equipo.
- Un consultorio integrado por varios odontólogos.
- Un equipo que también incluya secretaría y asistentes dentales.

## 4. Objetivos

- Reducir el tiempo necesario para organizar y encontrar turnos.
- Facilitar el acceso a la información administrativa de los pacientes.
- Permitir la creación, conservación, consulta e impresión de documentos.
- Mantener trazabilidad sobre autores, modificaciones y aceptaciones.
- Mejorar el control de proveedores, laboratorios, compras y existencias.
- Adaptarse a consultorios individuales y equipos con diferentes permisos.
- Utilizar inteligencia artificial como asistencia operativa, manteniendo las decisiones bajo control humano.

## 5. Fuera del alcance

OdontoSync no será una historia clínica digital.

Quedan expresamente fuera del alcance del MVP:

- Odontograma.
- Historia clínica y evolución clínica.
- Diagnósticos generados por inteligencia artificial.
- Planes de tratamiento o indicaciones redactados por inteligencia artificial.
- Firma digital con validez legal.
- Seguimiento avanzado de trabajos de laboratorio.
- Facturación, cobro o procesamiento de pagos.
- Portal externo para pacientes, proveedores o laboratorios.

La aceptación de un plan y presupuesto no deberá confundirse con un consentimiento informado. Si este último se incorpora en el futuro, será un tipo documental independiente.

## 6. Modelo de consultorio y usuarios

### 6.1. Consultorio individual

Un odontólogo particular podrá crear su espacio de trabajo y utilizar todos los módulos sin necesidad de configurar un equipo.

Recibirá los permisos de propietario y odontólogo.

### 6.2. Consultorio con equipo

Un consultorio podrá invitar miembros y asignarles roles. Los pacientes serán compartidos dentro del consultorio.

Los odontólogos podrán consultar los pacientes del consultorio y editar sus documentos según las reglas de autoría, firma y versionado definidas en este documento.

### 6.3. Roles iniciales

#### Propietario del consultorio

- Configurar el consultorio.
- Invitar y desactivar miembros.
- Asignar roles y permisos.
- Acceder a la administración general.
- Gestionar proveedores, laboratorios, compras y stock.

El rol de propietario representa autoridad sobre el espacio de trabajo y no implica necesariamente que la persona sea odontóloga.

#### Odontólogo

- Consultar pacientes compartidos.
- Gestionar su agenda y, según permisos, la agenda del equipo.
- Crear y modificar planes de tratamiento.
- Crear y modificar indicaciones clínicas.
- Finalizar documentos mediante firma interna.
- Consultar e imprimir documentos.

#### Secretaría o recepción

- Gestionar datos administrativos de pacientes.
- Crear, confirmar, cancelar y reprogramar turnos.
- Consultar agendas autorizadas.
- Consultar e imprimir documentos finalizados cuando tenga permiso.
- No podrá crear, modificar ni firmar contenido clínico.

#### Asistente dental

- Consultar la información necesaria para organizar el trabajo.
- Colaborar con la agenda según sus permisos.
- Gestionar proveedores, laboratorios, insumos e instrumental.
- Consultar e imprimir documentos finalizados cuando tenga permiso.
- No podrá crear, modificar ni firmar contenido clínico.

### 6.4. Permisos adicionales

Los permisos específicos evitarán crear una cantidad innecesaria de roles. Entre otros, podrán existir:

- Administrar miembros.
- Gestionar agendas de otros profesionales.
- Gestionar compras y stock.
- Gestionar proveedores y laboratorios.
- Consultar documentos finalizados.
- Imprimir documentos.
- Acceso de solo lectura.

Una misma persona podrá reunir más de un rol o conjunto de permisos.

## 7. Módulos funcionales del MVP

### 7.1. Pacientes

El módulo almacenará información administrativa y de contacto, sin convertirse en una historia clínica.

Deberá permitir:

- Crear, consultar, actualizar y desactivar pacientes.
- Buscar pacientes rápidamente.
- Evitar duplicados evidentes.
- Consultar sus turnos.
- Acceder a sus planes de tratamiento e indicaciones.
- Identificar el consultorio al que pertenece la información.

Los pacientes serán compartidos entre los integrantes autorizados del mismo consultorio.

### 7.2. Agenda de turnos

Deberá permitir:

- Consultar la agenda por día, semana y mes.
- Crear, confirmar, cancelar y reprogramar turnos.
- Asociar cada turno con un paciente y un profesional.
- Registrar fecha, hora, duración, motivo, estado y observaciones administrativas.
- Detectar superposiciones.
- Visualizar la disponibilidad de cada profesional.
- Buscar turnos por paciente, profesional o fecha.

### 7.3. Asistente de IA para encontrar turnos

La inteligencia artificial funcionará como una herramienta interna para odontólogos, asistentes o secretaría.

El usuario podrá realizar solicitudes en lenguaje natural, por ejemplo:

> Buscar un turno de 60 minutos para Ana la próxima semana, preferentemente por la tarde.

El sistema deberá:

- Interpretar duración, paciente, profesional, rango de fechas y preferencias.
- Consultar únicamente disponibilidad real.
- Proponer una o más opciones compatibles.
- Explicar brevemente por qué propone cada opción cuando sea necesario.
- Evitar superposiciones.
- Requerir confirmación humana antes de crear o modificar un turno.

La IA no tendrá autorización para confirmar autónomamente un turno ni para tomar decisiones clínicas.

### 7.4. Planes de tratamiento y presupuestos

#### 7.4.1. Propuestas y alternativas

Un plan se organizará como una propuesta que puede contener varias alternativas:

- Plan ideal.
- Plan alternativo.
- Otras alternativas creadas por el odontólogo.

Cada alternativa podrá incluir:

- Tratamientos o prestaciones.
- Pieza o sector, cuando corresponda.
- Etapas previstas.
- Importe por concepto y total estimado.
- Observaciones del profesional.
- Fecha o condición de validez del presupuesto.
- Profesional responsable.

Si el paciente y el odontólogo acuerdan combinar elementos de diferentes alternativas, el profesional podrá crear una nueva alternativa final.

#### 7.4.2. Estados

Una alternativa podrá encontrarse en alguno de estos estados:

- Borrador.
- Presentada.
- Aceptada.
- No seleccionada.
- Reemplazada.

#### 7.4.3. Autoría, edición y firma interna

Los planes serán redactados exclusivamente por odontólogos.

Cada documento y versión registrará:

- Autor original.
- Profesional que realizó la última modificación.
- Fecha y hora de creación.
- Fecha y hora de cada modificación.
- Número de versión.
- Profesional que finalizó y firmó internamente la versión.

Los odontólogos autorizados del consultorio podrán editar los documentos compartidos. Cada modificación quedará atribuida a su autor.

La firma interna identificará al profesional dentro de OdontoSync, pero no será presentada como una firma digital con validez legal.

#### 7.4.4. Versionado e inmutabilidad

Una versión aceptada no podrá sobrescribirse ni modificarse silenciosamente.

Si cambia el tratamiento, su alcance o la alternativa elegida:

- Se creará un nuevo plan relacionado con el anterior.
- El plan anterior se conservará.
- El nuevo plan deberá ser presentado y aceptado nuevamente.

Si cambia únicamente el precio de una etapa ajustable, se registrará una revisión económica sin reemplazar el contenido completo del plan.

#### 7.4.5. Políticas de precios

El profesional podrá elegir la política aplicable al plan.

##### Precio fijo

- El importe quedará congelado según la condición indicada.
- Podrá condicionarse al pago completo o a una fecha de validez.
- Los importes que ya hayan quedado fijados no se modificarán.
- Si la condición o el plazo no se cumplen, se deberá emitir una actualización.

##### Precio actualizable por etapas

- El presupuesto inicial se conservará como referencia.
- Cada etapa tendrá un valor estimado.
- Antes de iniciar una etapa pendiente, el profesional podrá actualizar su precio.
- Las etapas realizadas o pagadas conservarán el importe aplicado.
- Cada actualización registrará importe anterior, importe nuevo, fecha y profesional responsable.
- El paciente deberá aceptar el nuevo importe de la etapa.

La posible combinación de etapas fijas y actualizables se evaluará después del MVP.

#### 7.4.6. Aceptación

El flujo inicial previsto será:

1. El odontólogo finaliza y firma internamente la alternativa acordada.
2. El sistema genera un documento imprimible.
3. Paciente y profesional pueden firmarlo físicamente.
4. Un usuario autorizado registra la fecha de aceptación.
5. Se podrá adjuntar una copia escaneada o fotografiada del documento firmado.

El sistema conservará las alternativas no seleccionadas y el documento aceptado.

#### 7.4.7. Impresión y PDF

El documento generado deberá mostrar:

- Datos del paciente y del consultorio.
- Alternativa seleccionada.
- Tratamientos, etapas e importes.
- Política de precios y condiciones.
- Fecha y número de versión.
- Nombre y matrícula del profesional responsable.
- Identificador interno del documento.
- Espacios de firma cuando correspondan.

### 7.5. Indicaciones clínicas

Las indicaciones serán redactadas exclusivamente por odontólogos.

El módulo deberá permitir:

- Crear indicaciones para un paciente.
- Utilizar plantillas reutilizables sin convertirlas automáticamente en una indicación final.
- Editar, finalizar y firmar internamente.
- Conservar versiones y autoría.
- Consultar documentos anteriores.
- Generar PDF e imprimir.

La inteligencia artificial no redactará indicaciones clínicas.

### 7.6. Proveedores y laboratorios

El directorio deberá permitir:

- Registrar proveedores y laboratorios.
- Guardar datos de contacto, servicios, especialidad y observaciones administrativas.
- Buscar y filtrar contactos.
- Relacionar proveedores con insumos.
- Preparar el modelo para un futuro seguimiento de trabajos de laboratorio.

### 7.7. Compras, insumos e instrumental

El módulo deberá contemplar:

- Insumos consumibles.
- Instrumental reutilizable.
- Categorías.
- Proveedor habitual.
- Unidad de medida.
- Cantidad disponible.
- Stock mínimo.
- Entradas y salidas.
- Historial de movimientos.
- Alertas de reposición.
- Lista de productos que deben comprarse.

El alcance inicial será de control operativo. No incluirá contabilidad completa ni facturación.

## 8. Funcionalidad futura: seguimiento de laboratorio

El seguimiento avanzado no formará parte del MVP, pero deberá considerarse como evolución futura.

Un mismo trabajo podrá viajar varias veces entre consultorio y laboratorio antes de completarse. El modelo futuro deberá contemplar:

- Paciente.
- Profesional responsable.
- Laboratorio.
- Tipo de trabajo.
- Pieza, sector o prótesis relacionada.
- Estado actual.
- Próximo paso.
- Fechas de envío y recepción.
- Múltiples ciclos de ida y vuelta.
- Observaciones y archivos.
- Fecha comprometida.
- Historial completo de eventos.

En una fase posterior podrá existir un usuario externo de laboratorio con acceso restringido únicamente a los trabajos enviados a ese laboratorio.

## 9. Reglas transversales

### 9.1. Trazabilidad

Las acciones relevantes deberán registrar:

- Usuario.
- Consultorio.
- Fecha y hora.
- Acción realizada.
- Entidad afectada.
- Versión anterior y nueva cuando corresponda.

### 9.2. Conservación de autoría

Si un usuario abandona el consultorio, su cuenta podrá desactivarse, pero sus documentos, firmas internas y acciones históricas deberán conservarse.

### 9.3. Aislamiento entre consultorios

La información de un consultorio no deberá ser visible para miembros de otro consultorio sin una pertenencia y autorización explícitas.

### 9.4. Decisión humana

La IA asistirá en tareas operativas, pero no ejecutará cambios importantes sin confirmación del usuario ni realizará decisiones clínicas.

### 9.5. Acceso y protección

Los planes de tratamiento y las indicaciones contienen información sensible vinculada a pacientes. El sistema deberá aplicar autenticación, permisos, aislamiento de datos, trazabilidad y copias de seguridad.

## 10. Criterios iniciales de éxito del MVP

El MVP se considerará funcional cuando sea posible verificar que:

1. Un odontólogo particular puede crear su consultorio y trabajar sin configurar un equipo.
2. Un propietario puede invitar miembros y asignar roles.
3. Los miembros autorizados comparten pacientes dentro del consultorio.
4. Secretaría puede gestionar turnos sin editar documentos clínicos.
5. La agenda impide superposiciones y muestra disponibilidad real.
6. La IA propone turnos válidos a partir de una solicitud en lenguaje natural y solicita confirmación antes de agendarlos.
7. Un odontólogo puede crear una propuesta con plan ideal y alternativas.
8. El paciente y el profesional pueden elegir una alternativa y registrar su aceptación.
9. Una versión aceptada permanece inalterable y conserva sus firmas y autores.
10. Un cambio de tratamiento genera un nuevo plan relacionado.
11. Un cambio de precio en una etapa ajustable conserva el presupuesto original y registra la revisión.
12. Los planes e indicaciones pueden localizarse, generar PDF e imprimirse.
13. El consultorio puede registrar proveedores, laboratorios, insumos e instrumental.
14. Un movimiento de stock actualiza la cantidad disponible y la lista de compras.
15. Las acciones sensibles conservan usuario, fecha, hora y versión.

## 11. Decisiones pendientes

Antes de diseñar la arquitectura deberán resolverse:

- Si un usuario podrá pertenecer a más de un consultorio.
- Qué permisos exactos recibirá cada rol de forma predeterminada.
- Si los odontólogos podrán gestionar todas las agendas o solamente las autorizadas.
- Qué datos administrativos serán obligatorios para identificar a un paciente.
- Cómo se detectarán y resolverán pacientes duplicados.
- Si adjuntar la copia firmada de un plan será obligatorio u opcional.
- Si se permitirán monedas diferentes y cómo se presentarán los ajustes por inflación.
- Qué tipos de archivo podrán adjuntarse y cuáles serán sus límites.
- Qué información utilizará la IA para priorizar propuestas de turnos.
- Qué nivel de detalle tendrá el stock de instrumental reutilizable.
- Qué restricciones, entregables y criterios académicos exige el proyecto final del máster.

## 12. Próximos pasos

1. Validar este documento con los casos reales del consultorio.
2. Obtener y revisar la rúbrica del proyecto final.
3. Priorizar los requisitos del MVP.
4. Definir los principales flujos de usuario.
5. Diseñar el modelo conceptual de datos.
6. Crear bocetos de las pantallas principales.
7. Elegir la arquitectura y las tecnologías.
