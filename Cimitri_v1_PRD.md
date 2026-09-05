# Cimitri v1 — Product Requirements Document

**Status:** Current — aligned with schema and `job-types.json` (2026-09-05)
**Product:** Cimitri
**Version:** v1
**Last updated:** 2026-09-05

This document is the product contract. Scheduling is lightweight (complete / flag, no live board). Job types keep the original ids; CEP-5 is only for Alabama OSS new install and repair.

---

## 1. Summary

Cimitri is a standalone SaaS for small trade crews (1–20 people) who are required to file state compliance paperwork as part of their work. The core idea: capture client, property, and job data once, and use it to auto-populate the compliance forms a trade must submit — removing the redundant re-entry that currently happens by hand.

Cimitri is **compliance-first**. Scheduling exists to support that goal (know what job a form belongs to, know who was on it), not to compete with full dispatch/field-service platforms. v1 ships scheduling and compliance form drafting together, as one build — not sequenced.

Tagline: *"Scheduling and compliance automation for regulated trades."*

---

## 2. Problem

When regulated work is finished, the company re-types facts that already exist (owner, site, permit, equipment details) into compliance forms. Some fields are only knowable on site. Licensed professionals must attest on paper; the app must not pretend the form is filed or approved.

Office also lacks a simple way to know when something's wrong with a job — a cracked tank, a no-show customer, anything requiring their attention — without a crew member managing to reach them by phone. This is a narrower problem than full live job tracking: office doesn't need to watch jobs move through states in real time, they need to know when something needs them.

---

## 3. Users

| Role | Job in v1 | Failure |
|---|---|---|
| Office (owner or dispatcher) | Create customers/sites, create jobs (type, date, people), see assignments, see completions and flagged issues, start and export compliance form drafts | Still runs the day from calls and a whiteboard |
| Crew | See jobs assigned to them, mark a job complete or flag an issue, add photos/notes on regulated jobs | Ignores the app; office still finds out by phone |
| AOWB-licensed installer | Review printed draft and wet-sign on paper. May not be the person who dug | Prefill treated as "done"; app treated as a signature |
| Customer-of-record | No login | Wrong name on forms vs. invoice vs. site contact — office data problem |

Office and crew may be the same human on a given day. Same app; different default landing after they choose a mode.

**Not in v1:** customer portal, per-person logins, in-app form signature, multi-tenant billing/white-label, live status board, GPS/fleet tracking.

---

## 4. Goals

- Office can create a job, assign it to one or more people, and know later whether it was completed or flagged — without calling to check.
- For regulated work, Cimitri produces a form draft from the job (identity, permit, equipment) and a printable PDF. The licensed professional signs on paper.
- Crew can capture what a form needs (photos, notes) on-site, on a phone, even without signal at the time.
- Non-regulated jobs never enter a compliance form workflow.

---

## 5. Non-goals (v1)

- Live status board (en_route / on_site style tracking)
- GPS / fleet maps
- Timesheets / clock-in
- Invoicing / payments
- Route optimization
- Multi-jurisdiction form packs
- Customer login
- Per-person user accounts (one shop login)
- Filing regulatory forms on behalf of the user
- Auto-signing or in-app signing of compliance forms
- Implying regulatory approval
- Layout sketch as a required field in the first form slice
- One job record spanning multiple calendar days
- Vehicle / truck assignment (no vehicles in v1)
- Plumbing and construction as new verticals (v2). Non-Alabama OSS jobs may be scheduled; they do not get a CEP-5

---

## 6. Platform and access

- Responsive web (desktop office + phone crew). Installable as a PWA.
- UI: AlignUI (React, Tailwind). Primary #E56515. See `docs/design-system.md` and `docs/brand/palette.json`.
- Crew actions (complete / flag / attach photo-note) must not require a live connection at the moment of action — the action applies once the device is back online, or the user can act at the shop the same day. This is the only offline-tolerance requirement in v1; there is no live status to keep in sync.

**Login:** one shared shop account for v1. The shop password does not identify who tapped complete/flag or attached a photo. Per-person accounts can wait.

**After login:** choose Office or Crew **once per session** (same app, different landings). Not a per-screen toggle.

- **Office landing:** all jobs, today/week, assignees, completion/flag state.
- **Crew landing:** today, filtered to jobs assigned to the crew person they select.

**Crew identity without per-user accounts:** after choosing Crew, the user picks which person they are from the company's people list. That selection is session-level (this phone, this session), not a second password. The selected name stays visible; *I'm someone else* is available (remembers last person). Office assigns jobs to people; whoever should see a job must be assigned.

---

## 7. Workflows

### 7.1 Office day

1. Create or open a customer (payer/billing) and a site (911 address, owner/applicant, site contact — these three may differ).
2. Create a job: type, one calendar date, optional time, at least one assigned person. Every job has a customer and a site. Shop/yard/pickup work uses a reusable *Yard / pickup* site.
3. See jobs as not started, complete, flagged, and/or canceled. Flag is independent of complete.
4. If flagged, read the note the crew left and follow up (call, reschedule, whatever the note calls for). Office can clear a flag once handled, or edit/cancel the job.
5. Multi-day work: *Duplicate to next day* on the job (copy type, customer, site, people, optional time, OSS fields; new date).
6. If the job type requires compliance documentation, open the form draft once the crew has attached photos/notes.

