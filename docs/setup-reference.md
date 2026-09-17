# Muralink — Complete Project Setup Note

Project: **Muralink Communication Platform**  
Repository: `muralink-platform`  
Admin application: **Muralink Console**  
First tenant: **CORCOTTON**  
Primary provider: **Meta WhatsApp Business Platform**  
Status: **Setup and implementation handoff — Infyntra must remain active**

## 1. Project objective

Build Muralink as an independent, reusable, multi-tenant communication platform. CORCOTTON will be its first tenant, but the product must not contain CORCOTTON-specific campaign, order, customer or fulfillment logic.

Initial flow:

```text
CORCOTTON → Muralink → Meta WhatsApp Business Platform → Customer
```

During development and migration:

```text
CORCOTTON → controlled routing layer
          ├── Infyntra (existing production path)
          └── Muralink (shadow/test/canary path)
```

Infyntra must not be removed, disabled or silently bypassed. Muralink becomes the primary path only after direct Meta sending, templates, webhooks, status tracking, consent, campaigns, monitoring and recovery have passed the production migration gates.

## 2. Approved technical direction

Start with a modular monolith and independent background workers. Do not start with multiple microservices.

| Area | Decision |
|---|---|
| Runtime | Node.js active LTS, pinned in the repository |
| Language | TypeScript with strict mode |
| API | Express or Fastify; select one before bootstrap and use it consistently |
| Database | MySQL 8 production-compatible version |
| Queue/cache | Redis + BullMQ |
| Admin | React-based web application with a shared typed API client |
| Validation | Zod and versioned JSON Schemas |
| Tests | Unit, integration, contract, security, recovery and controlled live-provider tests |
| Observability | OpenTelemetry, structured logs, metrics, traces and alerts |
| Secrets | Managed secrets store/KMS; never plaintext database or repository values |
| Deployment | Separate API, worker and admin deployments from CORCOTTON |

The Muralink domain must not import Meta SDK details, BullMQ, Express or CORCOTTON code. These remain adapters around provider-neutral application contracts.

## 3. Repository layout

```text
muralink-platform/
  .github/
    workflows/
  apps/
    api/
      src/
        bootstrap/
        http/
        modules/
        middleware/
        jobs/
      tests/
    worker/
      src/
        consumers/
        schedulers/
        reconciliation/
      tests/
    admin-web/
      src/
        app/
        features/
        components/
        api/
      tests/
  packages/
    domain/
    application/
    api-contracts/
    provider-contract/
    provider-meta/
    persistence-mysql/
    queue-bullmq/
    observability/
    security/
    config/
    test-support/
  database/
    migrations/
    seeds/
  docs/
    adr/
    api/
    events/
    security/
    runbooks/
    infyntra-audit/
    meta-evidence/
  scripts/
  infra/
    docker/
    deployment/
  docker-compose.yml
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  eslint.config.js
  .env.example
  README.md
```

Use a workspace package manager such as pnpm. Lock the package-manager and Node versions. All applications must build from the same lockfile.

## 4. Initial bootstrap sequence

### Step 1 — Create the repository

- Create a new private repository named `muralink-platform`.
- Do not place it inside the CORCOTTON repository.
- Protect `main` and `staging` branches.
- Require pull-request review, passing CI and migration checks before merge.
- Block direct pushes to protected branches.
- Enable secret scanning and dependency alerts.

Suggested branch flow:

```text
feature/* → development → staging → main
```

Production deployments must be created only from reviewed releases or immutable commits from `main`.

### Step 2 — Initialize the workspace

Create the workspace, shared TypeScript configuration, formatter, linter, test runner and build scripts. Root scripts should expose one consistent interface:

```text
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:security
pnpm db:migrate
pnpm db:rollback
pnpm db:status
```

No application should require globally installed packages.

### Step 3 — Local infrastructure

Provide Docker Compose services for:

- MySQL
- Redis
- local mail/message capture only when needed for development notifications
- OpenTelemetry collector or a documented local observability substitute

Local infrastructure is for development and automated tests. It is not accepted as evidence that the real Meta integration works.

### Step 4 — Configuration validation

Create one typed configuration module. Applications must fail fast at startup when required configuration is missing or invalid. Do not read `process.env` throughout business code.

Configuration groups:

- application/runtime
- database
- Redis/queue
- authentication
- encryption/KMS
- Meta provider
- webhook verification
- observability
- CORCOTTON integration
- data retention
- rate limits

## 5. Environment model

Maintain fully separated environments:

