# Foundation decisions

Local choices: modular monolith, Fastify, TypeScript, React/Vite, MySQL 8.4, Redis 7.4, BullMQ and pnpm.
Domain/application contracts must not import framework, queue, Meta or CORCOTTON implementations.
Node 24.21.0 LTS pinned from https://nodejs.org/en/blog (2026-09-17).
Hosting, region, managed KMS/database/Redis, identity provider, retention and billing decisions remain pending. Existing Infyntra routing remains authoritative.
