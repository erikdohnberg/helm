"use client";

import { useState } from "react";

import { Eyebrow } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const DEFAULT_ALIGNMENT_INACTIVITY = 7;
const DEFAULT_ADRIFT_THRESHOLD = 21;
const DEFAULT_RECOMMENDED_ANCHORED = 5;
const DEFAULT_CHAT_CHANNEL = "";
const DEFAULT_ALLOW_INDEPENDENT = false;

type Props = {
  /** e.g. "your Slack workspace" — from org primary chat platform */
  conversationLocationPhrase: string;
};

export function DefaultsSettingsClient({ conversationLocationPhrase }: Props) {
  const [alignmentInactivity, setAlignmentInactivity] = useState(
    DEFAULT_ALIGNMENT_INACTIVITY
  );
  const [adriftThreshold, setAdriftThreshold] = useState(
    DEFAULT_ADRIFT_THRESHOLD
  );
  const [recommendedAnchored, setRecommendedAnchored] = useState(
    DEFAULT_RECOMMENDED_ANCHORED
  );
  const [chatChannel, setChatChannel] = useState(DEFAULT_CHAT_CHANNEL);
  const [allowIntentionallyIndependent, setAllowIntentionallyIndependent] =
    useState(DEFAULT_ALLOW_INDEPENDENT);

  return (
    <div className="flex max-w-prose flex-col gap-section-compact">
      <div className="flex flex-col gap-2.5">
        <Eyebrow>Defaults</Eyebrow>
        <p className="text-muted-foreground">
          When Helm decides a thread has gone quiet, when it decides an outcome
          has drifted, and where it starts a conversation in{" "}
          {conversationLocationPhrase}.
        </p>
      </div>

      <section
        className="flex flex-col gap-field"
        aria-labelledby="defaults-drift-heading"
      >
        <Eyebrow tone="muted" id="defaults-drift-heading">
          When Helm raises drift
        </Eyebrow>

        <div className="max-w-[160px]">
          <Input
            id="alignment-inactivity"
            type="number"
            min={1}
            max={365}
            label="Quiet after"
            value={alignmentInactivity}
            onChange={(e) => setAlignmentInactivity(Number(e.target.value) || 0)}
            help="Days without a signal in an outcome's thread before Helm says the team has gone quiet."
          />
        </div>

        <div className="max-w-[160px]">
          <Input
            id="adrift-threshold"
            type="number"
            min={1}
            max={365}
            label="Adrift after"
            value={adriftThreshold}
            onChange={(e) => setAdriftThreshold(Number(e.target.value) || 0)}
            help="Days without engagement before Helm names an outcome as a candidate to retire or replace."
          />
        </div>
      </section>

      <section
        className="flex flex-col gap-field"
        aria-labelledby="defaults-quarter-heading"
      >
        <Eyebrow tone="muted" id="defaults-quarter-heading">
          The shape of a quarter
        </Eyebrow>

        <div className="max-w-[160px]">
          <Input
            id="recommended-anchored"
            type="number"
            min={1}
            max={50}
            label="Anchored outcomes"
            value={recommendedAnchored}
            onChange={(e) => setRecommendedAnchored(Number(e.target.value) || 0)}
            help="Above this count, adding alongside carries a focus warning rather than a silent entry."
          />
        </div>

        <Input
          id="chat-channel"
          label="Where conversations start"
          placeholder="#strategy"
          value={chatChannel}
          onChange={(e) => setChatChannel(e.target.value)}
          help={`The channel Helm opens an alignment thread in once ${conversationLocationPhrase} is connected.`}
        />

        <div className="flex items-start gap-3">
          <button
            type="button"
            id="allow-independent-switch"
            role="switch"
            aria-checked={allowIntentionallyIndependent}
            aria-labelledby="allow-independent-label"
            aria-describedby="allow-independent-desc"
            onClick={() => setAllowIntentionallyIndependent((prev) => !prev)}
            className={cn(
              "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border border-border-strong transition-colors duration-quick ease-out",
              allowIntentionallyIndependent ? "bg-primary" : "bg-sunken"
            )}
          >
            <span
              className={cn(
                "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow-e1 transition-transform duration-quick ease-out",
                allowIntentionallyIndependent && "translate-x-5"
              )}
            />
          </button>
          <div className="min-w-0 space-y-1">
            <span
              id="allow-independent-label"
              className="block text-control font-semibold text-foreground"
            >
              Allow outcomes that stand outside the quarter
            </span>
            <p
              id="allow-independent-desc"
              className="max-w-help text-help text-muted-foreground"
            >
              An outcome marked independent is not counted against the quarter
              and does not raise drift. It takes effect when outcome settings
              carry the option.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
