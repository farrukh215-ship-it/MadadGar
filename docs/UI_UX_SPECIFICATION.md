# Madadgar — UI/UX Specification

**Version:** 1.0  
**Platforms:** Web (Next.js) + Mobile (Expo)  
**Implementation-ready**

---

## 1. Information Architecture

### 1.1 Global Navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MOBILE (Bottom Tab Bar)                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ Feed ]    [ Share ]    [ Chats ]    [ Profile ]                           │
│    🏠           ➕           💬           👤                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  WEB (Desktop)                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Logo   │  Feed  Share  Chats  │  [ Profile ▼ ]  [ Logout ]                  │
│  Madadgar                       │                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Tab Structure

| Tab | Screen | Auth Required |
|-----|--------|---------------|
| **Feed** | Home (categories + feed tabs) | No (location only) |
| **Share** | Post creation (Recommend vs Self) | Yes |
| **Chats** | Thread list | Yes |
| **Profile** | User/Worker profile | Yes |

### 1.3 IA Map

```
Madadgar
├── Splash / Onboarding (first launch)
├── Auth
│   ├── OTP Login
│   └── OTP Verify
├── Main (TabNav)
│   ├── Feed
│   │   ├── Home (categories + Nearby/Top Rated/All)
│   │   ├── Category Listing (filtered feed)
│   │   └── Post Detail (from card tap)
│   ├── Share
│   │   ├── Choose Type (Recommend / I am Worker)
│   │   ├── Recommend Form
│   │   └── Self-Post Form
│   ├── Chats
│   │   ├── Thread List
│   │   └── Chat Screen
│   └── Profile
│       ├── My Profile
│       ├── Edit Profile
│       ├── Worker Profile (public)
│       └── User Profile (public)
├── Modals / Overlays
│   ├── Review & Rating (after Job Done)
│   ├── Report Flow
│   ├── Block Confirmation
│   └── Phone Mask Toggle
└── Settings
    ├── Area / City
    └── Phone Masking
```

---

## 2. Screen-by-Screen Wireframe Descriptions

### 2.1 Splash / Onboarding

