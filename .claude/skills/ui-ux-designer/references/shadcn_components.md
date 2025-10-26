# shadcn/ui Components Reference

Comprehensive guide for implementing shadcn/ui components with modern design patterns using the **shadcn MCP server**.

## 🚀 MCP-Powered Component Generation (Recommended)

### shadcn MCP Server Integration

**Primary Method**: Use the shadcn MCP server for instant component generation.

**Server**: `@magnusrodseth/shadcn-mcp-server` (v1.1.2)
**Status**: ✅ Active in Claude Code

**How to Use**:
1. Request component: "Generate shadcn Button component"
2. MCP returns complete TypeScript code
3. Save to `src/components/ui/[component].tsx`
4. Customize with your styling
5. Import and use

**Advantages**:
- ✅ **No npm install** - Instant generation
- ✅ **Always current** - Latest component versions
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Accessible** - ARIA attributes included
- ✅ **Complete** - All dependencies and imports

**Available Components** (50+):
- Button, Input, Card, Alert, Label, Separator
- Dialog, Dropdown Menu, Tabs, Select, Checkbox
- Table, Chart, Calendar, Progress, Badge
- And 35+ more...

### Manual Installation (Fallback)

If MCP is unavailable, use traditional CLI:

```bash
# Install shadcn/ui CLI
npx shadcn@latest init

# Configure components.json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### Adding Components Manually

```bash
# Add specific components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add alert

# Add multiple at once
npx shadcn@latest add button input label card alert
```

## Essential Components

### Button

**MCP Generation**: Request "Generate shadcn Button component"
**Manual Installation**: `npx shadcn@latest add button`

**MCP Workflow**:
```
1. "Generate shadcn Button component"
2. MCP returns complete button.tsx with all variants
3. Save to src/components/ui/button.tsx
4. Add custom gradient variant (see below)
5. Import and use: import { Button } from "@/components/ui/button"
```

**Basic Usage**:
```jsx
import { Button } from "@/components/ui/button";

{/* Default */}
<Button>Click me</Button>

{/* Variants */}
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

{/* Sizes */}
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Icon className="w-4 h-4" />
</Button>

{/* With icons */}
<Button>
  <Mail className="w-4 h-4 mr-2" />
  Email me
</Button>

{/* Loading state */}
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Please wait
</Button>
```

**Custom Gradient Variant**:
```tsx
// Add to button.tsx variants
gradient: "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50 transition-all duration-300",
```

**Responsive Button**:
```jsx
<Button className="w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base">
  Responsive Button
</Button>
```

### Input

**Installation**: `npx shadcn@latest add input`

**Basic Usage**:
```jsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

{/* Standard input */}
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
</div>

{/* With icon */}
<div className="space-y-2">
  <Label htmlFor="search" className="flex items-center gap-2">
    <Search className="w-4 h-4 text-purple-600" />
    Search
  </Label>
  <Input
    id="search"
    placeholder="Search..."
    className="h-12 border-purple-200 focus:border-purple-400"
  />
</div>

{/* Disabled */}
<Input disabled placeholder="Disabled input" />

{/* File input */}
<Input type="file" />
```

**Styled Input Pattern**:
```jsx
<Input
  className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
  placeholder="Modern styled input"
/>
```

### Card

**Installation**: `npx shadcn@latest add card`

**Basic Usage**:
```jsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

{/* Standard card */}
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description or subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

{/* Modern styled card */}
<Card className="border border-purple-100/50 backdrop-blur-sm bg-white/95 shadow-2xl">
  <CardHeader className="space-y-4 text-center pb-8 pt-10">
    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
      <Sparkles className="w-8 h-8 text-white" />
    </div>
    <CardTitle className="text-3xl sm:text-4xl">Modern Card</CardTitle>
    <CardDescription>Beautiful gradient design</CardDescription>
  </CardHeader>
  <CardContent className="px-6 sm:px-8">
    Content
  </CardContent>
</Card>
```

### Label

**Installation**: `npx shadcn@latest add label`

**Basic Usage**:
```jsx
import { Label } from "@/components/ui/label";

{/* Standard label */}
<Label htmlFor="name">Name</Label>
<Input id="name" />

{/* With icon */}
<Label htmlFor="email" className="flex items-center gap-2">
  <Mail className="w-4 h-4 text-purple-600" />
  Email Address
</Label>
<Input id="email" type="email" />

{/* Required indicator */}
<Label htmlFor="password">
  Password <span className="text-red-500">*</span>
</Label>
<Input id="password" type="password" required />
```

### Alert

**Installation**: `npx shadcn@latest add alert`

**Basic Usage**:
```jsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

{/* Variants */}
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the cli.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>

{/* Animated alert */}
<Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>

{/* Success alert */}
<Alert className="border-green-500 bg-green-50">
  <CheckCircle className="h-4 w-4 text-green-600" />
  <AlertDescription className="text-green-700">
    Successfully saved changes!
  </AlertDescription>
</Alert>
```

### Separator

**Installation**: `npx shadcn@latest add separator`

**Basic Usage**:
```jsx
import { Separator } from "@/components/ui/separator";

{/* Horizontal */}
<Separator />

{/* Vertical */}
<Separator orientation="vertical" className="h-4" />

