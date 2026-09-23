/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Briefcase,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type LoginResponse = {
  message: string;
};

type FieldErrors = {
  username?: string;
  password?: string;
};

type UserType = "admin" | "employee" | "customer";

type LoginFormProps = {
  defaultUserType?: UserType;
};

export default function LoginForm({ defaultUserType = "admin" }: LoginFormProps) {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(defaultUserType);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!username.trim()) {
      errs.username =
        userType === "admin" ? "Username is required" : "Email is required";
    }
    if (!password) errs.password = "Password is required";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters";

    setFieldErrors(errs);
    if (errs.username) {
      usernameRef.current?.focus();
    } else if (errs.password) {
      passwordRef.current?.focus();
    }

    return Object.keys(errs).length === 0;
  };

  const getApiEndpoint = () => {
    switch (userType) {
      case "admin":
        return "/api/admin/login";
      case "employee":
        return "/api/employee/login";
      case "customer":
        return "/api/customer/login";
      default:
        return "/api/admin/login";
    }
  };

  const getRedirectPath = () => {
    switch (userType) {
      case "admin":
        return "/admin";
      case "employee":
        return "/employee";
      case "customer":
        return "/customer";
      default:
        return "/admin";
    }
  };

  const getRequestBody = () => {
    if (userType === "admin") {
      return { username, password };
    } else {
      return { email: username, password };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(getApiEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getRequestBody()),
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        throw new Error(data?.message || "Invalid credentials");
      }

      router.push(getRedirectPath());
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type: UserType) => {
    setUserType(type);
    setError("");
    setFieldErrors({});
    if (type === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else if (type === "employee") {
      setUsername("staff@fuelflow.com");
      setPassword("staff123");
    } else {
      setUsername("customer@fuelflow.com");
      setPassword("customer123");
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <h3 className="text-xl font-bold text-slate-900 text-center tracking-tight">
          Sign In to Your Account
        </h3>
        <p className="text-slate-500 text-xs text-center mt-1">
          Select your portal role to access system dashboards
        </p>
      </div>

      {/* Segmented Control for Role Selection */}
      <div className="space-y-1.5">
        <label className="block text-slate-700 text-xs font-semibold uppercase tracking-wider">
          Select Role
        </label>
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setUserType("admin");
              setError("");
              setFieldErrors({});
            }}
            className={`w-1/3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              userType === "admin"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType("employee");
              setError("");
              setFieldErrors({});
            }}
            className={`w-1/3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              userType === "employee"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Employee</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType("customer");
              setError("");
              setFieldErrors({});
            }}
            className={`w-1/3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              userType === "customer"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Customer</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Username / Email Field */}
      <div className="space-y-1">
        <label
          className="block text-slate-700 text-xs font-semibold"
          htmlFor="username"
        >
          {userType === "admin" ? "Username" : "Email Address"}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {userType === "admin" ? (
              <User className="w-4 h-4" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </div>
          <input
            ref={usernameRef}
            className={`w-full pl-10 pr-4 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
              fieldErrors.username
                ? "border-red-400"
                : "border-slate-200"
            }`}
            type={userType === "admin" ? "text" : "email"}
            name="username"
            id="username"
            autoComplete={userType === "admin" ? "username" : "email"}
            aria-invalid={!!fieldErrors.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={
              userType === "admin" ? "admin" : "name@example.com"
            }
          />
        </div>
        {fieldErrors.username && (
          <p className="text-[11px] text-red-600 mt-0.5">{fieldErrors.username}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label
          className="block text-slate-700 text-xs font-semibold"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            ref={passwordRef}
            className={`w-full pl-10 pr-10 py-2.5 bg-white border text-sm text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all ${
              fieldErrors.password
                ? "border-red-400"
                : "border-slate-200"
            }`}
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            autoComplete="current-password"
            aria-invalid={!!fieldErrors.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-[11px] text-red-700 font-medium mt-0.5">{fieldErrors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#c2410c] hover:bg-[#9a3412] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <span>Signing In...</span>
        ) : (
          <>
            <span>
              Sign In as {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {/* 1-Click Demo Fill for easy test */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-center text-[11px] text-slate-600 font-medium mb-2">
          Quick Demo Credentials (1-click autofill):
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickFill("admin")}
            className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
          >
            Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("employee")}
            className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
          >
            Staff Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("customer")}
            className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors"
          >
            Customer Demo
          </button>
        </div>
      </div>
    </form>
  );
}
