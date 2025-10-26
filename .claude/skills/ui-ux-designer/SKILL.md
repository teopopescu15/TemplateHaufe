---
name: ui-ux-designer
description: |
  Expert UI/UX designer for implementing modern, responsive web applications using shadcn/ui components, Tailwind CSS, and Lucide icons. This skill should be used when users request UI/UX improvements, design system implementation, responsive layouts, color palette selection, or modern component design. Automatically activates for tasks involving "design", "UI", "UX", "responsive", "shadcn", "components", "color palette", or "icons".
---

# UI/UX Designer Skill

## Overview

Transform any web application into a modern, beautiful, fully responsive experience using **shadcn/ui components via MCP server**, professional color palettes, and best-practice design patterns. This skill provides comprehensive guidance for implementing production-ready UI/UX across all device sizes with consistent, accessible design.

**Key Feature**: Integrated with **shadcn MCP server** (`@magnusrodseth/shadcn-mcp-server`) for intelligent, on-demand component generation without manual CLI commands.

## When to Use This Skill

Activate this skill when the user requests:
- **UI/UX improvements** or redesigns
- **Responsive design** implementation (mobile, tablet, laptop, desktop)
- **Color palette** selection and implementation
- **shadcn/ui components** integration
- **Icon** implementation with Lucide React
- **Modern design** patterns and best practices
- **Design system** creation or updates
- **Accessibility** improvements
- **Component library** setup

## MCP Integration

This skill is **MCP-powered** for seamless shadcn/ui component generation.

### shadcn MCP Server

**Server**: `@magnusrodseth/shadcn-mcp-server` (v1.1.2)
**Status**: ✅ Active and integrated

**What the MCP Provides**:
- **50+ Components**: Button, Input, Card, Dialog, Table, Chart, and more
- **Intelligent Generation**: Complete TypeScript components with proper types
- **Auto-Styling**: Tailwind CSS classes and CSS variables integrated
- **Accessibility**: ARIA attributes and keyboard navigation built-in
- **Dependencies**: Automatic Radix UI primitives and utility imports
- **Consistency**: All components follow shadcn/ui design system

**How to Use MCP**:
1. **Request a component**: "Generate shadcn Button component"
2. **MCP generates code**: Complete component with all features
3. **Customize**: Add project-specific colors, gradients, animations
4. **Integrate**: Import and use in your pages

**MCP vs. Manual CLI**:

| Feature | MCP Server ✅ | Manual CLI |
|---------|--------------|------------|
| Speed | Instant | Requires npm install |
| Context-Aware | Yes | No |
| Customization | Immediate | Manual edits |
| Documentation | Built-in | External docs |
| Dependencies | Automatic | Manual tracking |
| Updates | Always current | Manual updates |

**Component Categories Available via MCP**:

**Interactive Components**:
- Button, Dialog, Command, Dropdown Menu, Context Menu, Alert Dialog

**Form Components**:
- Input, Textarea, Select, Checkbox, Radio Group, Switch, Form, Label, Slider, Toggle

**Layout Components**:
- Card, Sheet, Sidebar, Resizable, Separator, Aspect Ratio, Scroll Area

**Navigation Components**:
- Navigation Menu, Breadcrumb, Pagination, Tabs, Menubar

**Feedback Components**:
- Alert, Toast, Toaster, Progress, Skeleton, Badge, Avatar

**Data Components**:
- Table, Chart, Calendar, Carousel, Accordion, Collapsible

**Overlay Components**:
- Popover, Tooltip, Hover Card, Drawer

**Advanced Components**:
- Input OTP, Toggle Group, Sonner (notifications)

**MCP Workflow in This Skill**:

```
1. User requests UI improvement
   ↓
2. Skill identifies needed components
   ↓
3. Request from shadcn MCP: "Generate [component]"
   ↓
4. MCP returns complete component code
   ↓
5. Customize with color palette & styling
   ↓
6. Integrate into user's project
   ↓
7. Test & validate
```

**Error Handling**:
- If MCP unavailable → Fall back to manual CLI commands
- If component not found → Use references/shadcn_components.md
- If generation fails → Provide manual component code

## Quick Start Workflow

### Step 1: Understand the Project

Before making any changes, analyze the current project:

1. **Identify the framework**:
   - Check `package.json` for React, Vue, Angular, etc.
   - Note build tool (Vite, Next.js, Create React App)
   - Verify Tailwind CSS is installed

