# Modern Color Palettes Reference

This document contains curated, production-ready color palettes for modern web applications.

## How to Use Color Palettes

Each palette includes:
- **Primary colors**: Main brand colors for buttons, links, CTAs
- **Secondary colors**: Supporting colors for accents and variety
- **Semantic colors**: Success, error, warning, info states
- **Neutral colors**: Backgrounds, text, borders
- **Gradient combinations**: Ready-to-use gradient formulas

## Premium Color Palettes

### 1. Sunset Gradient (Purple/Pink) - Creative & Modern
**Best for**: AI products, creative platforms, modern SaaS

**Primary Colors**:
```css
--primary-purple-600: #7c3aed;
--primary-purple-500: #a855f7;
--primary-pink-500: #ec4899;
--primary-purple-400: #c084fc;
```

**Gradients**:
```css
/* Text gradient */
background: linear-gradient(to right, #7c3aed, #a855f7, #ec4899);

/* Button gradient */
background: linear-gradient(to right, #7c3aed 0%, #a855f7 50%, #ec4899 100%);

/* Background gradient */
background: linear-gradient(to bottom right, #faf5ff, #fce7f3, #f3e8ff);
```

**Usage**:
- Buttons: Purple-to-pink gradient
- Text highlights: Gradient text clip
- Backgrounds: Soft purple-pink tints
- Icons: Purple-600 for consistency

### 2. Ocean Breeze (Blue/Cyan) - Professional & Trustworthy
**Best for**: Finance, SaaS, business applications

**Primary Colors**:
```css
--primary-blue-600: #0369a1;
--primary-blue-500: #0ea5e9;
--primary-cyan-500: #06b6d4;
--primary-blue-400: #38bdf8;
```

**Gradients**:
```css
/* Text gradient */
background: linear-gradient(to right, #0369a1, #0ea5e9, #06b6d4);

/* Button gradient */
background: linear-gradient(to right, #0369a1 0%, #0ea5e9 50%, #06b6d4 100%);

/* Background gradient */
background: linear-gradient(to bottom right, #ecfeff, #e0f2fe, #f0f9ff);
```

**Usage**:
- Professional, trustworthy appearance
- High contrast for readability
- Works well in corporate settings

### 3. Forest Zen (Green/Emerald) - Calm & Natural
**Best for**: Health, wellness, sustainability apps

**Primary Colors**:
```css
--primary-green-600: #059669;
--primary-green-500: #10b981;
--primary-emerald-500: #34d399;
--primary-teal-500: #14b8a6;
```

**Gradients**:
```css
/* Text gradient */
background: linear-gradient(to right, #059669, #10b981, #14b8a6);

/* Button gradient */
background: linear-gradient(to right, #059669 0%, #10b981 50%, #14b8a6 100%);

/* Background gradient */
background: linear-gradient(to bottom right, #ecfdf5, #d1fae5, #e0f2fe);
```

**Usage**:
- Calm, nature-inspired feel
- Excellent for health/wellness
- High readability on white

### 4. Midnight Professional (Slate/Blue) - Sophisticated & Modern
**Best for**: Fintech, professional tools, B2B platforms

**Primary Colors**:
```css
--primary-slate-800: #1e293b;
--primary-slate-700: #334155;
--primary-blue-500: #3b82f6;
--primary-blue-400: #60a5fa;
```

**Gradients**:
```css
/* Text gradient */
background: linear-gradient(to right, #1e293b, #3b82f6, #60a5fa);

/* Button gradient */
background: linear-gradient(to right, #1e293b 0%, #475569 50%, #3b82f6 100%);

/* Background gradient */
background: linear-gradient(to bottom right, #f8fafc, #e2e8f0, #e0f2fe);
```

**Usage**:
- Professional, enterprise feel
- Excellent contrast
- Works well for dashboards

### 5. Vibrant Coral (Orange/Red) - Energetic & Bold
**Best for**: Marketing, e-commerce, consumer apps

**Primary Colors**:
```css
--primary-orange-500: #f97316;
--primary-red-500: #ef4444;
--primary-pink-500: #ec4899;
--primary-orange-400: #fb923c;
```

**Gradients**:
```css
/* Text gradient */
background: linear-gradient(to right, #f97316, #ef4444, #ec4899);

/* Button gradient */
background: linear-gradient(to right, #f97316 0%, #ef4444 50%, #ec4899 100%);

/* Background gradient */
background: linear-gradient(to bottom right, #fff7ed, #fee2e2, #fef3f2);
```

**Usage**:
- High energy, attention-grabbing
- Great for CTAs and conversions
- Works well for marketing pages

### 6. Royal Indigo (Indigo/Purple) - Premium & Elegant
**Best for**: Luxury brands, premium services, exclusive platforms

**Primary Colors**:
```css
--primary-indigo-600: #4f46e5;
--primary-indigo-500: #6366f1;
--primary-purple-500: #a855f7;
--primary-violet-500: #8b5cf6;
```

**Gradients**:
```css
/* Text gradient */
background: linear-gradient(to right, #4f46e5, #8b5cf6, #a855f7);

/* Button gradient */
background: linear-gradient(to right, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%);

/* Background gradient */
background: linear-gradient(to bottom right, #eef2ff, #f5f3ff, #faf5ff);
```

**Usage**:
- Premium, elegant appearance
- Great for high-end products
- Excellent brand differentiation

