# Arquitectura de la API — Monolito modular NestJS

## Principio general

La API sigue una arquitectura de **monolito clasico modular** usando las convenciones estandar de NestJS. Cada dominio de negocio es un modulo con su controller, service y DTOs.

La separacion de responsabilidades se logra a nivel de **modulos NestJS**, no de capas concentricas.

---

## Estructura de carpetas

```
apps/api/src/
├── main.ts                         # Bootstrap de NestJS
├── app.module.ts                   # Root module, importa todos los modulos
│
├── shared/                         # Cross-cutting concerns
│   ├── database/
│   │   ├── prisma.service.ts       # Wrapper PrismaClient (singleton global)
│   │   └── prisma.module.ts        # Modulo global
│   ├── config/
│   │   └── config.module.ts        # @nestjs/config setup
│   ├── guards/
│   │   └── jwt-auth.guard.ts       # Guard de autenticacion JWT
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   └── ai/
│       ├── ai.service.ts           # Abstraccion multi-provider de IA
│       └── ai.module.ts
│
├── auth/                           # Autenticacion (JWT + refresh)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   └── strategies/
│       └── jwt.strategy.ts
│
├── users/                          # Gestion de usuarios
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
│
├── stories/                        # User stories (input del usuario)
│   ├── stories.controller.ts
│   ├── stories.service.ts
│   ├── stories.module.ts
│   └── dto/
│       ├── create-story.dto.ts
│       └── update-story.dto.ts
│
├── generation/                     # Generacion de test cases con IA
│   ├── generation.controller.ts
│   ├── generation.service.ts
│   ├── generation.module.ts
│   ├── dto/
│   │   └── generate.dto.ts
│   └── templates/                  # Plantillas por dominio/tipo
│       ├── template.service.ts
│       └── presets/
│           ├── login.ts
│           ├── payments.ts
│           ├── crud.ts
│           └── reservations.ts
│
├── history/                        # Historial de runs y versionado
│   ├── history.controller.ts
│   ├── history.service.ts
│   ├── history.module.ts
│   └── dto/
│       └── history-query.dto.ts
│
└── knowledge/                      # RAG: base de conocimiento QA (MVP1+)
    ├── knowledge.controller.ts
    ├── knowledge.service.ts
    ├── knowledge.module.ts
    └── dto/
        ├── create-source.dto.ts
        └── update-source.dto.ts
```

---

## Patron de cada modulo

Cada modulo de negocio sigue la misma estructura simple:

```
<modulo>/
├── <modulo>.controller.ts    # Endpoints REST
├── <modulo>.service.ts       # Logica de negocio
├── <modulo>.module.ts        # Wiring NestJS (providers, imports, exports)
└── dto/
    ├── create-<modulo>.dto.ts
    └── update-<modulo>.dto.ts
```

- **Controller:** recibe requests, valida con DTOs, delega al service, retorna respuesta.
- **Service:** logica de negocio, interactua con Prisma y otros services.
- **DTOs:** validacion de entrada. Usan los schemas de `@qach/contracts` cuando aplica.
- **Module:** registra providers y controllers, declara imports y exports.

---

## Prisma (multi-file schema)

Prisma v7+ soporta dividir el schema en multiples archivos. La configuracion base queda en `schema.prisma` y cada dominio define sus modelos en un archivo propio:

```
prisma/
├── schema.prisma         # generator + datasource (solo config)
├── user.prisma           # model User, enum UserRole
├── story.prisma          # model Story
├── generation-run.prisma # model GenerationRun, GenerationOutput
├── knowledge.prisma      # model KnowledgeSource, KnowledgeChunk (MVP1+)
└── migrations/           # generadas por prisma migrate
```

El `PrismaService` es un singleton global que todos los services inyectan directamente:

```typescript
// shared/database/prisma.service.ts
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```typescript
// Uso en cualquier service
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

No hay mappers ni entidades de dominio separadas. Se usa el modelo de Prisma directamente. Si en algun momento un modulo crece en complejidad, se refactoriza ese modulo puntual.

---

## Servicio de IA (multi-provider)

El modulo `shared/ai/` abstrae el acceso a modelos de IA usando Vercel AI SDK. Soporta:

1. **Modelo base del sistema:** configurado por env (OpenAI u otro). Se usa para usuarios FREE.
2. **BYO key:** el usuario pasa su API key en el request. El service instancia un provider temporal con esa key.

```typescript
// shared/ai/ai.service.ts
@Injectable()
export class AiService {
  private readonly defaultProvider: LanguageModel;

  constructor(private readonly config: ConfigService) {
    this.defaultProvider = openai(config.get('OPENAI_MODEL'));
  }

  getProvider(userApiKey?: string): LanguageModel {
    if (userApiKey) {
      return createOpenAI({ apiKey: userApiKey })(
        this.config.get('OPENAI_MODEL'),
      );
    }
    return this.defaultProvider;
  }
}
```

La key del usuario **no se persiste**. Se usa solo durante el request.

---

## Relacion con @qach/contracts

El paquete `packages/contracts` define schemas Zod compartidos entre API y Web. Los DTOs del lado API reutilizan estos schemas para validacion:

```typescript
// generation/dto/generate.dto.ts
import { QAchPromptInputSchema } from '@qach/contracts';
import { createZodDto } from 'nestjs-zod';

export class GenerateDto extends createZodDto(QAchPromptInputSchema) {}
```

Esto garantiza que front y back validen con las mismas reglas.

---

