import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      await register({ email, password, name });
      setSuccess(true);
      // Don't navigate - show success message
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-[#020617] p-4 sm:p-6 lg:p-8 overflow-hidden">
        {/* Enhanced decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <Card className="w-full max-w-md shadow-2xl border border-blue-500/20 backdrop-blur-xl bg-[#0a0e1a]/95 relative z-10 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <CardContent className="relative pt-16 pb-12 px-6 sm:px-10 text-center space-y-8">
            <div className="flex justify-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-glow-green" style={{ boxShadow: '0 0 40px rgba(34,197,94,0.6), 0 0 80px rgba(34,197,94,0.3)' }}>
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 tracking-tight animate-shimmer bg-[length:200%_auto]">
                Registration Successful!
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                We've sent a verification email to <strong className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 font-semibold">{email}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full h-14 font-extrabold text-lg group relative overflow-hidden rounded-xl shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-300 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
            >
              Go to Login
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1 duration-300" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#020617] p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main card container */}
      <Card className="w-full max-w-md shadow-2xl border border-blue-500/20 backdrop-blur-xl bg-[#0a0e1a]/95 relative z-10 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

        <CardHeader className="relative space-y-3 text-center pb-6 pt-12">
          {/* Icon with enhanced styling */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-glow-blue mb-4 transform hover:scale-105 transition-transform duration-300" style={{ boxShadow: '0 0 30px rgba(96, 165, 250, 0.5), 0 0 60px rgba(96, 165, 250, 0.3)' }}>
            <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
          </div>

          <CardTitle className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 tracking-tight animate-shimmer bg-[length:200%_auto]">
            Create Account
          </CardTitle>

          <CardDescription className="text-base sm:text-lg text-slate-300 font-medium">
            Join AI Zen Garden and start your journey
          </CardDescription>
        </CardHeader>

        <CardContent className="relative px-6 sm:px-10 pb-10 space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300 border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-semibold text-base">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 flex flex-col items-center">
            <div className="space-y-2.5 w-full max-w-sm">
              <Label htmlFor="name" className="text-base font-bold text-slate-200 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Full Name
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="h-14 text-lg border-2 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 rounded-xl bg-slate-900/50 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2.5 w-full max-w-sm">
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

            <div className="space-y-2.5 w-full max-w-sm">
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

              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= level
                            ? passwordStrength <= 2
                              ? 'bg-red-500 shadow-sm'
                              : passwordStrength === 3
                              ? 'bg-yellow-500 shadow-sm'
                              : 'bg-green-500 shadow-sm'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {passwordStrength <= 2 && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                    {passwordStrength === 3 && <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />}
                    {passwordStrength >= 4 && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                    <span className="text-slate-300 font-medium">
                      Must be 8+ characters with uppercase, lowercase, and number
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 w-full max-w-sm">
              <Label htmlFor="confirmPassword" className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-14 text-lg border-2 border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 rounded-xl pr-14 bg-slate-900/50 text-slate-100 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-2 text-xs pt-1">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-300 font-semibold">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-red-300 font-semibold">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full max-w-sm h-14 font-extrabold text-lg group relative overflow-hidden mt-8 rounded-xl shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-300 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1 duration-300" />
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="pt-4">
            <p className="text-center text-lg text-slate-300 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-extrabold underline-offset-4 hover:underline transition-all duration-200 hover:from-blue-300 hover:to-cyan-300"
              >
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
