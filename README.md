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
