# OdontoSync

Prototipo académico de una aplicación para organizar la agenda de odontólogos
independientes.

> Esta etapa admite únicamente usuarios y pacientes ficticios. No debe
> utilizarse con datos de pacientes reales.

## Stack

- Next.js con App Router, React y TypeScript
- Tailwind CSS
- PostgreSQL y Supabase Auth
- Prisma Schema y Prisma Migrate
- Vitest

Supabase Auth está conectado. El primer esquema de perfiles y configuración de
agenda se administra con Prisma Migrate. La aplicación accede a esos datos
mediante la Data API de Supabase con la sesión del usuario y aislamiento por
Row Level Security; la conexión PostgreSQL directa se reserva para migraciones.

## Requisitos

- Node.js 22.13 o posterior compatible
- npm

## Inicio local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Reemplazá las variables de ejemplo por las del proyecto de Supabase. `APP_URL`
debe contener el origen público canónico de cada entorno autorizado; en
desarrollo se utiliza `http://localhost:3000`.

Para habilitar **Continuar con Google**, creá un cliente OAuth de tipo web en
Google Cloud y usá como URI de redirección autorizada la URL de callback que
muestra Supabase Auth para el proveedor Google
(`https://<project-ref>.supabase.co/auth/v1/callback`). Activá Google en
Supabase Auth > Providers con el ID y secreto del cliente. Agregá
`${APP_URL}/auth/callback` a las URL de redirección permitidas en Supabase
para cada entorno. Mantené el secreto sólo en la configuración del proveedor,
fuera de Git. En esta etapa la interfaz ofrece solo Google. El registro por
correo y el ingreso con contraseña quedan deshabilitados hasta configurar y
verificar SMTP propio; entonces se pueden habilitar con
`EMAIL_AUTH_ENABLED="true"`.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm run test:run
npm run prisma:validate
npm run test:security:linked
npm run build
```

La verificación enlazada ejecuta ataques de lectura y escritura contra las
políticas RLS dentro de una transacción que siempre termina con `ROLLBACK`, y
luego consulta los asesores de seguridad de Supabase.

## Documentación

- [Visión y requisitos](./VISION_Y_REQUISITOS.md)
- [Registro de decisiones](./DECISIONES.md)

## Evolución y trazabilidad

El estado actual del producto se explica en este README y en los documentos
anteriores. El detalle histórico de cada cambio se conserva en los
[issues](https://github.com/daifernandez/odontosync/issues), los
[pull requests](https://github.com/daifernandez/odontosync/pulls) y el historial
de Git. No se mantiene un registro cronológico duplicado dentro del repositorio.