2. **Assess current state**:
   - Read existing component files
   - Note current styling approach
   - Check for existing component library
   - Identify pages needing redesign

3. **Gather requirements**:
   - Which pages/components to redesign?
   - Target devices (mobile, tablet, laptop, desktop)?
   - Preferred color scheme or brand guidelines?
   - Any specific design inspirations?

### Step 2: Choose a Color Palette

**Consult `references/color_palettes.md` for detailed palettes.**

Present 3-4 palette options to the user:

1. **Sunset Gradient** (Purple/Pink) - Creative, modern, AI-focused
2. **Ocean Breeze** (Blue/Cyan) - Professional, trustworthy, business
3. **Forest Zen** (Green/Emerald) - Calm, natural, wellness
4. **Midnight Professional** (Slate/Blue) - Sophisticated, enterprise

Each palette includes:
- Primary/secondary colors
- Gradient combinations
- Semantic colors (success, error, warning, info)
- Dark mode variants
- Accessibility-tested contrast ratios

### Step 3: Setup shadcn/ui with MCP

**IMPORTANT**: This skill uses the **shadcn MCP server** for intelligent component generation.

The shadcn MCP server (`@magnusrodseth/shadcn-mcp-server`) provides:
- **50+ shadcn/ui components** available on demand
- **Intelligent component generation** with proper dependencies
- **Automatic styling** with Tailwind CSS integration
- **Type-safe** TypeScript components
- **Accessibility** built-in with ARIA attributes

**MCP Integration**:
When you need a shadcn component, the MCP server will:
1. Generate the complete component code
2. Include all necessary dependencies
3. Apply proper Tailwind styling
4. Ensure TypeScript compatibility
5. Add accessibility features

**Available Components** (use MCP to generate):
- **Interactive**: Button, Dialog, Command, Dropdown Menu, Alert Dialog
- **Form**: Input, Textarea, Select, Checkbox, Radio Group, Switch, Form, Label
- **Layout**: Card, Sheet, Sidebar, Resizable, Separator, Scroll Area
- **Navigation**: Navigation Menu, Breadcrumb, Pagination, Tabs
- **Feedback**: Alert, Toast, Progress, Skeleton, Badge
- **Data**: Table, Chart, Calendar, Carousel, Accordion
- **Overlays**: Popover, Tooltip, Hover Card, Drawer

**Manual Fallback** (if MCP unavailable):
```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add essential components
npx shadcn@latest add button input label card alert separator
```

Configure `components.json`:
- Style: "new-york" (modern)
- Icon library: "lucide"
- CSS variables: true

### Step 4: Implement Color Palette

Update `src/index.css` or equivalent with chosen palette:

```css
:root {
  /* Example: Sunset Gradient palette */
  --radius: 0.75rem;

  /* Primary colors */
  --primary: oklch(0.55 0.25 290);  /* Purple */
  --primary-foreground: oklch(1 0 0);

  /* Secondary colors */
  --secondary: oklch(0.65 0.24 350);  /* Pink */
  --secondary-foreground: oklch(1 0 0);

  /* ... other colors */
}
```

Add custom button variants if needed:
```tsx
// In button.tsx
gradient: "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50",
```

### Step 5: Design Responsive Components

**Consult `references/responsive_design.md` for comprehensive patterns.**

Use mobile-first approach:

```jsx
{/* Start with mobile, scale up */}
<div className="p-4 sm:p-6 lg:p-8">
  <h1 className="text-3xl sm:text-4xl lg:text-5xl">
    Responsive Title
  </h1>
</div>
```

Test at all breakpoints:
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Half-screen laptop: 960px
- Laptop: 1280px (MacBook Air)
- Desktop: 1920px

### Step 6: Implement Components with MCP

**PRIMARY METHOD**: Use the shadcn MCP server to generate components.

**MCP Workflow**:
1. **Request component**: "I need a Button component with gradient variant"
2. **MCP generates**: Complete TypeScript component with all features
3. **Review & customize**: Add project-specific styling (gradients, colors)
4. **Integrate**: Use in your pages with proper imports

**MCP Advantages**:
- ✅ Always up-to-date component code
- ✅ Proper TypeScript types
- ✅ Accessibility built-in
- ✅ Tailwind CSS integrated
- ✅ No manual CLI commands needed

**Component Generation Examples**:

**Generate Button Component**:
Request from MCP: "Generate shadcn Button component"
Then customize with gradient variant:
```tsx
// Add to button.tsx after MCP generation
gradient: "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50",
```

