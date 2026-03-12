"use client";

import { useEffect, useState } from "react";
import { WAITLIST_EMAIL_KEY } from "../landing/waitlist-section";

export default function ThanksPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(WAITLIST_EMAIL_KEY);
    setEmail(stored);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Thank you</h1>
      <p className="mt-2 text-muted-foreground">
        {email
          ? `We'll be in touch at ${email} soon.`
          : "We'll be in touch soon."}
      </p>
    </div>
  );
}
