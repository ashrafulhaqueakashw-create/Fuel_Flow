/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function EmployeeLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email format";
    if (!password) errs.password = "Password is required";

    setFieldErrors(errs);
    // focus first invalid field
    if (errs.email) {
      emailRef.current?.focus();
    } else if (errs.password) {
      passwordRef.current?.focus();
    }

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/employee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      // Success: redirect to employee dashboard
      router.push("/employee");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-2xl font-bold text-center text-gray-900">
        Employee Login
      </h2>
      {error && (
        <div role="alert" className="bg-red-50 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-900 mb-2" htmlFor="email">
          Email
        </label>
        <input
          ref={emailRef}
          className={`w-full px-4 py-2 text-gray-900 placeholder-gray-400 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            fieldErrors.email ? "border-red-400" : "border-gray-300"
          }`}
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email && (
          <p id="email-error" className="text-sm text-red-600 mt-1">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-gray-900 mb-2" htmlFor="password">
          Password
        </label>
        <input
          ref={passwordRef}
          className={`w-full px-4 py-2 text-gray-900 placeholder-gray-400 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            fieldErrors.password ? "border-red-400" : "border-gray-300"
          }`}
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {fieldErrors.password && (
          <p id="password-error" className="text-sm text-red-600 mt-1">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