**Purpose:** Brand intro, value prop, optional location permission ask.

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         [Madadgar Logo]              │
│         (wordmark + icon)            │
│                                     │
│    "Trusted helpers, nearby"         │
│    اعتماد کے ساتھ مدد، قریب          │
│                                     │
│    ──────── ● ────  (3 dot carousel) │
│                                     │
│    [1] Share trusted contacts        │
│    [2] Find helpers in 2 taps        │
│    [3] Real reviews from neighbors   │
│                                     │
│    [ Get Started ]                   │
│    [ Already have account? Login ]   │
│                                     │
└─────────────────────────────────────┘
```

**States:**
- First launch: Full 3-step carousel
- Return user: Skip to Get Started
- Location prompt: After Get Started tap, before OTP

**Copy:**
- EN: "Trusted helpers, nearby"
- UR: اعتماد کے ساتھ مدد، قریب
- CTA: "Get Started" / شروع کریں

---

### 2.2 OTP Login

**Purpose:** Phone entry → OTP send → Verify → Session.

**Screen A: Phone Entry**
```
┌─────────────────────────────────────┐
│  ← Back                              │
│                                      │
│  Enter your phone number             │
│  اپنا فون نمبر درج کریں              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ +92 │ 300 1234567              │ │
│  └────────────────────────────────┘ │
│                                      │
│  We'll send a 6-digit code via SMS   │
│                                      │
│  [ Send Code ]                       │
│                                      │
│  By continuing, you agree to our     │
│  Terms and share user-submitted info │
└─────────────────────────────────────┘
```

**Screen B: OTP Verify**
```
┌─────────────────────────────────────┐
│  ← Back                              │
│                                      │
│  Enter the code we sent to           │
│  +92 300 ***4567                    │
│                                      │
│  ┌───┬───┬───┬───┬───┬───┐         │
│  │ 1 │ 2 │ 3 │   │   │   │  (OTP)  │
│  └───┴───┴───┴───┴───┴───┘         │
│                                      │
│  [ Verify ]                          │
│                                      │
│  Didn't receive? [ Resend ] (60s)    │
└─────────────────────────────────────┘
```

**States:**
- Empty phone: Disabled Send Code
- Sending: Loading spinner
- OTP sent: Navigate to verify
- Invalid OTP: Inline error "Invalid code"
- Success: Navigate to Feed

---

### 2.3 Home (Feed)

**Purpose:** Discover posts by category and feed type (Nearby / Top Rated / All).

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Madadgar                                    [Location ▼] [Filter]   │
├─────────────────────────────────────────────────────────────────────┤
│  Categories (horizontal scroll)                                     │
│  [🔧 Mechanic] [⚡ Electrician] [🔩 Plumber] [❄️ AC] ...           │
├─────────────────────────────────────────────────────────────────────┤
│  [ Nearby ]  [ Top Rated ]  [ All ]          ← Tab pills             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ FEED CARD (see §4.1)                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ FEED CARD                                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ... (infinite scroll)                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- **Nearby:** Default tab; requires location; shows posts within 5 km, sorted by distance.
- **Top Rated:** Sorted by trust score + rating.
- **All:** Full feed; optional city filter.
- Location chip: Tappable; opens area/city selector or requests GPS.
- Empty state: "No posts nearby. Be the first to share!" / قریب کوئی پوسٹ نہیں۔ پہلے شیئر کریں!

---

### 2.4 Category Listing

**Purpose:** Same as Home but with category pre-selected; filter persists.

**Layout:** Same as Home, with:
- Category chip highlighted/filled
- Header: "Plumber" or category name
- Breadcrumb: Feed > Plumber (web only)

---

### 2.5 Post Creation

**Purpose:** Create Recommendation or Self-Post.

**Step 0: Choose Type**
```
┌─────────────────────────────────────┐
│  ← Back         Share a contact      │
│                 رابطہ شیئر کریں       │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  👤 Recommend someone           │ │
│  │  کسی قابل اعتماد شخص کی سفارش   │ │
│  │  Share a trusted mechanic,      │ │
│  │  plumber, etc.                   │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  🔧 I am a worker               │ │
│  │  میں ایک ورکر ہوں               │ │
│  │  Add your skill and get found   │ │
│  └────────────────────────────────┘ │
│                                      │
└─────────────────────────────────────┘
```

**Step 1a: Recommend Form**
```
┌─────────────────────────────────────┐
│  ← Back    Recommend someone         │
├─────────────────────────────────────┤
│  Category *        [ Plumber ▼ ]    │
│  Worker name       [ Rashid Ahmed ]  │
│  Phone number *    [ +92 300 1234567 ]│
│  Location *        [ 📍 Pin on map ] │
│  Area text         [ DHA Phase 5 ]   │
│  Why recommend? *  [ Fixed my tap... ]│
│  Relation tag      [ mera plumber ▼ ]│
│  Photos (optional) [ + Add photo ]   │
│                                      │
│  [ Post recommendation ]             │
└─────────────────────────────────────┘
```

**Step 1b: Self-Post Form**
```
┌─────────────────────────────────────┐
│  ← Back    I am a worker             │
├─────────────────────────────────────┤
│  Skill *           [ Plumber ▼ ]     │
│  Phone *           [ +92 300 1234567 ]│
│  Location *        [ 📍 Pin on map ] │
│  Area              [ DHA Phase 5 ]   │
│  Short intro *      [ 10 years exp... ]│
│  Rate (optional)   [ 500/hr ]       │
│  Work photos       [ + Add photo ]   │
│  Availability      [ ● Available ]  │
│                                      │
│  [ Post ]                            │
└─────────────────────────────────────┘
```

**States:**
- Validation: Required fields marked; inline errors
- Duplicate phone: Warning "This number is already listed. Confirm you know this person."
- 3/day limit: Modal "You've reached today's limit. Try again tomorrow." / آج کی حد مکمل۔ کل دوبارہ کوشش کریں۔

---

### 2.6 Worker Profile

**Purpose:** Public view of a worker/post; contact actions.

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Back                    ⋮ More   │
├─────────────────────────────────────┤
│  [Avatar/Gallery carousel]           │
│  Plumber • DHA Phase 5              │
│  ⭐ 4.5  •  Recommended by 3         │
│  [🏆 Top Trusted Nearby]  [2.1 km]   │
│  ● Available                        │
├─────────────────────────────────────┤
│  "10 years experience, fair pricing"│
│  "Fixed my tap in 30 mins" (reason)  │
├─────────────────────────────────────┤
│  Rate: 500/hr (optional)            │
│  mera plumber (relation tag)        │
├─────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐   │
│  │  📞 Call    │ │  💬 Chat    │   │
│  └─────────────┘ └─────────────┘   │
│  Madad ki ❤️ 12  [ ❤️ ]            │
├─────────────────────────────────────┤
│  Reviews (3)                         │
│  ⭐⭐⭐⭐⭐ "Great work!" - Ali      │
│  ⭐⭐⭐⭐  "Quick fix" - Sana        │
└─────────────────────────────────────┘
```

