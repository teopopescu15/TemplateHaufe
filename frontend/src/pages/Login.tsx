import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });

      // Small delay to ensure cookies are processed by browser
      await new Promise((resolve) => setTimeout(resolve, 100));

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#020617] p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main card container */}
      <Card className="w-full max-w-lg shadow-2xl border border-blue-500/20 backdrop-blur-xl bg-[#0a0e1a]/95 relative z-10 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

        <CardHeader className="relative space-y-4 text-center pb-8 pt-14">
          {/* Icon with enhanced styling */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-glow-blue-lg mb-4 transform hover:scale-105 transition-transform duration-300" style={{ boxShadow: '0 0 40px rgba(96, 165, 250, 0.6), 0 0 80px rgba(96, 165, 250, 0.3)' }}>
            <Sparkles className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>

          <CardTitle className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 tracking-tight animate-shimmer bg-[length:200%_auto]">
            AI Zen Garden
          </CardTitle>

          <CardDescription className="text-xl sm:text-2xl text-slate-300 font-semibold">
            Welcome back! Continue your journey.
          </CardDescription>
        </CardHeader>

        <div className="relative px-8 sm:px-12 pb-12 space-y-7">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-semibold text-base">{error}</AlertDescription>
            </Alert>
          )}

          {/* Google OAuth Button */}
          <Button
            onClick={handleGoogleLogin}
            type="button"
            variant="outline"
            className="w-full h-14 gap-3 font-bold text-lg border-2 border-slate-700 hover:border-blue-500/50 bg-slate-800/50 hover:bg-blue-500/10 text-slate-200 transition-all duration-300 shadow-lg hover:shadow-glow-blue"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-[#0a0e1a] px-4 py-1.5 text-slate-400 font-bold tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
            <div className="space-y-3 w-full max-w-md">
              <Label htmlFor="email" className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="h-14 text-lg border-2 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 rounded-xl bg-slate-900/50 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-3 w-full max-w-md">
              <Label htmlFor="password" className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-14 text-lg border-2 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 rounded-xl pr-14 bg-slate-900/50 text-slate-100 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full max-w-md h-14 font-extrabold text-lg group relative overflow-hidden mt-8 rounded-xl shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-300 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1 duration-300" />
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="pt-6">
            <p className="text-center text-lg text-slate-300 font-medium">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-extrabold underline-offset-4 hover:underline transition-all duration-200 hover:from-blue-300 hover:to-cyan-300"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
