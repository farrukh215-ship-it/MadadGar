# Madadgar — Premium UI Design Specification

**Design Philosophy:** Trust-first, calm, emergency-ready. Premium without flashy.  
**Reference aesthetics:** Google Maps + Uber + modern fintech (Wise, Revolut).  
**Anti-style:** OLX clutter, cheap marketplace look, aggressive colors.

---

## 1. Design Goals & UX Rationale

### 1.1 Trust-First
- **Why:** Users share personal contacts and rely on strangers. Trust is the product.
- **How:** Calm palette (teal/green), generous whitespace, clear hierarchy, no visual noise. Trust badges and "Recommended by X" prominent. Avoid salesy language.

### 1.2 Emergency-Friendly
- **Why:** Plumbing leak, car breakdown, power cut—users need contact in seconds.
- **How:** Max 2 taps to Call/Chat from any feed card. Large CTAs (min 48px), sticky bottom bar on profile. No interstitial modals before contact.

### 1.3 Premium Feel
- **Why:** Differentiate from low-trust classifieds; attract quality recommenders.
- **How:** Soft shadows, 12–16px radius, refined typography, subtle motion. White/off-white backgrounds. Icon consistency (stroke 1.5–2px).

### 1.4 Scannable & Readable
- **Why:** Users scan quickly; trust signals must be obvious.
- **How:** High contrast (AA minimum), clear labels, rating + distance + availability above the fold. Card structure: icon → metadata → CTA.

---

## 2. Brand & Visual Language

### 2.1 Color Tokens

```css
/* Primary - Deep Teal (trust, reliability, calm) */
--brand-primary-50:  #ecfdfa;
--brand-primary-100: #d1faf5;
--brand-primary-200: #99f6e4;
--brand-primary-300: #5eead4;
--brand-primary-400: #2dd4bf;
--brand-primary-500: #14b8a6;   /* Main brand */
--brand-primary-600: #0d9488;
--brand-primary-700: #0f766e;
--brand-primary-800: #115e59;
--brand-primary-900: #134e4a;

/* Accent - Warm Amber (emergency, availability, attention) */
--brand-accent-50:  #fffbeb;
--brand-accent-100: #fef3c7;
--brand-accent-200: #fde68a;
--brand-accent-300: #fcd34d;
--brand-accent-400: #fbbf24;
--brand-accent-500: #f59e0b;    /* Main accent */
--brand-accent-600: #d97706;

/* Surfaces - Off-white, light grey (not pure white everywhere) */
--surface-base:    #fafaf9;     /* Page background */
--surface-raised:  #ffffff;     /* Cards */
--surface-overlay: #ffffff;     /* Modals */
--surface-sunken:  #f5f5f4;     /* Inputs, subtle areas */

/* Text - High contrast */
--text-primary:   #1c1917;      /* Headings, body */
--text-secondary: #57534e;      /* Muted, labels */
--text-tertiary:  #a8a29e;      /* Placeholders, hints */
--text-inverse:   #ffffff;      /* On brand/accent */

/* Semantic */
--semantic-success:  #22c55e;   /* Available, done */
--semantic-warning:  #f59e0b;   /* Pending, caution */
--semantic-danger:   #dc2626;   /* Block, report */
--semantic-info:     #0ea5e9;

/* Borders */
--border-subtle:  #e7e5e4;
--border-default: #d6d3d1;
--border-strong:  #a8a29e;
```

### 2.2 Typography Scale

