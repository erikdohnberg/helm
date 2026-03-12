"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const WAITLIST_EMAIL_KEY = "helm_waitlist_email";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function WaitlistSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (honeypot) {
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(WAITLIST_EMAIL_KEY, trimmed);
    }
    router.push("/thanks");
  }

  return (
    <section id="waitlist" className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Waitlist</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div
          className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="waitlist-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="you@company.com"
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          Join the waitlist
        </button>
      </form>
    </section>
  );
}
