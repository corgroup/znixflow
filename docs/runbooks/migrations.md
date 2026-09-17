# Migrations

001_tenancy is forward-only: dropping these tables destroys tenant identity. db:rollback refuses destructive rollback. Prove backup/restore in an isolated database before release. Roll back application code only when schema-compatible; otherwise use additive forward migrations.

MySQL DDL auto-commits. The runner takes an advisory lock and records each version after all its statements succeed. Initial CREATE TABLE statements are restartable after partial failure. Future migrations need checksum tracking, independent forward-safety review and recovery procedures; never assume multi-statement DDL is atomic.
