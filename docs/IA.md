# Cimitri — proposed information architecture (v1)

**Status:** Proposal — adjust this file; PRD stays the contract until you say otherwise  
**Last updated:** 2026-08-25

This is **how the product is organized**, not how a week strip looks. Option C is one widget on the crew landing, not a separate app.

---

## 1. One app, two shells

```
Shop login
    → Choose Office | Crew
        → If Crew: pick Person (who am I)
            → Shell
```

| | Office shell | Crew shell |
|---|---|---|
| Who | Dispatcher / owner | Person selected this session |
| Default home | **Board** (company jobs) | **Today** (my jobs only) |
| Sees | Everyone’s jobs | Jobs assigned to that person |
| Creates | Customers, sites, people, vehicles, jobs | Nothing in first build except status (+ later photos/notes) |

Same URL, same PWA. Mode and person live in the **session**, not a second password.

---

## 2. Objects (what the IA hangs on)

```
Shop
├── People          (names for assignment / who-am-I)
├── Vehicles
├── Customers
│     └── Sites     (911 address; owner ≠ payer allowed)
└── Jobs            (one calendar date each)
      ├── assignees (People)
      ├── vehicles
      ├── status
      ├── photos / notes     (later, OSS)
      └── CEP-5 draft        (later, AL OSS install/repair only)
```

**Job** is the hub. Everything the field cares about is on a job or one tap from it.

Quotes / marketing sites are **outside** Cimitri. A lead becomes a job only after an explicit accept (not in first-build nav).

---

## 3. Screens (first build vs later)

### Always (entry)

| Screen | Purpose |
|---|---|
| Login | Shop email + password |
| Mode | Office or Crew |
| Who am I | Crew only — pick a Person |

### Office shell — first build

| Screen | In the nav? | Purpose |
|---|---|---|
| **Board** | Primary | Today / this week, all jobs, status, people, trucks |
| **Job** | From board | One job: type, date, people, trucks, status; edit |
| **New job** | From board | Create job (needs customer + site) |
| **Customers** | Secondary | List; open customer |
| **Customer** | From list | Payer / contacts; list of sites |
| **Site** | From customer or job | Address; jobs at this site |
| **People** | Settings-ish | Names for assignment |
| **Vehicles** | Settings-ish | Trucks |

Office **Board** can include a week/month chrome; that is layout, not a second product.

### Crew shell — first build

| Screen | In the nav? | Purpose |
|---|---|---|
| **Today** | Primary (home) | Option C: week strip + list for the selected day. Status taps. |
| **Job** | From a card | Same job record as office; crew can change **status** only (first build) |

No company-wide board. No customer directory. Peek at the week **on Today**, not a separate “Calendar” app.

### Later (same IA, extra surfaces)

| Screen | Lives under |
|---|---|
| CEP-5 draft | Job (only AL `oss_install_new` / `oss_repair`) |
| Photos / notes | Job |
| Print / PDF | Job → CEP-5 |
| Sketch | Job → CEP-5 (after photos) |

If a job is vault / pump / grease / FL-GA OSS, **there is no CEP-5 item** on that job.

---

## 4. Navigation (proposed)

**Office (desktop-first)**

```
[ Board ]  [ Customers ]  [ People ]  [ Vehicles ]
     └── Job ── New job
Customer └── Site └── Job
```

Switch Office ↔ Crew from a persistent control (once per session vs always visible is still open).

**Crew (phone-first)**

```
[ Today ]
     └── Job (status; later photos)
```

Optional overflow: “I’m someone else” (change Person), “Office” (if they also dispatch).

---

## 5. Job as the only deep link that matters

A job screen always shows, in this order:

1. Where / who (site, customer names)  
2. When (one date, optional time)  
3. Who’s on it (people) and what trucks  
4. Status stepper  
5. **If CEP-5 applies:** draft / photos — else nothing about forms  

One schedule for all `job-types.json` types. Forms are a **facet of the job**, not a top-level “Forms” section in first build.

---

## 6. Explicitly not in the IA (v1)

- Customer portal  
- Map / GPS  
- Timesheets  
- Invoices  
- Quote funnel  
- A “CEP-5 inbox” separate from jobs  
- Multi-day single job record  

---

## 7. What you might want to change

Mark up here or reply with numbers:

1. **Office home:** Board only, or Board + a customer list equally prominent?  
2. **People / Vehicles:** own nav items, or buried under a single **Shop setup** screen?  
3. **Crew:** Today only, or a second tab for “this week list” without the strip?  
4. **CEP-5 later:** stay on Job, or a filtered “Needs form” list for the office?  
5. **Mode switch:** always in the header vs choose once after login until logout?

---

## 8. Related

- Product contract: `docs/PRD.md`  
- How it runs: `docs/how-it-works.md`  
- Types: `job-types.json`  
- Linear: FRE-12 (IA), FRE-19 (build order)  
