# Cimitri — information architecture (v1)

**Status:** Current — matches PRD, `job-types.json`, and `web/db/schema.sql`  
**Last updated:** 2026-09-05

This is how the product is organized: objects, shells, and screens. Layout of a week strip is not a separate app.

The PRD is the contract. This file is the map.

---

## 1. One app, two shells

```
Shop login
    → Choose Office | Crew   (once per session)
        → If Crew: pick Person (who am I)
            → Shell
```

| | Office shell | Crew shell |
|---|---|---|
| Who | Dispatcher / owner | Person selected this session |
| Default home | Company jobs (today / this week) | Today — my jobs only |
| Sees | Every job for the shop | Jobs assigned to that person |
| Creates | People, customers, sites, jobs | Nothing except complete / flag / photos / notes on assigned jobs |
| Cancels | Yes | No |
| Prints CEP-5 | Yes | No |

Same URL, same PWA. Mode and person live in the **session**, not a second password.

---

## 2. Objects

```
Shop
├── People              (names for assignment / who-am-I — not logins)
├── Customers           (payer / billing)
│     └── Sites         (911, owner/applicant, site contact; is_yard_pickup)
└── Jobs                (one calendar date each)
      ├── assignees     (People, ≥1)
      ├── status        (not_started | complete | canceled)
      ├── flag          (flagged + note, independent of status)
      ├── OSS fields    (permit / tank / system_type — AL OSS install/repair only)
      ├── notes / photos
      └── CEP-5 draft   (1:1, snapshot — AL OSS install/repair only)
```

**Job** is the hub. There are **no vehicles**.

Yard / pickup is a **site** (`is_yard_pickup`), not a job type. Tank sale / yard pour still uses a job type (`tank_sale_no_install`) pointed at that site when needed.

Quotes and marketing funnels are outside Cimitri.

---

## 3. Job types

All ten ids are on the schedule. CEP-5 only when `cep5` is true.

| id | CEP-5 |
|---|---|
| `vault_wholesale` | No |
| `vault_direct` | No |
| `tank_sale_no_install` | No |
| `oss_install_new` | Yes |
| `oss_repair` | Yes |
| `oss_install_or_repair_fl_ga` | No (schedule only) |
| `pumping` | No |
| `grease_trap` | No |
| `car_wash_pit` | No |
| `maintenance_other` | No |

---

## 4. Job state

Two independent axes. Not a live board.

| Axis | Values | Who |
|---|---|---|
| Status | `not_started` (default), `complete`, `canceled` | Crew: not_started ↔ complete. Office: also cancel |
| Flag | off, or on with a required free-text note | Crew sets; office clears |

A job may be complete and flagged, flagged and not started, or canceled. No `en_route`, `on_site`, or distinct `scheduled` status.

---

## 5. Screens (first build)

### Always (entry)

| Screen | Purpose |
|---|---|
| Login | Shop email + password |
| Mode | Office or Crew (once) |
| Who am I | Crew only — pick a Person |

### Office shell

| Screen | Nav | Purpose |
|---|---|---|
| Jobs | Primary | Today / this week, all jobs, assignees, status, flag |
| Job | From list | One job: type, date, people, status, flag, OSS fields, notes/photos, CEP-5 if any; edit / duplicate / cancel |
| New job | From jobs, customer, or site | Needs customer + site; ≥1 person |
| Customers | Secondary | List; open customer |
| Customer | From list | Payer; list of sites; new job |
| Site | From customer or job | Address, owner/applicant, site contact; jobs here |
| People | Settings-ish | Names for assignment |
| CEP-5 draft | On qualifying job | Snapshot + photos/notes; print / PDF |

Empty shop: prompt to add people, a customer, then a job.

### Crew shell

| Screen | Nav | Purpose |
|---|---|---|
| Today | Primary | Jobs assigned to the selected person for the visible day |
| Week peek | On today | Change day within the week; still only my jobs |
| Job | From list | Type, site/customer, time, other crew; **Mark complete**, **Flag an issue**; photos/notes if CEP-5 type |
| I'm someone else | In shell | Re-pick person (remembers last) |

Crew must not see the whole company's jobs, use GPS, assign people, cancel, or print CEP-5.

---

## 6. Compliance path (on the job)

No Forms inbox.

1. Office creates an `oss_install_new` or `oss_repair` job with permit / tank / system type.
2. A `compliance_form_drafts` row holds a **copy** of payer, owner/applicant, 911, and OSS fields (not invented).
3. Crew adds photos and notes on that job.
4. Office prints or exports PDF. Wet sign on paper. Cimitri does not sign or file.

---

## 7. Out of IA for v1

Live status board, vehicles, layout sketch, typed as-built fields, per-person logins, customer portal, invoicing, GPS, plumbing/construction form packs.