**More menu:** Report, Block, Share (native share).

---

### 2.7 User Profile

**Purpose:** View recommender's profile; trust score, history.

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Back                    ⋮ More   │
├─────────────────────────────────────┤
│  [Avatar]   Ali                      │
│  DHA Phase 5, Lahore                 │
│  Trust score: 72  [4 recommendations]│
│  Member since Jan 2025               │
├─────────────────────────────────────┤
│  Shared contacts (grid/list)         │
│  [Card] [Card] [Card] ...            │
└─────────────────────────────────────┘
```

**My Profile (authenticated):**
- Edit button
- Settings: Area, Phone masking, Logout

---

### 2.8 Chat Thread List

**Purpose:** List of chat threads.

**Layout:**
```
┌─────────────────────────────────────┐
│  Chats    پیغامات                    │
├─────────────────────────────────────┤
│  ┌────────────────────────────────┐ │
│  │ [Avatar] Rashid - Plumber       │ │
│  │ Last: "I'll be there in 30"     │ │
│  │ 10 min ago         [●] unread  │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ [Avatar] Ahmed - Electrician    │ │
│  │ Last: [Location shared]         │ │
│  │ Yesterday                      │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Empty:** "No chats yet. Start by contacting a helper!" / ابھی کوئی چٹ نہیں۔ مددگار سے رابطہ کریں!

---

### 2.9 Chat Screen

**Purpose:** Real-time messaging; image + location; Job Done.

**Layout:**
```
┌─────────────────────────────────────┐
│  ← Rashid - Plumber    ⋮ (menu)     │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │ Hi, need help with tap        │   │ ← Other (left, grey)
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ Sure, share your location     │   │ ← Me (right, primary)
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ [📍 Location] DHA Phase 5      │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ [Image thumbnail]              │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│  [ 📷 ] [ 📍 ]  [ Type message... ] [➤]│
│                                      │
│  [ Job Done ✓ ]  ← Sticky bottom bar │
└─────────────────────────────────────┘
```

**States:**
- Job Done visible: After at least 1 message exchange
- Job Done tapped: Opens review modal; hides Job Done until next thread

---

### 2.10 Review & Rating Flow (after Job Done)

**Purpose:** Collect rating and optional review.

