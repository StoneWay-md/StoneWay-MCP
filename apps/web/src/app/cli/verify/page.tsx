"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Terminal, CheckCircle2, AlertCircle, Shield, ArrowRight } from "lucide-react";

export default function CliVerifyPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/cli/device/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        if (res.status === 401) {
          // Redirect to login with return callback
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
          return;
        }
        setError(data.error || "Failed to authorize code.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-emerald-400 mb-2">
          <Terminal className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">StoneWay Terminal Device Login</h1>
        <p className="text-xs text-neutral-400">
          Authorize your local coding agent or terminal CLI to synchronize with your StoneWay profile.
        </p>
      </div>

      <div className="border border-neutral-800 bg-neutral-950 rounded-2xl p-6 shadow-2xl space-y-6">
        {success ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-base font-semibold text-white">Device Authorized Successfully!</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your terminal has been securely authenticated. A local credential has been stored on your machine.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-1.5 rounded-md">
                You can safely close this browser window.
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-300 block uppercase tracking-wider">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SW-XXXX"
                className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500 uppercase"
                required
              />
              <p className="text-[11px] text-neutral-500 text-center">
                Confirm this code matches what is displayed in your terminal.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !code}
              className="w-full py-3 bg-white text-black hover:bg-neutral-200 font-semibold rounded-lg text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? "Authorizing..." : "Authorize Terminal Device"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-[11px] text-neutral-500 font-mono">
        Protected by StoneWay Zero-Friction Device Auth
      </div>
    </div>
  );
}
