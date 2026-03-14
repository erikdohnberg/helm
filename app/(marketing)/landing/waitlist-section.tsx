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
      <h2 className="text-xl font-semibold text-white">
        Be the first to know
      </h2>
      <p className="text-white/90 leading-relaxed">
        Join the waitlist to get updates as Helm evolves.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md">
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
          <label
            htmlFor="waitlist-email"
            className="text-sm font-medium text-white/95"
          >
            Email
          </label>
          <input
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/25 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/50"
            placeholder="Enter your email"
          />
          {error && (
            <p className="text-sm text-amber-200" role="alert">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-brass px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brass/90"
        >
          Join the waitlist
        </button>
      </form>
    </section>
  );
}
