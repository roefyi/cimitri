# How Cimitri actually runs

**Status:** Locked for first build (vendors below are the default; swap only if something blocks)  
**Last updated:** 2026-08-25

This is the simple picture: a website you can install on a phone, talking to a database that holds the shop’s jobs.

---

## 1. Design system (locked)

All product UI uses **[AlignUI](https://www.alignui.com/)**.

| Piece | What we use |
|---|---|
| Framework | **React** + **TypeScript** |
| Styles | **Tailwind CSS** (AlignUI tokens / `@alignui/cli`) |
| Components | AlignUI components copied into the app (`@/ui/...`), not a one-off CSS kit |
| Icons | Remix Icon (what AlignUI uses) |
| Figma | AlignUI’s Figma library when designing; Cimitri file stays at `product.json` → `figma` |
| Color | **Clockwork palette**, primary **`#E56515`**. Tokens: `docs/brand/palette.json`, swatch: `docs/brand/palette.png` |

Do not invent a second component library. Prototypes in `prototypes/` are studies; production screens rebuild in AlignUI.

Official path: AlignUI Next.js starter lives in **`web/`** (already in this repo). Palette is applied in `web/app/globals.css`. To run: `cd web && npm install && npm run dev`.

| Token | Hex | Use |
|---|---|---|
| Primary | `#E56515` | Buttons, selected, key accent |
| Primary soft | `#FBA45C` | Chips, softer highlight |
| Background | `#F8F8F8` | Page / large surfaces |
| Border | `#CDCDCB` | Dividers, inactive chrome |
| Muted | `#919599` | Secondary text, muted icons |

Body copy stays near-black (AlignUI strong text). Orange is for action and emphasis, not paragraphs.

**Still useful, not blocking:**

1. **Free vs Pro** — Base is 40+ open-source components. Pro adds extra blocks and the **always-updated Figma file**.  
2. **Figma access** — If you have Pro, invite the AlignUI library into the Cimitri file and apply these hexes to the primary variables.

---

## 2. The moving parts (four boxes)

```
Phone / laptop  →  Cimitri web app (PWA)  →  API  →  Database
                         ↑
                    File storage (photos — second increment)
```

| Box | Job | First-build default |
|---|---|---|
| **App** | Screens: login, office board, crew today/week, create customer/site/job | **Next.js** (AlignUI’s native starter) + PWA so it can sit on the home screen |
| **API** | Save jobs, list “today for this person,” change status | Same Next.js app (server routes). One deploy, not a separate backend yet |
| **Database** | Customers, sites, people, vehicles, jobs | **Postgres** (hosted, e.g. Neon or similar) |
| **Files** | Job photos | Not in the first build. Add object storage when CEP-5 photos ship |

Office on a desktop and crew on a truck phone are the **same app**. After login they pick **Office** or **Crew** (and crew picks **who they are**). That choice lives in the browser session, not a second password.

---

## 3. What has to exist for the first build to function

Without these, it is still a mockup:

1. **A hosted URL** the shop can open (and Add to Home Screen).  
2. **One shop login** (email/username + password stored hashed in the database).  
3. **Tables** for people, vehicles, customers, sites, jobs (type, date, status, assigned people, assigned trucks).  
4. **Office screens** that create those records and show the board.  
5. **Crew screens** that filter jobs to the selected person and PATCH status (`scheduled` → `en_route` → `on_site` → `complete`).  
6. **A service worker / PWA** so a weak signal is annoying, not a dead app: at minimum they can reopen later and tap status at the shop.

CEP-5 PDF and photos are **not** required for the board to function.

---

## 4. Request flow (one example)

Crew marks a job on site:

1. Phone already has the app (or the site in the browser).  
2. Session says: shop X, mode Crew, person “Marcus.”  
3. App asks the API: jobs for today assigned to Marcus.  
4. Marcus taps **On site**.  
5. API writes `status = on_site` on that job.  
6. Next time office refreshes the board, they see it.

No GPS. No second server. The database is the source of truth.

---

## 5. Second increment (CEP-5)

Add:

- Extra columns / a `cep5_drafts` row on Alabama OSS jobs  
- Photo uploads → file storage  
- A **print/PDF** of the filled draft (server generates PDF from the form map + job data)

Still no LHD filing and no digital signature.

---

## 6. What we are not standing up yet

- Native iOS/Android apps (PWA is the truck client)  
- Microservices  
- Per-person passwords  
- Real-time websockets (refresh / short poll is enough for one shop)  
- A custom design system besides AlignUI  

---

## 7. You vs the computer

| You need to provide | The app provides |
|---|---|
| AlignUI color (when asked) and Pro vs Base if you know | Components, tokens, Figma alignment |
| A domain later (optional at first: `*.vercel.app` is fine) | Hosting of the web app |
| Shop password to log in | Session + data in Postgres |
| People, trucks, customers, jobs (typed in) | Board and crew list |

No AlignUI zip from the marketing site is required if we use the starter + CLI.
