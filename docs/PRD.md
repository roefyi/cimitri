# Cimitri v1 — Product Requirements Document

**Status:** Ready to lock  
**Product:** Cimitri  
**Version:** v1  
**Last updated:** 2026-08-25

This document is the product contract. UI studies in `prototypes/` are explorations, not requirements, except where this PRD restates a job-to-be-done.

---

## 1. Summary

Cimitri is standalone SaaS for field contractors who **schedule jobs**, **see crew and truck progress on a simple status board**, and **draft Alabama CEP-5** for onsite sewage install/repair.

v1 is one product for **office and crew**, as a **responsive web app that can be installed as a PWA**. Crew must be able to use it on a phone in the truck, including updating after they are back on a signal.

**First ship** is the schedule and status board. CEP-5, photos, and notes follow in the same v1 product, sequenced (see §12). Layout sketch and digital signature are later.

---

## 2. Problem

The office cannot see, in one place, who is on which job and which truck, or whether work is done, without calling around.

When an Alabama OSS install or repair is finished, the company re-types facts that already existed (owner, site, permit, tank) into CEP-5. Some fields are only knowable on site. The licensed installer must attest on **paper**; the app must not pretend the form is filed or approved.

---

## 3. Users

| Role | Job in v1 | Failure |
|---|---|---|
| Office (owner or dispatcher) | Create customers/sites, create jobs (type, date, people, trucks), watch status, close jobs, later start CEP-5 drafts | Still runs the day from calls and a whiteboard |
| Crew | See **only jobs assigned to the person they picked**, peek at the rest of the week, tap status in under a minute, later add photos/notes on OSS jobs | Ignores the app; board goes stale |
| AOWB-licensed installer | Review printed draft and **wet-sign on paper**. May not be the person who dug | Prefill treated as “done”; app treated as a signature |
| Customer-of-record | No login | Wrong name on CEP-5 vs invoice vs site contact — office data problem |

Office and crew may be the same human on a given day. Same app; **different default landing** after they choose a mode.

**Not in v1:** customer portal, per-person logins, in-app CEP-5 signature, multi-tenant billing/white-label as a product surface.

---

## 4. Goals

1. Office can answer: who is on what job, which truck(s), what status.
2. Crew can see today’s jobs **assigned to them** and update status in under a minute (including later, at the shop, if there was no signal).
3. For Alabama OSS new install or repair, Cimitri produces a **CEP-5 draft** from the job and a **printable PDF**. The licensee signs on paper. Non-OSS jobs never enter a CEP-5 dead end.
4. All field job types share one schedule.

---

## 5. Non-goals (v1)

- Live GPS / fleet maps  
- Timesheets / clock-in  
- Invoicing / payments  
- Route optimization  
- Multi-state form packs (FL/GA OSS)  
- Customer login  
- Per-person user accounts (one shop login)  
- Filing CEP-2 / CEP-3 for the owner  
- Engineer CEP-6 workflow  
- Submitting CEP-5 to the LHD  
- Auto-signing or in-app signing of CEP-5  
- Implying ADPH approval  
- Layout sketch as a required field in the first CEP-5 slice  
- One job record that spans multiple calendar days  
- Locking a specific week-calendar visual (pills, columns, Now/Next/Later, etc.)

---

## 6. Platform and access

