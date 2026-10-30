## Skills

This project has the following agent skills. **Read and follow the relevant skill before starting any task in that area.**

| Skill | Path | Use when |
|---|---|---|
| `frontend` | `.agents/skills/frontend/SKILL.md` | Writing any Next.js frontend code — components, hooks, services, queries, types, validations, utils, constants, contexts |
| `backend` | `.agents/skills/backend/SKILL.md` | Writing any NestJS backend code — controllers, services, modules, DTOs, guards |
| `forms` | `.agents/skills/forms/SKILL.md` | Building or modifying any form using react-hook-form + Zod |
| `react-query` | `.agents/skills/react-query/SKILL.md` | Writing data-fetching hooks, mutation hooks, or service layer calls |
| `frontend-testing` | `.agents/skills/frontend-testing/SKILL.md` | Writing or updating frontend Vitest tests and coverage |

---

## Codebase Overview

This is a **pnpm + Turborepo monorepo** with:

- `apps/server` — NestJS 11 backend. Global prefix `/api`. Swagger at `/docs` (dev only).
- `apps/web` — Next.js 16 frontend with App Router. `(main)/` route group is auth-protected. `(auth)/` is public.
- `packages/db` — `@repo/db`: Prisma schema + generated client. Backend only.
- `packages/shared` — `@repo/shared`: utilities and types shared across apps.
- `packages/ui` — `@repo/ui`: shadcn-derived component library used on the frontend.

**Auth:** Better Auth (email OTP + Google OAuth). Config at `apps/server/src/common/auth.ts`. All auth routes are at `/api/auth/*` — no controllers needed.

**Email queue:** BullMQ backed by Redis. Never send email inline. Always emit `SCHEDULER_EVENTS.EMAIL_SEND` via `EventEmitter2`. Queue monitored at `/api/queues` (Bull Board).

**HTTP client:** `ApiClient` in `apps/web/src/lib/api-client.ts`. Never call fetch directly. Pattern: Component → TanStack Query hook → Service → `ApiClient`.

---

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- No unnecessary comments - write self-documenting code.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write goal for invalid inputs, then make them pass"
- "Fix the bug" → "Write a goal that reproduces it, then make it pass"
- "Refactor X" → "Ensure goal pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. YAGNI (You Aren't Gonna Need It)
- Use YAGNI Principle to avoid overcomplication and prefer one-liners

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. pnpm Readiness Check After Changes

After any code change, do not stop at `typecheck` only.
Always run `pnpm ready` for the changed work.

If it fails and the issue is caused by your change, fix it before considering the task complete.

---

## 6. Code Quality & Modularity

### No comments unless genuinely necessary

Do not write comments that narrate what the code does. The code should explain itself.

Bad:
```typescript
// Get the user by ID
const user = await this.prisma.user.findUnique({ where: { id } });
// Return 404 if not found
if (!user) throw new NotFoundException('User not found');
```

Good:
```typescript
const user = await this.prisma.user.findUnique({ where: { id } });

if (!user) throw new NotFoundException('User not found');
```

The only acceptable comments are those explaining **why** something non-obvious is done — not what is done.

### File size limits

No file should grow large enough to be hard to scan. As a rule:

- **Service / controller files:** keep as minimal as possible. If a service is growing, it likely has more than one responsibility — split it.
- **Module / config files:** typically short; if they are growing, something is wrong structurally.
- **Utility files:** group related utilities; split when the file has unrelated concerns.

If a file is approaching the limit, split it before adding more. Do not keep growing a file because it's "easier."

### One responsibility per file

Each file should have a single clear purpose. If you find yourself writing a service that handles orders *and* notifications *and* billing, that is three services.

Signs a file needs splitting:
- The file has unrelated imports
- Functions in the file don't share data or context with each other
- The filename is vague (e.g. `utils.ts`, `helpers.ts`) and keeps growing

### Functions must be small and single-purpose

A function should do one thing. If you need to scroll to understand a function, it is too long.

- Extract named helper functions for any multi-step logic
- Avoid deeply nested conditionals — extract early-return guards or helper functions
- A function with more than ~20 lines is a candidate for splitting

### DRY — Don't Repeat Yourself

Before writing a piece of logic, check if it already exists:

- In `@repo/shared` for utilities usable across apps
- In the current module's service or a sibling utility file
- In `@repo/ui` for UI patterns

If you find yourself writing the same logic twice, extract it. The second time you write something is always the right time to abstract it.

### Readable by a first-time reader

Write code as if the next person reading it has never seen this codebase. That means:

- Name variables and functions precisely — `getUserByEmail` not `getUser`, `isSessionExpired` not `check`
- Avoid abbreviations unless they are universally understood (`id`, `dto`, `url` are fine; `usrSsn`, `chkExp` are not)
- Keep the happy path obvious — handle errors and edge cases first (early return), then the main logic
- Group related code together; don't interleave unrelated logic

### Component splitting (frontend)

A React component that does data fetching, business logic, layout, and rendering is too large. Split by concern:

- **Page component** — composes sections, may call hooks
- **Section component** — a logical region of the page (e.g. `ProfileHeader`, `SessionsList`)
- **UI component** — purely presentational, accepts props, no hooks or side effects

When a component file exceeds ~100 lines, ask whether it can be split into a parent + smaller focused children.

### Presentational component coverage (frontend)

- Name purely presentational React components `*.view.tsx`.
- A `*.view.tsx` component accepts props and renders them. It must not use hooks, query or mutation hooks, router state, auth clients, toasts, or event-driven workflow logic.
- Keep behavioral components as ordinary `.tsx` files; move their data and business logic into hooks or utils when practical.
- Frontend coverage excludes `src/components/**/*.view.tsx`. Do not add broad component exclusions or change the coverage include list to increase the metric.