| Environment | Purpose | Provider behavior |
|---|---|---|
| Local | Unit/integration development | Fake provider allowed only for automated tests |
| Development | Shared engineering verification | Test assets only; no customer campaigns |
| Staging | Real pre-production verification | Real Meta integration with controlled recipients |
| Production | Customer communication | Production WABA/number after approval |

Staging must not use mock results as final verification. Test doubles remain necessary for deterministic automated tests, but every direct Meta capability requires controlled live evidence before production approval.

Never reuse production access tokens, databases, queues, signing secrets or phone-number identities in local/development environments.

## 6. Environment-variable contract

The repository contains only names and safe examples. Real values belong in the deployment secrets manager.

```dotenv
NODE_ENV=
APP_NAME=muralink
APP_ENV=
PORT=
PUBLIC_API_URL=
ADMIN_WEB_URL=

MYSQL_HOST=
MYSQL_PORT=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_SSL_MODE=

REDIS_URL=
QUEUE_PREFIX=muralink

AUTH_JWT_ISSUER=
AUTH_JWT_AUDIENCE=
AUTH_JWT_PUBLIC_KEY=
SERVICE_HMAC_ACTIVE_KEY_ID=
SERVICE_HMAC_ACTIVE_SECRET=

ENCRYPTION_KEY_ID=
KMS_PROVIDER=

META_GRAPH_API_VERSION=
META_APP_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=
META_SYSTEM_USER_TOKEN=

OTEL_SERVICE_NAME=
OTEL_EXPORTER_ENDPOINT=
LOG_LEVEL=

WEBHOOK_RAW_RETENTION_DAYS=
MESSAGE_LOG_RETENTION_DAYS=
AUDIT_LOG_RETENTION_DAYS=
```

Do not put WABA IDs and phone-number IDs into global configuration if they belong to individual tenants. Store those against encrypted, environment-specific provider connections.

## 7. Database initialization

Create migrations in dependency order. Every migration must have an explicit rollback strategy or a documented reason why it is forward-only.

### Migration group A — tenancy and access

- organizations
- brands
- environments
- users
- memberships and roles
- service accounts
- API credentials
- audit logs

### Migration group B — providers

- provider connections
- encrypted provider secrets
- provider/WABA account snapshots
- channel addresses/phone numbers
- provider capability snapshots

### Migration group C — templates

- templates
- immutable template versions
- template components
- variable schemas
- synchronization runs
- template status events

### Migration group D — contacts and protection

- contacts
- contact channel addresses
- tags
- consent records
- suppression entries
- frequency counters

### Migration group E — events and messaging

- canonical events
- event processing attempts
- notification rules
- messages
- message variables
- message attempts
- provider responses
- message status events

### Migration group F — reliability

- idempotency keys
- transactional outbox
- webhook receipts
- normalized webhook events
- dead-letter items
- scheduled jobs
- usage ledger

### Migration group G — campaigns and automation

Add only in their approved phases:

- segments and immutable segment versions
- campaigns and campaign versions
- campaign runs and recipients
- automation definitions and versions
- triggers, actions and executions

Every tenant-owned table must include the correct organization and brand boundary. Add composite unique constraints and indexes that include those tenant identifiers. Repository methods must require a resolved tenant context.

## 8. Core modules to implement

### Tenancy module

- organization and brand creation
- environment isolation
- tenant-scoped repositories
- RBAC and service-account scopes
- immutable audit logging

### Provider module

- provider interface
- provider capability registry
- connection validation
- normalized error model
- Meta adapter plugged in only through the interface

### Template module

- approved-template synchronization
- immutable provider snapshots
- language/category/status metadata
- variable schema and local mapping
- template status history
- launch block when the synchronized version or mapping is invalid

Approved Meta template content is read-only in the first implementation. Muralink may map variables but must not pretend to edit an already approved provider template.

### Contact and consent module

- external customer reference
- E.164 phone normalization
- tenant-specific tags
- append-only consent evidence
- marketing opt-out and suppression
- frequency caps
- transactional-versus-marketing eligibility

### Event module

- versioned event schemas
- authenticated event ingestion
- event deduplication
- validation and dead-letter handling
- rule evaluation

Initial supported event types:

- `customer.created`
- `order.placed`
- `order.shipped`
- `order.delivered`
- `cart.abandoned`
- `product.published`
- `collection.published`
- `product.restocked`
- `refund.created`
- scheduled and manual triggers

Event names are data/config driven. Event payload schemas remain versioned code contracts.

### Messaging module

