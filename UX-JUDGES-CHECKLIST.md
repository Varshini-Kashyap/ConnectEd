# What Judges Look For in UI/UX — ConnectEd Checklist

Use this as the single source of truth when building or reviewing the frontend. Every screen and flow should align with these criteria.

---

## 1. User-centered design — Solves real pain points

- [ ] **Clear value up front** — Auth and homepage explain why ConnectEd matters (alumni verification, peer tutoring, career network).
- [ ] **Minimal friction** — Only ask for what we need (e.g. role-based email validation, no redundant fields).
- [ ] **Helpful copy** — Placeholder and helper text guide users (e.g. @gmu.edu for students, password min length).
- [ ] **Error messages** — Plain language, actionable (e.g. "Students must use a @gmu.edu email"), not technical.

---

## 2. Intuitive flow — Users don’t get lost

- [ ] **Predictable navigation** — Same nav on every authenticated page (Career, Student, Profile); active state visible.
- [ ] **Logical sequence** — Login → Stream select → Career/Student; Signup → Questionnaire → Stream.
- [ ] **One primary action per screen** — One main CTA (e.g. "Sign in", "Continue to profile setup").
- [ ] **Escape hatches** — "Already have an account?" / "Don’t have an account?" on auth; Logout clear.

---

## 3. Accessibility — Works for everyone

- [ ] **Semantic HTML** — `<form>`, `<label>`, `<button>`, headings in order.
- [ ] **Labels and IDs** — Every input has a `<label htmlFor="...">` and matching `id`; no label-less inputs.
- [ ] **ARIA when needed** — `aria-required`, `aria-invalid`, `aria-describedby` for hints/errors; `role="alert"` for errors.
- [ ] **Keyboard and focus** — All actions reachable by keyboard; visible focus ring (coral) on focus.
- [ ] **Contrast** — Text meets contrast on cream/coral (already in warm theme); don’t rely on color alone for errors.
- [ ] **Alt text** — All images have meaningful `alt`; decorative images use `aria-hidden`.

---

## 4. Microinteractions — Delightful details

- [ ] **Hover states** — Buttons and links have clear hover (e.g. lift, underline, color shift); inputs get a subtle border/background change.
- [ ] **Focus feedback** — Coral focus ring on inputs and buttons; no focus trap.
- [ ] **Loading states** — Buttons show "Signing in…" / "Creating account…"; avoid layout shift.
- [ ] **Theme toggle** — Smooth icon change and overlay transition (e.g. 300ms).
- [ ] **Transitions** — Use CSS `transition` (200–300ms); avoid long or janky animations.

---

## 5. Consistent design system — Feels professional

- [ ] **Warm theme everywhere** — Coral, cream, sage, gold from `DESIGN-SPEC.md`; same in auth, nav, and app.
- [ ] **Typography** — DM Sans for headings/nav/buttons; Inter for body/forms.
- [ ] **Spacing** — Consistent padding and gaps (e.g. card `p-8`, form `space-y-5`).
- [ ] **Components** — Same input style, same primary button (gradient, hover lift), same card (cream-50, border, shadow).
- [ ] **Theme persistence** — Light/dark stored in `localStorage` and applied on load.

---

## 6. Performance — Fast, no janky animations

- [ ] **CSS over JS for motion** — Prefer `transition` / `transform`; avoid animating layout-heavy properties.
- [ ] **No layout thrash** — Don’t animate `width`/`height` where `transform` works.
- [ ] **Lazy where appropriate** — Code-split routes if the bundle grows.
- [ ] **Images** — Illustration in `public/`; use appropriate size/format for any future assets.

---

## Valentine’s touch (bonus)

- [ ] **Tasteful accent** — Subtle heart (♥) in tagline or "Connect with heart" where it fits.
- [ ] **Same design system** — Valentine gradient (coral + rose) only as an optional accent; keep accessibility and consistency.

---

**Version:** 1.0  
**Last updated:** February 2026
