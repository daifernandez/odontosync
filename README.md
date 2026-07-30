# OdontoSync

Prototipo académico de una aplicación para organizar la agenda de odontólogos
independientes.

> Esta etapa admite únicamente usuarios y pacientes ficticios. No debe
> utilizarse con datos de pacientes reales.

## Stack

- Next.js con App Router, React y TypeScript
- Tailwind CSS
- PostgreSQL y Supabase Auth
- Prisma ORM
- Vitest

La base de datos y la autenticación todavía no están conectadas.

## Requisitos

- Node.js 22.13 o posterior compatible
- npm

## Inicio local

```bash
npm install
cp .env.example .env
npm run dev
```

Las conexiones de ejemplo no permiten acceder a una base real. Deberán
reemplazarse al configurar el proyecto de Supabase.

## Verificaciones

```bash
npm run lint
npm run typecheck
npm run test:run
npm run prisma:validate
npm run build
```

## Documentación

- [Visión y requisitos](./VISION_Y_REQUISITOS.md)
- [Registro de decisiones](./DECISIONES.md)