```css
/* Font stack - modern, readable */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Inter', system-ui, sans-serif;
/* Urdu: 'Noto Nastaliq Urdu', 'Noto Sans Arabic' */

/* Scale (mobile base 16px, line-height 1.5) */
--text-2xs:  0.6875rem;  /* 11px - captions */
--text-xs:   0.75rem;    /* 12px - labels */
--text-sm:   0.875rem;   /* 14px - secondary */
--text-base: 1rem;       /* 16px - body */
--text-lg:   1.125rem;   /* 18px - emphasized */
--text-xl:   1.25rem;    /* 20px - card title */
--text-2xl:  1.5rem;    /* 24px - section head */
--text-3xl:  1.875rem;  /* 30px - hero */
--text-4xl:  2.25rem;   /* 36px - splash */

/* Weights */
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;

/* Line heights */
--leading-tight:  1.25;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 2.3 Spacing System

```css
--space-0:  0;
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
```

### 2.4 Radius & Elevation

```css
/* Border radius */
--radius-sm:   6px;
--radius-md:   10px;
--radius-lg:   14px;
--radius-xl:   16px;
--radius-2xl:  20px;
--radius-full: 9999px;

/* Shadows - soft, layered (NOT harsh) */
--shadow-card:     0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04);
--shadow-card-hover: 0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04);
--shadow-modal:    0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 40px -10px rgba(0,0,0,0.1);
--shadow-sticky:   0 -2px 10px rgba(0,0,0,0.06);
```

---

## 3. Screen-by-Screen Layout

### 3.1 Splash & Onboarding

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  [Full-bleed off-white #fafaf9]                  │
│                                                  │
│              [Madadgar wordmark]                  │
│              (teal, font-weight 600)               │
│                                                  │
│     [Minimal illustration: handshake or         │
│      neighborhood silhouette - line art,        │
│      single color teal 20% opacity]              │
│                                                  │
│     Trusted logon ki madad, bilkul qareeb        │
│     (Teal, text-xl, font-medium)                 │
│     ٹرسٹڈ لوگوں کی مدد، بالکل قریب               │
│                                                  │
│     [  Get Started  ]  ← Primary, 48px height    │
│     [ Already have account? Login ] ← Ghost      │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Specs:**
- Padding: `--space-8` sides, `--space-12` top/bottom
- Illustration: Max 120px height, SVG, teal at 15–20% opacity
- Tagline: `--text-xl`, `--font-medium`, `--text-primary`
- CTA: 48px min height, `--radius-lg`, `--brand-primary-500`

---

### 3.2 OTP Login

**Phone Entry:**
```
┌─────────────────────────────────────────────────┐
│  ← Back                                          │
│                                                  │
│     Enter your phone number                      │
│     (text-2xl, font-semibold)                    │
│                                                  │
│     ┌─────────────────────────────────────────┐  │
│     │ +92  │  300 1234567                     │  │
│     └─────────────────────────────────────────┘  │
│     (Input: 48px height, radius-lg, border)     │
│                                                  │
│     We'll send a 6-digit code via SMS            │
│     (text-sm, text-secondary)                    │
│                                                  │
│     [      Send Code      ]  ← Full width, 48px  │
│                                                  │
│     By continuing, you agree to our Terms.       │
│     Platform shares user-submitted info.         │
│     (text-xs, text-tertiary)                     │
└─────────────────────────────────────────────────┘
```

**OTP Verify:**
```
│     Enter the code sent to +92 300 ***4567       │
│                                                  │
│     ┌───┬───┬───┬───┬───┬───┐  ← 6 digit boxes  │
│     │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │    48px each      │
│     └───┴───┴───┴───┴───┴───┘                   │
│                                                  │
│     [      Verify      ]                         │
│     Resend code in 45s (or [Resend] when ready)  │
```

**Trust message:** Subtle, non-intrusive. "Your number is never shared publicly." (text-xs, below CTA)

---

### 3.3 Home Screen

**Structure:**
```
┌─────────────────────────────────────────────────┐
│  [Logo] Madadgar    [Location ▼]  [Profile]      │
│  Location: DHA Phase 5, Lahore                  │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐│
│  │ 🔍 Search categories or area...             ││
│  └─────────────────────────────────────────────┘│
│  (48px, radius-lg, surface-sunken)              │
├─────────────────────────────────────────────────┤
│  Categories (text-sm, font-medium, text-secondary)│
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐             │
│  │ 🔧 │ │ ⚡ │ │ 🔩 │ │ ❄️ │ │ 👨‍🍳 │  ...scroll  │
│  │Mech│ │Elec│ │Plum│ │ AC │ │Cook│             │
│  └────┘ └────┘ └────┘ └────┘ └────┘             │
│  (CategoryIconCard: 72x72, radius-lg)           │
├─────────────────────────────────────────────────┤
│  [ Nearby ] [ Top Rated ] [ All ]               │
│  (Tab pills, 40px height, selected: primary bg) │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐│
│  │ FEED CARD (see §4)                           ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ FEED CARD                                   ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Location selector:** Tappable pill; opens bottom sheet or modal. Shows "DHA Phase 5, Lahore" or "Use current location".

