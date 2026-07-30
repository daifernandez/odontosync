# OdontoSync

## Visión y requisitos del primer MVP

**Estado:** alcance inicial definido

**Versión:** 0.2

**Fecha:** 30 de julio de 2026

---

## 1. Propósito

Este documento resume la visión y el alcance vigente de OdontoSync. El detalle
y la justificación de cada definición se conservan en
[`DECISIONES.md`](./DECISIONES.md), que prevalece ante cualquier diferencia.

El primer resultado será un prototipo académico funcional. Su evolución hacia
un producto para consultorios reales es un objetivo posterior y requerirá una
revisión específica de aspectos legales, de privacidad y de seguridad.

## 2. Problema

Los odontólogos que trabajan de forma independiente suelen organizar su agenda,
los datos de contacto de sus pacientes y distintos materiales impresos entre
calendarios, mensajes, planillas y anotaciones.

OdontoSync busca reducir esa fragmentación mediante una herramienta sencilla
que permita:

- organizar pacientes y turnos;
- calcular disponibilidad respetando horarios y tiempos de
  acondicionamiento;
- encontrar opciones de turnos mediante lenguaje natural;
- imprimir indicaciones generales y papelería odontológica vacía.

La idea surge de problemas cotidianos observados durante doce años de trabajo
como asistente dental.

## 3. Usuario prioritario y etapas

### 3.1. Prototipo académico

- Estará orientado a un odontólogo que trabaja por cuenta propia.
- Utilizará exclusivamente usuarios y pacientes ficticios.
- Mostrará de forma permanente que no deben ingresarse datos reales.
- La aceptación de esta condición será obligatoria durante el registro.
- Incluirá una cuenta de demostración con datos ficticios.

### 3.2. Producto real

La versión apta para datos reales se desplegará en un entorno separado, después
de revisar los requisitos legales, de privacidad, seguridad, conservación de
datos y contenido profesional aplicables en Argentina.

El aviso académico no reemplaza esas revisiones.

## 4. Alcance funcional del MVP

### 4.1. Registro, acceso y perfil

El odontólogo podrá registrarse de forma autónoma mediante:

- correo electrónico y contraseña;
- inicio de sesión con Google.

El correo deberá verificarse antes de acceder a información protegida. El
perfil tendrá:

- nombre completo obligatorio;
- matrícula y jurisdicción opcionales.

No habrá nombre de usuario independiente. Informar una matrícula no acreditará
la identidad profesional ni habilitará permisos especiales.

Al registrarse se creará un espacio individual cuyo usuario será propietario y
odontólogo. No será necesario configurar un equipo.

### 4.2. Configuración inicial

Cada odontólogo podrá definir:

- uno o más bloques de atención por día;
- intervalo visual de la agenda: 10, 15, 20, 30 o 60 minutos;
- duración habitual de los turnos;
- margen habitual de acondicionamiento posterior.

Los valores iniciales serán:

- grilla de 15 minutos;
- turnos de 30 minutos;
- acondicionamiento de 5 minutos.

También se podrán registrar bloqueos excepcionales, como vacaciones, feriados
o asuntos personales.

### 4.3. Pacientes

La ficha será exclusivamente administrativa y mínima:

- nombre obligatorio;
- apellido obligatorio;
- teléfono opcional;
- correo electrónico opcional.

Permitirá crear, consultar, actualizar, buscar y desactivar pacientes, además
de consultar sus turnos.

No incluirá DNI, domicilio, fecha de nacimiento, obra social o prepaga, plan,
número de afiliación, notas libres ni datos clínicos.

### 4.4. Agenda y turnos

La agenda tendrá vistas de día, semana y mes. Abrirá inicialmente en la vista
semanal y luego recordará la última vista elegida.

Cada turno almacenará:

- paciente;
- odontólogo responsable;
- fecha y hora de inicio;
- duración;
- margen de acondicionamiento;
- estado;
- especialidad o área odontológica.

El margen podrá modificarse para un turno concreto sin cambiar la configuración
habitual.

Las especialidades se elegirán desde este catálogo inicial:

- odontología general;
- odontopediatría;
- ortodoncia;
- cirugía;
- implantología;
- endodoncia;
- periodoncia;
- operatoria/restauradora;
- prótesis/rehabilitación.

El término «especialidad» identifica el área correspondiente al turno y no
acredita títulos ni certificaciones.

Los estados iniciales serán:

- pendiente de confirmación;
- confirmado;
- atendido;
- cancelado;
- ausente;
- reprogramado.

Al reprogramar se conservará el turno original y se creará uno nuevo, vinculado
con el anterior y pendiente de confirmación. No habrá campos libres para motivo
u observaciones.

### 4.5. Disponibilidad

La disponibilidad será calculada por reglas determinísticas a partir de:

- horarios habituales;
- bloqueos excepcionales;
- turnos que ocupan horario;
- duración y margen de acondicionamiento.

Los turnos pendientes y confirmados ocuparán horario. Los cancelados y
reprogramados lo liberarán. Los atendidos y ausentes permanecerán como registro
administrativo histórico.

Ante una superposición manual, la aplicación advertirá el conflicto y exigirá
confirmación explícita. La inteligencia artificial nunca propondrá ni creará
superposiciones.

### 4.6. Asistente para encontrar turnos

El usuario podrá expresar una búsqueda en lenguaje natural, por ejemplo:

> Buscar un turno de 60 minutos la próxima semana, preferentemente por la
> tarde.

