# QAch

Aplicacion web que asiste a QA/Testing generando material de testing accionable a partir de User Stories y criterios de aceptacion, apoyandose en inteligencia artificial.

## Que hace

**Entrada:** historia de usuario, criterios de aceptacion, y opcionalmente payloads JSON, endpoints, ejemplos de request/response, reglas de negocio.

**Salida:**

- Test cases estructurados (ID, titulo, pasos, expected)
- Edge cases / casos negativos
- Riesgos y supuestos
- Preguntas para PO/BA (informacion faltante)
- Checklist de validaciones (funcionales + no funcionales)
- Scaffolding de automatizacion (Playwright, Karate, Postman) — Pro
- Export: Markdown + JSON

## Tech stack

| Capa       | Tecnologia                              |
| ---------- | --------------------------------------- |
| Monorepo   | pnpm workspaces                         |
| API        | NestJS 11, TypeScript                   |
| Web        | Next.js 16, React 19, Tailwind CSS 4    |
| DB         | PostgreSQL + Prisma 7                   |
| IA         | Vercel AI SDK + OpenAI (multi-provider) |
| RAG        | pgvector (embeddings en PostgreSQL)     |
| Auth       | Passport + JWT                          |
| Validacion | Zod (schemas compartidos)               |
| Testing    | Jest                                    |

## Estructura del monorepo

```
qach/
├── apps/
│   ├── api/             # NestJS backend
│   └── web/             # Next.js frontend
├── packages/
│   ├── contracts/       # Schemas Zod compartidos (input/output)
│   └── eslint-config/   # Config ESLint compartida
└── infra/               # Docker, deploy (futuro)
```

## Modelo de negocio

| Modo    | Descripcion                                           |
| ------- | ----------------------------------------------------- |
| FREE    | Generacion con modelo base del sistema. Ads visibles. |
| LOW ADS | Login + BYO key (el usuario usa su propia API key).   |

## Requerimientos funcionales

- **RF-01. Generacion:** ingresar historia + AC, generar resultado estructurado (JSON) con test cases, edge cases, riesgos, preguntas y checklist. Exportar a Markdown y JSON.
- **RF-02. Validacion de entrada:** validar que el input sea suficiente antes de ejecutar IA. Detectar falta de info y proponer preguntas antes de gastar tokens.
- **RF-03. Clasificacion de alcance:** detectar o seleccionar tipo de historia (API_ONLY / UI_ONLY / E2E / MIXED). Separar output en suites cuando corresponda.
- **RF-04. Plantillas:** templates por dominio/tipo (login, pagos, reservas, CRUD) para guiar la generacion.
- **RF-05. Historial y versionado:** guardar historias, runs de generacion y versiones de outputs. Re-generar y comparar versiones anteriores. Requiere cuenta.
- **RF-06. Modo API (Pro):** validaciones de contrato, assertions recomendadas, scaffolding para Playwright/Karate/Postman.
- **RF-07. Modo Mobile (Pro):** checklist UX, permisos, offline, sesiones, notificaciones y estados.
- **RF-08. Backoffice de conocimiento (RAG):** panel admin para cargar conocimiento (texto), chunking + embeddings, versionado, tags, habilitar/deshabilitar fuentes.
- **RF-09. BYO Key:** el usuario usa su propia API key para generar. Habilita experiencia LOW ADS.
- **RF-10. Copiar a Jira (bonus):** generar texto formateado listo para pegar en Jira.

## Requerimientos no funcionales

- **RNF-01. Seguridad:** JWT + refresh, RBAC (USER/ADMIN), no loguear info sensible.
- **RNF-02. Control de costo:** rate limit por IP (publico) y por usuario (con cuenta). Trazabilidad de consumo.
- **RNF-03. Performance:** generacion async (jobs) en fases avanzadas. RAG top-K con pgvector.
- **RNF-04. Mantenibilidad:** contrato de salida versionado, separacion entre core y proveedores IA (multi-provider).
- **RNF-05. Compliance:** conocimiento cargado respeta licencias. Preferencia por contenido curado propio.

## Roadmap por fases

### MVP0 — Generador publico sin cuentas

Valor inmediato, minima friccion.

- Input story + AC (+ opcional payload)
- Validacion de input (anti gasto)
- Generacion estructurada + export Markdown/JSON
- Sin historial (sin usuarios)
- Rate limit por IP
- Ads visibles

### MVP1 — Cuentas + historial + templates + RAG basico

Retencion y valor acumulado.

- Auth JWT + refresh
- CRUD Story
- Templates por tipo (minimo 4)
- Guardado de runs + outputs versionados
- RAG habilitado con conocimiento cargado por admin (texto)
- Rate limit por usuario

### MVP2 — Modelo de negocio + modos Pro + BYO key

Sostenibilidad economica + features pro.

- FREE vs LOW ADS
- BYO key (no persistida inicialmente)
- Modo API: contract checks + scaffolding
- Modo Mobile: checklist UX/permisos/offline
- Jobs async + reintentos + metricas
- Copiar a Jira (bonus)
- Backoffice completo de conocimiento (versionado/tags/fuentes)

## Setup local

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
# Editar .env con tu DATABASE_URL

# Generar cliente Prisma
pnpm --filter api exec prisma generate

# Correr migraciones
pnpm --filter api exec prisma migrate dev

# Levantar API
pnpm --filter api run start:dev

# Levantar Web
pnpm --filter web run dev
```

## Documentacion

- [Arquitectura de la API](apps/api/docs/architecture.md)
