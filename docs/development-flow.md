# Development and release flow

`znixflow-development` -> pull request -> `znixflow-staging` -> pull request -> `main`.

All branches live in corgroup/znixflow. A push uploads commits; it does not merge a release.

## Daily work

Work on znixflow-development locally, or merge feature branches into it.

```sh
git switch znixflow-development
git pull --ff-only origin znixflow-development
# Edit, test and commit selected files.
git push origin znixflow-development
```

## Testing and release

1. Open a PR with base znixflow-staging and head znixflow-development.
2. Wait for verify and promotion checks, then merge using a merge commit.
3. Test the staging deployment once hosting is configured.
4. Open a PR with base main and head znixflow-staging.
5. Wait for checks and testing acceptance, then merge using a merge commit.
6. Once production hosting is configured, deploy the exact verified main commit.
7. Merge origin/main back into znixflow-development and push to keep histories aligned.

Keep all three long-lived branches. Do not squash release promotions or delete the source branches.
Planned remote protections (pending activation): staging and main require PRs, passing verify and promotion checks, and resolved conversations.
The remote protection setup will disable force pushes and branch deletion. Solo operation does not require a second reviewer.

## Hosting status

Live staging and production deployment are not configured. The app currently rejects
APP_ENV=staging and APP_ENV=production because authentication and other production requirements
are incomplete. Do not bypass this guard by deploying with APP_ENV=local.

To finish VPS deployment, supply the provider/server OS, SSH deployment identity,
staging and production domains, runtime/service arrangement and separate database/Redis resources.
Store secrets in deployment environments, never in Git. Configure TLS, health checks,
backup/restore and rollback before enabling deployment on merges. Production deployment must
wait for successful CI for the exact main commit; a push alone is not a sufficient gate.
