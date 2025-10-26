# Responsive Design Reference

Comprehensive guide for creating fully responsive layouts that work perfectly across all devices.

## Device Breakpoints

### Standard Tailwind Breakpoints

```css
/* Mobile First Approach (Recommended) */
DEFAULT:  0px - 639px   /* Mobile phones */
sm:      640px+         /* Large phones, small tablets */
md:      768px+         /* Tablets, small laptops */
lg:      1024px+        /* Laptops, desktops */
xl:      1280px+        /* Large desktops */
2xl:     1536px+        /* Extra large screens */
```

### Common Device Sizes

```
Mobile Phones:
- iPhone SE: 375px
- iPhone 12/13: 390px
- iPhone 12/13 Pro Max: 428px
- Samsung Galaxy S21: 360px
- Standard mobile: 320px - 480px

Tablets:
- iPad Mini: 768px
- iPad: 810px
- iPad Pro: 1024px
- Standard tablet: 768px - 1024px

Laptops:
- MacBook Air: 1280px
- Standard laptop: 1366px
- MacBook Pro 14": 1512px
- Half-screen laptop: 960px - 1200px

Desktops:
- Standard desktop: 1920px
- 4K displays: 2560px+
```

## Responsive Layout Patterns

### 1. Container Pattern

```jsx
{/* Full-width mobile, max-width constraint desktop */}
<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="max-w-md mx-auto lg:max-w-none">
    Content
  </div>
</div>

{/* Common max-widths */}
max-w-sm   /* 384px  - Small forms */
max-w-md   /* 448px  - Auth forms, modals */
max-w-lg   /* 512px  - Content cards */
max-w-xl   /* 576px  - Article content */
max-w-2xl  /* 672px  - Wide content */
max-w-4xl  /* 896px  - Full-width content */
max-w-7xl  /* 1280px - Page container */
```

### 2. Grid Patterns

```jsx
{/* Responsive grid: 1 → 2 → 3 columns */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

{/* Auto-fit grid (fluid columns) */}
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
  <div>Fluid Item</div>
</div>

{/* Asymmetric grid (sidebar + content) */}
<div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
  <aside>Sidebar</aside>
  <main>Content</main>
</div>
```

### 3. Flexbox Patterns

```jsx
{/* Stack mobile, horizontal desktop */}
<div className="flex flex-col lg:flex-row gap-4">
  <div className="flex-1">Left</div>
  <div className="flex-1">Right</div>
</div>

{/* Responsive spacing */}
<div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
  <span>Label</span>
  <span>Value</span>
</div>

{/* Wrap pattern */}
<div className="flex flex-wrap gap-2 md:gap-3">
  <button>Tag 1</button>
  <button>Tag 2</button>
</div>
```

## Typography Scaling

### Responsive Text Sizes

```jsx
{/* Hero heading */}
<h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
  Hero Title
</h1>

{/* Page heading */}
<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Page Title
</h2>

{/* Section heading */}
<h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
  Section Title
</h3>

{/* Body text */}
<p className="text-sm sm:text-base lg:text-lg">
  Body content
</p>

{/* Small text */}
<span className="text-xs sm:text-sm">
  Caption or label
</span>
```

### Line Height Scaling

```jsx
{/* Tighter line-height for headings on mobile */}
<h1 className="leading-tight sm:leading-snug lg:leading-normal">
  Multi-line Heading
</h1>

{/* More comfortable reading on desktop */}
<p className="leading-relaxed lg:leading-loose">
  Long paragraph content
</p>
```

## Spacing System

### Responsive Padding

```jsx
{/* Page padding */}
<div className="p-4 sm:p-6 lg:p-8 xl:p-10">
  Content
</div>

{/* Section spacing */}
<section className="py-8 sm:py-12 lg:py-16">
  Section
</section>

{/* Component padding */}
<div className="px-4 sm:px-6 lg:px-8">
  Content
</div>
```

### Responsive Margins

```jsx
{/* Vertical spacing */}
<div className="mb-6 sm:mb-8 lg:mb-12">
  Section
</div>

{/* Gap between elements */}
<div className="space-y-4 sm:space-y-6 lg:space-y-8">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Component Patterns

### Responsive Cards

```jsx
<div className="w-full max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
  <Card className="p-4 sm:p-6 lg:p-8">
    <CardHeader className="space-y-3 sm:space-y-4">
      <CardTitle className="text-2xl sm:text-3xl">Title</CardTitle>
      <CardDescription className="text-sm sm:text-base">
        Description
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4 sm:space-y-6">
      Content
    </CardContent>
  </Card>