- eligibility pipeline
- message lifecycle
- outbox publication
- queue dispatch
- retry policy
- idempotency
- provider attempts and responses
- reconciliation for unknown outcomes
- status projection from webhooks

### Webhook module

- Meta challenge verification
- webhook authenticity verification based on the current official Meta specification
- fast durable receipt before asynchronous processing
- raw payload hash and bounded payload retention
- normalized event extraction
- idempotent processing
- duplicate and out-of-order handling
- replay tooling and dead-letter recovery

### Campaign and automation modules

Do not activate these in Phase 1. Define their boundaries but implement them after direct-message reliability, consent and webhook tracking have passed Phase 2.

## 9. API setup

Use `/v1` as the first public API version. Return a correlation ID on every request and error.

Initial endpoints:

```text
GET  /health/live
GET  /health/ready

POST /v1/events
POST /v1/messages
GET  /v1/messages/{messageId}
GET  /v1/messages/{messageId}/events

POST /v1/contacts:upsert
POST /v1/contacts/{contactId}/consents
POST /v1/contacts/{contactId}/opt-outs

GET  /v1/templates
POST /v1/provider-connections/{connectionId}/template-syncs

GET  /webhooks/meta
POST /webhooks/meta
```

Mutation endpoints require an `Idempotency-Key`. Integration credentials identify the organization, brand, environment and allowed scopes. Never accept an unrestricted tenant ID from a caller and use it as authority.

Error response shape:

```json
{
  "error": {
    "code": "TEMPLATE_MAPPING_INVALID",
    "message": "Template variables do not match the synchronized version.",
    "retryable": false,
    "correlationId": "req_..."
  }
}
```

## 10. Queue and worker setup

Create separate queues for:

- event processing
- eligibility/rendering
- message dispatch
- webhook processing
- template synchronization
- scheduled campaign/automation work
- reconciliation
- dead-letter recovery

Queue payloads carry opaque internal IDs, not full customer/provider payloads. Workers reload authoritative state from MySQL and revalidate tenant ownership.

Required controls:

- bounded retries with exponential backoff and jitter
- error-class-based retry decisions
- per-provider and per-phone-number rate limits
- job leases and stale-job recovery
- graceful shutdown
- duplicate-job tests
- operational pause/resume
- dead-letter inspection and audited replay

## 11. Security baseline

Before exposing any integration endpoint:

- TLS-only public endpoints
- service-account scopes and credential rotation
- short-lived admin sessions
- optional MFA/SSO-ready admin architecture
- encrypted provider credentials using KMS/envelope encryption
- webhook signature/authenticity verification
- request size, rate and timeout limits
- strict JSON/schema validation
- SQL parameterization
- sensitive-field redaction from logs/traces/errors
- CSRF protection where cookie sessions are used
- secure headers and restrictive CORS
- dependency and container scanning
- tenant-isolation security tests
- audit logs for credential, provider, template, campaign and replay operations

Meta tokens, app secrets, webhook secrets, customer phone numbers and rendered message variables must never appear in CI logs.

## 12. Meta readiness checklist

Do not begin direct Meta coding from assumptions. First record evidence for:

- owner of the Meta Business Portfolio
- business verification status
- owner and mode of the Meta app
- WABA owner and WABA ID
- current phone-number owner and phone-number ID
- whether the number is held under Infyntra/BSP assets or CORCOTTON-controlled assets
- system user, assigned assets and approved permissions
- token generation, storage, expiry/revocation and rotation path
- webhook callback ownership and subscriptions
- two-step verification/PIN custody
- billing/payment responsibility
- display-name and phone-number registration status
- all approved templates, languages, categories, variables and statuses
- exact coexistence or migration procedure available for the current number/setup

Meta API version, permissions, webhook verification, throughput, template rules and migration/coexistence steps must be verified from current official Meta documentation and the live Meta Business configuration immediately before implementation. Never copy a token or asset from Infyntra without confirmed authority.

## 13. Infyntra audit checklist

Complete this audit before claiming Muralink feature parity:

### Repository evidence

- all Infyntra imports and client modules
- all endpoints and environment-variable names
- outbound business-event call sites
- request/response mappings
- phone normalization
- template selection and variable mapping
- retries, timeouts and duplicate prevention
- webhook routes, authentication and status mapping
- opt-out/inbound handling
- fallback/parallel email behavior
- staging and production differences

### Account/dashboard evidence

- connected WABA and phone assets
- template registry
- webhook destinations
- campaign/audience capabilities actually in use
- message logs and exports
- billing and operational ownership

### Live behavior evidence