---

### 3.4 Feed Card (CRITICAL)

**Layout (implementation-ready):**
```
┌───────────────────────────────────────────────────────────┐
│  ┌────┐  Plumber                    ● Available  2.1 km   │
│  │ 🔩 │  (category + skill)         (green dot)  (grey)   │
│  └────┘                                                     │
│  ⭐ 4.5  •  Recommended by 12  •  [TrustBadge]             │
│  Recommended by Ahmed                                       │
│  "Fixed my tap in 30 mins, fair price"                      │
│  (reason, 2 lines max, text-secondary)                       │
│                                                             │
│  Madad ki ❤️ 12  [ ❤️ ]                                    │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │      📞 Call        │  │      💬 Chat        │         │
│  └─────────────────────┘  └─────────────────────┘         │
│  (48px height each, primary + outline, 50/50 split)         │
└───────────────────────────────────────────────────────────┘
```

**Spacing:**
- Card padding: `--space-4` (16px)
- Gap between sections: `--space-3` (12px)
- Button gap: `--space-2` (8px)
- Card margin bottom: `--space-3`

**States:**
| State | Treatment |
|-------|-----------|
| Default | Full content, `--shadow-card` |
| Emergency | Accent border-left 4px (optional focus) |
| Unavailable | Opacity 0.7, "Unavailable" chip, disabled Call |
| Reported (own view) | Greyed, "Under review" badge |
| Hover (web) | `--shadow-card-hover`, cursor pointer |

**2-tap rule:** From Home → Tap card (1) → Tap Call (2). No modal between. Card tap navigates to detail; detail has sticky Call/Chat.

---

### 3.5 Post Creation

**Step 0: Choose Type**
```
┌─────────────────────────────────────────────────┐
│  Share a contact                                 │
│  رابطہ شیئر کریں                                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐│
│  │  👤  Recommend someone                       ││
│  │  کسی قابل اعتماد شخص کی سفارش                ││
│  │  Share a trusted mechanic, plumber, etc.     ││
│  └─────────────────────────────────────────────┘│
│  (Card: padding-6, radius-lg, border, tap → form)│
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │  🔧  I am a skilled worker                  ││
│  │  میں ایک ماہر ورکر ہوں                       ││
│  │  Add your skill and get discovered          ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Step 1: Form**
- Single column, one question per section
- Section spacing: `--space-6`
- Input height: 48px
- Labels: `--text-sm`, `--font-medium`, `--text-secondary`
- Progress: Optional step indicator (1/4, 2/4) for multi-step
- CTA: Full width, 48px, sticky at bottom on mobile

---

### 3.6 Worker Profile

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  ← Back                                    ⋮    │
├─────────────────────────────────────────────────┤
│  [Hero: gradient or solid surface-raised]       │
│  [Avatar/Gallery - 120px height, radius-lg]      │
│  Plumber • DHA Phase 5                          │
│  ⭐ 4.5  •  Recommended by 3  •  [Top Trusted]  │
│  [AvailabilityToggle]  ● Available               │
├─────────────────────────────────────────────────┤
│  "10 years experience, fair pricing"            │
│  Rate: 500/hr (optional)                        │
│  mera plumber                                   │
├─────────────────────────────────────────────────┤
│  Work gallery (2–3 columns, 80px thumbs)        │
├─────────────────────────────────────────────────┤
│  Reviews (collapse/expand)                      │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐│
│  │  📞 Call          │  💬 Chat                ││
│  └─────────────────────────────────────────────┘│
│  STICKY BOTTOM, 56px height, shadow-sticky      │
└─────────────────────────────────────────────────┘
```