{/* Styled separator (gradient) */}
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <Separator className="bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-white px-3 text-muted-foreground">
      Or continue with
    </span>
  </div>
</div>
```

## Form Components

### Form Field Pattern

```jsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

{/* Complete form field */}
<div className="space-y-2">
  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
    <Mail className="w-4 h-4 text-purple-600" />
    Email Address
  </Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    className="h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
    required
  />
  {error && (
    <p className="text-xs text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {error}
    </p>
  )}
</div>
```

### Password Field with Validation

```jsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle, XCircle } from "lucide-react";

const [password, setPassword] = useState("");

const getPasswordStrength = (pwd: string) => {
  let strength = 0;
  if (pwd.length >= 8) strength++;
  if (/[a-z]/.test(pwd)) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/\d/.test(pwd)) strength++;
  return strength;
};

const passwordStrength = getPasswordStrength(password);

<div className="space-y-2">
  <Label htmlFor="password" className="flex items-center gap-2">
    <Lock className="w-4 h-4 text-purple-600" />
    Password
  </Label>
  <Input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="h-12"
  />

  {/* Strength indicator */}
  {password && (
    <div className="space-y-2">
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
      <p className="text-xs text-muted-foreground">
        Must be 8+ characters with uppercase, lowercase, and number
      </p>
    </div>
  )}
</div>
```

## Advanced Components

### Dialog

**Installation**: `npx shadcn@latest add dialog`

**Basic Usage**:
```jsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tabs

**Installation**: `npx shadcn@latest add tabs`

```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="account" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    Account settings content
  </TabsContent>
  <TabsContent value="password">
    Password settings content
  </TabsContent>
</Tabs>
```

### Dropdown Menu

**Installation**: `npx shadcn@latest add dropdown-menu`

```jsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Icons with Lucide React

### Installation

```bash
npm install lucide-react
```

### Common Icons

```jsx
import {
  // Authentication
  Mail, Lock, User, LogIn, LogOut,

  // Actions
  ArrowRight, ArrowLeft, Plus, Minus, X, Check,

  // UI
  Menu, Search, Settings, Home, Bell, Heart,

  // Status
  AlertCircle, CheckCircle, XCircle, Info, AlertTriangle,

  // Media
  Image, Upload, Download, Trash, Edit,

  // Navigation
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,

  // Special
  Loader2, Sparkles, Star, Calendar, Clock
} from "lucide-react";

{/* Usage */}
<Mail className="w-4 h-4 text-purple-600" />
<Loader2 className="w-5 h-5 animate-spin" />
<CheckCircle className="w-6 h-6 text-green-500" />
```

### Icon Sizing Guide

```jsx
{/* Extra small - 12px */}
<Icon className="w-3 h-3" />

{/* Small - 16px */}
<Icon className="w-4 h-4" />

{/* Medium - 20px */}
<Icon className="w-5 h-5" />

{/* Large - 24px */}
<Icon className="w-6 h-6" />

{/* Extra large - 32px */}
<Icon className="w-8 h-8" />

{/* Huge - 40px */}
<Icon className="w-10 h-10" />
```

### Icon Patterns

```jsx
{/* Button with icon */}
<Button>
  <Mail className="w-4 h-4 mr-2" />
  Send Email
</Button>

{/* Icon button */}
<Button size="icon">
  <Search className="w-4 h-4" />
</Button>

{/* Label with icon */}
<Label className="flex items-center gap-2">
  <Lock className="w-4 h-4 text-purple-600" />
  Password
</Label>

{/* Loading state */}
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Loading...
</Button>

{/* Gradient icon container */}
<div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
  <Sparkles className="w-8 h-8 text-white" />
</div>
```

## Complete Form Example

```jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Your login logic here
      await login(email, password);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-600" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-12"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-600" />
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="h-12"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        variant="gradient"
        className="w-full h-12 group"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            Login
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}
```

## Component Customization

### Extending Button Variants

```tsx
// In components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // Add custom gradient variant
        gradient: "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50 transition-all duration-300",
        // Add custom glass variant
        glass: "bg-white/10 backdrop-blur-lg border border-white/20 text-white hover:bg-white/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Custom Input Styles

```tsx
// Wrapper component for consistent styled inputs
import { Input, InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StyledInput({ className, ...props }: InputProps) {
  return (
    <Input
      className={cn(
        "h-12 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200",
        className
      )}
      {...props}
    />
  );
}
```

## Best Practices

### Accessibility

```jsx
{/* Always use labels */}
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

{/* Provide error messages */}
<Input aria-invalid={!!error} aria-describedby="error-message" />
{error && <p id="error-message" className="text-red-600">{error}</p>}

{/* Use semantic HTML */}
<form onSubmit={handleSubmit}>
  {/* form fields */}
  <Button type="submit">Submit</Button>
</form>
```

### Performance

```jsx
{/* Lazy load heavy components */}
const Dialog = lazy(() => import("@/components/ui/dialog"));

{/* Memoize expensive components */}
const MemoizedCard = memo(Card);
```

### Consistency

```jsx
{/* Create reusable patterns */}
const FormField = ({ icon: Icon, label, ...props }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-purple-600" />
      {label}
    </Label>
    <Input className="h-12" {...props} />
  </div>
);

{/* Usage */}
<FormField icon={Mail} label="Email" type="email" />
<FormField icon={Lock} label="Password" type="password" />
```
