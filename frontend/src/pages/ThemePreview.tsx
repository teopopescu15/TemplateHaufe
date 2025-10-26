import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  User,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react';

/**
 * CORPORATE GREEN THEME PREVIEW - REFINED
 *
 * Dark Business Aesthetic with Soft Blue-to-Green Gradient
 *
 * Color Palette (Softened):
 * - Background: Very dark navy (#0f172a, #1e293b)
 * - Cards: Slate (#1e293b, #334155) with subtle shadows
 * - Buttons: Soft blue-to-teal gradient (#0ea5e9 → #14b8a6)
 * - Text: Light slate (#f8fafc, #cbd5e1)
 * - Accents: Soft cyan/teal highlights
 *
 * Animations:
 * - Gentle gradient shift on hover
 * - Soft shadow depth (not glow)
 * - Subtle scale (102%)
 * - Smooth transitions (300ms)
 */

const ThemePreview: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      {/* Theme Comparison Grid */}
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
            Corporate Green Theme Preview - Refined
          </h1>
          <p className="text-slate-400 text-lg">
            Dark Business Aesthetic • Soft Blue-to-Teal Gradients • Subtle Shadows
          </p>
        </div>

        {/* Color Palette Display */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Color Palette</CardTitle>
            <CardDescription className="text-slate-400">
              Professional dark theme with vibrant accent colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Backgrounds */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold">Backgrounds</p>
                <div className="space-y-2">
                  <div className="h-16 bg-slate-950 rounded-lg border border-slate-700 flex items-center justify-center">
                    <span className="text-xs text-slate-400">#0f172a</span>
                  </div>
                  <div className="h-16 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
                    <span className="text-xs text-slate-400">#1e293b</span>
                  </div>
                  <div className="h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
                    <span className="text-xs text-slate-400">#334155</span>
                  </div>
                </div>
              </div>

              {/* Blues - Softened */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold">Soft Blue/Cyan</p>
                <div className="space-y-2">
                  <div className="h-16 bg-sky-500 rounded-lg shadow-md shadow-slate-900/40 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">#0ea5e9</span>
                  </div>
                  <div className="h-16 bg-cyan-500 rounded-lg shadow-md shadow-slate-900/40 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">#06b6d4</span>
                  </div>
                  <div className="h-16 bg-cyan-400 rounded-lg shadow-md shadow-slate-900/40 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">#22d3ee</span>
                  </div>
                </div>
              </div>

              {/* Greens - Softened to Teal */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold">Soft Teal/Green</p>
                <div className="space-y-2">
                  <div className="h-16 bg-teal-600 rounded-lg shadow-md shadow-slate-900/40 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">#0d9488</span>
                  </div>
                  <div className="h-16 bg-teal-500 rounded-lg shadow-md shadow-slate-900/40 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">#14b8a6</span>
                  </div>
                  <div className="h-16 bg-teal-400 rounded-lg shadow-md shadow-slate-900/40 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">#2dd4bf</span>
                  </div>
                </div>
              </div>

              {/* Gradients - Softened */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold">Soft Gradients</p>
                <div className="space-y-2">
                  <div className="h-16 bg-gradient-to-r from-sky-500 to-teal-500 rounded-lg shadow-lg shadow-slate-900/50 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">Primary</span>
                  </div>
                  <div className="h-16 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg shadow-lg shadow-slate-900/50 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">Accent</span>
                  </div>
                  <div className="h-16 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 rounded-lg shadow-lg shadow-slate-900/50 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">Full</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variations */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Button Styles & Animations</CardTitle>
            <CardDescription className="text-slate-400">
              Hover over buttons to see animations: gradient shift, glow, scale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Gradient Buttons - Softened */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-semibold">Primary Gradient (Soft Sky → Teal)</Label>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white shadow-md shadow-slate-900/30 hover:shadow-lg hover:shadow-slate-800/40 transition-all duration-300 hover:scale-[1.02]">
                  Primary Button
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>

                <Button className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white shadow-md shadow-slate-900/30 hover:shadow-lg hover:shadow-slate-800/40 transition-all duration-300 hover:scale-[1.02] px-8">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading State
                </Button>

                <Button className="bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-slate-900/30 hover:shadow-lg hover:shadow-slate-800/40 transition-all duration-300 hover:scale-[1.02]">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Success
                </Button>
              </div>
            </div>

            {/* Outline Buttons - Softened */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-semibold">Outline with Soft Shadow</Label>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="border-2 border-sky-500/40 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400/60 hover:text-sky-300 shadow-sm shadow-slate-900/20 hover:shadow-md hover:shadow-slate-800/30 transition-all duration-300"
                >
                  Outline Sky
                </Button>

                <Button
                  variant="outline"
                  className="border-2 border-teal-500/40 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400/60 hover:text-teal-300 shadow-sm shadow-slate-900/20 hover:shadow-md hover:shadow-slate-800/30 transition-all duration-300"
                >
                  Outline Teal
                </Button>

                <Button
                  variant="outline"
                  className="border-2 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/60 hover:text-cyan-300 shadow-sm shadow-slate-900/20 hover:shadow-md hover:shadow-slate-800/30 transition-all duration-300"
                >
                  Outline Cyan
                </Button>
              </div>
            </div>

            {/* Ghost Buttons - Softened */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-semibold">Ghost / Transparent</Label>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="ghost"
                  className="text-sky-400 hover:bg-sky-500/15 hover:text-sky-300 transition-all duration-200"
                >
                  Ghost Sky
                </Button>

                <Button
                  variant="ghost"
                  className="text-teal-400 hover:bg-teal-500/15 hover:text-teal-300 transition-all duration-200"
                >
                  Ghost Teal
                </Button>

                <Button
                  variant="ghost"
                  className="text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all duration-200"
                >
                  Ghost Neutral
                </Button>
              </div>
            </div>

            {/* Icon Buttons - Softened */}
            <div className="space-y-3">
              <Label className="text-slate-300 text-sm font-semibold">Icon Buttons with Soft Shadow</Label>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="icon"
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-md shadow-slate-900/30 hover:shadow-lg hover:shadow-slate-800/40 transition-all duration-300 hover:scale-105 rounded-xl"
                >
                  <Mail className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  className="bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md shadow-slate-900/30 hover:shadow-lg hover:shadow-slate-800/40 transition-all duration-300 hover:scale-105 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5" />
                </Button>

                <Button
                  size="icon"
                  className="bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-sky-500/40 hover:text-sky-400 shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-800/30 transition-all duration-300 rounded-xl"
                >
                  <Shield className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Dark Theme Login */}
          <div className="relative flex items-center justify-center min-h-[600px] bg-slate-950 rounded-2xl p-8 overflow-hidden border border-slate-800">
            {/* Animated background blobs - Softened */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl animate-blob" />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            <Card className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-slate-900/50 relative z-10">
              <CardHeader className="space-y-4 text-center pb-8 pt-10">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-sky-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-xl shadow-slate-900/40 transform hover:scale-105 transition-transform duration-300">
                  <Shield className="w-10 h-10 text-white" strokeWidth={2} />
                </div>

                <CardTitle className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
                  Business Portal
                </CardTitle>

                <CardDescription className="text-slate-400 text-base">
                  Secure access to your corporate dashboard
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="email-dark" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-400" />
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      id="email-dark"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-12 bg-slate-800 border-2 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-sky-500/60 focus:ring-4 focus:ring-sky-500/15 transition-all duration-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="password-dark" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-teal-400" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="password-dark"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 bg-slate-800 border-2 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-teal-500/60 focus:ring-4 focus:ring-teal-500/15 transition-all duration-200 rounded-xl pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-13 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-white font-bold text-base shadow-lg shadow-slate-900/40 hover:shadow-xl hover:shadow-slate-800/50 transition-all duration-300 hover:scale-[1.02] rounded-xl mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-4 text-center">
                  <p className="text-sm text-slate-500">
                    Need help?{' '}
                    <a href="#" className="text-sky-400 hover:text-teal-400 font-semibold transition-colors duration-200">
                      Contact Support
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Components Showcase */}
          <div className="space-y-6">
            {/* Alert Examples */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 text-lg">Alert Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-sky-950/40 border-sky-500/40 text-sky-300">
                  <Shield className="h-4 w-4 text-sky-400" />
                  <AlertDescription>
                    <strong className="text-sky-200">Info:</strong> Your session expires in 10 minutes
                  </AlertDescription>
                </Alert>

                <Alert className="bg-teal-950/40 border-teal-500/40 text-teal-300">
                  <CheckCircle className="h-4 w-4 text-teal-400" />
                  <AlertDescription>
                    <strong className="text-teal-200">Success:</strong> Login successful! Redirecting...
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive" className="bg-red-950/40 border-red-500/40">
                  <AlertDescription>
                    <strong>Error:</strong> Invalid credentials. Please try again.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Stats Cards - Softened */}
            <Card className="bg-gradient-to-br from-sky-900/30 to-teal-900/30 border-sky-700/40 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 font-medium">Total Users</p>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">
                      12,845
                    </h3>
                    <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
                      +12.5% this month
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/30">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input Showcase */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 text-lg">Form Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm">Default Input</Label>
                  <Input
                    placeholder="Enter text..."
                    className="mt-2 bg-slate-800 border-slate-700 text-slate-100 focus:border-sky-500/60 focus:ring-sky-500/15"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Success State</Label>
                  <Input
                    placeholder="Validated input"
                    className="mt-2 bg-slate-800 border-teal-500/60 text-slate-100 focus:ring-teal-500/15"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Error State</Label>
                  <Input
                    placeholder="Invalid input"
                    className="mt-2 bg-slate-800 border-red-500/60 text-slate-100 focus:ring-red-500/15"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Animation Details */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100">Animation Specifications</CardTitle>
            <CardDescription className="text-slate-400">
              Technical details of the animation system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sky-400 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Hover Effects
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Gradient shift: 300ms ease-in-out</li>
                  <li>• Scale: 102% (subtle transform)</li>
                  <li>• Shadow: Depth increase (not glow)</li>
                  <li>• Gradient: Sky → Teal transition</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-teal-400 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Active States
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Press down: Scale 98%</li>
                  <li>• Duration: 100ms</li>
                  <li>• Brightness: Slightly darker</li>
                  <li>• Shadow: Subtle depth reduction</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-cyan-400 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Shadow System
                </h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Base: shadow-md with slate-900/30</li>
                  <li>• Hover: shadow-lg with slate-800/40</li>
                  <li>• Soft depth instead of color glow</li>
                  <li>• Professional, subtle elevation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ThemePreview;