### 7.2 Crew day

1. Pick Crew mode and which person they are. Name stays visible; *I'm someone else* to switch.
2. Open jobs assigned to that person today. Optionally peek at the rest of the week (still only their assignments).
3. On finishing a job: tap **Mark complete**.
4. If something needs office's attention: tap **Flag an issue** and add a short note (e.g., "tank cracked on delivery," "customer not home"). A job can be flagged instead of, or in addition to, marked complete, depending on what happened.
5. On regulated jobs: add photos and notes for the compliance form. Layout sketch is not required in the first forms slice.
6. Do not sign in the app. Signature is on paper after print.

### 7.3 Compliance form close-out (same build as scheduling — not a later increment)

Only when job type requires regulatory documentation (v1: Alabama septic install/repair).

1. Office prefills identity from customer (payer) and site (owner/applicant, 911 address), and permit/tank/system-type fields from the job (copied, not invented — never fabricated).
2. Crew adds photos and notes on the job.
3. Office prints or exports PDF. Licensed professional wet-signs on paper. Draft ≠ approval. Cimitri never captures a signature and does not submit the form to ADPH or any authority — confirmed there is no reliable electronic filing path for CEP-5, so print/PDF-for-wet-signature is the correct v1 (and likely permanent) flow, not a placeholder.
4. Someone still delivers the signed form to the relevant authority within required timeframes. Cimitri does not file it.

---

## 8. Functional requirements

### 8.1 Customers and sites

- Customer is the payer/billing party. Reused across jobs. Not a sales pipeline.
- Site is the place of work: 911 address, city/state/zip, optional subdivision/lot/block, owner/applicant, site contact.
- Payer, owner/applicant, and site contact may all differ. Owner/applicant lives on the site, not the customer.
- A job always belongs to one customer and one site. For yard pour, pickup, or other work with no 911 address, use a shop site such as *Yard / pickup*.

### 8.2 Jobs

- Fields: type, single date, optional time, assigned people (one or more), status (`not_started` / `complete` / `canceled`), flag (`flagged` + required note, independent of status). No vehicles.
- Types (v1): the original ten ids in `job-types.json` (vault, tank sale, Alabama OSS install/repair, out-of-state OSS, pumping, grease trap, car wash pit, other maintenance). All are schedulable. CEP-5 only for `oss_install_new` and `oss_repair`.
- No `en_route` / `on_site` (and no separate “scheduled” status). Default is `not_started`.
- Crew can mark complete (or return to not started) and/or flag an issue with a single free-text note. Crew cannot cancel a job.
- Office can edit, cancel, or clear a flag on any job.
- Multi-day work: a separate job per calendar day. *Duplicate to next day* copies type, customer, site, people, optional time, and OSS fields onto a new job.
- *New job* from a Site or Customer record prefills customer and site.
- Whoever should see the job in Crew must be assigned. Multiple people can be assigned to one job; all assigned people see it.
- When type is `oss_install_new` or `oss_repair`: permit #, tank, and system type live on the job. Other types do not show those fields and never enter a CEP-5 flow. Yard / pickup is a **site** (`is_yard_pickup`), not a job type.

### 8.3 Office view

- List or calendar of jobs with assignees, status, and flag.
- Filter at least by date (today/this week).
- Sees the company's jobs, not a personal subset.
- Empty shop: prompt to add people, a customer, then a job.

### 8.4 Crew view

**Must:**
- Default to today's jobs assigned to the selected crew person.
- Show the selected person's name; *I'm someone else* in the crew shell.
- Show job type, site/customer, time if present, other assigned crew.
- Let the user change the visible day within the current week without leaving the view.
- Mark complete and Flag an issue as two clearly separate, thumb-usable actions.

**Must not:**
- Show the whole company's jobs to crew.
- Require GPS.
- Force a compliance form flow for jobs that don't require regulatory documentation.

### 8.5 Compliance forms (first build — not sequenced after scheduling)

- Trigger only when job type requires regulatory documentation. Stays on the job; no separate Forms inbox.
- Prefill identity from customer (payer) + site (owner/applicant, 911 address) and permit/tank/system type from the job (copied, not invented).
- Field sources: customer (payer), site (owner/applicant, 911), job (permit / tank / system type). A field-by-field CEP-5 map is still due (`cep5.pdf` in the repo root; `forms/cep5-field-map.json` is not in the tree).
- First form field slice: photos and notes on the job; the draft uses them. Detailed typed fields and layout sketch iterate later.
- Export: office prints or downloads PDF for wet signature on paper. Crew does not print in v1. No in-app signature, no submission to ADPH.
- Never auto-complete certification or signature.

---

## 9. Data objects (logical)

