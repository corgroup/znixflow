# Setup status — 2026-09-17

## Verified locally

- pnpm dependencies installed and shared lockfile generated across 15 workspace packages.
- ESLint and strict TypeScript checks pass.
- Four unit/bootstrap security tests pass.
- API/worker TypeScript and React production build pass.
- Runtime dependency audit reports no known vulnerabilities.
- Local Git repository initialized on main; origin is git@github.com:corgroup/znixflow.git.
- Ignored .env generated with random local database passwords; values are never printed.

## External blockers

- Docker is unavailable: MySQL migration execution and MySQL/Redis integration tests have not run.
- GitHub CLI authentication is invalid for corcotton-official. Private repository creation, main/staging protections, dependency alerts and remote CI are not configured. Authenticate using `gh auth login` before remote setup.
- Host Node is 24.19.0. Repository/CI pin 24.21.0; exact pinned-runtime execution has not been verified locally.
- CORCOTTON repository, Infyntra evidence and Meta ownership details were not supplied.

## Remaining implementation

This delivers setup scaffolding, not the complete Phase 1 work package. Authentication, RBAC, tenant repositories, durable audit/idempotency/outbox, full contact/event/message models, worker recovery and security/reliability gates remain open. Meta adapter, campaigns, automation and customer sends are absent. No mock results are represented as provider evidence.

CI currently covers formatting, lint, typecheck, unit/security tests, migration rerun, MySQL/BullMQ integration, build and dependency audit. Contract/recovery suites, secret/container scanning, production deployment and operational monitoring must be added before production approval.

Next local step: install/start Docker Desktop, then run `docker compose up -d --wait`, `pnpm db:migrate`, `pnpm test:integration`, and `pnpm dev` from the repository root.

## Znixflow branding update

Project/package names, Console title, configuration defaults and CI now use Znixflow. The supplied logo sheet is stored in apps/admin-web/public/znixflow-brand.png and its dark wordmark is displayed in the Console. The original setup-reference.md is preserved unchanged as historical input.

The filesystem folder is still D:/COM_DEV/muralink-platform because Windows denied its rename. Remote remains corgroup/znixflow. No push was performed.
