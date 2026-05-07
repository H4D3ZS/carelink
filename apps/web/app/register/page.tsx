"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Heart,
  Building2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi, setToken } from "@/lib/api";
import { useEffect } from "react";

const userTypes = [
  { value: "healthcare_provider", label: "Healthcare Provider" },
  { value: "family_member", label: "Family Member" },
  { value: "administrator", label: "Hospital Administrator" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "",
    hospitalName: "",
  });

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.replace("/family-portal"), 800);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    if (step === 1) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    try {
      const role =
        formData.userType === "healthcare_provider"
          ? "staff"
          : formData.userType === "administrator"
          ? "admin"
          : "family";
      const res = await authApi.register(formData.email, formData.password, role as any);
      setToken(res.token);
      setSuccess("Account created.");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-sky-500/30 transition-shadow">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-slate-900">
              CareLink<span className="text-sky-600">QR</span>
            </span>
          </Link>
          <p className="mt-2 text-slate-600">Create your account</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1
                ? "bg-sky-600 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            1
          </div>
          <div
            className={`w-16 h-1 rounded ${
              step >= 2 ? "bg-sky-600" : "bg-slate-200"
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2
                ? "bg-sky-600 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            2
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {step === 1 ? "Personal Information" : "Account Details"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1
                ? "Tell us about yourself"
                : "Set up your account credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="pl-10"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userType">I am a</Label>
                    <Select
                      value={formData.userType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, userType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.userType === "healthcare_provider" && (
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">Hospital/Organization</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="hospitalName"
                          placeholder="St. Mary's Hospital"
                          className="pl-10"
                          value={formData.hospitalName}
                          onChange={(e) =>
                            setFormData({ ...formData, hospitalName: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@hospital.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Must be at least 8 characters with a number and special character
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                      I agree to the{" "}
                      <Link href="/terms" className="text-sky-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-sky-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : step === 1 ? (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {success && (
          <p className="mt-4 text-center text-sm text-emerald-600">
            {success}
          </p>
        )}
        {error && (
          <p className="mt-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-sky-600 hover:text-sky-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
