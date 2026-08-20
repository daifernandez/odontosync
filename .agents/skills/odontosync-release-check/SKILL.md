---
name: odontosync-release-check
description: Preparar y verificar ramas de OdontoSync antes de commit, push, pull request o merge. Usar cuando se pida dejar una rama lista para publicar, revisar el estado previo a un PR, ejecutar la batería de calidad y seguridad, comprobar cambios de Next.js, Prisma o Supabase, o confirmar el resultado de CI.
---

# OdontoSync Release Check

Dejar una rama lista para revisión con evidencia reproducible. Mantener separados verificación y publicación: verificar no autoriza commit, push, PR, merge ni cambios remotos.

## 1. Confirmar alcance

- Expresar supuestos y criterios de éxito antes de modificar archivos.
- Inspeccionar `git status --short --branch`, el diff y el historial reciente.
- Preservar cambios ajenos. Si el worktree mezcla tareas, detenerse y pedir el alcance exacto.
- Trabajar en una rama `codex/*`; no commitear directamente en `main`.

## 2. Revisar el diff

- Vincular cada archivo modificado con la tarea.
- Comprobar que no se incluyan `.env`, credenciales, datos reales de pacientes ni artefactos generados innecesarios.
- Ejecutar `git diff --check`.
- Revisar especialmente Server Actions, validación en servidor, autorización por recurso y mensajes de error.

## 3. Ejecutar controles base

Ejecutar todos los controles siguientes desde la raíz:

```bash
npm run test:run
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=low
```

- Tratar cualquier fallo como bloqueo del PR.
- No usar `npm audit fix --force`. Investigar la cadena vulnerable y aplicar el cambio mínimo compatible.
- Si cambian `package.json` o `package-lock.json`, comprobar reproducibilidad con `npm ci` y repetir los controles afectados.

## 4. Aplicar controles condicionales

### Prisma o migraciones

Ejecutar:

```bash
npm run prisma:validate
npx prisma migrate status
```

No aplicar migraciones a una base enlazada sin autorización explícita.

### Supabase, autenticación, RLS o datos

- Usar las skills de Supabase y revisión de seguridad.
- Ejecutar `npm run test:security:linked` cuando exista una conexión autorizada.
- Probar casos negativos: anónimo, usuario ajeno, sesión vencida, recurso inexistente y operación no permitida, según el cambio.
- Separar errores bloqueantes de advertencias externas y documentar el riesgo residual.

### Interfaz o flujo de usuario

- Usar la skill de navegador para comprobar el recorrido real, feedback, accesibilidad básica y errores de consola.
- No modificar registros reales durante QA sin autorización. Preferir datos ficticios o una comprobación sin envío.

## 5. Publicar sólo con autorización

Si el usuario pidió publicar:

1. Actualizar la base y confirmar que no haya conflictos.
2. Agregar sólo rutas confirmadas con `git add -- <rutas>`; no usar `git add .` ni variantes globales.
3. Crear un commit descriptivo.
4. Subir la rama actual.
5. Reutilizar un PR existente o abrir uno nuevo como borrador contra `main`.
6. Incluir alcance, migraciones, seguridad, pruebas y riesgos residuales en la descripción.
7. Esperar GitHub Actions y reportar su resultado.

No mergear el PR salvo que el usuario lo pida explícitamente.

## 6. Entregar evidencia

Informar de forma breve:

- rama y estado del worktree;
- commit y PR, si se publicaron;
- resultados exactos de tests, build, auditoría y controles condicionales;
- advertencias pendientes y próximo paso recomendado.

No declarar “seguro” o “listo” si queda un control bloqueante sin resolver.
