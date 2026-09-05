# Cimitri design system

**Status:** Current — shadcn/ui in `web/` and Clockwork in `docs/brand/palette.json`  
**Last updated:** 2026-09-05

Product UI is **[shadcn/ui](https://ui.shadcn.com/)** (React, Tailwind v4, source copied into `web/components/ui`). Brand color is the **Clockwork** swatch. Do not add a second component library. AlignUI is retired.

| Source | Path |
|---|---|
| Brand swatch (source of truth for hex) | `docs/brand/palette.json`, `docs/brand/palette.png` |
| shadcn config | `web/components.json` |
| CSS tokens | `web/app/globals.css` |
| Components | `web/components/ui/*` |
| Fonts | Inter (`--font-sans`), Geist Mono (`--font-geist-mono`) in `web/app/layout.tsx` |

Run: `cd web && npm install && npm run dev` → **http://127.0.0.1:3456**

---

## 1. Principles

1. **One library.** shadcn primitives only. Compose screens from `web/components/ui`, not ad-hoc HTML controls when a primitive exists.
2. **Orange is action, not copy.** Body text stays near-black (`text-foreground`). Never set paragraphs to `#E56515`.
3. **Semantic tokens, not raw hex in screens.** Prefer `bg-primary`, `text-muted-foreground`, `border-border` over `#E56515` in product UI. Hex lives in palette JSON and CSS variables.
4. **Office desktop + crew phone, same tokens.** Density and layout change; color and components do not.
5. **Dark mode is supported** (`next-themes` + `.dark` in `globals.css`). Surfaces invert; primary orange stays the brand.

---

## 2. Clockwork palette

shadcn base color: **neutral**. Primary override: **`#E56515`** (`shadcn.primary` in `palette.json`).

| Token | Hex | Use |
|---|---|---|
| Primary | `#E56515` | Primary buttons, selected states, key accent |
| Primary soft | `#FBA45C` | Chips, hover/secondary highlight, dark-mode ring |
| Background | `#F8F8F8` | Page and large surfaces (`bg-background`) |
| Border | `#CDCDCB` | Borders, dividers, inactive chrome (`border-border`) |
| Muted | `#919599` | Secondary text and muted icons (`text-muted-foreground`) |
| Text (required, not in swatch) | `#171717` | Primary copy (`text-foreground`) |

---

## 3. Semantic color (use these in UI)

Light mode mapping (see `.dark` in `globals.css` for inverted surfaces).

### Surfaces and chrome

| Tailwind | Light hex (approx) | Use |
|---|---|---|
| `bg-background` | `#F8F8F8` | Page background |
| `bg-card` / `bg-sidebar` | `#FFFFFF` | Cards, raised panels, office/crew chrome |
| `bg-muted` | `#F5F5F5` | Subtle fills |
| `bg-accent` | `#FFF4EB` | Selected nav wash |
| `bg-primary` | `#E56515` | Primary actions |
| `text-primary-foreground` | `#FFFFFF` | Text on filled primary buttons |
| `text-foreground` | `#171717` | Titles, labels, primary copy |
| `text-muted-foreground` | `#919599` | Secondary copy, descriptions, placeholders |
| `border-border` / `border-input` | `#CDCDCB` | Default borders |
| `ring-ring` | `#E56515` | Focus ring |

A few legacy class aliases (`bg-bg-weak-50`, `text-text-strong-950`, `text-title-h5`, …) still exist in `globals.css` for older screens. New work should use the shadcn tokens above.

### Status

Clockwork orange doubles as **warning**. Do not invent extra status hues.

| Meaning | Tokens | Cimitri job mapping |
|---|---|---|
| Success | green as needed | Job **complete** |
| Warning / pending | orange primary | **Not started** |
| Error | `destructive` (`#FB3748`) | **Flagged** and destructive actions |
| Faded | `outline` / muted | **Canceled**, disabled chrome |

Use shadcn `Badge` (`default` / `secondary` / `outline` / `destructive`) rather than custom pills.

---

## 4. Typography

**Sans:** Inter. **Mono:** Geist Mono (IDs, license numbers, CEP-5 field codes).

**Product defaults**

- Page title: `text-2xl font-medium` (or existing `text-title-h5` on screens not yet migrated).
- Body: `text-sm` / `text-muted-foreground`.
- Buttons: shadcn `Button` type styles.
- Hints / helper: `text-xs text-muted-foreground`.

---

## 5. Radius, space, elevation

`--radius` is **0.625rem** (10px). shadcn maps `rounded-lg` to that token.

| Token | Use |
|---|---|
| `rounded-lg` | Buttons, inputs, most controls |
| `rounded-xl` | Cards |
| `h-14` | App header |
| `px-5` / `lg:px-8` | Content gutters |
| `max-w-7xl` | Office and crew main columns |

Crew screens should stay thumb-friendly. Prefer `Button` default or `lg` over tiny icon-only targets for primary actions.

---

## 6. Components (shadcn in repo)

Named exports, e.g. `import { Button } from '@/components/ui/button'`.

Add new primitives with the CLI from `web/`:

```bash
npx shadcn@latest add <component> -y
```

**Use first (v1 product)**

| File | Role |
|---|---|
| `button.tsx` | Primary (`default`), secondary (`outline`), destructive |
| `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx` | Forms |
| `label.tsx` | Field labeling |
| `badge.tsx` | Status and CEP-5 chips |
| `alert.tsx`, `sonner.tsx` | Feedback |
| `dialog.tsx` | Confirmations and crew flag note |
| `table.tsx` | Office and crew lists |
| `card.tsx` | Page sections and stats |
| `calendar.tsx` | Schedule date picker |
| `breadcrumb.tsx` | Office hierarchy |
| `toggle-group.tsx` | Theme switch |
| `tooltip.tsx` | Overlays |
| `separator.tsx` | Section breaks |

### Button rules

```tsx
<Button>Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
```

- Default CTA: `variant="default"` → `#E56515`.
- Secondary: `variant="outline"`.
- Destructive: `variant="destructive"`, never orange.
- Crew complete: primary filled. Crew flag: destructive + dialog confirm.

Icons: **Lucide** (`lucide-react`).

---

## 7. Product patterns

| Pattern | Spec |
|---|---|
| App shell | `bg-background`, header `border-b bg-card`, logo `text-label-md` / `font-medium` |
| Selected nav | `bg-accent text-primary` |
| Selected day | Calendar selected uses `bg-primary` |
| Job complete | `Badge variant="secondary"` |
| Job flagged | `Badge variant="destructive"` plus the flag note |
| Job canceled | `Badge variant="outline"` |
| CEP-5 badge | `Badge` default (primary orange) — only when the job type needs CEP-5 |
| Primary on photos / PDF | Keep orange for “Print CEP-5” / “Save”; not for body of the form preview |

---

## 8. Do / don’t

**Do**

- Compose from shadcn; add missing primitives with the CLI.
- Keep contrast: orange on white for buttons; dark text on `#F8F8F8`.
- Test light and dark (`ThemeSwitch` in the shell).

**Don’t**

- Don’t reintroduce AlignUI, MUI, or a second orange.
- Don’t use primary orange for long text, logos-as-fill, or error.
- Don’t hard-code Clockwork hex in new screens; add a token if something is missing.
- Don’t restyle radius/type per screen.

---

## 9. Changing the brand

1. Update hex in `docs/brand/palette.json` (and the PNG if the swatch changes).
2. Update `--primary`, `--ring`, `--accent`, `--background`, `--border`, and `--muted-foreground` in `web/app/globals.css`.
3. Visual check: landing/sign-in primary button, focus ring, CEP-5 badge, dark mode.