## Autenticacion y autorizacion

- **JWT + refresh token** (desde MVP1).
- Guard global opcional: rutas publicas usan `@Public()` decorator.
- RBAC con roles `USER` y `ADMIN`.
  - USER: accede a sus propios recursos (stories, historial).
  - ADMIN: gestiona plantillas globales y base de conocimiento.

```typescript
// Ruta publica (MVP0)
@Public()
@Post('generate')
async generate(@Body() dto: GenerateDto) { ... }

// Ruta protegida (MVP1+)
@UseGuards(JwtAuthGuard)
@Get('history')
async getHistory(@CurrentUser() user: User) { ... }
```

---

## Rate limiting

Usa `@nestjs/throttler`:

- **MVP0:** rate limit por IP (sin cuentas).
- **MVP1+:** rate limit por usuario autenticado.

```typescript
// app.module.ts
ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]);
```

---

## RAG — Base de conocimiento (MVP1+)

### Una sola base de datos

No se usa una base de datos vectorial separada. **pgvector es una extension de PostgreSQL** que agrega el tipo `vector` y operadores de similitud. El mismo Postgres que almacena usuarios, stories y runs almacena los embeddings.

```
PostgreSQL (unica instancia)
├── extension: pgvector          # habilita tipo vector y operadores
├── tablas relacionales           # users, stories, generation_runs, ...
└── tablas vectoriales            # knowledge_sources, knowledge_chunks (con embedding)
```

### Como convive Prisma con pgvector

Prisma no soporta el tipo `vector` de forma nativa. La solucion estandar:

- El campo de embedding se declara como `Unsupported("vector(1536)")` en el schema de Prisma.
- Las operaciones CRUD normales (insert, delete) funcionan con Prisma.
- Las **busquedas de similitud** (cosine, L2) se hacen con `$queryRaw`.

```prisma
// prisma/knowledge.prisma
model KnowledgeChunk {
  id        Int                      @id @default(autoincrement())
  sourceId  Int
  content   String
  embedding Unsupported("vector(1536)")?
  position  Int
  source    KnowledgeSource          @relation(fields: [sourceId], references: [id])
}
```

```typescript
// knowledge/knowledge.service.ts — busqueda top-K por similitud coseno
async findSimilarChunks(embedding: number[], topK = 5) {
  const vector = `[${embedding.join(',')}]`;
  return this.prisma.$queryRaw<{ content: string; distance: number }[]>`
    SELECT content, embedding <=> ${vector}::vector AS distance
    FROM knowledge_chunks
    ORDER BY distance
    LIMIT ${topK}
  `;
}
```

### Flujo RAG

1. Admin carga conocimiento (texto) via backoffice.
2. El sistema hace chunking y genera embeddings via AI SDK.
3. Los chunks + embeddings se guardan en PostgreSQL.
4. En cada generacion, se buscan los chunks mas relevantes (top-K coseno).
5. Los chunks recuperados se inyectan como contexto en el prompt.

### Modelos de datos

```
KnowledgeSource: { id, title, content, tags[], enabled, version, createdAt }
KnowledgeChunk:  { id, sourceId, content, embedding vector(1536), position }
```

### Setup requerido

Antes de la primera migracion, habilitar la extension en PostgreSQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Esto se puede incluir en una migracion de Prisma con `$executeRaw` o directamente en el SQL de la migracion inicial.

---

## Root module

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    PrismaModule,
    AiModule,
    AuthModule, // MVP1
    UsersModule, // MVP1
    StoriesModule, // MVP1
    GenerationModule, // MVP0
    HistoryModule, // MVP1
    KnowledgeModule, // MVP1
  ],
})
export class AppModule {}
```

---

## Agregar un nuevo modulo

1. Crear el archivo `prisma/<modulo>.prisma` con los modelos.
2. Correr `pnpm --filter api exec prisma generate`.
3. Crear la estructura en `src/<modulo>/`:
   ```
   <modulo>/
   ├── <modulo>.controller.ts
   ├── <modulo>.service.ts
   ├── <modulo>.module.ts
   └── dto/
   ```
4. Registrar el modulo en `app.module.ts`.

---

## Flujo de generacion (core del producto)

```
Request (story + AC)
    │
    ▼
GenerationController
    │  valida DTO
    ▼
GenerationService
    │
    ├── 1. Validar calidad del input (anti gasto de tokens)
    │       └── Si insuficiente → retorna preguntas sugeridas, no genera
    │
    ├── 2. Detectar/confirmar scope (API_ONLY, UI_ONLY, E2E, MIXED)
    │
    ├── 3. Seleccionar template si aplica (login, pagos, etc.)
    │
    ├── 4. (MVP1+) Recuperar contexto RAG (top-K chunks)
    │
    ├── 5. Construir prompt con: story + AC + template + contexto RAG
    │
    ├── 6. Llamar a AiService.generate(prompt, userApiKey?)
    │
    ├── 7. Parsear y validar output contra QAchOutputSchema
    │
    └── 8. (MVP1+) Guardar run en historial
    │
    ▼
Response (JSON estructurado)
```

---

## Supuestos y restricciones

- La base de conocimiento se carga por texto (PDF a texto es opcional, OCR fuera de MVP).
- No se hace busqueda web por prompt: se prioriza RAG local para costo y performance.
- Multi-provider: se diseña para poder cambiar modelos sin reescribir logica de generacion.
- El output principal es JSON estructurado + derivacion a Markdown para export.
- Keys de usuario no se persisten.
