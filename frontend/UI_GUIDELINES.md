# AI Zen Garden - UI/UX Design Guidelines

## Overview
This document outlines the design system and UI/UX guidelines for the AI Zen Garden application. Follow these guidelines to maintain consistency across all components.

---

## Color Palette - Sunset Gradient Theme

### Primary Colors
- **Purple 600**: `#7c3aed` - Primary brand color
- **Purple 500**: `#a855f7` - Gradient middle
- **Pink 500**: `#ec4899` - Secondary accent
- **Purple 400**: `#c084fc` - Lighter accent

### Background Colors
- **Light Base**: `from-purple-50 via-pink-50 to-purple-100`
- **Card Background**: `bg-white/95` with `backdrop-blur-sm`
- **Decorative Blobs**: Purple/Pink gradients with blur and low opacity

### Semantic Colors
- **Success**: Green (`from-green-500 to-emerald-600`)
- **Error**: Red (`text-red-600`, `bg-red-500`)
- **Warning**: Yellow (`text-yellow-500`, `bg-yellow-500`)
- **Info**: Purple (primary color)

### Text Colors
- **Headings**: Gradient text `from-purple-600 via-purple-500 to-pink-500`
- **Body**: `text-foreground` (dark gray)
- **Muted**: `text-muted-foreground` (medium gray)
- **Links**: `text-purple-600 hover:text-pink-600`

---

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Text Sizes
- **Hero/Title**: `text-3xl sm:text-4xl` (30-36px)
- **Heading**: `text-2xl sm:text-3xl` (24-30px)
- **Subheading**: `text-xl` (20px)
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Extra Small**: `text-xs` (12px)

### Font Weights
- **Bold**: `font-bold` (700) - Main headings
- **Semibold**: `font-semibold` (600) - Subheadings, buttons
- **Medium**: `font-medium` (500) - Labels, emphasis
- **Regular**: `font-normal` (400) - Body text

### Gradient Text
```jsx
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500">
  Your Heading
</h1>
```

---

## Spacing System

### Padding/Margin Scale
- **xs**: `p-2` (8px)
- **sm**: `p-4` (16px)
- **md**: `p-6` (24px)
- **lg**: `p-8` (32px)
- **xl**: `p-10` (40px)
- **2xl**: `p-12` (48px)

### Component Spacing
- **Form spacing**: `space-y-5` (20px between form fields)
- **Section spacing**: `space-y-6` (24px between sections)
- **Card padding**: `px-6 sm:px-8` (responsive padding)

---

## Components

### Buttons

#### Primary Gradient Button
```jsx
<Button
  variant="gradient"
  className="w-full h-12 font-semibold text-base group"
>
  Button Text
  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
</Button>
```

**Styles**:
- Gradient: `from-purple-600 via-purple-500 to-pink-500`
- Shadow: `shadow-lg shadow-purple-500/50`
- Hover: Darker gradient
- Height: `h-12` (48px)
- Icon: Right arrow with hover animation

#### Outline Button
```jsx
<Button
  variant="outline"
  className="w-full h-12 gap-3 font-medium hover:bg-accent hover:border-purple-300"
>
  <Icon className="w-5 h-5" />
  Button Text
</Button>
```

**Styles**:
- Border: `border-input`
- Hover: `hover:bg-accent hover:border-purple-300`
- Icon spacing: `gap-3`

### Input Fields

```jsx
<div className="space-y-2">
  <Label htmlFor="field" className="text-sm font-medium flex items-center gap-2">
    <Icon className="w-4 h-4 text-purple-600" />
    Field Label
  </Label>
  <Input
    id="field"
    type="text"
    placeholder="Placeholder text"
    className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
  />
</div>
```

**Requirements**:
- Height: `h-12` (48px)
- Border: `border-purple-200`
- Focus states: Purple ring and border
- Icon in label: `w-4 h-4 text-purple-600`
- Smooth transitions: `transition-all duration-200`

### Cards

