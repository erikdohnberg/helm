"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

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
      setError("Updates are sent to an email address.");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError(
        "That is not an email address. It needs an @ and a domain, like ada@example.com."
      );
      return;
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(WAITLIST_EMAIL_KEY, trimmed);
    }
    router.push("/thanks");
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-field">
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
      <Input
        id="waitlist-email"
        name="email"
        type="email"
        autoComplete="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ada@example.com"
        help="Used for Helm product updates and nothing else."
        error={error ?? undefined}
      />
      <div>
        <Button type="submit">Add me to the list</Button>
      </div>
    </form>
  );
}
