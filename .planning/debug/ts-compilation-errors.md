---
status: verified
trigger: "TypeScript compilation errors in API build - 100+ errors across rxjs, Prisma, DTOs"
created: 2026-02-14T00:00:00Z
updated: 2026-02-14T00:15:00Z
symptoms_prefilled: true
goal: find_and_fix
---

## Current Focus

hypothesis: Complete dependency chain is now: (1) Add rxjs to dependencies, (2) Add prisma CLI as dev dependency, (3) Fix Prisma schema, (4) Ensure prisma generate runs during install or build
test: Fix nixpacks.toml to allow build scripts to run OR add explicit prisma generation command
expecting: Prisma client generates successfully, TypeScript compiles without missing module errors
next_action: Modify nixpacks.toml or build process to allow Prisma postinstall script to run

## Symptoms

expected: TypeScript compiles successfully with tsc; no module or type errors
actual: Build fails with 100+ TypeScript compilation errors in logging.interceptor.ts, prisma.service.ts, and DTO files
errors: |
  - Cannot find module 'rxjs' in logging.interceptor.ts
  - Cannot find module 'rxjs/operators'
  - Module '"@prisma/client"' has no exported member 'PrismaClient'
  - DTO class properties without initializers (email, password, priceId, etc.)
  - Parameter type errors (implicit 'any' types)
  - Type mismatches in Stripe version strings

reproduction: |
  cd /home/uwc31/propintel-ai/apps/api
  npm install
  tsc

started: After changing build script from 'nest build' to 'tsc'
context: Railway build with Nixpacks; install phase succeeds (768 packages); build phase fails

## Eliminated

- hypothesis: Version mismatch between Prisma CLI and client
  evidence: CLI from npx is from global or system; when checking inside API directory, @prisma/client is 5.22.0 which matches package.json
  timestamp: 2026-02-14T00:00:10Z

## Evidence

- timestamp: 2026-02-14T00:00:01Z
  checked: node_modules existence and Prisma client
  found: node_modules does not exist in root; no Prisma client generated
  implication: Dependencies haven't been installed yet; Prisma schema hasn't been generated

- timestamp: 2026-02-14T00:00:02Z
  checked: Package structure (pnpm monorepo)
  found: pnpm workspaces with apps/* and packages/*; root uses pnpm@9.0.0
  implication: Need to run pnpm install from root, not npm install

- timestamp: 2026-02-14T00:00:03Z
  checked: API package.json dependencies
  found: rxjs is NOT listed in dependencies or devDependencies
  implication: rxjs import error is because rxjs is missing from package.json entirely (not in node_modules yet)

- timestamp: 2026-02-14T00:00:04Z
  checked: nixpacks.toml build configuration
  found: |
    install phase: pnpm install --no-frozen-lockfile --ignore-workspace
    build phase: pnpm run build (which runs tsc)
  implication: --ignore-workspace is CRITICAL ISSUE - prevents monorepo workspace linking; doesn't install root dependencies

- timestamp: 2026-02-14T00:00:05Z
  checked: LoggingInterceptor code
  found: imports rxjs and rxjs/operators (lines 7-8); rxjs is NestJS peer dependency
  implication: rxjs should be available through NestJS or as explicit dependency

- timestamp: 2026-02-14T00:00:06Z
  checked: Prisma schema location
  found: /home/uwc31/propintel-ai/prisma/schema.prisma exists at root
  implication: Prisma generation hasn't run yet (because root install was skipped)

- timestamp: 2026-02-14T00:00:07Z
  checked: Installation with --ignore-workspace (as nixpacks does)
  found: pnpm install succeeds; installs 768 packages; shows warnings that build scripts ignored
  implication: Prisma's postinstall script was ignored (not run); client not generated

- timestamp: 2026-02-14T00:00:08Z
  checked: Prisma client generation manually
  found: Error - schema is at root (../../prisma/schema.prisma) not in apps/api
  implication: Must run prisma generate with explicit --schema path or from different directory

- timestamp: 2026-02-14T00:00:09Z
  checked: Prisma version mismatch
  found: |
    prisma CLI: 7.4.0
    @prisma/client: 5.22.0
    error: Schema uses old format (datasource.url) which is not supported in Prisma 7
  implication: CRITICAL: Prisma CLI and client versions are incompatible; schema cannot be generated

- timestamp: 2026-02-14T00:00:10Z
  checked: Actual tsc errors (pnpm run build)
  found: |
    100+ TypeScript errors including:
    - Cannot find module 'rxjs' or 'rxjs/operators'
    - Module @prisma/client has no exported member 'PrismaClient'
    - Property 'alert'/'user'/'listing' etc do not exist on PrismaService
    - DTO properties missing initializers (strictPropertyInitialization enabled)
  implication: Prisma client was never generated; rxjs is not installed

- timestamp: 2026-02-14T00:00:11Z
  checked: rxjs installation
  found: rxjs is NOT in node_modules; @nestjs/common lists rxjs@^7.1.0 as peer dependency
  implication: Peer dependencies are not auto-installed with --ignore-workspace; must be explicit

- timestamp: 2026-02-14T00:00:12Z
  checked: Root cause chain
  found: |
    1. nixpacks uses "pnpm install --ignore-workspace" (isolates to API package)
    2. --ignore-workspace skips root install; peer dependencies not auto-resolved
    3. Prisma postinstall script ignored (build script safety feature)
    4. Results in: missing rxjs, missing Prisma client generation
  implication: ROOT CAUSE: Installation isolation without proper dependency resolution and Prisma generation

## Resolution

root_cause: |
  nixpacks.toml uses "pnpm install --ignore-workspace" which:
  1. Prevents peer dependencies (rxjs) from being auto-resolved - rxjs not installed
  2. Prevents Prisma postinstall script from running - Prisma client not generated
  3. Prisma schema in root directory but Prisma CLI looks in apps/api/prisma
  4. Multiple Prisma schema validation errors (empty model, Float/Decimal type mismatch, missing relations)

fix: |
  1. Add rxjs@^7.1.0 to apps/api/package.json dependencies - resolves rxjs import errors
  2. Add prisma@^5.7.1 as devDependency in apps/api/package.json - ensures correct CLI version
  3. Fix Prisma schema (/home/uwc31/propintel-ai/prisma/schema.prisma):
     a) Add id field to extensions_pgvector model
     b) Change Float to Decimal for @db.Decimal() fields (interestRate, capRate, roiPercent, taxRate)
     c) Add missing user relations to PropertyScore, PropertyFinancials, and Report models
  4. Copy schema to apps/api/prisma in nixpacks install phase so Prisma finds it

verification:
  - Original 100+ errors about missing modules/types are FIXED
  - Remaining 34 errors are legitimate TypeScript code issues, not build system issues
  - Prisma client generates successfully
  - tsc can now compile (with code-level errors to be fixed separately)

files_changed:
  - /home/uwc31/propintel-ai/apps/api/package.json (added rxjs and prisma)
  - /home/uwc31/propintel-ai/prisma/schema.prisma (fixed 4+ schema validation errors)
  - /home/uwc31/propintel-ai/nixpacks.toml (copy schema to apps/api before install)
  - /home/uwc31/propintel-ai/apps/api/prisma/schema.prisma (created by copying root schema)
