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

- La autenticación y la sesión utilizarán el cliente oficial de Supabase.
- Prisma ORM estable será la capa de acceso a PostgreSQL desde el servidor.
- El esquema se definirá con Prisma y se versionará mediante Prisma Migrate.
- Las restricciones, los índices y las políticas que Prisma no pueda expresar
  se incorporarán como SQL dentro de las migraciones.
- La aplicación accederá a los datos a través de repositorios internos; las
  páginas y componentes no consultarán Prisma ni Supabase directamente.
- Las migraciones y la aplicación utilizarán credenciales de base de datos
  separadas.
- El usuario de ejecución no tendrá `BYPASSRLS`; cada operación protegida
  establecerá dentro de una transacción la identidad previamente verificada
  por Supabase Auth.
- Las políticas RLS tendrán pruebas automatizadas.
- El acceso serverless utilizará el pool de conexiones de Supabase.
- No se utilizará Prisma Next mientras permanezca en Early Access.

## D-009. Estilos de la interfaz

- La interfaz utilizará Tailwind CSS.
- Los colores, tipografías, espaciados y radios se centralizarán mediante
  variables y tokens de diseño.
- La interfaz será responsive y deberá mantener criterios básicos de
  accesibilidad desde el comienzo.

## D-010. Componentes de interfaz

- La aplicación utilizará shadcn/ui con Base UI como base de componentes.
- Los componentes se incorporarán como código fuente dentro del proyecto.
- Solo se agregarán los componentes que tengan un uso concreto.
- Las personalizaciones conservarán los tokens visuales y los comportamientos
  accesibles definidos por el sistema de componentes.

## D-011. Gestión de dependencias

- npm será el gestor de paquetes.
- El archivo `package-lock.json` se versionará para mantener instalaciones
  reproducibles.

## D-012. Estrategia de pruebas

- Vitest será el ejecutor principal para pruebas unitarias y de integración.
- Las reglas de negocio se probarán sin depender de React ni de la base de
  datos siempre que sea posible.
- React Testing Library y `user-event` se utilizarán para componentes con
  comportamiento relevante desde la perspectiva del usuario.
- Las integraciones de Prisma, PostgreSQL y RLS se probarán contra una base de
  datos de prueba.
- Playwright cubrirá un conjunto pequeño de recorridos críticos de extremo a
  extremo en un navegador real.
- Los Server Components asíncronos se verificarán mediante pruebas de extremo
  a extremo, no intentando simularlos con Vitest.
- No se impondrá un porcentaje de cobertura arbitrario; se priorizarán reglas
  críticas, permisos, casos límite y regresiones.

## D-013. Integración de inteligencia artificial

- La aplicación utilizará Vercel AI SDK mediante Vercel AI Gateway.
- El despliegue en Vercel utilizará autenticación OIDC; el desarrollo local
  podrá utilizar una clave propia del Gateway.
- No se fijará un modelo hasta consultar la disponibilidad y los precios
  vigentes al implementar la funcionalidad.
- La IA transformará solicitudes en lenguaje natural en criterios
  estructurados y validados.
- La búsqueda de disponibilidad, la detección de superposiciones y la
  creación de turnos permanecerán como lógica determinística de la aplicación.
- La IA no creará ni modificará turnos sin confirmación humana.
- Las pruebas automatizadas utilizarán modelos simulados y no dependerán de
  llamadas externas pagas.
- Se registrará consumo por funcionalidad y se configurarán límites de uso y
  presupuesto.

## D-014. Métodos de autenticación

- Supabase Auth permitirá acceso mediante correo electrónico y contraseña.
- También se permitirá iniciar sesión con una cuenta de Google.
- La aplicación solicitará a Google únicamente identidad, correo y perfil
  básico; no almacenará tokens para acceder a otros servicios de Google.
- Las identidades con el mismo correo verificado podrán vincularse al mismo
  usuario.
- El perfil interno dependerá del identificador de Supabase Auth y no del
  proveedor utilizado para iniciar sesión.
- La demostración académica conservará una cuenta de prueba con contraseña para
  que la evaluación no dependa de una cuenta personal de Google.
- Las credenciales OAuth y demás secretos se almacenarán como variables de
  entorno y nunca en el repositorio.

## D-015. Registro autónomo

- Cualquier odontólogo podrá crear su propia cuenta sin invitación ni
  aprobación administrativa previa.
- Al completar el registro se creará su espacio de consultorio individual.
- El usuario inicial recibirá los permisos de propietario y odontólogo de ese
  espacio.
- El consultorio podrá utilizarse sin configurar miembros ni roles
  adicionales.
- La verificación del correo será obligatoria antes de acceder a información
  protegida.
