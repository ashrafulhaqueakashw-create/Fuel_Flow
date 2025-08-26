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

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!username.trim()) errs.username = "Username is required";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as LoginResponse;

      if (!res.ok) {
        // use backend message if present
        throw new Error(data?.message || "Invalid credentials");
      }

      // Success: use Next.js router to navigate
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="p-8 rounded-lg shadow-md w-full max-w-sm space-y-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-2xl font-bold text-center text-black">Admin Login</h2>
      {error && (
        <div role="alert" className="bg-red-50 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-900 mb-2" htmlFor="username">
          Username
        </label>
        <input
          ref={usernameRef}
          className={`w-full px-4 py-2 text-gray-900 placeholder-gray-400 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            fieldErrors.username ? "border-red-400" : "border-gray-300"
          }`}
          type="text"
          name="username"
          id="username"
          autoComplete="username"
          aria-invalid={!!fieldErrors.username}
          aria-describedby={fieldErrors.username ? "username-error" : undefined}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {fieldErrors.username && (
          <p id="username-error" className="text-sm text-red-600 mt-1">
            {fieldErrors.username}
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
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
