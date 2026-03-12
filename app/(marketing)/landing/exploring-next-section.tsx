"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeatureVote } from "@/lib/types";
import { seedFeatureIdeas } from "@/lib/mock/feature-ideas";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ExploringNextSection() {
  const [votes, setVotes] = useState<FeatureVote[]>([]);
  const [waitlistEmails, setWaitlistEmails] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{
    featureId: string;
    featureTitle: string;
  } | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const voteCountByFeature = (featureId: string) =>
    votes.filter((v) => v.featureId === featureId).length;

  function openVoteModal(featureId: string, featureTitle: string) {
    setModal({ featureId, featureTitle });
    setEmailDraft("");
    setEmailError(null);
  }

  function closeVoteModal() {
    setModal(null);
    setEmailDraft("");
    setEmailError(null);
  }

  function submitVoteEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    if (!modal) return;

    const normalized = normalizeEmail(emailDraft);
    if (!emailDraft.trim()) {
      setEmailError("Please enter your email.");
      return;
    }
    if (!isValidEmail(emailDraft)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const alreadyVoted = votes.some(
      (v) => v.featureId === modal.featureId && v.email === normalized
    );
    if (alreadyVoted) {
      setEmailError("You've already voted for this feature.");
      return;
    }

    setWaitlistEmails((prev) => new Set(prev).add(normalized));
    setVotes((prev) => [
      ...prev,
      {
        id: `vote-${modal.featureId}-${normalized}-${Date.now()}`,
        featureId: modal.featureId,
        email: normalized,
      },
    ]);
    closeVoteModal();
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        What We&apos;re Exploring Next
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {seedFeatureIdeas.map(({ id, title, description }) => (
          <Card key={id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openVoteModal(id, title)}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground hover:bg-muted transition-colors"
                  aria-label={`Upvote ${title}`}
                >
                  <ChevronUp className="h-4 w-4" />
                  Upvote
                </button>
                <span className="text-sm text-muted-foreground">
                  {voteCountByFeature(id)} vote{voteCountByFeature(id) !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vote-email-modal-title"
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-background p-4 shadow-lg">
            <h3
              id="vote-email-modal-title"
              className="text-sm font-medium text-foreground"
            >
              Enter your email to upvote &quot;{modal.featureTitle}&quot;
            </h3>
            <form onSubmit={submitVoteEmail} className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="vote-email-input"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="vote-email-input"
                  type="email"
                  autoComplete="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@company.com"
                />
                {emailError && (
                  <p className="text-sm text-destructive" role="alert">
                    {emailError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeVoteModal}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:bg-foreground/90"
                >
                  Submit vote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
