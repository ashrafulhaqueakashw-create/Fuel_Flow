"use client";
import LoginForm from "../components/LoginForm";

export default function EmployeeLoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-950 overflow-hidden px-4">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px] animate-float-slow" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-fuel-orange/15 blur-[120px] animate-float-medium" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg mb-3">
            <span className="text-3xl text-white font-semibold">👔</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Staff<span className="text-emerald-500 font-black">Login</span>
          </h1>
          <p className="text-gray-400 text-sm">
            FuelFlow Staff & Dispatcher Terminal
          </p>
        </div>

        {/* Login Form Wrapper */}
        <div className="glass-panel-dark rounded-3xl p-8 premium-shadow-lg border border-white/10 relative overflow-hidden backdrop-blur-xl">
          {/* Subtle glow border effect */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-60" />
          <LoginForm defaultUserType="employee" />
        </div>
      </div>
    </div>
  );
}
