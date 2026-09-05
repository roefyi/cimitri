# How Cimitri actually runs

**Status:** Current — matches the live stack and schema  
**Last updated:** 2026-09-05

A website you can install on a phone, talking to Postgres that holds the shop’s jobs.

---

## 1. Design system (locked)

Canonical spec: **`docs/design-system.md`**. Palette source: `docs/brand/palette.json`.

All product UI uses **[shadcn/ui](https://ui.shadcn.com/)** in `web/components/ui`. Clockwork primary **`#E56515`**. Body copy stays near-black. AlignUI is retired. Do not add a second component library.

Run: `cd web && npm install && npm run dev` → **http://127.0.0.1:3456**

---

## 2. Moving parts

```
Phone / laptop  →  Cimitri web (PWA)  →  Next.js server routes  →  Postgres (Neon)
                                              ↓
                                    Object storage (photos) when that slice is wired
```

| Box | Job | Default |
|---|---|---|
| **App** | Login, office jobs, crew today, customers/sites/jobs | Next.js in `web/` + PWA |
| **API** | Same deploy: save jobs, list today’s assignments, complete/flag | Next.js Route Handlers / server actions |
| **Database** | Shop, people, customers, sites, jobs, notes, photos metadata, CEP-5 drafts | **Neon Postgres** project `mute-term-96326603` (name: cimitri). Schema: `web/db/schema.sql`. Local URL in gitignored `web/.env.local` |
| **Files** | Job photo bytes | Table `job_photos.storage_url` exists; Blob (or equivalent) is wired when the photo slice is built |

Office on desktop and crew on a phone are the **same app**. After login they pick **Office** or **Crew** once per session. Crew then picks **who they are**. That lives in the browser session, not a second password.

There are **no vehicle tables**.

---

## 3. What has to exist for the first build to function

1. A hosted URL the shop can open (and Add to Home Screen).
2. One shop login (email + password hash in `shops`).
3. Tables as in `web/db/schema.sql` (already applied on Neon).
4. Office screens that create people / customers / sites / jobs and show today/week.
5. Crew screens that filter to the selected person and set complete / flag.
6. PWA so complete / flag / photo-note can be tapped with no signal and applied when back online (or at the shop the same day). That is the only offline requirement — there is no live status to sync.
7. For CEP-5 jobs: draft snapshot, photos/notes, office PDF/print.

Empty database except one seeded shop is enough to start; people and jobs are still created in the app.

**Schema commands** (from `web/`, needs `web/.env.local`):

- Existing database: `npm run db:migrate`
- Empty database: `npm run db:apply`

---

## 4. Request flow (examples)

**Crew marks complete**

1. Phone: tap Mark complete on an assigned job.
2. App writes `jobs.status = complete` (rejected if `canceled`).
3. Office list shows complete for that job. Flag, if any, is unchanged.

**Crew flags an issue**

1. Phone: tap Flag an issue, enter a note.
2. App writes `flagged = true` and `flag_note`.
3. Office reads the note, follows up, clears the flag (`flagged = false`, `flag_note` null).

**Office opens CEP-5**

1. Job type is `oss_install_new` or `oss_repair`.
2. Draft row copies payer (customer), owner/applicant + 911 (site), permit/tank/system type (job).
3. Crew photos/notes attach to the job, not a separate inbox.
4. Office exports PDF. No signature capture, no ADPH submit.

---

## 5. Data the database actually holds

| Table | Role |
|---|---|
| `shops` | One company login |
| `people` | Assignment and who-am-I |
| `customers` | Payer |
| `sites` | Place of work; `is_yard_pickup` for shop/yard |
| `jobs` | Type, date, optional time, status, flag, OSS fields |
| `job_assignees` | Who sees the job in Crew |
| `job_notes` / `job_photos` | Field capture |
| `compliance_form_drafts` | 1:1 snapshot for CEP-5 jobs |

Types and statuses: `web/db/types.ts` and `job-types.json`.

---

## 6. Not this stack (v1)

Separate backend service, per-person auth, vehicle tracking, GPS, live board state machine, in-app signature, ADPH filing.