**Layout:**
```
┌─────────────────────────────────────┐
│           How was the service?       │
│           خدمات کیسے تھیں؟           │
│                                      │
│  ⭐  ☆  ☆  ☆  ☆   (1-5 tappable)    │
│                                      │
│  Add a review (optional)             │
│  ┌────────────────────────────────┐ │
│  │ Great work, fixed quickly!     │ │
│  └────────────────────────────────┘ │
│                                      │
│  [ Submit ]                          │
└─────────────────────────────────────┘
```

**Flow:**
1. Job Done → Modal opens
2. Select 1–5 stars (required)
3. Optional text
4. Submit → Close modal, show toast "Thanks for your review!" / شکریہ!

---

### 2.11 Report Flow

**Purpose:** Report post or user.

**Layout:**
```
┌─────────────────────────────────────┐
│  Report                              │
│  رپورٹ کریں                          │
├─────────────────────────────────────┤
│  Why are you reporting?             │
│  ┌────────────────────────────────┐ │
│  │ ○ Spam / Fake                  │ │
│  │ ○ Wrong category               │ │
│  │ ○ Inappropriate content        │ │
│  │ ○ Harassment                   │ │
│  │ ○ Other                        │ │
│  └────────────────────────────────┘ │
│  Additional details (optional)       │
│  ┌────────────────────────────────┐ │
│  │                                 │ │
│  └────────────────────────────────┘ │
│  [ Submit Report ]                   │
└─────────────────────────────────────┘
```

**Success:** Toast "Report submitted. We'll review it." / رپورٹ موصول۔ ہم جائزہ لیں گے۔

---

### 2.12 Block Flow

**Purpose:** Block user; confirm.

**Layout:**
```
┌─────────────────────────────────────┐
│  Block Rashid?                       │
│  راشد کو بلاک کریں؟                  │
│                                      │
│  They won't see your posts or        │
│  contact you.                        │
│                                      │
│  [ Cancel ]  [ Block ] (danger)      │
└─────────────────────────────────────┘
```

**Success:** Toast "Blocked" / بلاک ہو گیا۔

---

## 3. Design System

### 3.1 Color Tokens

```css
/* Primary - Deep green/teal (trust, calm) */
--color-primary-50:   #e6f7f4;
--color-primary-100:  #b3e9e0;
--color-primary-200:  #80dbcc;
--color-primary-300:  #4dcdb8;
--color-primary-400:  #26c2a8;
--color-primary-500:  #0d9488;   /* Main primary */
--color-primary-600:  #0f766e;
--color-primary-700:  #115e59;
--color-primary-800:  #134e4a;
--color-primary-900:  #134e4a;

/* Accent - Amber/yellow (warmth, attention) */
--color-accent-50:    #fffbeb;
--color-accent-100:   #fef3c7;
--color-accent-200:   #fde68a;
--color-accent-300:   #fcd34d;
--color-accent-400:   #fbbf24;
--color-accent-500:   #f59e0b;   /* Main accent */
--color-accent-600:   #d97706;

/* Neutral */
--color-neutral-50:   #fafafa;
--color-neutral-100:  #f5f5f5;
--color-neutral-200:  #e5e5e5;
--color-neutral-300:  #d4d4d4;
--color-neutral-400:  #a3a3a3;
--color-neutral-500:  #737373;
--color-neutral-600:  #525252;
--color-neutral-700:  #404040;
--color-neutral-800:  #262626;
--color-neutral-900:  #171717;

/* Semantic */
--color-success:      #22c55e;
--color-warning:     #f59e0b;
--color-danger:      #ef4444;
--color-info:        #3b82f6;

/* Backgrounds */
--color-bg:          #ffffff;
--color-bg-muted:    var(--color-neutral-50);
--color-bg-elevated: #ffffff;
--color-bg-overlay:  rgba(0,0,0,0.5);

/* Text */
--color-text:        var(--color-neutral-900);
--color-text-muted:  var(--color-neutral-500);
--color-text-inverse: #ffffff;
```

### 3.2 Typography Scale