## Semantic Colors (Universal)

Use these across all palettes for consistent meaning:

```css
/* Success */
--success-500: #10b981; /* Green */
--success-600: #059669;
--success-bg: #ecfdf5;

/* Error */
--error-500: #ef4444; /* Red */
--error-600: #dc2626;
--error-bg: #fef2f2;

/* Warning */
--warning-500: #f59e0b; /* Amber */
--warning-600: #d97706;
--warning-bg: #fffbeb;

/* Info */
--info-500: #3b82f6; /* Blue */
--info-600: #2563eb;
--info-bg: #eff6ff;
```

## Neutral Colors (Universal)

```css
/* Text */
--text-primary: #0f172a;     /* slate-900 */
--text-secondary: #475569;   /* slate-600 */
--text-muted: #64748b;       /* slate-500 */
--text-disabled: #94a3b8;    /* slate-400 */

/* Backgrounds */
--bg-primary: #ffffff;       /* white */
--bg-secondary: #f8fafc;     /* slate-50 */
--bg-tertiary: #f1f5f9;      /* slate-100 */
--bg-accent: #e2e8f0;        /* slate-200 */

/* Borders */
--border-light: #e2e8f0;     /* slate-200 */
--border-medium: #cbd5e1;    /* slate-300 */
--border-dark: #94a3b8;      /* slate-400 */
```

## Implementation Guide

### Tailwind CSS Variables (Recommended)

```css
:root {
  /* Primary colors - choose one palette */
  --primary: oklch(0.55 0.25 290);      /* Purple-600 */
  --primary-foreground: oklch(1 0 0);   /* White */

  --secondary: oklch(0.65 0.24 350);    /* Pink-500 */
  --secondary-foreground: oklch(1 0 0); /* White */

  /* Semantic colors */
  --success: oklch(0.65 0.18 156);
  --error: oklch(0.577 0.245 27.325);
  --warning: oklch(0.74 0.19 75);
  --info: oklch(0.60 0.18 240);

  /* Neutral colors */
  --background: oklch(0.99 0.005 300);
  --foreground: oklch(0.15 0.01 300);
  --muted: oklch(0.96 0.005 300);
  --muted-foreground: oklch(0.50 0.01 300);
  --border: oklch(0.90 0.01 300);
}
```

### Direct Tailwind Classes

```jsx
/* Gradient text */
className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500"

/* Gradient button */
className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600"

/* Gradient background */
className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100"
```

## Dark Mode Variants

For each palette, adjust for dark mode:

```css
.dark {
  --primary: oklch(0.65 0.25 290);      /* Lighter in dark mode */
  --background: oklch(0.145 0 0);       /* Dark background */
  --foreground: oklch(0.985 0 0);       /* Light text */
  --muted: oklch(0.269 0 0);            /* Darker muted */
  --border: oklch(1 0 0 / 10%);         /* Subtle borders */
}
```

## Accessibility Guidelines

### Contrast Ratios (WCAG AA)
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 3:1 contrast ratio

### Testing Colors
Always test color combinations:
- Use tools like WebAIM Contrast Checker
- Verify in both light and dark modes
- Test with color blindness simulators

### Safe Combinations
```css
/* High contrast (AAA) */
Purple-600 (#7c3aed) on white: 7.2:1 ✓
Slate-900 (#0f172a) on white: 18.5:1 ✓

/* Medium contrast (AA) */
Purple-500 (#a855f7) on white: 4.8:1 ✓
Blue-500 (#3b82f6) on white: 5.9:1 ✓

/* Low contrast (Fails) */
Purple-200 (#e9d5ff) on white: 1.4:1 ✗
Pink-100 (#fce7f3) on white: 1.1:1 ✗
```

## Color Psychology

### Purple
- **Emotions**: Creativity, luxury, wisdom, spirituality
- **Use for**: Premium brands, creative tools, AI/tech products
- **Avoid**: Children's apps (too mature), food (appetite suppressant)

### Blue
- **Emotions**: Trust, stability, professionalism, calm
- **Use for**: Finance, healthcare, corporate, productivity
- **Avoid**: Food (except water), entertainment (too conservative)

### Green
- **Emotions**: Growth, health, nature, harmony
- **Use for**: Health, sustainability, finance (money), eco-friendly
- **Avoid**: Luxury (too casual), tech (too organic)

### Orange/Red
- **Emotions**: Energy, urgency, excitement, passion
- **Use for**: E-commerce, marketing, entertainment, food
- **Avoid**: Healthcare (too aggressive), corporate (too casual)

## Quick Selection Guide

**Choose a palette based on:**

| Project Type | Recommended Palette | Reason |
|--------------|-------------------|---------|
| AI/ML Product | Sunset Gradient | Modern, innovative feel |
| SaaS Platform | Ocean Breeze | Professional, trustworthy |
| Health/Wellness | Forest Zen | Calm, natural association |
| Fintech | Midnight Professional | Sophisticated, secure |
| E-commerce | Vibrant Coral | Energetic, conversion-focused |
| Premium Service | Royal Indigo | Elegant, exclusive |
| Corporate | Ocean Breeze | Professional, safe choice |
| Creative Tool | Sunset Gradient | Inspiring, modern |
| Social Platform | Royal Indigo | Engaging, friendly |
| Education | Ocean Breeze or Forest Zen | Trustworthy, calm |
