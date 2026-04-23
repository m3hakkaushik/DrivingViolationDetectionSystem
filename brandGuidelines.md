# Drishti-Path — Brand Guidelines
**Document 1 of 2 — Design System & Brand Guide**
*Internal Use Only — v1.0.0*

---

## Table of Contents

1. [Brand Name](#1-brand-name)
2. [Tagline](#2-tagline)
3. [Logo System](#3-logo-system)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Iconography](#6-iconography)
7. [UI Component System](#7-ui-component-system)
8. [Motion & Animation](#8-motion--animation)
9. [Photography & Illustration Style](#9-photography--illustration-style)
10. [Tone of Voice](#10-tone-of-voice)
11. [Marketing Assets](#11-marketing-assets)

---

## 1. Brand Name

### 1.1 Official Spelling

| Format | Usage |
|---|---|
| `Drishti-Path` | Primary — always hyphenated, both words capitalised |
| `Drishti` | Short form — acceptable in UI space-constrained contexts only |
| `drishti-path` | Lowercase — acceptable in code, URLs, package names only |

> **Etymology:** *Drishti* (दृष्टि) = Vision / Sight in Sanskrit. *Path* = Road. Together: **"Vision on the Road."**

### 1.2 Acceptable Usage

- `Drishti-Path` in all marketing, UI headers, splash screens, and press materials
- `Drishti` alone only in app icon label (character limit constraint)
- `drishti_path` in Dart package names, file names, and environment variables
- `drishti-path` in URLs, GitHub repo names, and API subdomains

### 1.3 Unacceptable Usage

- ❌ `DrishtiPath` — no hyphen
- ❌ `drishtipath` — all lowercase in public-facing text
- ❌ `Drishti Path` — space instead of hyphen
- ❌ `D-Path` — abbreviation not approved
- ❌ `DP` — too generic; never use as product abbreviation
- ❌ `DRISHTI-PATH` — all caps outside of legal disclaimers
- ❌ Transliterations in other scripts in product UI (English only for v1)

### 1.4 Abbreviation Rules

| Context | Acceptable Form |
|---|---|
| App icon label | `Drishti` |
| Notification sender | `Drishti-Path` |
| API base URL | `api.drishtipath.app` |
| Internal code references | `drishti_path` (snake_case) |
| Git branches | `drishtipath/feature-name` |

---

## 2. Tagline

### 2.1 Primary Tagline

> **"Every road, watched over."**

### 2.2 Secondary Tagline (UI use, shorter)

> **"See the road clearly."**

### 2.3 Usage Guidelines

| Context | Tagline |
|---|---|
| App Store listing | "Every road, watched over." |
| Splash screen | "See the road clearly." |
| Marketing headers | "Every road, watched over." |
| Onboarding subtitle | "See the road clearly." |
| Email footers | "Every road, watched over." |

**Rules:**
- Never alter the tagline wording
- Never bold individual words within the tagline
- Always render in `Sentence case` — never ALL CAPS
- Minimum font size: 13sp on mobile
- Always pair with logo; never standalone without brand name context

---

## 3. Logo System

### 3.1 Logo Concept

The logo mark is a **stylised eye shape merged with a road vanishing-point** — representing vision, direction, and awareness. The iris of the eye contains a soft gradient orb (pink → lavender → peach), glowing subtly outward.

### 3.2 Logo Variants

| Variant | Usage |
|---|---|
| **Full lockup** (mark + wordmark) | App Store, marketing, splash screen |
| **Mark only** (eye-road icon) | App icon, favicon, notification icon |
| **Wordmark only** | Portal header, documents, letterhead |
| **Monochrome** (white) | Dark overlays, video watermarks |
| **Monochrome** (dark) | Print, legal documents |

### 3.3 Clear Space Rules

Minimum clear space = **1× the height of the letter "D" in the wordmark** on all four sides.

```
  ┌─────────────────────────────────┐
  │          [clear space X]        │
  │  [X]  👁  Drishti-Path  [X]    │
  │          [clear space X]        │
  └─────────────────────────────────┘
  X = height of capital "D" in wordmark
```

### 3.4 Minimum Sizes

| Variant | Minimum Size | Context |
|---|---|---|
| Full lockup | 120px wide | Digital |
| Full lockup | 30mm wide | Print |
| Mark only | 24×24px | Notification icons |
| Mark only | 48×48px | UI contexts |
| Wordmark only | 80px wide | Digital |

### 3.5 Logo Placement

- **Splash screen:** Centered horizontally, 42% from top
- **App bar:** Mark only, left-aligned, 28×28dp
- **Portal header:** Full lockup, left-aligned
- **Onboarding:** Full lockup, centered

### 3.6 Background Rules

| Background Type | Approved Logo Variant |
|---|---|
| White / off-white | Full colour lockup |
| Light pastel gradient | Full colour lockup |
| Dark / deep navy | White monochrome |
| Photography / video | White monochrome with 60% opacity backdrop pill |
| Neon / saturated | ❌ Do not place logo — background conflicts |

### 3.7 Incorrect Logo Usage

- ❌ Stretching or skewing the mark
- ❌ Rotating the logo
- ❌ Dropping shadow on the mark (the glow effect is built-in; do not add external shadows)
- ❌ Recolouring the gradient with non-brand colours
- ❌ Placing on a busy photographic background without a scrim
- ❌ Outlining the wordmark
- ❌ Using the mark at sizes below minimum

---

## 4. Color System

### 4.1 Primary Palette

These colours form the emotional core of the product — soft, glowing, and alive.

| Name | HEX | RGB | HSL | Usage |
|---|---|---|---|---|
| **Blossom Pink** | `#F4A7C3` | `244, 167, 195` | `338°, 75%, 81%` | Primary CTA backgrounds, gradient start |
| **Lavender Mist** | `#C9B8F0` | `201, 184, 240` | `258°, 65%, 83%` | Gradient midpoint, active state fills |
| **Warm Peach** | `#F7C9A8` | `247, 201, 168` | `24°, 85%, 81%` | Gradient end, warm accent fills |
| **Blush Rose** | `#F0B8C8` | `240, 184, 200` | `344°, 65%, 83%` | Secondary highlights, card tints |

**Primary gradient (used on CTAs, orbs, hero elements):**
```dart
LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [
    Color(0xFFF4A7C3), // Blossom Pink
    Color(0xFFC9B8F0), // Lavender Mist
    Color(0xFFF7C9A8), // Warm Peach
  ],
  stops: [0.0, 0.5, 1.0],
)
```

**Radial glow orb gradient:**
```dart
RadialGradient(
  center: Alignment.center,
  radius: 0.85,
  colors: [
    Color(0xFFF4A7C3).withOpacity(0.9),
    Color(0xFFC9B8F0).withOpacity(0.6),
    Color(0xFFF7C9A8).withOpacity(0.0),
  ],
  stops: [0.0, 0.55, 1.0],
)
```

### 4.2 Accent Colours

| Name | HEX | RGB | HSL | Usage |
|---|---|---|---|---|
| **Neon Magenta** | `#FF3CAC` | `255, 60, 172` | `322°, 100%, 62%` | Hover states, active indicators, badge highlights |
| **Electric Lavender** | `#A855F7` | `168, 85, 247` | `272°, 91%, 65%` | Focus rings, selected states, progress indicators |
| **Glow Pink** | `#FF79C6` | `255, 121, 198` | `320°, 100%, 74%` | Icon glow, pulse animations, recording indicator |

**Usage rules for accents:**
- Neon Magenta: never used as a fill on large surfaces; reserved for micro-interactions and small UI moments
- Electric Lavender: focus rings only at 2dp width; never as background
- Glow Pink: animation only — not static fills

### 4.3 Neutral Palette

| Name | HEX | RGB | HSL | Usage |
|---|---|---|---|---|
| **Cloud White** | `#FAFAFA` | `250, 250, 250` | `0°, 0%, 98%` | App background (default) |
| **Parchment** | `#F5F0EC` | `245, 240, 236` | `25°, 33%, 94%` | Card backgrounds, sheet surfaces |
| **Pale Gray** | `#EFEFEF` | `239, 239, 239` | `0°, 0%, 94%` | Dividers, input backgrounds |
| **Soft Beige** | `#F0EBE3` | `240, 235, 227` | `33°, 33%, 92%` | Alternate section backgrounds |
| **Muted Stone** | `#D4CFC9` | `212, 207, 201` | `30°, 10%, 81%` | Borders, inactive states |
| **Ash** | `#9E9A96` | `158, 154, 150` | `30°, 4%, 60%` | Secondary text, placeholder text |
| **Charcoal** | `#3D3A38` | `61, 58, 56` | `20°, 4%, 23%` | Primary body text |
| **Ink** | `#1A1917` | `26, 25, 23` | `30°, 6%, 10%` | Headlines, high-contrast text |

### 4.4 Semantic Colours

| Semantic | HEX | RGB | HSL | Usage |
|---|---|---|---|---|
| **Success** | `#6FCF97` | `111, 207, 151` | `145°, 50%, 62%` | Upload complete, confirmed violation |
| **Warning** | `#F2C94C` | `242, 201, 76` | `45°, 87%, 62%` | Storage low, upload queued, thermal warning |
| **Error** | `#EB5757` | `235, 87, 87` | `0°, 78%, 63%` | Failed upload, model error, crash state |
| **Info** | `#56CCF2` | `86, 204, 242` | `195°, 85%, 64%` | AI analysis running, sync in progress |

**Semantic colour usage rules:**
- Never use semantic colours as decorative elements
- Always pair with an icon — colour alone is insufficient for accessibility
- Minimum contrast ratio: 4.5:1 against the surface it appears on
- Use at 10% opacity for background tints on alert banners

### 4.5 Glassmorphism Surface Tokens

| Token | Value | Usage |
|---|---|---|
| `glass-bg` | `#FFFFFF` at 40% opacity | Card overlays on gradient backgrounds |
| `glass-border` | `#FFFFFF` at 30% opacity, 1dp | Card edges on glass surfaces |
| `glass-blur` | `12dp` backdrop blur (ImageFilter) | All glass cards |
| `glass-shadow` | `0 4dp 24dp rgba(196,160,210,0.18)` | Diffused lavender shadow |

```dart
// Glass card decoration
BoxDecoration(
  color: Colors.white.withOpacity(0.40),
  borderRadius: BorderRadius.circular(20),
  border: Border.all(
    color: Colors.white.withOpacity(0.30),
    width: 1.0,
  ),
  boxShadow: [
    BoxShadow(
      color: Color(0xFFC4A0D2).withOpacity(0.18),
      blurRadius: 24,
      offset: Offset(0, 4),
    ),
  ],
)
// Apply BackdropFilter with ImageFilter.blur(sigmaX: 12, sigmaY: 12)
```

---

## 5. Typography

### 5.1 Primary Typeface — **DM Sans**

- **Use:** All UI text, body copy, labels, navigation
- **Source:** Google Fonts (`dm_sans` Flutter package)
- **Why:** Clean, geometric, highly legible at small sizes; modern but warm

### 5.2 Secondary Typeface — **Playfair Display**

- **Use:** Hero headlines, splash screen, onboarding large text only
- **Source:** Google Fonts (`playfair_display` Flutter package)
- **Why:** Elegant serif that contrasts beautifully with DM Sans; adds the "slightly magical" emotional tone

### 5.3 Fallback Fonts

```dart
// Flutter font fallback chain
fontFamily: 'DM Sans',
fontFamilyFallback: ['SF Pro Display', 'Roboto', 'sans-serif'],
```

| Context | Fallback |
|---|---|
| iOS | SF Pro Display → Helvetica Neue |
| Android | Roboto → sans-serif |
| Web portal | Inter → system-ui → sans-serif |

### 5.4 Font Weights

| Weight Name | Weight Value | Usage |
|---|---|---|
| Regular | 400 | Body text, descriptions, metadata |
| Medium | 500 | Labels, secondary headings, input text |
| SemiBold | 600 | Section headings, card titles, CTAs |
| Bold | 700 | Primary headings, screen titles |
| ExtraBold | 800 | Hero text, splash screen name only |

### 5.5 Mobile Typography Scale

| Token | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `display-xl` | Playfair Display | 36sp | 700 | 44px | -0.5px | Splash screen brand name |
| `display-lg` | Playfair Display | 28sp | 700 | 36px | -0.3px | Onboarding hero text |
| `heading-xl` | DM Sans | 24sp | 700 | 32px | -0.2px | Screen titles |
| `heading-lg` | DM Sans | 20sp | 600 | 28px | -0.1px | Section headers |
| `heading-md` | DM Sans | 18sp | 600 | 26px | 0px | Card titles |
| `heading-sm` | DM Sans | 16sp | 600 | 24px | 0px | List item headers |
| `body-lg` | DM Sans | 16sp | 400 | 26px | 0.1px | Primary body text |
| `body-md` | DM Sans | 14sp | 400 | 22px | 0.1px | Secondary body, descriptions |
| `body-sm` | DM Sans | 13sp | 400 | 20px | 0.2px | Captions, metadata |
| `label-lg` | DM Sans | 14sp | 500 | 20px | 0.3px | Input labels, tab labels |
| `label-md` | DM Sans | 12sp | 500 | 18px | 0.4px | Badges, chips |
| `label-sm` | DM Sans | 11sp | 500 | 16px | 0.5px | Timestamps, micro-labels |
| `button-lg` | DM Sans | 16sp | 600 | 20px | 0.5px | Primary CTA buttons |
| `button-md` | DM Sans | 14sp | 600 | 18px | 0.4px | Secondary buttons |
| `button-sm` | DM Sans | 13sp | 500 | 16px | 0.3px | Inline action buttons |

### 5.6 Text Colour Rules

| Token | Colour | Contrast (on Cloud White) |
|---|---|---|
| Primary text | `Ink #1A1917` | 18.1:1 ✅ |
| Secondary text | `Charcoal #3D3A38` | 10.4:1 ✅ |
| Tertiary text | `Ash #9E9A96` | 3.8:1 ⚠️ (large text only) |
| Disabled text | `Muted Stone #D4CFC9` | 1.6:1 — intentional, non-interactive |
| Inverse text | `Cloud White #FAFAFA` | On dark/gradient surfaces |

---

## 6. Iconography

### 6.1 Icon Style

- **Style:** Rounded, friendly, slightly thick strokes — never sharp or aggressive
- **Feel:** Soft, approachable; consistent with the calm/magical tone
- **Corners:** All path corners rounded (round linecap, round linejoin)

### 6.2 Stroke Weight

| Icon Size | Stroke Width |
|---|---|
| 16dp | 1.5dp |
| 20dp | 1.75dp |
| 24dp (default) | 2.0dp |
| 32dp | 2.0dp |
| 48dp | 2.5dp |

> **Rule:** Never fill icons that are defined as outline — and never outline icons defined as filled. Pick one style per icon and be consistent.

### 6.3 Icon Sizes

| Usage Context | Size |
|---|---|
| Navigation bar | 24dp |
| App bar actions | 24dp |
| Inline / list items | 20dp |
| Floating action area | 28dp |
| Onboarding illustrations | 48–64dp |
| Empty state illustrations | 80–96dp |

### 6.4 Recommended Libraries

| Library | Usage | Package |
|---|---|---|
| **Lucide Icons** | Primary icon set — clean rounded strokes | `lucide_icons` (Flutter) |
| **Phosphor Icons** | Secondary — for any gaps in Lucide | `phosphor_flutter` |
| Custom SVG | Logo mark, special UI moments | Inline SVG via `flutter_svg` |

### 6.5 Icon Colour Rules

| Context | Colour |
|---|---|
| Active / selected | `Electric Lavender #A855F7` |
| Inactive / default | `Ash #9E9A96` |
| On gradient surfaces | `Cloud White #FAFAFA` |
| Destructive action | `Error #EB5757` |
| AI-related features | `Blossom Pink #F4A7C3` with `Glow Pink` glow filter |

### 6.6 Glow Effect on Icons

For AI-feature icons and the recording indicator specifically:

```dart
// Glow icon wrapper
Container(
  decoration: BoxDecoration(
    shape: BoxShape.circle,
    boxShadow: [
      BoxShadow(
        color: Color(0xFFFF79C6).withOpacity(0.55),
        blurRadius: 16,
        spreadRadius: 2,
      ),
    ],
  ),
  child: Icon(LucideIcons.eye, color: Color(0xFFF4A7C3), size: 24),
)
```

---

## 7. UI Component System

### 7.1 Buttons

#### Primary Button (Gradient CTA)

| Property | Value |
|---|---|
| Background | `Blossom Pink → Lavender Mist → Warm Peach` gradient (135°) |
| Text | `Cloud White`, `button-lg`, SemiBold |
| Height | 52dp |
| Border radius | 16dp |
| Horizontal padding | 24dp |
| Shadow | `0 4dp 20dp rgba(201,184,240,0.45)` (lavender glow) |
| Min width | 160dp |

**Interaction states:**
- `default` — gradient as defined
- `hover` (portal) — brighten gradient by 8%; scale to 1.02
- `pressed` — scale to 0.97; reduce shadow opacity to 20%
- `loading` — shimmer animation across gradient; spinner replaces label
- `disabled` — flat `Pale Gray #EFEFEF`; text `Ash #9E9A96`; no shadow

#### Secondary Button (Ghost)

| Property | Value |
|---|---|
| Background | Transparent |
| Border | 1.5dp, `Lavender Mist #C9B8F0` |
| Text | `Lavender Mist #C9B8F0` deepened to `Electric Lavender`, `button-md` |
| Height | 48dp |
| Border radius | 16dp |

**Interaction states:**
- `pressed` — background fills to `C9B8F0` at 15% opacity
- `disabled` — border `Muted Stone`; text `Muted Stone`

#### Destructive Button

| Property | Value |
|---|---|
| Background | `Error #EB5757` at 12% opacity |
| Border | 1.5dp `Error #EB5757` |
| Text | `Error #EB5757`, `button-md` |
| Height | 48dp |
| Border radius | 16dp |

#### Icon Button (Floating)

| Property | Value |
|---|---|
| Size | 48×48dp |
| Background | Glass surface (`#FFFFFF` at 40% opacity + blur 12dp) |
| Border | 1dp `#FFFFFF` at 30% |
| Icon | 24dp, `Charcoal` or white depending on surface |
| Border radius | 14dp |

---

### 7.2 Cards

#### Standard Card

| Property | Value |
|---|---|
| Background | `Parchment #F5F0EC` |
| Border radius | 20dp |
| Padding | 16dp all sides |
| Shadow | `0 2dp 16dp rgba(212,207,201,0.30)` |
| Border | None (default) |

#### Glass Card (used on gradient backgrounds)

| Property | Value |
|---|---|
| Background | `#FFFFFF` at 40% opacity |
| Backdrop blur | 12dp |
| Border | 1dp `#FFFFFF` at 30% |
| Border radius | 20dp |
| Shadow | `0 4dp 24dp rgba(196,160,210,0.18)` |

#### Violation Clip Card

| Property | Value |
|---|---|
| Background | `Parchment` |
| Thumbnail | 16:9 aspect ratio, top of card, `border-radius: 16dp 16dp 0 0` |
| Content area padding | 12dp |
| Border radius | 20dp |
| Confidence badge | Top-right of thumbnail, overlaid |
| Elevation | 2dp shadow |

---

### 7.3 Input Fields

| Property | Value |
|---|---|
| Background | `Cloud White #FAFAFA` |
| Border (default) | 1dp `Muted Stone #D4CFC9` |
| Border (focused) | 2dp `Electric Lavender #A855F7` |
| Border (error) | 2dp `Error #EB5757` |
| Border radius | 12dp |
| Height | 52dp |
| Horizontal padding | 16dp |
| Label | `label-lg`, `Ash #9E9A96`, floats on focus |
| Input text | `body-lg`, `Ink #1A1917` |
| Placeholder | `body-lg`, `Muted Stone #D4CFC9` |

**Focus glow effect:**
```dart
// Wrap TextField with AnimatedContainer
boxShadow: isFocused ? [
  BoxShadow(
    color: Color(0xFFA855F7).withOpacity(0.20),
    blurRadius: 12,
    spreadRadius: 0,
  )
] : [],
```

---

### 7.4 Sliders

Used for video scrubber in Trip Review screen.

| Property | Value |
|---|---|
| Track height | 3dp |
| Track colour (inactive) | `Pale Gray #EFEFEF` |
| Track colour (active) | `Blossom Pink → Lavender Mist` gradient |
| Thumb | 14dp circle, `Cloud White`, shadow `0 2dp 8dp rgba(200,160,210,0.4)` |
| Thumb pressed size | 18dp |
| Timestamp marker | 4×12dp vertical pill, amber/blue/green per source |

---

### 7.5 Badges

| Variant | Background | Text | Border radius |
|---|---|---|---|
| AI Confidence High (≥80%) | `Success #6FCF97` at 15% | `Success`, `label-md` | 8dp |
| AI Confidence Mid (60–79%) | `Warning #F2C94C` at 15% | `Warning`, `label-md` | 8dp |
| AI Confidence Low (<60%) | `Error #EB5757` at 15% | `Error`, `label-md` | 8dp |
| Voice Marked | `Lavender Mist #C9B8F0` at 30% | `Electric Lavender`, `label-md` | 8dp |
| Manual | `Warm Peach #F7C9A8` at 30% | `Charcoal`, `label-md` | 8dp |
| Upload Pending | `Info #56CCF2` at 15% | `Info`, `label-md` | 8dp |
| Fines Issued | `Error #EB5757` at 15% | `Error`, `label-md` | 8dp |

**Badge padding:** 4dp vertical, 8dp horizontal.

---

### 7.6 Navigation Bar (Bottom Nav)

| Property | Value |
|---|---|
| Background | `Cloud White #FAFAFA` at 90% opacity |
| Backdrop blur | 20dp |
| Border top | 1dp `Pale Gray #EFEFEF` |
| Height | 64dp (+ safe area inset) |
| Icon size | 24dp |
| Label | `label-sm`, 11sp |
| Active icon colour | `Electric Lavender #A855F7` |
| Active label colour | `Electric Lavender #A855F7` |
| Active indicator | 40×32dp pill, `Electric Lavender` at 12% opacity |
| Inactive colour | `Ash #9E9A96` |
| Tab count | 4 (Home, Trips, Upload, Settings) |

```dart
// Active tab indicator animation
AnimatedContainer(
  duration: Duration(milliseconds: 200),
  curve: Curves.easeOutCubic,
  width: isActive ? 40 : 0,
  height: 32,
  decoration: BoxDecoration(
    color: Color(0xFFA855F7).withOpacity(0.12),
    borderRadius: BorderRadius.circular(16),
  ),
)
```

---

## 8. Motion & Animation

### 8.1 Animation Philosophy

> **Animations should feel like breathing — natural, unhurried, alive.**

Every motion in Drishti-Path communicates care. Nothing snaps. Nothing is abrupt. The interface feels like it gently responds to touch, not reacts to commands.

**Three principles:**
1. **Softness** — ease curves always favour gradual starts and endings
2. **Intention** — animate only what carries meaning; decorative animations are subtle, never distracting
3. **Warmth** — transitions feel like the UI is pleased to see you

### 8.2 Duration Standards

| Category | Duration | Usage |
|---|---|---|
| Micro | 100ms | Icon state changes, badge count updates |
| Fast | 200ms | Button press feedback, tab indicator slide |
| Standard | 300ms | Screen element entry, card expand |
| Deliberate | 400ms | Page transitions, bottom sheet open |
| Slow | 600ms | Splash to home, onboarding hero entrance |
| Ambient | 3000–6000ms | Background orb pulse, glow breathe loops |

### 8.3 Easing Curves

| Curve | Flutter Constant | Usage |
|---|---|---|
| `easeOutCubic` | `Curves.easeOutCubic` | Default for entrances — fast start, soft landing |
| `easeInOutCubic` | `Curves.easeInOutCubic` | Transitions between states |
| `easeOutBack` | `Curves.easeOutBack` | Confirmation moments — slight overshoot (bouncy warmth) |
| `easeInCubic` | `Curves.easeInCubic` | Exits — elements leaving the screen |
| `linear` | `Curves.linear` | Progress indicators only |

### 8.4 Page Transitions

```dart
// Standard page push transition
CustomTransitionPage(
  transitionDuration: Duration(milliseconds: 350),
  transitionsBuilder: (context, animation, secondaryAnimation, child) {
    return FadeTransition(
      opacity: CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
      child: SlideTransition(
        position: Tween(begin: Offset(0, 0.04), end: Offset.zero)
          .animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
        child: child,
      ),
    );
  },
)
```

> Never use left-right slide transitions (feels corporate). Always fade + subtle upward drift.

### 8.5 Feedback Animations

| Interaction | Animation |
|---|---|
| Button press | Scale to 0.97 in 80ms, return in 120ms (`easeOutBack`) |
| Timestamp voice mark | Amber radial pulse expands from dot (300ms, fade out) |
| AI flag detected | Badge increment with `easeOutBack` scale pop (200ms) |
| Upload complete | Success checkmark draws in with `easeOutCubic` (400ms) + green glow pulse |
| Trip card appear | Staggered fade + translateY(8→0) per card, 60ms stagger delay |
| Recording dot | Continuous `sin`-based pulse: opacity 1.0→0.5→1.0 every 1200ms |

### 8.6 Ambient Background Orb Animation

The hero gradient orb on the Active Trip screen pulses gently:

```dart
// Orb breathe animation
AnimationController(
  vsync: this,
  duration: Duration(milliseconds: 4000),
)..repeat(reverse: true);

// Scale: 0.92 → 1.08 (easeInOut)
// Opacity: 0.75 → 0.95 (easeInOut)
// Slight hue rotation: 0° → 15° (slow, subtle)
```

---

## 9. Photography & Illustration Style

### 9.1 Photography Lighting

- **Quality:** Soft, diffused natural light — never harsh flash or studio-lit
- **Mood:** Golden hour warmth or overcast-soft (no midday harsh shadows)
- **Colour temperature:** Warm (5500–6500K range)
- **Avoid:** High-contrast, dramatic shadows, neon-lit environments

### 9.2 Subject Matter

- Hands on steering wheel (close-up, soft background blur)
- Smartphone mounted on dashboard (lifestyle, road visible through windshield)
- Open roads with soft light — highways, tree-lined roads, gentle curves
- Abstract: blurred tail-lights at dusk, soft bokeh traffic
- **Avoid:** Accident scenes, aggressive driving, police confrontation imagery, night-only urban darkness

### 9.3 Composition Rules

- Rule of thirds — subject never centred unless intentional hero shot
- Generous breathing room in frame
- Road always visible — it is the product's context
- Human presence: hands or silhouette only — never full faces (privacy-consistent with product values)
- Aspect ratios: 16:9 for hero banners, 3:2 for cards, 1:1 for thumbnails

### 9.4 Colour Grading

All photography should be graded with:
- Lifted shadows (never true black in shadows)
- Slight warm tone in highlights (+8 warm)
- Reduced saturation in mid-tones (-10 to -15)
- Soft pink/lavender tint in highlights to echo brand palette
- Clarity: -5 (slightly soft, not sharp)

> **Goal:** Photography should feel like it could be from the same visual universe as the gradient UI — warm, soft, and slightly dreamy.

### 9.5 Illustration Style

- **Style:** Flat with soft gradient fills; no hard outlines
- **Shapes:** Rounded, organic — no sharp angles
- **Palette:** Uses brand primary palette directly
- **Use of glow:** Subtle radial glows behind focal elements
- **Characters:** Abstract/geometric — no realistic human faces
- **Usage:** Empty states, onboarding steps, error states

---

## 10. Tone of Voice

### 10.1 Brand Voice Dimensions

| Dimension | Description | Dial Setting |
|---|---|---|
| **Clarity** | Always direct; never jargon-heavy; technical terms explained simply | 9/10 |
| **Friendliness** | Warm without being childish; like a calm, smart companion | 8/10 |
| **Encouragement** | Acknowledges user actions positively; never preachy | 7/10 |
| **Trustworthiness** | Precise about what the AI can and cannot do; never overpromises | 10/10 |
| **Formality** | Semi-formal — professional but never cold; conversational but never flippant | 5/10 |
| **Urgency** | Used only when genuinely necessary (errors, safety-critical) | 2/10 |

### 10.2 Copy Examples

| Context | ✅ Good Copy | ❌ Bad Copy |
|---|---|---|
| App empty state | "No trips yet. Start your first trip and let Drishti-Path watch the road with you." | "No data found. Please record a trip to populate this screen." |
| AI flag notification | "Something caught our attention at 14:32. Take a look?" | "VIOLATION DETECTED at timestamp 14:32:08" |
| Upload in progress | "Your clips are on their way. We'll let you know when they're safe." | "Uploading files to server. Please wait." |
| Storage warning | "You're running a little low on space. Free up some room before your next trip." | "Error: Insufficient storage. Minimum 500MB required." |
| Trip complete | "That's a wrap on this trip. Review your moments below." | "Trip recording ended. Process clips to upload." |
| Voice mark confirmed | "Marked." | "Timestamp added successfully at current position." |
| Thermal warning | "Your phone needs a breather. We've slowed down AI analysis for now." | "Device temperature exceeded threshold. AI sampling rate reduced." |
| Upload complete | "All done. Your clips are safe and ready for review." | "Upload successful. 8 clips synced to server." |
| Error: upload failed | "Something interrupted your upload. We'll try again when you're back on WiFi." | "Error code 503. Upload failed. Retry?" |
| Onboarding CTA | "Let's set up your first trip." | "Begin configuration" |

### 10.3 Writing Rules

- Use **"your"** not **"the user's"** — always address the user directly
- Use **"we"** to refer to the app/system — it feels like a companion
- Avoid exclamation marks — the warmth comes from tone, not punctuation
- Never use passive voice in notifications or CTAs
- Numbers: write out one through nine; use numerals for 10+
- Time references: use natural language — "about 2 minutes" not "00:01:47 remaining"
- Error messages: always say what happened, then what to do — never just the error

---

## 11. Marketing Assets

### 11.1 App Icon

| Property | Spec |
|---|---|
| Shape | Rounded square (per platform guidelines) |
| Background | Radial gradient: `Blossom Pink #F4A7C3` (centre) → `Lavender Mist #C9B8F0` (edge) |
| Mark | Eye-road logo mark, white, centred, occupying 52% of icon area |
| Glow | Subtle inner glow on mark: `Glow Pink #FF79C6` at 40% opacity, 8dp blur |
| Sizes | 1024×1024 master; export at 48, 72, 96, 144, 192dp (Android); 1024px (iOS) |
| Dark mode | Same gradient — no dark mode variant (gradient works on any launcher) |

### 11.2 App Store Screenshots (Android — 6 screens)

| Screen # | Content | Headline Copy |
|---|---|---|
| 1 | Active Trip screen with orb animation | "Watch every road." |
| 2 | Trip Review screen with timeline markers | "Your moments, timestamped." |
| 3 | Voice mark animation mid-trip | "Just say 'mark'." |
| 4 | Clip list with confidence badges | "AI finds what matters." |
| 5 | Upload complete state | "Safe in the cloud." |
| 6 | Trip History screen | "Every trip, remembered." |

**Screenshot spec:**
- Dimensions: 1080×1920px (9:16)
- Device frame: Pixel 7 (graphite) or frameless
- Background: Soft gradient `Cloud White → Soft Beige` with faint pink orb bottom-right
- Headline font: Playfair Display 700, 36sp, `Ink #1A1917`
- Sub-copy: DM Sans 400, 16sp, `Charcoal #3D3A38`

### 11.3 Short Product Description

**App Store (80 characters):**
> `AI dashcam that flags lane violations and sends clips for review.`

**App Store (Short — 30 characters):**
> `Smart dashcam. Safer roads.`

**Full description (500 characters):**
> Drishti-Path turns your smartphone into a quiet, intelligent road companion. Mount your phone, tap Start, and drive — the app watches, flags suspicious lane changes, and saves short clips automatically.
>
> Use your voice to mark moments. Review clips after your trip. Everything syncs to a secure portal where trained reviewers assess violations before any action is taken.
>
> No judgement in the moment. Just clarity, later.

---