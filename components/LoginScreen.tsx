"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/cn";
import { buttonPrimary, field } from "@/lib/ui";

export function LoginScreen() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Use a valid email and a password of at least 6 characters.");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      if (mode === "create") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage("Check your email to confirm the account, then sign in.");
          setMode("sign-in");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-20">
      <Logo large />
      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Five terms at 8:00.</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-mute">
          Technical English for engineers, at B2/C1. Speak or write. The words that slip come back.
        </p>

        {configured ? (
          <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-3">
            <div className="flex w-fit rounded-xl border border-line bg-sheet p-1 text-sm">
              {(["sign-in", "create"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setError(null);
                    setMessage(null);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5",
                    item === mode ? "bg-canvas font-medium text-ink" : "text-mute hover:text-ink",
                  )}
                >
                  {item === "sign-in" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block text-sm text-mute">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={field}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-sm text-mute">Password</span>
              <input
                type="password"
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={field}
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-amber-800">
                {error}
              </p>
            ) : null}
            {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
            <button type="submit" className={`${buttonPrimary} w-full`} disabled={pending}>
              {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {mode === "create" ? "Create account" : "Sign in"}
            </button>
          </form>
        ) : (
          <ol className="mt-6 space-y-3 text-sm leading-6 text-mute">
            <li>1. Create a Supabase project and run `supabase/migrations/20261019120000_lexipulse_init.sql`.</li>
            <li>2. Add the project URL and anon key, plus `OPENAI_API_KEY`, to `.env.local`.</li>
            <li>3. Restart the dev server. For local accounts, turn off email confirmation in Supabase Auth.</li>
          </ol>
        )}

        <Link href="/demo" className="mt-8 inline-flex text-sm text-ink underline decoration-line underline-offset-4">
          Preview the drill without an account
        </Link>
      </div>
    </main>
  );
}
