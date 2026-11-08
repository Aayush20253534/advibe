# Database backup and recovery runbook

Authority: designated database/recovery operator. Production restoration, key custody and customer-data handling require their approval. This session exercised only a disposable local database populated by synthetic tests.

## Verified local drill

Using the repository's unchanged `backup-encrypted.sh` and `restore-drill.sh`, PostgreSQL 16.15 and age 1.2.1: encrypted archive 334,516 bytes, mode 0600; backup 188 ms, restore 1,347 ms. Restored counts matched: 70 tables, 80 users, 20 migration records, 143 audit events. A second restore into the occupied database was refused. Temporary identity/archive were erased afterward. Full evidence is in `qa/restore-drill.json`; these timings are not production RTO/RPO.

## Prerequisites and custody

- Use a pg_dump version compatible with the source server; use the matching major for reproducible drills. Keep pg_restore and psql available, with age installed from a verified distribution.
- Connect with explicit `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`, TLS verification and a mode-0600 `PGPASSFILE` outside Git. Do not put credentials in command arguments, screenshots or CI logs.
- Backups use an approved age public recipient. Hold the private identity in a separate restricted recovery vault, with documented access/recovery owners. Never store the private identity beside the retained archive.
- Choose retention, backup cadence, region, RPO and RTO before real data admission. Provider history is complementary; Neon Free's limited restore window cannot replace independently retained backups.

## Create and retain a backup

1. Identify the exact source environment/database and migration revision. Confirm no test reset/seed command points to it.
2. Configure the approved public recipient and source connection in a protected shell. Run `bash backend/scripts/backup-encrypted.sh /approved-backup-path/new-archive.dump.age`.
3. The script streams custom-format pg_dump directly into age, writes mode 0600 and refuses an existing destination. No unencrypted archive is written by the script.
4. Record UTC time, environment, revision, encrypted size/hash, operator and non-secret storage artifact ID. Transfer only the encrypted archive to approved retained storage with restricted access, lifecycle and deletion auditing.
5. Alert on failure or an overdue backup. A successful upload is not evidence that decryption/restoration works.

## Isolated restore drill

1. A separate operator creates a completely empty, isolated target named `advibe_<label>_restore` or another name allowed by the script. Never use the source/customer database.
2. Set target connection variables, `B23_AGE_IDENTITY_FILE` and `B23_RESTORE_ACK=YES_DISPOSABLE_DATABASE` in the controlled recovery environment.
3. Run `bash backend/scripts/restore-drill.sh /approved-backup-path/archive.dump.age`. The script refuses a populated database, requires schema tables and uses no destructive `--clean` option.
4. Compare migration state and authorized aggregate counts; check foreign keys, audit continuity and critical ledger totals. Run read-only application checks with outgoing email, payments, refunds, payouts, GPS and device activity disabled.
5. Record restore duration, backup age, consistency checks, operator and evidence ID. Do not publish customer rows or secrets. Remove temporary decrypted access material and retire the disposable target under the approved retention policy.

## Incident restoration

Stop affected writes/workers through approved admission controls. Preserve evidence and identify the last trusted recovery point. Restore into a new database; validate integrity and reconcile payment/provider events and audit continuity. Only the incident owner may authorize traffic cutover by changing secrets. Keep the prior database read-only for investigation; do not overwrite it during initial recovery.

Rollback application binaries independently of database recovery. Applied migration history is immutable; prefer a reviewed forward repair for schema defects. A stale financial backup must never trigger replayed transfers or mark unreconciled payments successful.

## Remaining admission requirements

Actual hosted backup retention, independent key recovery, a provider-database restore, measured representative RPO/RTO, incident ownership and alert delivery remain unverified. Do not set `B23_RESTORE_DRILL_VERIFIED=true` based solely on this small local synthetic drill.