---

## 7. Package Management

Always use `pnpm` for installing packages. Never use `npm` or `yarn`.

```bash
pnpm add <package>              # add to current workspace app
pnpm add <package> -w           # add to monorepo root
pnpm add <package> --filter @repo/ui  # add to a specific workspace package
pnpm add -D <package>           # dev dependency
```

---

## 8. Better Auth — Rules

- **Never write auth controllers.** All sign-in, sign-out, OTP, and OAuth routes are handled by Better Auth at `/api/auth/*`.
- **Config is the only place to change auth behavior.** All auth settings (OTP expiry, providers, plugins) live in `apps/server/src/common/auth.ts`. Do not scatter auth config elsewhere.
- **Backend route protection** uses three decorators — apply the right one:
  - Default (no decorator) → auth required
  - `@AllowAnonymous()` → fully public
  - `@OptionalAuth()` → works for both, session may be null
- **Access the current user** via `@Session()` — do not query the database for the current user when the session already contains it.
- **Frontend session** is read via `authClient.useSession()`. Do not store the session in component state or a custom context — Better Auth manages it.
- **Adding a new auth plugin** requires updating both `apps/server/src/common/auth.ts` (server plugin) and `apps/web/src/lib/auth-client.ts` (client plugin) if the plugin has a frontend component.
- If a new plugin requires new database tables, run `pnpm db:migrate` after updating the schema.

---

## 9. Email & BullMQ — Rules

- **Never call `MailService` directly** from your own services. Always go through the event system. Emit `SCHEDULER_EVENTS.EMAIL_SEND` via `EventEmitter2` — the queue handles delivery.
- **One queue per concern.** Do not put unrelated job types into the `emails` queue. If you need background processing for something else (e.g. data sync, report generation), add a new queue — see the README for how.
- **Adding a new queue:** register the queue name in `QUEUES` array inside `scheduler.types.ts`. This automatically registers it with Bull Board. Then create a processor in `scheduler/processors/`, register it in `SchedulerModule`, and inject the queue where you need to enqueue jobs.
- **Do not add retry/delay logic ad-hoc** when emitting jobs. Use `sendAt` for scheduling and `jobId` for idempotency. The retry policy (3 attempts, 30s backoff) is already configured in `SchedulerService` — do not duplicate it.
- **Templates live in `apps/server/src/mail/templates/`.** Every template must wrap content with `emailTemplateWrapper()` for consistent branding. Export new templates from `templates/index.ts`.
- **Do not hardcode HTML inline** when emitting email events. Always use a named template function so the HTML is reusable and testable.

---

## 10. UI/UX Standards

### Think UX before writing UI

Before writing any UI code, ask: what is the user trying to do, and what is the fastest path to that goal? Every extra click, label, or visual element has a cost. Default to less.

### Style principles

- **Minimal** — show only what is needed on screen at any moment. Avoid information overload.
- **Clean** — consistent spacing, clear visual hierarchy, no decorative elements that don't carry meaning.
- **Modern** — use Tailwind utilities; avoid legacy patterns like inline styles or external CSS. Prefer subtle interactions over heavy animations.
- **Readable** — typography should be comfortable. Use `text-muted-foreground` for secondary text; reserve full contrast for primary content.

### Always handle all states

Every async UI must handle loading, empty, and error states explicitly. A component that renders nothing while loading, or silently fails, is incomplete.

- Use `Skeleton` for content that is loading in place
- Use `LoadingScreen` for full-page loads
- Use `AlertMessage` for inline errors or warnings
- Use the `Empty` component (from `@repo/ui/components/empty`) for empty list/data states

### Use existing components before building new ones

Check `@repo/ui/general/` before writing a new component. Available general components:

| Component | Use for |
|---|---|
| `CustomTable` | Any data table — wraps TanStack Table with sorting, pagination, loading, and empty states built in |
| `CustomAlertDialog` | Confirm/cancel dialogs — destructive actions, sign-out prompts, delete confirmations |
| `LoadingButton` | Any button that triggers an async action — shows spinner, disables automatically |
| `LoadingScreen` | Full-page loading state |
| `UserAvatar` | Displaying a user's avatar with initials fallback |
| `AvatarGroup` | Displaying multiple user avatars stacked |
| `PageContainer` | Wrapping page content with consistent max-width and padding |
| `PaginationControls` | Pagination UI for tables (used internally by `CustomTable`) |
| `AlertMessage` | Inline error, warning, info, or success messages |
| `ColorBadge` | Status/role badges with semantic color mapping |
| `AccessDenied` | 403 / permission denied empty state |
| `RequiredStar` | `*` indicator for required form fields |

Import from `@repo/ui/general/<ComponentName>`.

### Forms

- Use `react-hook-form` + Zod for all forms. Never manage form state manually.
- Use `Controller` from `react-hook-form` with `Field`, `FieldLabel`, `FieldDescription`, and `FieldError` from `@repo/ui/components/field`. Do **not** use the old `Form`/`FormField`/`FormItem`/`FormControl`/`FormLabel`/`FormMessage` components — `@repo/ui/components/form` no longer exists.
- Show field-level validation errors inline using `<FieldError errors={[fieldState.error]} />` — never in a toast.
- Always add `data-invalid={fieldState.invalid}` to `<Field>` and `aria-invalid={fieldState.invalid}` to the input control.
- Use `LoadingButton` for submit buttons — never disable the button manually or show a separate spinner.
- Use `RequiredStar` on required field labels.
