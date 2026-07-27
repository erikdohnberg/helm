"use client";

import { useState } from "react";

import { LogRow } from "@/components/log/log";
import { Button } from "@/components/ui/button";
import { Observed } from "@/components/ui/chip";
import { Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { seedFeatureIdeas } from "@/lib/mock/feature-ideas";
import type { FeatureVote } from "@/lib/types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ExploringNextSection() {
  const [votes, setVotes] = useState<FeatureVote[]>([]);
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
      setEmailError("A vote is recorded against an email address.");
      return;
    }
    if (!isValidEmail(emailDraft)) {
      setEmailError(
        "That is not an email address. It needs an @ and a domain, like ada@example.com."
      );
      return;
    }

    const alreadyVoted = votes.some(
      (v) => v.featureId === modal.featureId && v.email === normalized
    );
    if (alreadyVoted) {
      setEmailError("This address already voted for that one.");
      return;
    }

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
    <>
      <div className="border-t-2 border-foreground">
        {seedFeatureIdeas.map(({ id, title, description }) => {
          const count = voteCountByFeature(id);
          return (
            <LogRow key={id} label={title}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <p className="min-w-[28ch] max-w-prose flex-1 text-[16px] text-muted-foreground">
                  {description}
                </p>
                <div className="flex flex-none items-center gap-3">
                  {count > 0 && (
                    <Observed className="text-help">
                      {count === 1 ? "1 vote" : `${count} votes`}
                    </Observed>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openVoteModal(id, title)}
                  >
                    Vote for this
                  </Button>
                </div>
              </div>
            </LogRow>
          );
        })}
      </div>

      <Modal
        open={modal != null}
        onClose={closeVoteModal}
        width="440px"
        title={modal ? `Vote for ${modal.featureTitle}` : undefined}
        description="A vote is recorded against an email address so it counts once. It joins the same list as the waitlist."
        footer={
          <>
            <Button variant="outline" onClick={closeVoteModal}>
              Never mind
            </Button>
            <Button form="vote-form" type="submit">
              Record this vote
            </Button>
          </>
        }
      >
        <form id="vote-form" onSubmit={submitVoteEmail}>
          <Input
            id="vote-email-input"
            type="email"
            autoComplete="email"
            label="Email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder="ada@example.com"
            error={emailError ?? undefined}
          />
        </form>
      </Modal>
    </>
  );
}
