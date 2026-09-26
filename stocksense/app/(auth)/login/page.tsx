"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manager@stocksense.io");
  const [password, setPassword] = useState("stocksense2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400));
    if (email && password) {
      localStorage.setItem("ss_user", JSON.stringify({ name: "Alex Morgan", email, role: "manager" }));
      router.push("/dashboard");
    } else {
      setError("Please enter email and password.");
    }
    setLoading(false);
  }

  function handleDemoLogin() {
    setEmail("manager@stocksense.io");
    setPassword("stocksense2026");
    localStorage.setItem("ss_user", JSON.stringify({ name: "Alex Morgan", email: "manager@stocksense.io", role: "manager" }));
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden">
        {/* Top Header Card Banner */}
        <div className="bg-slate-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl"></div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 shadow-lg shadow-blue-500/30 mb-4">
            <Boxes size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">StockSense</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Modular Inventory Management System</p>
        </div>

        {/* Form area */}
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sign In</h2>
              <p className="text-xs text-slate-500">Access your warehouse dashboard</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck size={12} /> Prototype Mode
            </span>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full py-2.5 text-sm font-semibold justify-center">
              Sign In <ArrowRight size={16} />
            </Button>
          </form>

          {/* Quick Demo Login Button */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleDemoLogin}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>⚡ One-Click Demo Sign-In</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Need an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-semibold">
              Create demo account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