```css
/* Font families */
--font-sans:   'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
--font-urdu:   'Noto Nastaliq Urdu', 'Noto Sans Arabic', serif;

/* Scale (mobile base 16px) */
--text-xs:     0.75rem;   /* 12px */
--text-sm:     0.875rem;  /* 14px */
--text-base:   1rem;      /* 16px */
--text-lg:     1.125rem;  /* 18px */
--text-xl:     1.25rem;   /* 20px */
--text-2xl:    1.5rem;    /* 24px */
--text-3xl:    1.875rem;  /* 30px */
--text-4xl:    2.25rem;   /* 36px */

/* Weights */
--font-normal:  400;
--font-medium:  500;
--font-semibold: 600;
--font-bold:    700;

/* Line heights */
--leading-tight:  1.25;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### 3.3 Spacing

```css
--space-0:   0;
--space-1:   0.25rem;   /* 4px */
--space-2:   0.5rem;    /* 8px */
--space-3:   0.75rem;   /* 12px */
--space-4:   1rem;      /* 16px */
--space-5:   1.25rem;   /* 20px */
--space-6:   1.5rem;    /* 24px */
--space-8:   2rem;      /* 32px */
--space-10:  2.5rem;    /* 40px */
--space-12:  3rem;      /* 48px */
--space-16:  4rem;      /* 64px */
```

### 3.4 Radius & Shadows

```css
--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-2xl:  24px;
--radius-full: 9999px;

--shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
--shadow-md:  0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
--shadow-lg:  0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
--shadow-xl:  0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
```

### 3.5 Button Styles

| Style | BG | Text | Border | Use |
|-------|-----|------|-------|-----|
| **Primary** | primary-500 | white | none | CTAs (Call, Chat, Submit) |
| **Secondary** | neutral-100 | neutral-800 | none | Cancel, secondary actions |
| **Outline** | transparent | primary-600 | primary-500 | Madad ki ❤️, low emphasis |
| **Ghost** | transparent | neutral-600 | none | Inline links, tertiary |
| **Danger** | danger | white | none | Block, Delete |

**Button specs:**
- Min height: 44px (mobile touch target)
- Min width: 44px for icon-only
- Border radius: `--radius-md`
- Padding: `--space-3` `--space-4`
- Font: `--font-medium` `--text-base`

---

## 4. Component Specs

### 4.1 FeedCard

**Props:**
```ts
interface FeedCardProps {
  id: string;
  categoryName: string;
  categoryIcon?: string;
  postType: 'recommendation' | 'self';
  workerName?: string;
  phone: string;
  areaText?: string;
  reason?: string;
  relationTag?: string;
  images?: string[];
  availability: boolean;
  optionalRate?: string;
  madadCount: number;
  userMadadGiven: boolean;
  distanceM?: number;
  avgRating?: number;
  recCount: number;
  trustBadges?: string[];
  createdAt: Date;
  phoneMasked?: boolean;
  onCall: () => void;
  onChat: () => void;
  onMadad: () => void;
  onPress: () => void;  // Navigate to detail
}
```

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [CategoryIcon] Category     [AvailabilityDot] [DistanceTag] │
│ ⭐ avgRating  •  Recommended by recCount                     │
│ reason (truncated 2 lines)                                  │
│ [TrustBadge] [TrustBadge]                                   │
│ Madad ki ❤️ madadCount    [LikeButton]                      │
│ [  📞 Call  ]  [  💬 Chat  ]    ← 44px min height           │
└─────────────────────────────────────────────────────────┘
```

**States:**
- Default: Full content
- Loading: Skeleton
- Madad given: LikeButton filled
- Unavailable: Greyed out; "Unavailable" badge
- Self-post: Optional "New" badge

**Spacing:** `padding: var(--space-4)`; gap between elements `var(--space-2)`.

---

### 4.2 CategoryChip / IconGrid

