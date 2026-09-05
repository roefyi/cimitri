# Cimitri design system

**Status:** Current — matches AlignUI in `web/` and Clockwork in `docs/brand/palette.json`  
**Last updated:** 2026-09-05

Product UI is **[AlignUI](https://www.alignui.com/)** (React, Tailwind, copied into `web/components/ui`). Brand color is the **Clockwork** swatch. Do not add a second component library.

| Source | Path |
|---|---|
| Brand swatch (source of truth for hex) | `docs/brand/palette.json`, `docs/brand/palette.png` |
| CSS tokens | `web/app/globals.css` |
| Type, radius, shadow, color map | `web/tailwind.config.ts` |
| Components | `web/components/ui/*` |
| Fonts | Inter (`--font-sans`), Geist Mono (`--font-geist-mono`) in `web/app/layout.tsx` |

Run: `cd web && npm install && npm run dev` → **http://127.0.0.1:3456**

---

## 1. Principles

1. **One library.** AlignUI primitives only. Compose screens from `web/components/ui`, not ad-hoc HTML controls.
2. **Orange is action, not copy.** Body text stays near-black (`text-text-strong-950`). Never set paragraphs to `#E56515`.
3. **Semantic tokens, not raw hex in screens.** Prefer `bg-primary-base`, `text-text-sub-600`, `border-stroke-sub-300` over `#E56515` in product UI. Hex lives in palette JSON and CSS variables.
4. **Office desktop + crew phone, same tokens.** Density and layout change; color, type scale, and components do not.
5. **Dark mode is supported** (`next-themes` + `.dark` in `globals.css`). Semantic `bg-*`, `text-*`, `stroke-*` invert; primary orange stays the brand.

---

## 2. Clockwork palette

AlignUI CLI primary preset: **orange**, with Cimitri overrides (`alignUi.overridePrimary` in `palette.json`).

| Token | Hex | Use |
|---|---|---|
| Primary | `#E56515` | Primary buttons, selected states, key accent |
| Primary soft | `#FBA45C` | Chips, hover/secondary highlight |
| Background | `#F8F8F8` | Page and large surfaces (`bg-bg-weak-50`) |
| Border | `#CDCDCB` | Borders, dividers, inactive chrome (`stroke-sub-300`) |
| Muted | `#919599` | Secondary text and muted icons (`neutral-500` / faded) |
| Text (required, not in swatch) | `#171717` | Primary copy (`text-text-strong-950` / `--gray-950`) |

### Orange scale (wired as AlignUI primary)

| Step | Hex | Role |
|---|---|---|
| 950 | `#5C2808` | Warning-dark (light mode) |
| 900 | `#7A3610` | Deep hover |
| 800 | `#9A4512` | `--primary-dark` |
| 700 | `#C05513` | `--primary-darker` (button hover) |
| 600 | `#D45C14` | Dark-mode warning base |
| **500** | **`#E56515`** | **`--primary-base` / `--orange-500`** |
| **400** | **`#FBA45C`** | **Primary soft** |
| 300 | `#FCBD85` | Soft fill |
| 200 | `#FDD4B0` | Warning-light |
| 100 | `#FEE9D6` | Tint |
| 50 | `#FFF4EB` | Warning-lighter / selected wash |

Alpha: `--orange-alpha-24/16/10` on `#E56515` for focus rings (`shadow-button-primary-focus`).

---

## 3. Semantic color (use these in UI)

Light mode mapping (see `.dark` in `globals.css` for inverted surfaces).

### Surfaces

| Tailwind | Light hex (approx) | Use |
|---|---|---|
| `bg-bg-white-0` | `#FFFFFF` | Cards, inputs, raised panels |
| `bg-bg-weak-50` | `#F8F8F8` | Page background |
| `bg-bg-soft-200` | `#EBEBEB` | Subtle fills, disabled wash |
| `bg-bg-sub-300` | `#CDCDCB` | Stronger chrome |
| `bg-bg-surface-800` | `#292929` | Inverse surfaces |
| `bg-bg-strong-950` | `#171717` | Inverse / high contrast |

### Text

| Tailwind | Use |
|---|---|
| `text-text-strong-950` | Titles, labels, primary copy |
| `text-text-sub-600` | Secondary copy, descriptions |
| `text-text-soft-400` | Placeholders, tertiary |
| `text-text-disabled-300` | Disabled |
| `text-static-white` | Text on filled primary buttons |

### Stroke

| Tailwind | Use |
|---|---|
| `stroke-stroke-soft-200` | Subtle hairlines (`#EBEBEB`) |
| `stroke-stroke-sub-300` | Default borders (`#CDCDCB`) |
| `stroke-stroke-strong-950` | High-contrast edges |
| `ring-primary-base` | Focus / selected ring when needed |

### Status (product + AlignUI)

Clockwork orange doubles as **warning**. Do not invent extra status hues.

| Meaning | Tokens | Cimitri job mapping |
|---|---|---|
| Success | `success-*` (green `#1FC16B`) | Job **complete** |
| Warning | `warning-*` (orange, same as primary) | **Not started** / pending |
| Error | `error-*` (red `#FB3748`) | **Flagged** (and destructive actions) |
| Faded | `faded-*` | **Canceled**, disabled chrome |
| Information | `information-*` (blue) | Informational alerts only — not a job status |

Use `StatusBadge` (`completed` / `pending` / `failed` / `disabled`) rather than custom pills.

---

## 4. Typography

**Sans:** Inter. **Mono:** Geist Mono (IDs, license numbers, CEP-5 field codes).

Tailwind classes from `web/tailwind.config.ts` (`texts`). Weight 500 = titles/labels; 400 = paragraphs.

| Class | Size / line | Tracking | Weight | Use |
|---|---|---|---|---|
| `text-title-h1` | 56 / 64 | -0.01em | 500 | Marketing only |
| `text-title-h2` | 48 / 56 | -0.01em | 500 | Marketing only |
| `text-title-h3` | 40 / 48 | -0.01em | 500 | Rare |
| `text-title-h4` | 32 / 40 | -0.005em | 500 | Page titles (landing uses this) |
| `text-title-h5` | 24 / 32 | 0 | 500 | Section titles |
| `text-title-h6` | 20 / 28 | 0 | 500 | Card titles |
| `text-label-xl` … `text-label-xs` | 24 → 12 | tight | 500 | Buttons, nav, form labels |
| `text-paragraph-xl` … `text-paragraph-xs` | 24 → 12 | tight | 400 | Body, hints |
| `text-subheading-md` … `text-subheading-2xs` | 16 → 11 | +0.02–0.06em | 500 | Overlines, table headers |

**Product defaults**

- Page title: `text-title-h5` or `text-title-h6` (crew phone: h6).
- Body: `text-paragraph-sm` or `text-paragraph-md`.
- Buttons: AlignUI already applies `text-label-sm`.
- Hints / helper: `text-paragraph-xs text-text-sub-600`.

Do not use arbitrary `text-sm` / `font-bold` when an AlignUI type class exists.

---

## 5. Radius, space, elevation

| Token | Value | Use |
|---|---|---|
| `rounded-10` | 10px | Medium buttons, many controls |
| `rounded-20` | 20px | Large cards / sheets |
| `rounded-lg` / `rounded-md` | Tailwind defaults | Smaller controls, badges |

Shadows (prefer named AlignUI shadows): `shadow-regular-xs/sm/md`, `shadow-custom-xs`–`lg`, `shadow-tooltip`, `shadow-button-primary-focus`.

Layout: header is `h-14`, content `px-5`, office max width around `max-w-5xl` (see `header.tsx`). Crew screens should stay thumb-friendly (min tap ~40px — AlignUI `Button` medium is `h-10`).

---

## 6. Components (AlignUI in repo)

Import as namespaces, e.g. `import * as Button from '@/components/ui/button'`.

**Use first (v1 product)**

| File | Role |
|---|---|
| `button.tsx` | Primary filled / stroke / ghost; sizes medium → xxsmall |
| `compact-button.tsx` | Icon chrome |
| `input.tsx`, `textarea.tsx`, `select.tsx`, `datepicker.tsx` | Forms |
| `checkbox.tsx`, `radio.tsx`, `switch.tsx` | Binary / choice |
| `label.tsx`, `hint.tsx` | Field labeling |
| `badge.tsx`, `status-badge.tsx`, `tag.tsx` | Status and chips |
| `alert.tsx`, `notification.tsx` | Feedback |
| `modal.tsx`, `drawer.tsx` | Office dialogs / crew sheets |
| `dropdown.tsx`, `popover.tsx`, `tooltip.tsx` | Overlays |
| `table.tsx` | Office lists |
| `tab-menu-horizontal.tsx`, `segmented-control.tsx` | Today / week, Office / Crew |
| `avatar.tsx`, `avatar-group.tsx` | People |
| `file-upload.tsx` | Job photos |
| `breadcrumb.tsx` | Office hierarchy (customer → site → job) |
| `divider.tsx` | Section breaks |
| `accordion.tsx` | Dense CEP-5 / job detail |

**Available but not default for v1 chrome:** `fancy-button`, `social-button`, `color-picker`, `command-menu`, `digit-input`, `kbd`, `pagination`, steppers, `slider`, `progress-*`, `svg-rating-icons`. Use only if a screen genuinely needs them.

### Button rules

```tsx
<Button.Root variant="primary">Save</Button.Root>
<Button.Root variant="primary" mode="stroke">Cancel</Button.Root>
<Button.Root variant="error">Delete</Button.Root>
```

- Default CTA: `variant="primary"` (filled) → `#E56515`.
- Secondary: `mode="stroke"`.
- Destructive: `variant="error"`, never orange.
- Crew complete: primary filled. Crew flag: error or stroke + confirm.

Icons: **Remix Icon** (`@remixicon/react`). Path scale is already in `globals.css`.

---

## 7. Product patterns

| Pattern | Spec |
|---|---|
| App shell | `bg-bg-weak-50`, header `border-stroke-soft-200`, logo `text-label-md text-text-strong-950` |
| Selected day / tab | Primary base or `bg-orange-50` + `text-primary-base` |
| Job complete | `StatusBadge` `status="completed"` |
| Job flagged | `StatusBadge` `status="failed"` plus the flag note |
| Job canceled | `StatusBadge` `status="disabled"` |
| CEP-5 badge | `Badge` `color="orange"` `variant="lighter"` — only when `cep5` is true |
| Primary on photos / PDF | Keep orange for “Print CEP-5” / “Save draft”; not for body of the form preview |

---

## 8. Do / don’t

**Do**

- Compose from AlignUI; extend with `tv()` the same way existing components do.
- Keep contrast: orange on white for buttons; dark text on `#F8F8F8`.
- Test light and dark (`ThemeSwitch` in header).

**Don’t**

- Don’t introduce shadcn, MUI, or a second orange.
- Don’t use primary orange for long text, logos-as-fill, or error.
- Don’t hard-code Clockwork hex in new screens; add a token if something is missing.
- Don’t restyle AlignUI radius/type per screen.

---

## 9. Changing the brand

1. Update hex in `docs/brand/palette.json` (and the PNG if the swatch changes).
2. Update `--orange-*` and `--gray-*` alignments in `web/app/globals.css` (primary 500 = brand; gray 50/300/500 = background/border/muted).
3. Confirm `--primary-base` still aliases `--orange-500`.
4. Visual check: landing primary button, focus ring, warning badges, dark mode hover (`primary-darker`).