- **ShopAccount** — one login for the company.
- **Person** — named crew/office people used for assignment and the crew "who am I" picker. Not a login in v1.
- **Customer** — payer/billing; reused across jobs.
- **Site** — 911 address, owner/applicant, site contact; belongs to a customer.
- **Job** — type, one date, optional time, assignees (≥1), status, flag + note; OSS fields when type needs them. No assigned vehicles.
- **ComplianceFormDraft** — 1:1 with qualifying jobs; snapshot copied from job + site + customer; part of first build.
- **JobNote / JobPhoto** — field capture on qualifying jobs; part of first build.

Quote sites and marketing funnels are out of product. If a lead becomes a job, that's an explicit accept step, not automatic.

---

## 10. Success criteria

| Signal | Bar |
|---|---|
| Office | Can create and assign a day's jobs, and later tell what's done or flagged, without calling every crew member |
| Crew | Sees only their jobs; can mark complete or flag an issue in under a minute |
| Compliance forms | Qualifying jobs can print a draft with identity/permit/equipment mostly filled; licensed professional signs on paper |
| Negative | Jobs that don't require documentation never see a form workflow; office never sees a live per-minute status board |

---

## 11. Decisions locked

| Topic | Decision |
|---|---|
| Name | Cimitri, standalone SaaS |
| Users | Office and crew, same app, different landings |
| Login | One shared shop account; crew picks who they are after login |
| Crew jobs | Only jobs assigned to that person; name always visible; change person in-shell |
| Customer vs. site | Customer = payer. Site = place + owner/applicant + site contact |
| Job always has | Customer + site (use Yard/pickup for shop work) |
| Progress tracking | Status `not_started` / `complete` / `canceled` (office). Flag + free-text note independent of status. No live board, no en_route/on_site |
| Job duration | One job per calendar day; Duplicate to next day instead of a date range |
| People | ≥1 person required per job |
| Vehicles | None in v1 |
| Time | Optional on the job |
| OSS fields | Permit #, tank, system type on `oss_install_new` and `oss_repair`; form copies them |
| Compliance forms when | First build, alongside scheduling. CEP-5 only for those two Alabama OSS types. Draft only; office prints; no submission |
| Form signature | Paper/wet signature after print or PDF export — confirmed, no reliable ADPH electronic filing path exists |
| First field capture | Photos and notes; sketch later |
| Job types (v1) | Original ten ids in `job-types.json`. All schedule. CEP-5 only on `oss_install_new` / `oss_repair`. Plumbing/construction verticals are v2 |
| Mode switch | Office vs Crew chosen once per session after login |
| Platform | Responsive web + PWA |
| Design system | AlignUI (React + Tailwind). Primary #E56515 |
| Pricing | Not part of this PRD — lives in strategy doc |

---

## 12. Must / should / later — sequence the first build

**Must — first build**

Ship nothing else until this works on phone and desktop.

- Shop login.
- People list (names for assignment, not separate passwords).
- Customers (payer) and sites (address, owner/applicant, site contact), including a Yard/pickup site.
- Jobs: type, one date, optional time, ≥1 person, status, flag + note. New job from board or site. Duplicate to next day. `oss_install_new` / `oss_repair`: permit #, tank, system type on the job.
- After login: Office vs Crew once per session.
- Office view: all jobs, today/week, assignees, status and flag.
- Crew view: pick person → only their jobs today; peek at week; mark complete or flag an issue.
- Compliance form draft on CEP-5 jobs: prefill snapshot from customer + site + job; photos and notes on the job; office print/PDF export.
- PWA; complete/flag actions apply once back online if there was no signal.

**Done when:** office can schedule a day of septic jobs, assign crew, and later see what's complete or flagged without calling around; crew on a phone only sees their jobs and can mark complete/flag in under a minute; a qualifying job can produce a form draft that's mostly pre-filled, ready to print for a wet signature.

**Later — after v1 ships**

- Live status states (en_route, on_site) — only if office demand for finer-grained tracking is confirmed after v1 is in use.
- Layout sketch (not only photos).
- Typed as-built form fields on the phone.
- Per-person logins and an audit of who changed what.
- In-app/digital signature (not expected — no electronic filing path confirmed for CEP-5).
- One job record spanning multiple days.
- Submitting forms to regulatory authorities.
- Plumbing and construction job types and their forms (v2).
- Multi-state expansion (v3, demand-dependent).
- GPS, timesheets, invoicing.
- Vehicle / truck assignment.

---

## 13. Open questions (do not block the first build)

- Photo/note limits (count, size) when that slice is built.

Locked (were listed as open; now defaults): Office vs Crew once per session; office prints CEP-5; flag is a single free-text note with no categories.

---

## 14. How it runs

Next.js app + AlignUI, one API in the same deploy, Postgres, PWA. See `docs/how-it-works.md`.

---

## 15. References

- `product.json`
- `v1-scope.json`
- `job-types.json`
- `web/db/schema.sql`
- `cep5.pdf` (field map JSON not in the tree yet)
- `docs/IA.md`
- `docs/how-it-works.md`
- `docs/design-system.md`
- `docs/brand/palette.json`
