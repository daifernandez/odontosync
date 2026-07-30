# OdontoSync

## Registro de decisiones

**Estado:** en evolución
**Fecha de inicio:** 30 de julio de 2026

Este documento registra las decisiones confirmadas durante la definición del
producto. La visión y los requisitos generales se actualizarán cuando quede
cerrado el alcance del primer MVP.

## D-001. Etapas del producto

- La primera etapa será un prototipo académico funcional.
- La demostración utilizará exclusivamente usuarios y pacientes ficticios.
- El objetivo posterior es convertirlo en una aplicación utilizable por
  consultorios reales.
- Antes de utilizar datos reales se revisarán los requisitos legales, de
  privacidad, seguridad y conservación aplicables.

## D-002. Planes para imprimir

- El MVP podrá generar planes personalizados para imprimir.
- Los datos identificatorios del paciente se completarán sobre el documento
  impreso.
- La personalización existirá temporalmente en el navegador y no será
  almacenada por el sistema.
- No habrá asociación con pacientes, historial, adjuntos ni recuperación.
- Solo podrán guardarse plantillas completamente genéricas.

## D-003. Indicaciones genéricas

- Las indicaciones serán plantillas genéricas clasificadas por área.
- No estarán asociadas con pacientes ni turnos.
- No incluirán espacios para nombre, fecha o firma.
- Serán redactadas o aprobadas por un odontólogo responsable.
- La inteligencia artificial no generará contenido clínico.

## D-004. Requisitos académicos del TFM

- El proyecto debe ser una aplicación funcional y original.
- No existe una tecnología obligatoria.
- El repositorio deberá incluir un `README.md` detallado.
- El código deberá publicarse en GitHub; un repositorio privado requiere
  justificación y acceso para revisión.
- El despliegue es recomendado siempre que sea posible.
- La entrega requiere slides y un vídeo explicativo con captura de pantalla.
- Si existe autenticación, deberán proporcionarse credenciales de prueba.
- La fecha indicada fue el 20 de julio de 2026, pero se permiten entregas
  posteriores con posibles variaciones en los tiempos de corrección.

## D-005. Usuario prioritario

- El primer MVP estará dirigido a un odontólogo particular que administra su
  propio consultorio.
- La colaboración con secretaría, asistentes y otros odontólogos se
  incorporará en etapas posteriores.

## D-006. Arquitectura y despliegue iniciales

- La aplicación utilizará TypeScript, React y Next.js con App Router.
- Next.js cubrirá la interfaz y el backend sobre el runtime de Node.js.
- La arquitectura será un monolito modular; no se utilizarán microservicios.
- Los módulos de negocio se mantendrán separados de las páginas y rutas.
- La persistencia principal será una base de datos PostgreSQL administrada.
- El despliegue académico utilizará Vercel y servicios administrados.
- Docker, la infraestructura propia y la separación de servicios se evaluarán
  únicamente cuando exista una necesidad concreta.

## D-007. Plataforma de datos y autenticación

- Supabase proporcionará la base de datos PostgreSQL administrada y la
  autenticación.
- Las tablas de la aplicación utilizarán Row Level Security para limitar el
  acceso a los datos de cada usuario.
- Supabase Storage se incorporará solamente cuando el producto necesite
  almacenar archivos.
- No se utilizarán inicialmente Supabase Realtime ni Edge Functions.
- El proyecto utilizará Node.js 22 o una versión compatible posterior.

## D-008. Acceso y evolución de la base de datos

- El acceso en tiempo de ejecución utilizará el cliente oficial de Supabase
  con la sesión autenticada y tipos TypeScript generados desde el esquema.
- El esquema, las restricciones, los índices y las políticas RLS se
  versionarán mediante migraciones SQL.
- La aplicación accederá a los datos a través de repositorios internos; las
  páginas y componentes no consultarán Supabase directamente.
- Las políticas RLS tendrán pruebas automatizadas.
- No se incorporará inicialmente Prisma ni Drizzle porque no resuelven una
  necesidad actual y complican la ejecución de consultas bajo la identidad RLS
  del usuario.
- Se podrá incorporar una ORM dentro de los repositorios cuando exista una
  necesidad concreta y su integración con RLS no reduzca las garantías de
  aislamiento.

## D-009. Estilos de la interfaz

- La interfaz utilizará Tailwind CSS.
- Los colores, tipografías, espaciados y radios se centralizarán mediante
  variables y tokens de diseño.
- La interfaz será responsive y deberá mantener criterios básicos de
  accesibilidad desde el comienzo.