</div>
```

### Responsive Forms

```jsx
{/* Form container */}
<form className="w-full max-w-md mx-auto space-y-4 sm:space-y-6">
  {/* Input field */}
  <div className="space-y-2">
    <Label className="text-sm sm:text-base">Label</Label>
    <Input className="h-10 sm:h-12 text-sm sm:text-base" />
  </div>

  {/* Button */}
  <Button className="w-full h-10 sm:h-12 text-sm sm:text-base">
    Submit
  </Button>
</form>

{/* Multi-column form (desktop only) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
  <div>
    <Label>First Name</Label>
    <Input />
  </div>
  <div>
    <Label>Last Name</Label>
    <Input />
  </div>
</div>
```

### Responsive Buttons

```jsx
{/* Full-width mobile, auto desktop */}
<Button className="w-full sm:w-auto px-4 sm:px-6 h-10 sm:h-12">
  Click Me
</Button>

{/* Icon + text (hide text on mobile) */}
<Button className="gap-2">
  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
  <span className="hidden sm:inline">Click Me</span>
</Button>

{/* Responsive sizing */}
<Button size="sm" className="sm:size-default lg:size-lg">
  Adaptive Size
</Button>
```

### Responsive Navigation

```jsx
{/* Mobile: Hamburger, Desktop: Horizontal */}
<nav className="flex items-center justify-between">
  {/* Logo */}
  <div className="text-lg sm:text-xl font-bold">Logo</div>

  {/* Desktop menu */}
  <div className="hidden md:flex items-center gap-4 lg:gap-6">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </div>

  {/* Mobile menu button */}
  <button className="md:hidden">
    <Menu className="w-6 h-6" />
  </button>
</nav>
```

### Responsive Images

```jsx
{/* Responsive aspect ratio */}
<div className="aspect-video sm:aspect-[4/3] lg:aspect-[16/9]">
  <img src="..." alt="..." className="w-full h-full object-cover" />
</div>

{/* Responsive sizing */}
<img
  src="..."
  alt="..."
  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full"
/>

{/* Picture element for different images */}
<picture>
  <source media="(min-width: 1024px)" srcSet="desktop.jpg" />
  <source media="(min-width: 768px)" srcSet="tablet.jpg" />
  <img src="mobile.jpg" alt="..." className="w-full" />
</picture>
```

## Mobile-First Best Practices

### 1. Start with Mobile

```jsx
{/* ✓ GOOD: Mobile first, scale up */}
<div className="text-base sm:text-lg lg:text-xl">
  Content
</div>

{/* ✗ BAD: Desktop first, scale down */}
<div className="text-xl lg:text-lg sm:text-base">
  Content
</div>
```

### 2. Touch Targets

```jsx
{/* Minimum 44x44px for touch */}
<button className="h-11 px-4 sm:h-12 sm:px-6">
  Tap Me
</button>

{/* Interactive elements */}
<a className="inline-block min-h-[44px] min-w-[44px] flex items-center justify-center">
  Link
</a>
```

### 3. Readable Text

```jsx
{/* Never smaller than 16px on mobile (prevents zoom) */}
<input
  className="text-base"  {/* 16px minimum */}
  placeholder="Email"
/>

{/* Comfortable line length */}
<p className="max-w-prose">  {/* ~65 characters */}
  Long paragraph text
</p>
```

### 4. Scroll Performance

```jsx
{/* Fixed positioning (careful with mobile) */}
<header className="sticky top-0 z-50 bg-white">
  Navigation
</header>

{/* Avoid horizontal scroll */}
<div className="max-w-full overflow-x-auto">
  <table className="min-w-full">
    Table
  </table>