**CategoryChip (single):**
```ts
interface CategoryChipProps {
  slug: string;
  name: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
}
```
- Unselected: Outline, neutral
- Selected: Filled primary, white text
- Size: 40px icon + label; horizontal scroll

**IconGrid (2-row scroll on mobile):**
```
[🔧 Mechanic] [⚡ Electrician] [🔩 Plumber] [❄️ AC]
[👨‍🍳 Cook] [🚗 Driver] [🧹 Cleaner] [🪚 Carpenter]
...
```

---

### 4.3 TrustBadge

**Props:**
```ts
interface TrustBadgeProps {
  type: 'recommended-10' | 'top-trusted' | 'new';
  label?: string;
}
```

**Variants:**
- `recommended-10`: "Recommended by 10+" — Primary bg, white text
- `top-trusted`: "Top Trusted Nearby" — Accent bg, dark text
- `new`: "New" — Neutral 200 bg, neutral 700 text

**Size:** `--text-xs`, `--radius-sm`, padding `--space-1` `--space-2`

---

### 4.4 AvailabilityToggle

**Props:**
```ts
interface AvailabilityToggleProps {
  available: boolean;
  onChange: (available: boolean) => void;
  disabled?: boolean;
}
```

**Layout:**
- Toggle switch (44px touch)
- Label: "Available" / دستیاب when on; "Unavailable" / دستیاب نہیں when off
- Color: Green when on, neutral when off

---

### 4.5 DistanceTag

**Props:**
```ts
interface DistanceTagProps {
  distanceM: number;
}
```

**Display:**
- &lt; 1000m: "450 m"
- ≥ 1000m: "2.3 km"
- No location: "—" or hide

**Style:** `--text-sm`, `--color-text-muted`, icon 📍 optional

---

### 4.6 LikeButton ("Madad ki ❤️")

**Props:**
```ts
interface LikeButtonProps {
  count: number;
  isLiked: boolean;
  onPress: () => void;
  disabled?: boolean;
}
```

**Layout:**
- Heart icon (filled when liked, outline when not)
- Label: "Madad ki ❤️" 
- Count: "12"
- Full: `Madad ki ❤️ 12`

**States:**
- Default: Outline heart, neutral
- Liked: Filled heart, primary or accent
- Disabled: Greyed, no interaction
- Loading: Spinner on heart

**Animation:** Brief scale on tap

---

## 5. Responsive Rules

### 5.1 Breakpoints

```css
--bp-sm:  640px;
--bp-md:  768px;
--bp-lg:  1024px;
--bp-xl:  1280px;
```

### 5.2 Mobile Layouts (default)

- Single column
- Full-width cards
- Bottom tab bar (fixed)
- Sticky header with back
- Touch targets min 44px

### 5.3 Desktop Web Layout (3-column)

```
┌──────────────┬────────────────────────────┬──────────────┐
│  Categories  │  Feed                       │  Filters     │
│  (vertical)  │  (Nearby / Top / All)       │  (optional)  │
│  ~200px      │  Center, scroll             │  ~240px      │
│              │  Max-width 600px cards       │              │
└──────────────┴────────────────────────────┴──────────────┘
```

**Rules:**
- Left: Scrollable category list; sticky
- Center: Feed; max-width 600px for readability
- Right: Filters (category, radius, sort); collapsible on md
- Top nav: Logo, links, profile (replaces bottom tabs)

### 5.4 Adaptive Behaviors

| Element | Mobile | Desktop |
|---------|--------|---------|
| Nav | Bottom tabs | Top nav + sidebar |
| Feed cards | Full width | Max 600px, centered |
| Category selector | Horizontal scroll | Vertical list |
| Chat | Full screen | Side panel or modal |
| Modals | Full screen | Centered 400px |

---

## 6. Microcopy (Urdu + English)

### 6.1 Buttons

