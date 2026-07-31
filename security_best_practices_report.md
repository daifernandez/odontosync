# Informe de seguridad de OdontoSync

Fecha: 31 de julio de 2026
Alcance: Next.js, Supabase Auth, PostgreSQL, Prisma, RLS y dependencias npm.

## Resumen ejecutivo

No se encontraron secretos versionados ni vulnerabilidades críticas conocidas.
La base remota exige TLS, las tablas de aplicación usan RLS forzado, los roles
de API tienen privilegios mínimos y las pruebas intentan lectura, inserción,
actualización, borrado y suplantación entre usuarios.

Queda un riesgo alto abierto: Supabase no permite activar la protección contra
contraseñas filtradas en el plan Free. Para eliminarlo es necesario pasar el
proyecto a Pro o superior. También falta definir una salida de red estable antes
de restringir por IP las conexiones directas a PostgreSQL.

## Hallazgos altos

### SEC-001 — Protección contra contraseñas filtradas desactivada

- Severidad: Alta.
- Estado: Abierto; requiere Supabase Pro o superior.
- Ubicación: Supabase Auth → Sign In / Providers → Email.
- Evidencia: `supabase db advisors --linked --type security --level info`
  devuelve `auth_leaked_password_protection`. El panel identifica el control como
  disponible únicamente en Pro.
- Impacto: una contraseña conocida por filtraciones podría reutilizarse para
  tomar una cuenta mediante credential stuffing.
- Corrección: activar `Prevent use of leaked passwords` después del cambio de
  plan. Supabase documenta que el control consulta Pwned Passwords de
  HaveIBeenPwned.
- Mitigación actual: mínimo de 12 caracteres, mayúscula, minúscula, número y
  símbolo en `supabase/config.toml:181`; confirmación de correo, cambio seguro de
  contraseña y requisito remoto de contraseña actual.
- Falso positivo: ninguno; el advisor remoto confirma el estado.

### SEC-002 — Dependencias transitivas vulnerables en producción

- Severidad: Alta.
- Estado: Corregido.
- Ubicación: `package.json:46`.
- Evidencia: `npm audit --omit=dev` reportaba vulnerabilidades altas en PostCSS y
  Sharp arrastradas por Next.js 16.2.12.
- Impacto: procesamiento malicioso de CSS o imágenes podía exponer información o
  agotar/comprometer procesos que utilizaran esas rutas.
- Corrección: overrides acotados a PostCSS 8.5.25 y Sharp 0.35.3.
- Verificación: `npm audit --omit=dev` devuelve cero vulnerabilidades y el build
  valida compatibilidad.
- Falso positivo: la aplicación no usa actualmente `next/image`, pero mantener
  Sharp vulnerable seguía siendo una exposición innecesaria del artefacto.

## Hallazgos medios

### SEC-003 — Conexiones PostgreSQL sin exigencia de TLS

- Severidad: Media.
- Estado: Corregido en el proyecto remoto.
- Ubicación: configuración administrada de Supabase PostgreSQL.
- Evidencia: `supabase ssl-enforcement get` devolvía `database: false`.
- Impacto: un cliente mal configurado podía negociar una conexión directa sin
  cifrado.
- Corrección: se activó Database SSL Enforcement.
- Verificación: `pg_stat_ssl` confirma TLS 1.3 con
  `TLS_AES_256_GCM_SHA384`; Prisma y las pruebas enlazadas siguen conectando.
- Falso positivo: el servidor ya soportaba TLS, pero no lo exigía.

### SEC-004 — Privilegios implícitos para objetos futuros

- Severidad: Media.
- Estado: Corregido.
- Ubicación: `prisma/migrations/20260731185431_harden_database_defaults/migration.sql:1`
  y `prisma/migrations/20260731190253_revoke_default_function_execute/migration.sql:1`.
- Evidencia: PostgreSQL concedía `EXECUTE` a `PUBLIC` para funciones nuevas y la
  tabla `_prisma_migrations` no tenía RLS forzado con una política explícita.
- Impacto: una función privilegiada creada en el futuro podía convertirse en un
  endpoint RPC involuntario; metadatos internos podían quedar expuestos si los
  grants derivaban.
- Corrección: defaults cerrados, esquema privado revocado, RLS forzado y política
  restrictiva de denegación para los metadatos de Prisma.
- Verificación: la prueba crea funciones y secuencias de sondeo dentro de una
  transacción y confirma que los roles de API no pueden utilizarlas.
- Falso positivo: ninguno; la primera ejecución de la prueba reprodujo el fallo.