**Generate Input Component**:
Request from MCP: "Generate shadcn Input component"
Use with custom styling:
```tsx
<Input className="h-12 border-purple-200 focus:border-purple-400" />
```

**Generate Card Component**:
Request from MCP: "Generate shadcn Card component"
Apply modern styling:
```tsx
<Card className="border border-purple-100/50 backdrop-blur-sm bg-white/95 shadow-2xl" />
```

**Fallback**: If MCP unavailable, consult `references/shadcn_components.md` for manual implementation.

**Common Patterns**:

**Form Fields**:
```jsx
<div className="space-y-2">
  <Label htmlFor="email" className="flex items-center gap-2">
    <Mail className="w-4 h-4 text-purple-600" />
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    className="h-12 border-purple-200 focus:border-purple-400"
    placeholder="you@example.com"
  />
</div>
```

**Buttons**:
```jsx
<Button variant="gradient" className="w-full h-12 group">
  Submit
  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
</Button>
```

**Cards**:
```jsx
<Card className="border border-purple-100/50 backdrop-blur-sm bg-white/95 shadow-2xl">
  <CardHeader className="text-center">
    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center">
      <Sparkles className="w-8 h-8 text-white" />
    </div>
    <CardTitle>Modern Card</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Step 7: Add Animations

Add to `tailwind.config.js`:

```js
theme: {
  extend: {
    animation: {
      'blob': 'blob 7s infinite',
    },
    keyframes: {
      blob: {
        '0%': { transform: 'translate(0px, 0px) scale(1)' },
        '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
        '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        '100%': { transform: 'translate(0px, 0px) scale(1)' },
      },
    },
  },
}
```

Add animation delays to CSS:

```css
@layer utilities {
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
}
```

Use in components:

```jsx
{/* Animated background blobs */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
</div>
```

### Step 8: Validate & Test

1. **Responsive testing**:
   - Test on all breakpoints
   - Verify touch targets (minimum 44x44px)
   - Check text readability

2. **Accessibility**:
   - Verify color contrast (4.5:1 minimum)
   - Test keyboard navigation
   - Check screen reader support

3. **Performance**:
   - Optimize images
   - Minimize animations
   - Check bundle size

4. **Browser testing**:
   - Chrome, Safari, Firefox, Edge
   - Mobile browsers

## Design Patterns Library

### Authentication Pages

```jsx
<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4 sm:p-6 lg:p-8">
  {/* Decorative background */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
  </div>

  <Card className="w-full max-w-md border border-purple-100/50 backdrop-blur-sm bg-white/95 shadow-2xl relative z-10">
    <CardHeader className="space-y-4 text-center pb-8 pt-10">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <CardTitle className="text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500">
        Welcome Back
      </CardTitle>
      <CardDescription>Login to continue your journey</CardDescription>
    </CardHeader>

    <CardContent className="px-6 sm:px-8 pb-8">
      {/* Form fields here */}
    </CardContent>
  </Card>
</div>
```

### Dashboard Layout

```jsx
<div className="min-h-screen bg-gray-50">
  <header className="sticky top-0 z-50 bg-white border-b h-16">
    {/* Navigation */}
  </header>

  <div className="flex">
    <aside className="hidden md:block w-60 lg:w-72 border-r bg-white min-h-screen">
      {/* Sidebar */}
    </aside>

    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Content */}
      </div>
    </main>
  </div>
</div>
```

### Form Validation

```jsx
{/* Password strength indicator */}
<div className="flex gap-1">
  {[1, 2, 3, 4].map((level) => (
    <div
      key={level}
      className={`h-1.5 flex-1 rounded-full transition-all ${
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

{/* Password match validation */}
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

## Best Practices

### 1. Mobile-First Design

Always start with mobile and scale up:

```jsx
{/* ✓ GOOD */}
<div className="text-base sm:text-lg lg:text-xl">

{/* ✗ BAD */}
<div className="text-xl lg:text-lg sm:text-base">
```

### 2. Consistent Spacing

Use Tailwind's spacing scale consistently:

```jsx
{/* Forms */}
space-y-4 sm:space-y-5    // Between fields
space-y-6 sm:space-y-8    // Between sections

{/* Pages */}
p-4 sm:p-6 lg:p-8         // Container padding
py-8 sm:py-12 lg:py-16    // Section padding
```

### 3. Touch Targets

Minimum 44x44px for mobile interactions:

```jsx
<Button className="h-11 px-4 sm:h-12 sm:px-6">  {/* 44px+ */}
  Click Me
</Button>
```

### 4. Color Contrast

Ensure WCAG AA compliance (4.5:1 ratio):

```jsx
{/* High contrast combinations */}
- Purple-600 on white: 7.2:1 ✓
- Slate-900 on white: 18.5:1 ✓

{/* Test with tools like WebAIM Contrast Checker */}
```

### 5. Loading States

Always provide feedback:

```jsx
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Loading...
    </>
  ) : (
    <>Submit</>
  )}
</Button>
```

### 6. Error Handling

Clear, helpful error messages:

```jsx
{error && (
  <Alert variant="destructive" className="animate-in fade-in">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}
```

## Resources

### Reference Files

This skill includes three comprehensive reference documents:

1. **`references/color_palettes.md`**
   - 6 professional color palettes with complete specifications
   - Gradient combinations and usage guidelines
   - Semantic color definitions
   - Dark mode variants
   - Accessibility testing and contrast ratios
   - Color psychology and selection guide

2. **`references/responsive_design.md`**
   - Complete breakpoint system
   - Device size references
   - Responsive layout patterns (grid, flexbox, container)
   - Typography and spacing scaling
   - Component patterns (cards, forms, buttons, navigation)
   - Testing checklist
   - Common pattern library

3. **`references/shadcn_components.md`**
   - Installation and setup instructions
   - Complete component reference (Button, Input, Card, Alert, etc.)
   - Lucide React icon library
   - Form patterns with validation
   - Advanced components (Dialog, Tabs, Dropdown)
   - Customization examples
   - Best practices and accessibility

### When to Consult References

- **Color Palettes**: When selecting colors, implementing themes, or ensuring accessibility
- **Responsive Design**: When creating layouts, testing across devices, or implementing breakpoints
- **shadcn Components**: When implementing specific components, adding icons, or customizing styles

## Deliverables

After completing a UI/UX design task, provide:

1. **Updated Components**
   - All redesigned page/component files
   - New shadcn/ui components added
   - Icon imports and usage

2. **Configuration Files**
   - Updated `tailwind.config.js` with animations
   - Updated `src/index.css` with color palette
   - Updated `components.json` if needed

3. **Documentation**
   - UI guidelines document (optional, recommended for teams)
   - Color palette reference
   - Component usage examples
   - Responsive breakpoint guide

4. **Testing Notes**
   - Devices/sizes tested
   - Browser compatibility
   - Accessibility validation results

## Common Tasks

### Redesign Authentication Pages

1. Choose color palette
2. Install shadcn components (Button, Input, Label, Card, Alert, Separator)
3. Add Lucide icons (Mail, Lock, User, Sparkles, ArrowRight, Loader2)
4. Implement animated background
5. Create responsive form layout
6. Add validation feedback
7. Test across devices

### Create Dashboard

1. Implement responsive layout (sidebar + main content)
2. Add navigation header
3. Create stat cards with gradients
4. Implement data tables
5. Add responsive charts
6. Test collapsing sidebar on mobile

### Build Form with Validation

1. Install form components
2. Add icon-labeled inputs
3. Implement real-time validation
4. Add password strength indicator
5. Show success/error states
6. Ensure accessibility

## Troubleshooting

### shadcn/ui not installing

```bash
# Check Node version (14.18+  required)
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npx shadcn@latest init
```

### Tailwind classes not applying

- Check `tailwind.config.js` content paths include all files
- Verify PostCSS is configured
- Restart development server
- Check for typos in class names

### Icons not showing

```bash
# Ensure lucide-react is installed
npm install lucide-react

# Check import syntax
import { Mail } from "lucide-react";  // ✓ Correct
import Mail from "lucide-react";      // ✗ Wrong
```

### Colors not matching

- Verify CSS variables are defined in `:root`
- Check OKLCH syntax is correct
- Ensure theme system is consistent
- Test in both light and dark modes

## Example: Complete Login Page

See the user's current implementation in `/mnt/c/Users/Teo/Desktop/TemplateHaufe/frontend/src/pages/Login.tsx` for a production-ready example featuring:

- Sunset Gradient color palette
- Animated background blobs
- Gradient icon container
- Responsive form layout
- Icon-labeled inputs
- Loading states with spinner
- Error handling with animations
- Full responsiveness (mobile → desktop)
- Glassmorphism card effect
- Hover animations

This serves as a template for other pages in the application.

---

Use this skill to create beautiful, modern, production-ready UI/UX that delights users across all devices!
