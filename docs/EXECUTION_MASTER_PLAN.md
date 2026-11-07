# BlinkMyAd execution master plan

Audit baseline: `d2ac1f3d7777784509cffdcd3aa763d6de138920`, 7 November 2026 (India).
Branch: `work/blinkmyad-production-readiness`. Scope: preserve the modular monolith and finish independently executable work; no commercial deployment, paid provider activation, or approval attestations.

## Existing architecture

Next.js 16.4.2 / React 19.3.1, TypeScript, Tailwind 4 and Motion 12 frontend; Express 5, Prisma 6.19 and PostgreSQL backend. Browser sessions travel through an allowlisted same-origin relay. Backend ownership, role, CSRF and MFA checks remain authoritative. There are 23 backend milestone implementations, domain integration suites, immutable audit records, gated finance/device operations, and dedicated role portals. Historical demo models are not the live product.

## Ordered execution

| Phase | Work based on the source audit | Required evidence |
| --- | --- | --- |
| 0 | Inventory source, routes, schema, migrations, documentation, CI and dependency manifests | Current baseline and explicit external blockers |
| 1 | Reproducible dependency installation, environment repair, runtime error handling, current route contract | Lint, types, contracts, build and regressions |
| 2 | Preserve established UI tokens; centralize brand configuration and loading/error behavior | Component checks, design-system/browser review |
| 3 | Refine existing public pages and motion; preserve original artwork | Responsive public flow review, reduced motion |
| 4 | Verify sessions, account isolation, password/MFA and expiry behavior | Disposable database auth/security tests |
| 5 | Verify campaign/business/creative workflows and error states | Advertiser tests and portal review |
| 6 | Verify partner onboarding and preserve legal/storage gates | Driver/KYC tests and portal review |
| 7 | Verify admin permissions, audit and operational controls | MFA/admin/support/finance boundary tests |
| 8 | Finish safe integration seams and opt-in maps; verify provider constraints | Mock/disabled path tests, provider status report |
| 9 | Address concrete threats in relay, logs, dependencies and CI | Security regressions and documented threat model |
| 10 | SEO, accessibility and measured performance improvements | Build, browser measurements; record unavailable tools |
| 11 | Execute current and legacy tests, repair actual failures | Consolidated fresh evidence, no deleted protections |
| 12 | Prepare controlled-test deployment, cost and recovery runbooks | Release-gate tests, owner actions, final verdict |

Each phase records its actual status in `PHASE_PROGRESS.md` and has a separate commit. A blocked provider/hardware/legal task does not authorize fake data or approval flags. A phase can be implementation-complete while its staging verification remains blocked; those are distinct statuses.