**2-tap:** From feed → Card tap (1) → Call/Chat on profile (2). Sticky CTA always visible.

---

### 3.7 User Profile

**My Profile:**
- Avatar, name, area
- Trust score (large number + label)
- Recommendations count
- "Shared contacts" grid (cards)
- Edit, Settings, Logout

**Public Profile:**
- Same minus Edit; show trust + count

---

### 3.8 Chat

**Thread list:** WhatsApp-style—avatar, name, last message, time. Unread dot.

**Chat screen:**
- Header: Name, skill, back
- Messages: Bubbles (me: primary bg, other: surface-sunken)
- Input: 48px, attach + location icons
- **Job Done:** Pill below input or in message area. Accent background, white text. "Job Done ✓"

---

### 3.9 Review Flow

**Modal:**
- "How was the service?" — Stars (large, 1–5)
- "Add a comment (optional)" — Single line or textarea
- [ Submit ] — Primary, 48px

---

### 3.10 Web Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo] Madadgar    [Search]  [Location]              [Profile] [Logout]  │
├────────────┬─────────────────────────────────┬──────────────────────────┤
│ Categories │  Feed                           │  Filters                 │
│ (240px)    │  (max 560px, centered)          │  (200px)                 │
│            │                                 │                          │
│ [Mechanic] │  [Nearby][Top Rated][All]       │  Radius: 5 km            │
│ [Electric] │  ┌─────────────────────────┐   │  Sort: Distance          │
│ [Plumber]  │  │ FeedCard                │   │  Availability: Any       │
│ ...        │  └─────────────────────────┘   │                          │
│            │  ┌─────────────────────────┐   │                          │
│            │  │ FeedCard                │   │                          │
│            │  └─────────────────────────┘   │                          │
└────────────┴─────────────────────────────────┴──────────────────────────┘
```

**Max-width:** 1280px container; feed column 560px; cards full width of column.

---

## 4. Component Specs

### 4.1 FeedCard

| Prop | Type | Description |
|------|------|-------------|
| categoryName | string | e.g. "Plumber" |
| categoryIcon | string | Icon key |
| postType | 'recommendation' \| 'self' |
| workerName | string? | |
| reason | string? | Truncate 2 lines |
| recommenderName | string? | "Recommended by Ahmed" |
| recCount | number | "Recommended by 12" |
| avgRating | number? | |
| distanceM | number? | |
| availability | boolean | Green dot / grey |
| madadCount | number | |
| userMadadGiven | boolean | |
| trustBadges | string[] | |
| state | 'default' \| 'unavailable' \| 'reported' |
| onCall | fn | |
| onChat | fn | |
| onMadad | fn | |
| onPress | fn | Navigate to detail |

**Dimensions:**
- Padding: 16px
- Border radius: 14px
- Shadow: `--shadow-card`
- Min touch target for buttons: 48px

---

### 4.2 CategoryIconCard

- Size: 72×72 (mobile), 80×80 (tablet)
- Icon: 32px, outline style
- Label: text-xs, below icon
- Selected: Primary border 2px, primary bg 10%
- Unselected: Border subtle, transparent bg

---

### 4.3 TrustBadge

**Variants:**
- `recommended-10`: "Recommended by 10+" — Primary bg, white text
- `top-trusted`: "Top Trusted Nearby" — Accent bg, dark text
- `new`: "New" — Surface-sunken, text-secondary

- Padding: 4px 8px
- Radius: 6px
- Font: text-xs, font-medium

---

### 4.4 AvailabilityChip

- **Available:** Green dot (8px) + "Available" — semantic-success
- **Unavailable:** Grey dot + "Unavailable" — text-tertiary
- Optional: Very subtle pulse on green dot (1.5s loop, opacity 0.8→1)

---

### 4.5 DistanceTag

- Format: "450 m" or "2.1 km"
- Icon: Location pin (optional)
- Style: text-sm, text-secondary

---

### 4.6 Buttons

| Variant | BG | Text | Border | Use |
|---------|-----|------|--------|-----|
| Primary | brand-primary-500 | white | none | Call, Chat, Submit |
| Secondary | surface-sunken | text-primary | none | Cancel |
| Outline | transparent | brand-primary-600 | 2px primary | Low emphasis |
| Danger | semantic-danger | white | none | Block, Report |
| Ghost | transparent | text-secondary | none | Resend, Skip |

**Min height:** 48px (mobile), 44px (desktop)  
**Padding:** 12px 20px  
**Radius:** 14px

---

### 4.7 LikeButton ("Madad ki ❤️")

- **Default:** Outline heart, "Madad ki ❤️ 12"
- **Liked:** Filled heart (primary or accent), count updates
- **Animation:** Scale 1 → 1.2 → 1 on tap (200ms)
- **Disabled:** Greyed, no interaction

---

## 5. Micro-Interactions

| Interaction | Behavior |
|-------------|----------|
| Card hover (web) | Elevation +2px, shadow-card-hover |
| Button tap (mobile) | Scale 0.98, 100ms |
| Like tap | Heart fill + scale bounce |
| Availability pulse | Green dot opacity 0.8→1, 1.5s ease-in-out |
| Modal open | Fade overlay + slide up 20px, 250ms |
| Tab switch | Underline/background transition, 200ms |

---

## 6. Responsive Rules

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | &lt; 640px | Single column, bottom nav |
| Tablet | 640–1024px | Same, larger cards |
| Desktop | &gt; 1024px | 3-column, top nav |

**Mobile-first:** Base styles for 375px; scale up.  
**Max-width:** Content 1280px; feed column 560px.  
**Touch targets:** Min 44×44 (48 preferred for primary CTAs).

---

## 7. Icon System

- **Style:** Outline, 1.5–2px stroke
- **Size:** 20px (inline), 24px (buttons), 32px (categories)
- **Set:** Lucide, Heroicons, or custom SVG
- **Consistency:** Same stroke weight across all icons

---

## 8. Implementation Guidance

### Next.js (Web)
- Use CSS variables for tokens (define in `:root` or Tailwind config)
- Tailwind: Extend theme with custom colors, spacing, shadow
- shadcn/ui: Customize primitives to match; override radius, shadows
- FeedCard: `rounded-[14px]`, `shadow-card` class

### React Native (Expo)
- Define tokens in `theme.ts`; use `useColorScheme` if dark mode later
- Pressable with `activeOpacity={0.98}` for tap feedback
- Shadow: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` (iOS); `elevation` (Android)
- Like animation: `react-native-reanimated` or `Animated` API

### Shared
- Export design tokens as JSON/TS for both platforms
- Component props align with specs above
- Test 2-tap flow: Home → Card → Call (no extra steps)

---

## 9. QA Checklist (Design)

- [ ] All CTAs min 44px height
- [ ] Call/Chat reachable in 2 taps from home
- [ ] Contrast ratio ≥ 4.5:1 for body text
- [ ] No flashy animations; subtle only
- [ ] Card shadows soft, not harsh
- [ ] Spacing consistent (4px grid)
- [ ] Trust badges visible on cards
- [ ] Emergency state (if any) uses accent, not red

---

*End of Premium UI Design Specification*