</div>
```

## Testing Checklist

### Device Testing

```
☐ iPhone SE (375px) - Smallest modern phone
☐ iPhone 12 (390px) - Common phone size
☐ iPad (810px) - Common tablet
☐ Laptop half-screen (960px) - Split screen work
☐ MacBook Air (1280px) - Common laptop
☐ Desktop (1920px) - Common desktop
```

### Orientation Testing

```
☐ Portrait mobile (375 x 667)
☐ Landscape mobile (667 x 375)
☐ Portrait tablet (810 x 1080)
☐ Landscape tablet (1080 x 810)
```

### Browser Testing

```
☐ Chrome (DevTools responsive mode)
☐ Safari (iOS simulator)
☐ Firefox (Responsive Design Mode)
☐ Edge (Device emulation)
```

## Common Patterns Library

### Authentication Forms

```jsx
<div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
  <Card className="w-full max-w-md">
    <CardHeader className="space-y-4 text-center pb-8 pt-8 sm:pt-10">
      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center">
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>
      <CardTitle className="text-2xl sm:text-3xl lg:text-4xl">
        Welcome Back
      </CardTitle>
      <CardDescription className="text-sm sm:text-base">
        Login to continue
      </CardDescription>
    </CardHeader>
    <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
      <form className="space-y-4 sm:space-y-5">
        <Input className="h-10 sm:h-12" placeholder="Email" />
        <Input className="h-10 sm:h-12" type="password" placeholder="Password" />
        <Button className="w-full h-10 sm:h-12 text-sm sm:text-base">
          Login
        </Button>
      </form>
    </CardContent>
  </Card>
</div>
```

### Dashboard Layout

```jsx
<div className="min-h-screen bg-gray-50">
  {/* Header */}
  <header className="sticky top-0 z-50 bg-white border-b h-14 sm:h-16 px-4 sm:px-6">
    <div className="flex items-center justify-between h-full">
      <h1 className="text-lg sm:text-xl font-bold">Dashboard</h1>
      <button className="md:hidden">
        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  </header>

  <div className="flex">
    {/* Sidebar */}
    <aside className="hidden md:block w-60 lg:w-72 border-r bg-white min-h-screen p-4 lg:p-6">
      Sidebar
    </aside>

    {/* Main content */}
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-4 sm:p-6">Stat 1</Card>
          <Card className="p-4 sm:p-6">Stat 2</Card>
          <Card className="p-4 sm:p-6">Stat 3</Card>
          <Card className="p-4 sm:p-6">Stat 4</Card>
        </div>
      </div>
    </main>
  </div>
</div>
```

### Content Page

```jsx
<div className="min-h-screen bg-white">
  <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
    {/* Hero */}
    <header className="mb-8 sm:mb-12 lg:mb-16">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
        Article Title
      </h1>
      <p className="text-base sm:text-lg text-gray-600">
        Subtitle or description
      </p>
    </header>

    {/* Content */}
    <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
      <p className="text-sm sm:text-base lg:text-lg leading-relaxed">
        Article content with comfortable reading width and spacing.
      </p>
    </div>
  </article>
</div>
```

## Performance Optimization

### Image Optimization

```jsx
{/* Use next/image or similar for automatic optimization */}
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="w-full h-auto"
/>

{/* Lazy loading */}
<img
  src="image.jpg"
  alt="Description"
  loading="lazy"
  className="w-full"
/>
```

### Code Splitting

```jsx
{/* Lazy load heavy components */}
const HeavyComponent = lazy(() => import('./HeavyComponent'));

{/* Conditional loading for mobile */}
const isMobile = useMediaQuery('(max-width: 768px)');
{isMobile ? <MobileView /> : <DesktopView />}
```

## Accessibility

### Screen Reader Support

```jsx
{/* Hide visually, keep for screen readers */}
<span className="sr-only">Skip to content</span>

{/* Responsive aria labels */}
<button aria-label="Menu">
  <Menu className="w-6 h-6 sm:hidden" />
  <span className="hidden sm:inline">Menu</span>
</button>
```

### Focus Management

```jsx
{/* Visible focus states */}
<button className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
  Click Me
</button>

{/* Skip to content */}
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to main content
</a>
```

## Quick Reference

### Common Responsive Patterns

```jsx
/* Text sizing */
text-sm sm:text-base lg:text-lg

/* Spacing */
p-4 sm:p-6 lg:p-8
gap-4 sm:gap-6 lg:gap-8

/* Sizing */
h-10 sm:h-12 lg:h-14
w-full sm:w-auto

/* Layout */
flex flex-col sm:flex-row
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Visibility */
hidden md:block
sm:hidden

/* Max widths */
max-w-full sm:max-w-md lg:max-w-lg xl:max-w-xl
```