### SEC-005 — Redirecciones construidas desde el Host de la solicitud

- Severidad: Media.
- Estado: Corregido.
- Ubicación: `src/app/auth/callback/route.ts:7` y
  `src/lib/supabase/proxy.ts:34`.
- Evidencia: las redirecciones usaban antes `request.url` o `request.nextUrl` como
  origen.
- Impacto: en una infraestructura que aceptara un Host manipulado, un atacante
  podía intentar desviar un callback de autenticación a otro dominio.
- Corrección: todas las redirecciones de Auth se construyen desde `APP_URL`, cuyo
  protocolo, origen y ausencia de credenciales se validan.
- Mitigación: Vercel normalmente valida hosts, pero la aplicación ya no depende
  de ese comportamiento.
- Falso positivo: el riesgo dependía de la configuración del proxy/edge.

### SEC-006 — Endpoint directo de PostgreSQL abierto a cualquier IP

- Severidad: Media.
- Estado: Abierto; requiere una decisión de arquitectura.
- Ubicación: Supabase Network Restrictions; actualmente IPv4 `0.0.0.0/0` e IPv6
  `::/0`.
- Evidencia: `supabase network-restrictions get` confirma ambos rangos.
- Impacto: el endpoint de conexión directa acepta intentos desde Internet, aunque
  todavía exige TLS y credenciales.
- Corrección: permitir únicamente IPs de administración y una salida estática del
  backend. No debe aplicarse una IP dinámica local como solución permanente.
- Mitigación actual: contraseña fuerte, pooler, TLS obligatorio y ausencia de
  credenciales en el repositorio.
- Falso positivo: no afecta la Data API; sólo las conexiones directas a Postgres.

## Hallazgos bajos y operativos

### SEC-007 — Controles adicionales de Auth pendientes

- Severidad: Baja ahora; aumentará antes de usar datos reales.
- Estado: Abierto.
- Ubicación: Supabase Auth → Attack Protection y Multi-Factor.
- Evidencia: CAPTCHA está desactivado y la aplicación aún no implementa enrolado
  y desafío MFA.
- Impacto: mayor superficie para automatización de registros e intentos de acceso.
- Corrección: configurar Turnstile/hCaptcha y exigir MFA antes de admitir datos
  personales o clínicos.
- Mitigación actual: límites de Supabase Auth, confirmación de correo, política de
  contraseña fuerte y sesiones rotatorias.
- Falso positivo: CAPTCHA necesita claves externas y MFA necesita flujo de UI;
  activarlos sólo en el panel rompería el alta actual.

### SEC-008 — Advisories en herramientas de desarrollo

- Severidad: Baja para producción.
- Estado: Abierto por compatibilidad upstream.
- Ubicación: ESLint y plugins de `eslint-config-next` en `package.json:32`.
- Evidencia: el audit completo informa nueve vulnerabilidades altas transitivas
  en `brace-expansion/minimatch`; `npm audit --omit=dev` devuelve cero.
- Impacto: posible denegación de servicio durante lint sobre entrada hostil; no se
  incluye en el bundle ni en las dependencias de runtime.
- Corrección: actualizar cuando los plugins oficiales soporten ESLint 10 o
  publiquen un árbol corregido. No usar `npm audit fix --force`, que propone una
  regresión mayor incompatible.
- Mitigación: CI con lockfile y entradas controladas.
- Falso positivo: la severidad del registry no refleja la exposición de runtime,
  que es nula.

## Controles verificados

- `.env.local` está ignorado y no aparece en el historial Git.
- No hay claves `service_role`, contraseñas ni llaves privadas versionadas.
- CSP con nonce y `strict-dynamic` cubre todas las rutas de aplicación desde
  `src/proxy.ts:9`; no usa `unsafe-inline` y sólo permite `unsafe-eval` en local.
- Los callbacks aceptan únicamente rutas internas y un origen canónico.
- `anon` no tiene privilegios sobre las tablas de aplicación.
- `authenticated` sólo puede operar sus propias filas y no puede borrar perfil o
  configuración general.
- Las funciones `SECURITY DEFINER` están en un esquema privado, con `search_path`
  vacío y sin `EXECUTE` para roles de API.
- La prueba enlazada termina siempre en `ROLLBACK`; no conserva datos de prueba.

## Límite de alcance

El proyecto continúa marcado como prototipo académico y no debe almacenar datos
reales de pacientes. Seguridad técnica no sustituye evaluación legal, acuerdos
de tratamiento, retención, backups, respuesta a incidentes ni requisitos de
cumplimiento aplicables a información clínica.