| Context | English | Urdu |
|---------|---------|------|
| Primary CTA | Get Started | شروع کریں |
| Login | Send Code | کوڈ بھیجیں |
| Verify | Verify | تصدیق |
| Call | Call | کال |
| Chat | Chat | بات کریں |
| Like | Madad ki ❤️ | مدد کی ❤️ |
| Submit | Submit | جمع کریں |
| Cancel | Cancel | منسوخ |
| Block | Block | بلاک |
| Report | Report | رپورٹ |
| Job Done | Job Done | کام ہو گیا |
| Share | Share | شیئر |
| Post | Post | پوسٹ |
| Edit | Edit | میں تبدیلی |
| Save | Save | محفوظ |
| Resend | Resend | دوبارہ بھیجیں |

### 6.2 Messages

| Context | English | Urdu |
|---------|---------|------|
| Empty feed | No posts nearby. Be the first to share! | قریب کوئی پوسٹ نہیں۔ پہلے شیئر کریں! |
| Empty chat | No chats yet. Start by contacting a helper! | ابھی کوئی چٹ نہیں۔ مددگار سے رابطہ کریں! |
| Max posts | You've reached today's limit. Try again tomorrow. | آج کی حد مکمل۔ کل دوبارہ کوشش کریں۔ |
| Thank you review | Thanks for your review! | شکریہ آپ کے جائزے کا! |
| Report submitted | Report submitted. We'll review it. | رپورٹ موصول۔ ہم جائزہ لیں گے۔ |
| Blocked | Blocked | بلاک ہو گیا |
| Invalid OTP | Invalid code. Please try again. | غلط کوڈ۔ دوبارہ کوشش کریں۔ |
| Location needed | Allow location to see nearby helpers | قریبی مددگار دیکھنے کے لیے لوکیشن دیں |
| Duplicate phone | This number is already listed. Confirm you know this person. | یہ نمبر پہلے سے ہے۔ تصدیق کریں کہ آپ اسے جانتے ہیں۔ |

### 6.3 Labels

| Context | English | Urdu |
|---------|---------|------|
| Trust score | Trust score | اعتماد اسکور |
| Recommended by | Recommended by X | X کی سفارش |
| Available | Available | دستیاب |
| Unavailable | Unavailable | دستیاب نہیں |
| Distance | 2.3 km | 2.3 کلومیٹر |
| Rating | 4.5 | 4.5 |
| Reviews | Reviews | جائزے |
| My profile | My profile | میرا پروفائل |
| Chats | Chats | پیغامات |
| Feed | Feed | فیڈ |
| Nearby | Nearby | قریب |
| Top Rated | Top Rated | سب سے بہتر |
| All | All | سب |
| Recommend someone | Recommend someone | کسی کی سفارش |
| I am a worker | I am a worker | میں ورکر ہوں |

### 6.4 Placeholders

| Context | English | Urdu |
|---------|---------|------|
| Phone | Enter phone number | فون نمبر درج کریں |
| OTP | Enter 6-digit code | 6 ہندسوں کا کوڈ درج کریں |
| Message | Type message... | پیغام لکھیں... |
| Review | Add a review (optional) | جائزہ شامل کریں (اختیاری) |
| Reason | Why recommend? | کیوں سفارش؟ |
| Area | Area / locality | علاقہ |

---

## 7. Accessibility

- **Touch targets:** Min 44×44px
- **Color contrast:** Text AA minimum (4.5:1)
- **Focus:** Visible focus ring (2px primary)
- **Labels:** All icons have aria-label or visible text
- **Reduced motion:** Respect `prefers-reduced-motion`

---

## 8. Animation Guidelines

- **Duration:** 200–300ms for micro-interactions
- **Easing:** `ease-out` for enter, `ease-in` for exit
- **Like:** Heart scale 1 → 1.2 → 1 on tap
- **Modal:** Fade + slide up (mobile); fade (desktop)
- **Page transition:** Subtle fade (no heavy motion)

---

*End of UI/UX Specification*
