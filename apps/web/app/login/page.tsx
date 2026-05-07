"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Heart,
  ArrowRight,
  Github,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, setToken } from "@/lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/family-portal";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.replace(next), 800);
      return () => clearTimeout(timer);
    }
  }, [success, router, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await authApi.login(formData.email, formData.password);
      setToken(res.token);
      setSuccess("Signed in.");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <div className="w-full max-w-[420px] mx-auto">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-sky-500/30 transition-shadow">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-bold text-xl sm:text-2xl text-slate-900">
              CareLink<span className="text-sky-600">QR</span>
            </span>
          </Link>
          <p className="mt-2 text-sm sm:text-base text-slate-600">Sign in to your account</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-sm">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@hospital.com"
                    className="pl-10 h-11"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm text-sky-600 hover:text-sky-700"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 h-11 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {success && (
              <p className="mt-4 text-sm text-emerald-600 text-center">{success}</p>
            )}
            {error && (
              <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <Button variant="outline" className="w-full gap-2 h-11">
                <Github className="w-4 h-4" />
                Continue with GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-5 sm:mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-sky-600 hover:text-sky-700"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-3 sm:mt-4 text-center text-xs text-slate-500">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-sky-600 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-sky-600 hover:underline">
            Privacy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
