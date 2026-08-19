/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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
    // focus first invalid field
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white text-center">
          Access Console
        </h2>
        <p className="text-gray-400 text-xs text-center mt-1">
          Select portal and enter authorization
        </p>
      </div>

      {/* Segmented Control for Portal Selection */}
      <div className="space-y-2">
        <label className="block text-gray-300 text-xs font-semibold uppercase tracking-wider">
          System Portal
        </label>
        <div className="relative flex p-1 bg-white/5 border border-white/10 rounded-xl">
          {/* Animated Highlight */}
          <div
            className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 shadow-md transition-all duration-300 ease-out"
            style={{
              left:
                userType === "admin"
                  ? "4px"
                  : userType === "employee"
                    ? "calc(33.33% + 2px)"
                    : "calc(66.66% + 1px)",
              width: "calc(33.33% - 4px)",
            }}
          />
          <button
            type="button"
            onClick={() => {
              setUserType("admin");
              setError("");
              setFieldErrors({});
            }}
            className={`relative z-10 w-1/3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 ${userType === "admin" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType("employee");
              setError("");
              setFieldErrors({});
            }}
            className={`relative z-10 w-1/3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 ${userType === "employee" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
          >
            Employee
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType("customer");
              setError("");
              setFieldErrors({});
            }}
            className={`relative z-10 w-1/3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 ${userType === "customer" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
          >
            Customer
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm animate-shake"
        >
          {error}
        </div>
      )}

      {/* Username / Email Field */}
      <div className="space-y-1.5">
        <label
          className="block text-gray-300 text-xs font-semibold uppercase tracking-wider"
          htmlFor="username"
        >
          {userType === "admin" ? "Username" : "Email Address"}
        </label>
        <div className="relative">
          <input
            ref={usernameRef}
            className={`w-full px-4 py-3 bg-white/5 border text-sm text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all ${fieldErrors.username
                ? "border-red-500/50 focus:border-red-500"
                : "border-white/10 focus:border-primary-500"
              }`}
            type={userType === "admin" ? "text" : "email"}
            name="username"
            id="username"
            autoComplete={userType === "admin" ? "username" : "email"}
            aria-invalid={!!fieldErrors.username}
            aria-describedby={
              fieldErrors.username ? "username-error" : undefined
            }
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={
              userType === "admin" ? "Enter username" : "name@example.com"
            }
          />
        </div>
        {fieldErrors.username && (
          <p id="username-error" className="text-xs text-red-400 mt-1">
            {fieldErrors.username}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label
          className="block text-gray-300 text-xs font-semibold uppercase tracking-wider"
          htmlFor="password"
        >
          Password
        </label>
        <input
          ref={passwordRef}
          className={`w-full px-4 py-3 bg-white/5 border text-sm text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all ${fieldErrors.password
              ? "border-red-500/50 focus:border-red-500"
              : "border-white/10 focus:border-primary-500"
            }`}
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {fieldErrors.password && (
          <p id="password-error" className="text-xs text-red-400 mt-1">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full relative overflow-hidden py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 shadow-lg shadow-primary-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Securing Connection...</span>
          </div>
        ) : (
          `Authenticate as ${userType.charAt(0).toUpperCase() + userType.slice(1)
          }`
        )}
      </button>
    </form>
  );
}