- Responsive **web** (desktop office + phone crew).  
- Installable as a **PWA**.  
- **UI:** [AlignUI](https://www.alignui.com/) only (React, Tailwind, AlignUI components). Primary **`#E56515`**. See `docs/how-it-works.md` and `docs/brand/palette.json`.  
- Status updates must not require a perfect live connection: if the user taps offline, the change must apply when the device is back online, or the user can update at the shop the same day.

**Login:** one **shared shop account** for v1. That is acceptable. Caveat: the shop password does not identify who tapped status or attached a photo. Per-person accounts can wait.

**After login:** choose **Office** or **Crew** (same app, different landings).

- Office landing: schedule / status board (all jobs).  
- Crew landing: today, **filtered to jobs assigned to the crew person they select**.

**Crew identity without per-user accounts:** the shop login is not enough for “assigned to me.” After choosing Crew, the user picks **which person they are** from the company’s people list. That selection is session-level (tablet in this truck), not a second password. Office assigns jobs to those people.

---

## 7. Workflows

### 7.1 Office day

1. Create or open a customer and a site (payer, owner, and site contact may differ).  
2. Create a job: type, **one calendar date**, assigned people, **one or more vehicles**, status `scheduled`.  
3. Watch the board as statuses change.  
4. May mark complete if the crew already finished in the field.  
5. If the job is Alabama OSS install or repair, open the CEP-5 draft when that slice is in scope. Otherwise stop.

Work that lasts more than one day is **one job per day**, not one record with a date range.

### 7.2 Crew day

1. Pick Crew mode and **which person** they are.  
2. Open **today’s** jobs assigned to that person.  
3. Optionally peek at **other days this week** (still only their assignments).  
4. Tap status: `scheduled` → `en_route` → `on_site` → `complete`.  
5. On Alabama OSS install/repair (when that slice ships): add **photos and notes**. Layout sketch is not required in the first CEP-5 slice.  
6. Do not sign in the app. Signature is on paper after print.

**Week UI:** any of the eight week-widget studies may be used. The PRD requires the jobs above, not a specific layout.

### 7.3 CEP-5 close-out (same v1 product, later than the board)

Only when job type is OSS new install or repair **and** the site is in Alabama.

1. Office prefills identity, permit, tank, and system-type fields from the job (copied, not invented). LHD-originated fields are copied from the permit, never fabricated.  
2. Crew adds photos and notes. Sketch is a later iteration.  
3. Office (or licensee) **prints or exports PDF**. Licensee **wet-signs on paper**. Draft ≠ approval. Cimitri never captures a signature.  
4. Someone still delivers the signed form to the LHD within **3 business days** of completion (Alabama 420-3-1). Cimitri does not file it.

---

## 8. Functional requirements

### 8.1 Customers and sites

- Store customer and **site** separately enough that owner/applicant, payer, and site address can differ.  
- Site has 911 address, city/state/zip, optional subdivision/lot/block.

### 8.2 Jobs

- Fields: type, **single date**, assigned people (one or more), assigned vehicles (**one or more**), status.  
- Types: see `job-types.json`. All types appear on one schedule.  
- Status values only: `scheduled`, `en_route`, `on_site`, `complete`.  
- Multi-day work: create **a separate job per calendar day**.  
- A job may have **multiple trucks** when two vehicles are on site the same day.

### 8.3 Office board

- List or calendar of jobs with assignees, truck(s), status.  
- Filter at least by date (today / this week).  
- Sees the company’s jobs, not a personal subset.

### 8.4 Crew week view

Must:

- Default to **today’s** jobs **assigned to the selected crew person**.  
- Show **status**, site/title, time if present, crew, truck(s).  
- Let the user change the visible day within the current week without leaving the view.  
- Status control usable with a thumb (large tap target).  

Must not:

- Show the whole company’s jobs to crew.  
- Require GPS.  
- Force a CEP-5 flow for vault, pump, grease, tank-only, or out-of-state OSS.

### 8.5 CEP-5 (sequenced after the board)

- Trigger only: `oss_install_new` or `oss_repair` and Alabama site.  
- Field sources: `forms/cep5-field-map.json` (office / field / lhd).  
- Current form: ADPH CEP-5 **8/2025** (`forms/references/cep5.pdf`).  
- First CEP-5 field slice: **photos and notes**; as-built typed fields and layout sketch iterate later.  
- Export: printable **PDF** for **wet signature on paper**. No in-app signature.  
- Never auto-complete certification or signature.

---

## 9. Data objects (logical)

- **ShopAccount** — one login for the company.  
- **Person** — named crew/office people used for assignment and the crew “who am I” picker. Not a login in v1.  
- **Customer**  
- **Site**  
- **Vehicle**  
- **Job** — type, one date, assignees, vehicles (many), status  
- **Cep5Draft** — optional, 1:1 with qualifying jobs (later slice)  
- **JobNote** / **JobPhoto** — field capture on qualifying jobs (later than board)

Quote sites and marketing funnels are **out of product**. If a lead becomes a job, that is an explicit accept step, not automatic.

---

## 10. Success criteria

| Signal | Bar |
|---|---|
| Office | Can run a morning without calling every crew, using the board |
| Crew | Sees only their jobs; status update in under one minute |
| CEP-5 (when that slice ships) | Qualifying jobs can print a draft with identity/permit/tank mostly filled; licensee signs on paper |
| Negative | Vault/pump/grease jobs never see a CEP-5 wall |

---

## 11. Decisions locked

| Topic | Decision |
|---|---|
| Name | **Cimitri**, standalone SaaS |
| Users | Office and crew, same app, different landings |
| Login | One shared shop account; crew picks **who they are** after login |
| Crew jobs | Only jobs **assigned to that person** |
| Progress | Status board, not GPS |
| Job duration | **One job per calendar day** |
| Vehicles | **Multiple trucks** on the same job |
| CEP-5 when | Alabama OSS install/repair only; draft; no LHD submit |
| CEP-5 sign | **Paper / wet signature** after print or PDF export |
| First field capture | **Photos and notes**; sketch later |
| Platform | Responsive web + PWA |
| Design system | **AlignUI** (React + Tailwind). No second component kit. |
| Color | Primary **`#E56515`**. Full palette: `docs/brand/palette.json` |
| Week widget visual | Not locked |

---

## 12. Must / should / later — sequence the first build

Use this to cut tickets. “v1 product” still includes CEP-5; it does not all ship in the first increment.

### Must — first build (board)

Ship nothing else until this works on phone and desktop.

1. Shop login.  
2. People list (names for assignment; not separate passwords).  
3. Vehicles list.  
4. Customers and sites.  
5. Jobs: type, one date, people, **one or more trucks**, status.  
6. After login: **Office** vs **Crew**.  
7. Office landing: all jobs, today/week, assignees, trucks, status.  
8. Crew landing: pick person → **only their** jobs for today; peek at the week; thumb-sized status taps.  
9. PWA; status can be updated later the same day if there was no signal.

**Done when:** office can schedule a mixed day (vault + OSS + pump) and see statuses change without calling; crew on a phone only sees their jobs and can tap through statuses.

### Should — same v1, second increment (CEP-5 draft)

1. CEP-5 draft on Alabama OSS install/repair only.  
2. Prefill office/LHD fields from the job (`cep5-field-map.json`).  
3. Photos and notes on that job.  
4. Print / PDF export for **paper signature**.  
5. No CEP-5 path on other job types.

**Done when:** office can print a draft that is mostly filled from the job; crew can attach photos/notes; licensee signs on paper.

### Later — after v1 lock, iterate

- Layout sketch (not only photos).  
- Typed as-built CEP-5 fields on the phone.  
- Per-person logins and an audit of who changed status.  
- In-app / digital signature.  
- One job record spanning multiple days.  
- Submitting to the LHD.  
- GPS, timesheets, invoicing, FL/GA forms.

---

## 13. Open questions (do not block the first build)

1. Exact office vs crew switcher (toggle on every screen vs choose once per session).  
2. If two people share a truck and both are assigned, both see the job — confirm that is intended.  
3. Photo/note limits (count, size) when that slice starts.  
4. Who prints the CEP-5 (office only vs crew can download PDF).

---

## 14. How it runs

See **`docs/how-it-works.md`**: Next.js app + AlignUI, one API in the same deploy, Postgres, PWA. Photos/PDF come in the second increment.

---

## 15. References

- `product.json`  
- `v1-scope.json`  
- `job-types.json`  
- `workflows.json`  
- `forms/cep5-field-map.json`  
- `docs/how-it-works.md`  
- `docs/brand/palette.json`  
- `prototypes/calendar-widgets.html` (A/B/C)  
- `prototypes/week-widget-lab.html` (eight week studies)  