For each message type, capture a sanitized request, provider acceptance response, provider message ID, webhook timeline, final state and customer-visible result.

At minimum include:

- login/OTP
- payment success/failure/refund
- order placed/confirmed/processing
- approved `order_processing`
- approved `order_ready_for_shipment`
- shipped/in-transit/out-for-delivery/delivered
- cancellation/return/exchange
- support communications
- checkout-phone recipient selection
- WhatsApp-unavailable behavior and email fallback/parallel behavior

Create a final matrix:

| Infyntra capability | Used by CORCOTTON | Evidence | Muralink replacement | Parity test | Status |
|---|---:|---|---|---|---|

## 14. CORCOTTON integration setup

CORCOTTON publishes facts. It must not call the Meta adapter or contain Muralink campaign logic.

Example event:

```json
{
  "eventId": "corcotton:order:123:placed:v1",
  "type": "order.placed",
  "schemaVersion": 1,
  "occurredAt": "2026-09-17T10:00:00Z",
  "subject": { "type": "order", "id": "123" },
  "contact": {
    "externalCustomerId": "cust_456",
    "phone": "+919999999999",
    "locale": "en_IN"
  },
  "data": {
    "orderNumber": "CC-123",
    "customerName": "Example"
  }
}
```

Create one CORCOTTON communication adapter that:

- builds versioned events
- generates stable business idempotency keys
- signs requests
- applies network timeout/retry policy safely
- stores the Muralink message/event reference
- does not expose Meta or Muralink secrets to the storefront

Routing modes per message class:

| Mode | Behavior |
|---|---|
| `INFYNTRA_ONLY` | Existing path; initial production state |
| `SHADOW_NO_SEND` | Muralink evaluates and renders but cannot dispatch |
| `META_TEST_ONLY` | Direct Meta sends only to allowlisted internal numbers |
| `META_CANARY` | Small explicit cohort; Infyntra is suppressed for the same message |
| `META_PRIMARY_WITH_FALLBACK` | Allowed only after duplicate-safe fallback is proven |
| `META_ONLY` | Final state after migration approval |

Never send one real customer notification through both providers for comparison.

## 15. Admin panel setup

Phase 3 navigation:

- Dashboard
- Organizations and Brands
- WhatsApp Accounts
- Phone Numbers
- Templates
- Contacts
- Consent and Suppression
- Segments
- Campaigns
- Automations
- Messages
- Delivery Logs
- Webhooks
- Analytics
- Settings
- Audit Log

First admin release should prioritize operations, not campaign design:

- connection health
- template sync/status
- message search and lifecycle
- provider attempts/errors
- webhook timeline
- contact consent/suppression
- dead-letter inspection and safe replay
- basic sent/delivered/read/failed analytics

## 16. CI/CD setup

Pull-request verification must run:

- dependency install from lockfile
- formatting/linting
- TypeScript compilation
- unit tests
- database integration tests
- Redis/queue integration tests
- API contract tests
- migration up/down or forward-safety checks
- tenant-isolation tests
- secret scan
- dependency/container vulnerability scan
- production build for API, worker and admin

Promotion flow:

```text
development → automatic development deployment
staging     → controlled staging deployment + real integration verification
main        → approved production release
```

Database migrations run as a controlled release job before new application instances become active. Backward-incompatible migrations require an expand/migrate/contract sequence.

Every deployment must record:

- commit SHA
- database migration version
- environment
- deployed services
- API schema version
- provider adapter version
- operator/automation identity

## 17. Observability and operational setup

Every message must be traceable using:

- request correlation ID
- tenant/brand/environment
- source event ID
- internal message ID
- attempt ID
- provider message ID
- campaign/automation execution ID where applicable

Required metrics:

- API request rate/error/latency
- queue depth and oldest-job age
- send attempts and acceptance rate
- sent/delivered/read/failed counts and rates
- provider error codes/classes
- webhook receipt/processing lag
- duplicate webhook/event counts
- retries and dead-letter volume
- template sync failures
- consent/suppression rejections
- per-tenant usage

Required alerts:

- authentication/token failure spike
- webhook endpoint failures or missing webhook activity
- queue backlog above threshold
- failed-message spike
- dead-letter growth
- MySQL/Redis availability
- template-status/quality degradation
- reconciliation backlog

Write runbooks for token rotation, webhook outage, queue backlog, provider outage, accidental campaign, compromised credential, template rejection and rollback to Infyntra.

## 18. Testing strategy

### Unit tests

- consent and purpose classification
- frequency caps
- template-variable validation
- error normalization
- retry decisions
- state transitions
- idempotency-key generation