```jsx
<Card className="w-full max-w-md shadow-2xl border border-purple-100/50 backdrop-blur-sm bg-white/95 relative z-10">
  <CardHeader className="space-y-4 text-center pb-8 pt-10">
    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-2">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**Styles**:
- Shadow: `shadow-2xl`
- Border: `border-purple-100/50`
- Background: `bg-white/95 backdrop-blur-sm`
- Icon container: Gradient background with shadow
- Max width: `max-w-md` (448px)

### Alerts

```jsx
{error && (
  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

**Features**:
- Animation: Fade in and slide from top
- Icon: Always include relevant icon
- Variants: `default`, `destructive`

---

## Icons (Lucide React)

### Icon Sizes
- **Small**: `w-3 h-3` or `w-4 h-4` (12-16px) - Inline icons, indicators
- **Medium**: `w-5 h-5` (20px) - Buttons, labels
- **Large**: `w-8 h-8` (32px) - Hero icons, feature icons
- **XL**: `w-10 h-10` (40px) - Success states, major actions

### Common Icons
- **User**: Profile, account (User)
- **Mail**: Email fields (Mail)
- **Lock**: Password fields (Lock)
- **Sparkles**: Branding, AI features (Sparkles)
- **ArrowRight**: CTAs, navigation (ArrowRight)
- **Loader2**: Loading states (Loader2)
- **AlertCircle**: Errors, warnings (AlertCircle)
- **CheckCircle**: Success, validation (CheckCircle)
- **XCircle**: Errors, invalid states (XCircle)

### Icon Colors
- **Primary**: `text-purple-600`
- **Success**: `text-green-500`
- **Error**: `text-red-500`
- **Warning**: `text-yellow-500`
- **Muted**: `text-muted-foreground`

---

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Small devices (tablets) */
md: 768px   /* Medium devices (small laptops) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

### Responsive Patterns

#### Mobile First Approach
```jsx
<div className="p-4 sm:p-6 lg:p-8">
  {/* Padding: 16px mobile, 24px tablet, 32px desktop */}
</div>

<h1 className="text-3xl sm:text-4xl">
  {/* Font: 30px mobile, 36px tablet+ */}
</h1>
```

#### Container Widths
- **Full width mobile**: `w-full`
- **Max width constraint**: `max-w-md` (448px)
- **Responsive padding**: `px-6 sm:px-8`

#### Grid Layouts (for future use)
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Screen Size Testing
Test all components at:
- **Mobile**: 375px (iPhone SE)
- **Tablet**: 768px (iPad)
- **Half screen laptop**: 960px
- **Laptop**: 1440px
- **Desktop**: 1920px

---

## Animations

### Built-in Animations
```jsx
className="animate-in fade-in slide-in-from-top-2 duration-300"
className="animate-in zoom-in duration-500"
className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
```

### Custom Animations

#### Blob Animation
```jsx
<div className="animate-blob" />
```

**Keyframes**: Smooth floating/morphing effect

#### Loading Spinner
```jsx
<Loader2 className="w-5 h-5 animate-spin" />
```

#### Hover Transitions
```jsx
className="transition-all duration-200"
className="transition-colors duration-200"
className="transition-transform group-hover:translate-x-1"
```

### Animation Delays
```jsx
className="animation-delay-2000" // 2s delay
className="animation-delay-4000" // 4s delay
```

---

## Background Decorations

### Animated Blob Pattern
```jsx
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
</div>
```

**Features**:
- Multiple blobs with staggered animations
- Low opacity (20%) for subtle effect
- Blur filter for soft edges
- `mix-blend-multiply` for color blending
- `pointer-events-none` to prevent interaction

### Background Gradients
```jsx
className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100"
```

---

## Interactive States

### Focus States
```css
focus:border-purple-400
focus:ring-purple-400/20
focus-visible:outline-none
focus-visible:ring-1
focus-visible:ring-ring
```

### Hover States
```css
hover:bg-accent
hover:border-purple-300
hover:text-pink-600
group-hover:translate-x-1
```

### Disabled States
```css
disabled:pointer-events-none
disabled:opacity-50
```

### Loading States
```jsx
{loading ? (
  <>
    <Loader2 className="w-5 h-5 animate-spin" />
    Loading text...
  </>
) : (
  <>Normal content</>
)}
```

---

## Form Validation

### Password Strength Indicator
```jsx
<div className="flex gap-1">
  {[1, 2, 3, 4].map((level) => (
    <div
      key={level}
      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
        passwordStrength >= level
          ? passwordStrength <= 2
            ? 'bg-red-500'
            : passwordStrength === 3
            ? 'bg-yellow-500'
            : 'bg-green-500'
          : 'bg-gray-200'
      }`}
    />
  ))}
</div>
```

### Validation Feedback
```jsx
{confirmPassword && (
  <div className="flex items-center gap-2 text-xs">
    {password === confirmPassword ? (
      <>
        <CheckCircle className="w-3 h-3 text-green-500" />
        <span className="text-green-600">Passwords match</span>
      </>
    ) : (
      <>
        <XCircle className="w-3 h-3 text-red-500" />
        <span className="text-red-600">Passwords don't match</span>
      </>
    )}
  </div>
)}
```

---

## Accessibility

### ARIA Labels
- Always include proper labels for form fields
- Use semantic HTML elements
- Provide alt text for images and icons

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Proper focus indicators
- Logical tab order

### Color Contrast
- Ensure minimum 4.5:1 contrast ratio for text
- Test with accessibility tools
- Don't rely solely on color for information

---

## Best Practices

### Component Structure
1. **Import statements** - Organize by type (React, components, icons)
2. **State management** - useState hooks at the top
3. **Helper functions** - Place before render
4. **JSX structure** - Clean, readable hierarchy
5. **Styling** - Use Tailwind classes, avoid inline styles

### Naming Conventions
- **Components**: PascalCase (`LoginForm`, `UserProfile`)
- **Files**: PascalCase for components (`Login.tsx`)
- **CSS classes**: kebab-case for custom classes
- **Variables**: camelCase (`isLoading`, `userEmail`)

### Performance
- Use `transition-all` sparingly
- Prefer specific transition properties
- Optimize images and assets
- Lazy load components when appropriate

### Code Organization
```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── custom/       # Custom reusable components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── styles/           # Global styles
```

---

## Example: Complete Form Field

```jsx
<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
    <Mail className="w-4 h-4 text-purple-600" />
    Email Address
  </Label>
  <Input
    type="email"
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    placeholder="you@example.com"
    className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
  />
  {error && (
    <p className="text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {error}
    </p>
  )}
</div>
```

---

## Quick Reference

### Common Class Combinations

**Gradient Text**:
```
text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500
```

**Gradient Button**:
```
bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50
```

**Card Container**:
```
border border-purple-100/50 backdrop-blur-sm bg-white/95 shadow-2xl
```

**Input Field**:
```
h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200
```

**Icon Container**:
```
w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30
```

---

## Updates & Maintenance

This design system should be:
- **Reviewed regularly** - Update as the app evolves
- **Shared with team** - Ensure all developers follow guidelines
- **Documented changes** - Keep a changelog of major updates
- **Tested thoroughly** - Validate across devices and browsers

**Last Updated**: October 2025
**Version**: 1.0.0