La inteligencia artificial convertirá la solicitud en criterios estructurados
y validados. La aplicación aplicará esos criterios a su cálculo determinístico
de disponibilidad y presentará opciones compatibles.

Crear o reprogramar un turno siempre requerirá confirmación humana. La IA no
tomará decisiones clínicas ni generará contenido clínico.

Las pruebas automatizadas usarán modelos simulados y no dependerán de llamadas
externas pagas.

### 4.7. Indicaciones genéricas imprimibles

Habrá indicaciones generales clasificadas por especialidad o área, por ejemplo:

- posteriores a una topicación;
- posteriores a una exodoncia;
- posteriores a un implante;
- posteriores a la colocación de brackets.

No se asociarán con pacientes ni turnos y no tendrán espacios para nombre,
fecha o firma. Su contenido será redactado o aprobado por un odontólogo
responsable, nunca por inteligencia artificial.

### 4.8. Papelería odontológica vacía

El MVP permitirá imprimir formularios sin completar:

- hoja de planificación profesional;
- hoja administrativa para cálculos;
- odontograma de adultos con dentición permanente;
- odontograma pediátrico para dentición temporal y mixta.

La aplicación no permitirá escribir en ellos nombres, tratamientos, importes,
cálculos ni otros datos clínicos. Tampoco los asociará con pacientes o turnos,
ni guardará versiones, archivos o copias completadas.

Después de imprimirlos, su cumplimentación y conservación quedarán fuera de
OdontoSync. Antes de presentarlos como documentación apta para uso real se
revisarán profesionalmente y conforme a los requisitos aplicables.

## 5. Fuera del alcance del MVP

Quedan expresamente fuera:

- historia clínica y evolución clínica;
- odontogramas completados o almacenados;
- diagnósticos, antecedentes y notas clínicas;
- planes de tratamiento digitales o asociados a pacientes;
- presupuestos, cobros, pagos y facturación;
- consentimientos informados y firmas digitales;
- adjuntos o copias de documentos completados;
- proveedores, laboratorios, compras, insumos y stock;
- equipos de trabajo, invitaciones y roles adicionales;
- recordatorios automáticos por WhatsApp, SMS o correo;
- portales externos para pacientes u otros colaboradores;
- decisiones o contenido clínico generado por IA.

Estas funciones solo podrán evaluarse en etapas posteriores. No forman parte de
la arquitectura inicial salvo que una necesidad real lo justifique.

## 6. Requisitos de protección y calidad

- Los datos de cada usuario estarán aislados mediante autenticación,
  autorización y Row Level Security.
- La aplicación y las migraciones usarán credenciales de base de datos
  separadas.
- Los secretos se almacenarán en variables de entorno y no se versionarán.
- La interfaz será responsive y mantendrá criterios básicos de accesibilidad.
- Las reglas de agenda, permisos y aislamiento tendrán pruebas automatizadas.
- Las decisiones asistidas por IA permanecerán bajo control humano.
- El sistema utilizará formatos e idioma adecuados inicialmente para
  Argentina.

## 7. Arquitectura y stack principal

OdontoSync comenzará como un monolito modular:

- TypeScript;
- React;
- Next.js con App Router y runtime de Node.js;
- Tailwind CSS;
- shadcn/ui con Base UI, incorporando solo componentes necesarios;
- PostgreSQL administrado por Supabase;
- Supabase Auth;
- Prisma ORM estable y Prisma Migrate;
- Vitest, React Testing Library y Playwright;
- Vercel AI SDK mediante Vercel AI Gateway;
- npm como gestor de paquetes;
- Vercel para el despliegue académico.

No se utilizarán microservicios, Docker, Supabase Realtime ni Edge Functions en
esta etapa.

Las páginas y componentes no accederán directamente a Prisma o Supabase. El
acceso a datos quedará detrás de módulos y repositorios internos.

## 8. Criterios de éxito

El MVP académico se considerará funcional cuando sea posible verificar que:

1. Un odontólogo puede registrarse, verificar su correo e iniciar sesión.
2. Puede completar su perfil y configurar su horario habitual.
3. Puede gestionar fichas administrativas de pacientes ficticios.
4. Puede crear, confirmar, cancelar y reprogramar turnos.
5. La agenda calcula disponibilidad considerando bloqueos y acondicionamiento.
6. Una superposición manual requiere una confirmación explícita.
7. La IA interpreta una búsqueda y propone solamente opciones disponibles.
8. Crear o modificar un turno sugerido requiere confirmación humana.
9. Se pueden consultar e imprimir indicaciones genéricas.
10. Se pueden imprimir las hojas y odontogramas vacíos definidos.
11. Los datos de un usuario no resultan accesibles para otro.
12. La interfaz advierte que el prototipo admite únicamente datos ficticios.

## 9. Entregables académicos

Además de la aplicación, el proyecto incluirá:

- repositorio Git con historial comprensible;
- `README.md` detallado;
- código publicado en GitHub o acceso justificado para su revisión;
- despliegue accesible cuando sea posible;
- credenciales de demostración;
- presentación de diapositivas;
- vídeo explicativo con captura de pantalla.

## 10. Próximos pasos

1. Crear la base técnica del proyecto.
2. Diseñar el modelo conceptual de datos del MVP.
3. Definir los flujos principales y sus criterios de aceptación.
4. Crear bocetos de las pantallas prioritarias.
5. Implementar por incrementos pequeños y verificables.