### Integration tests

- MySQL constraints and tenancy
- outbox-to-queue publication
- worker recovery after interruption
- duplicate event/message requests
- duplicate and out-of-order webhooks
- dead-letter and replay
- migration behavior

### Contract tests

- CORCOTTON event schemas
- provider interface
- Meta request/response/webhook fixtures
- admin/API client contracts

### Security tests

- cross-tenant reads and writes
- invalid/expired credentials
- webhook forgery
- replayed signed requests
- privilege escalation
- secret/PII log leakage
- rate and payload-size enforcement

### Controlled live tests

- approved template synchronization
- test send
- sent/delivered/read/failed lifecycle
- invalid recipient
- invalid/paused template
- token revocation/expiry
- rate-limit response
- provider/network timeout and reconciliation
- duplicate webhook

Fake-provider tests are required but never replace controlled live Meta evidence.

## 19. Execution plan

### Phase 0 — audit and validation

- approve stack and repository decisions
- audit Infyntra
- verify Meta/WABA/phone ownership
- finalize event/API contracts
- complete threat model and data-retention rules
- establish environments and access owners

Exit: evidence pack and architecture approval complete.

### Phase 1 — foundation

- repository and CI/CD
- configuration/secrets
- tenancy/RBAC/service accounts
- database foundation
- provider contract
- contacts/consent/suppression
- events/messages/outbox/queues
- webhook receipt framework
- audit logs and observability

Exit: tenant isolation, recovery, idempotency, consent and replay tests pass.

### Phase 2 — Meta integration

- connection validation
- WABA/phone discovery
- approved-template sync
- direct sending
- webhook processing
- delivery lifecycle
- errors, throttling, retries and reconciliation

Exit: controlled staging and production lifecycle evidence passes.

### Phase 3 — Muralink Console

- operational dashboard
- accounts/phone numbers
- templates
- messages/webhooks/logs
- contacts/consent
- analytics and safe recovery

### Phase 4 — campaigns

- segments and audience snapshots
- campaign versions
- preview/test send
- send now/schedule
- pause/cancel
- reporting and frequency protection

### Phase 5 — automation

- event-triggered rules
- delays/conditions/actions
- abandoned cart, order follow-up, restock, win-back and review flows
- execution history and replay protection

### Phase 6 — CORCOTTON migration

- shadow evaluation
- internal direct-Meta tests
- message-class canaries
- production monitoring
- rollback exercise
- class-by-class cutover
- Infyntra retirement only after final sign-off

## 20. Definition of done

Muralink is not production-ready merely because Meta accepts a message. Completion requires:

- tenant isolation verified
- credentials encrypted and rotatable
- approved templates synchronized and versioned
- marketing consent and frequency caps enforced
- transactional messages remain correctly independent from marketing opt-out
- duplicate event, job, send and webhook behavior tested
- sent/delivered/read/failed lifecycle proven
- real staging and controlled production evidence retained
- monitoring, alerts, dashboards and runbooks operational
- rollback to Infyntra tested
- campaigns and automations audited and replay-safe
- no customer receives duplicate communication during migration
- final Infyntra dependency removal approved separately

## 21. Immediate first work package

Do these tasks first, in this order:

1. Create `muralink-platform` repository and branch protections.
2. Create the Infyntra capability-audit document and evidence matrix.
3. Complete Meta Business Portfolio/WABA/phone-number ownership worksheet.
4. Approve Express versus Fastify and the deployment provider.
5. Bootstrap workspace, MySQL, Redis, configuration validation and CI.
6. Implement organization/brand/environment tenancy and service-account authentication.
7. Implement audit logs, idempotency, outbox and queue foundations.
8. Implement provider contract and deterministic fake provider for automated tests.
9. Implement contact, consent, suppression, event and message models.
10. Stop for Phase 1 security/reliability review before adding the Meta adapter.

No Infyntra code should be removed in this work package. No real customer should receive a Muralink message during Phase 1.

## 22. Pending decisions before coding

- API framework: Express or Fastify
- production deployment provider and region
- managed MySQL, Redis, KMS and observability providers
- admin authentication method
- organization billing/usage scope for the first release
- retention periods for webhook payloads, message variables and audit logs
- Meta asset ownership and number coexistence/migration outcome
- whether the first production rollout uses the existing CORCOTTON number or a separate controlled number

Once these decisions and the Phase 0 evidence are approved, Phase 1 implementation may begin. Direct Meta implementation remains blocked until current Meta ownership, permissions, templates, webhook and phone-number migration requirements are proven.
