---
name: backend
description: Backend conventions for apps/server — NestJS 11 module structure, decorators, auth, email queue, rate limiting, Prisma usage, and DTOs. Use when writing any NestJS backend code, creating controllers, services, modules, DTOs, or guards in apps/server.
---

# Backend Conventions (NestJS 11)

## Module Structure

Each feature gets its own NestJS module folder:

```
src/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.types.ts
│   ├── users.constants.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── common/
│   ├── auth.ts           # Better Auth config — all auth settings live here
│   ├── config.ts         # App config
│   └── decorators/
├── scheduler/            # BullMQ email queue
├── mail/
│   └── templates/        # Email templates
└── prisma/
    └── prisma.service.ts
```

---

## Route Protection

All routes are auth-protected by default. Use decorators to adjust:

```typescript
@AllowAnonymous()   // fully public — no session required
@OptionalAuth()     // works for both; session may be null
// (no decorator)   // auth required — default
```

Access the current session via `@Session()` — do not re-query the DB for the current user when the session already has it.

---

## Auth

- **Never write auth controllers.** All sign-in, sign-out, OTP, and OAuth routes are handled by Better Auth at `/api/auth/*`.
- All auth settings live in `apps/server/src/common/auth.ts` only. Do not scatter auth config.
- Adding a new auth plugin: update both `apps/server/src/common/auth.ts` AND `apps/web/src/lib/auth-client.ts`.
- New plugin with DB tables → run `pnpm db:migrate`.

---

## Email Queue (BullMQ)

Never send email inline. Always emit via EventEmitter2:

```typescript
this.eventEmitter.emit(SCHEDULER_EVENTS.EMAIL_SEND, {
  to: 'user@example.com',
  subject: 'Subject',
  html: yourTemplate(),
  sendAt: new Date(Date.now() + 3600_000), // optional scheduling
  jobId: `welcome-${userId}`,              // optional idempotency
});
```

- Never call `MailService` directly from your services.
- Never add retry/delay logic ad-hoc — the retry policy (3 attempts, 30s backoff) is in `SchedulerService`.
- Templates live in `apps/server/src/mail/templates/`. Always wrap with `emailTemplateWrapper()`. Export from `templates/index.ts`.
- Adding a new queue: register in `QUEUES` in `scheduler.types.ts`, create processor in `scheduler/processors/`, register in `SchedulerModule`.

---

## DTOs & Validation

- Use `class-validator` + `class-transformer` decorators on DTOs.
- DTOs live in a `dto/` subfolder inside the feature module.
- Return typed response classes from controllers; use `@ApiResponse` for Swagger docs.
- Global prefix: `/api`. Swagger available at `/docs` in dev.

---

## Types & Constants

- When defining reusable types, interfaces, enums, or constants for a feature, create a dedicated module file such as `users.types.ts` or `users.constants.ts`.
- Do not place feature-specific types or constants inside services.
- If types and constants are related, they may live together in a single `*.types.ts` file.
- Keep shared app-wide types and utilities in `packages/shared` (`@repo/shared`).

---

## Prisma

- Use `PrismaService` (injected via module). Never instantiate `PrismaClient` directly.
- Schema lives in `packages/db/prisma/schema.prisma`. After changes: `pnpm db:migrate` then `pnpm db:generate`.
- Schema conventions:
  - `@id @default(uuid()) @db.Uuid` for primary keys
  - `@@index` for frequently filtered fields
  - `onDelete: Cascade` where parent deletion should cascade
  - Always include `createdAt` / `updatedAt`

---

## Rate Limiting

Global `ThrottlerGuard` is active (300 req / 60s default). To exempt a route:

```typescript
@SkipThrottle()
```

To override on a specific route:

```typescript
@Throttle({ default: { limit: 10, ttl: 60_000 } })
```

---

## Logging

Use `nestjs-pino`. Inject `Logger` from `@nestjs/common` — never use `console.log` in production code.

---

## Shared Code

Anything usable in both `apps/server` and `apps/web` (types, enums, utils) goes in `packages/shared` (`@repo/shared`).
