"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const DEFAULT_ALIGNMENT_INACTIVITY = 7;
const DEFAULT_ADRIFT_THRESHOLD = 21;
const DEFAULT_RECOMMENDED_ANCHORED = 5;
const DEFAULT_SLACK_CHANNEL = "";
const DEFAULT_ALLOW_INDEPENDENT = false;

export default function DefaultsSettingsPage() {
  const [alignmentInactivity, setAlignmentInactivity] = useState(
    DEFAULT_ALIGNMENT_INACTIVITY
  );
  const [adriftThreshold, setAdriftThreshold] = useState(
    DEFAULT_ADRIFT_THRESHOLD
  );
  const [recommendedAnchored, setRecommendedAnchored] = useState(
    DEFAULT_RECOMMENDED_ANCHORED
  );
  const [slackChannel, setSlackChannel] = useState(DEFAULT_SLACK_CHANNEL);
  const [allowIntentionallyIndependent, setAllowIntentionallyIndependent] =
    useState(DEFAULT_ALLOW_INDEPENDENT);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-foreground">Defaults</h2>
      <div className="max-w-xl space-y-2 text-sm text-muted-foreground">
        <p>
          Use these settings to tune how Helm nudges teams when alignment
          threads go quiet, how it guides quarter planning around{" "}
          <span className="text-foreground">Anchored</span> outcomes, and
          where new conversations start in Slack.
        </p>
        <p>
          Values below are local to this screen for now; persisting them to
          your organization will follow as the product connects settings to
          the live experience.
        </p>
      </div>

      <div className="max-w-xl space-y-8 rounded-lg border border-border bg-card p-4 shadow-sm">
        <section className="space-y-4" aria-labelledby="defaults-nudges-heading">
          <h3
            id="defaults-nudges-heading"
            className="text-sm font-medium text-foreground"
          >
            Nudges and drift
          </h3>

          <div className="space-y-2">
            <label
              htmlFor="alignment-inactivity"
              className="block text-sm font-medium text-foreground"
            >
              Alignment inactivity threshold
            </label>
            <input
              id="alignment-inactivity"
              type="number"
              min={1}
              max={365}
              value={alignmentInactivity}
              onChange={(e) =>
                setAlignmentInactivity(Number(e.target.value) || 0)
              }
              aria-describedby="alignment-inactivity-desc"
              className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p
              id="alignment-inactivity-desc"
              className="text-xs text-muted-foreground"
            >
              Days without messages or other signals in an outcome’s shared
              alignment thread before Helm treats the team as quiet and nudges
              them to reconnect.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="adrift-threshold"
              className="block text-sm font-medium text-foreground"
            >
              Adrift threshold
            </label>
            <input
              id="adrift-threshold"
              type="number"
              min={1}
              max={365}
              value={adriftThreshold}
              onChange={(e) => setAdriftThreshold(Number(e.target.value) || 0)}
              aria-describedby="adrift-threshold-desc"
              className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p
              id="adrift-threshold-desc"
              className="text-xs text-muted-foreground"
            >
              Days without meaningful engagement before Helm may treat an
              outcome as a candidate for{" "}
              <span className="text-foreground">Adrift</span>—when strategy
              drift or loss of momentum is likely.
            </p>
          </div>
        </section>

        <div className="space-y-2">
          <label
            htmlFor="recommended-anchored"
            className="block text-sm font-medium text-foreground"
          >
            Recommended anchored outcomes
          </label>
          <input
            id="recommended-anchored"
            type="number"
            min={1}
            max={50}
            value={recommendedAnchored}
            onChange={(e) =>
              setRecommendedAnchored(Number(e.target.value) || 0)
            }
            aria-describedby="recommended-anchored-desc"
            className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p
            id="recommended-anchored-desc"
            className="text-xs text-muted-foreground"
          >
            Soft target for how many Anchored quarter priorities Helm suggests.
            Planning guidance when you add outcomes may reference this number.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="slack-channel"
            className="block text-sm font-medium text-foreground"
          >
            Slack channel name
          </label>
          <input
            id="slack-channel"
            type="text"
            placeholder="#strategy"
            value={slackChannel}
            onChange={(e) => setSlackChannel(e.target.value)}
            aria-describedby="slack-channel-desc"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p id="slack-channel-desc" className="text-xs text-muted-foreground">
            Default channel for new alignment threads and Slack notifications
            once your workspace is connected to Slack.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <button
              type="button"
              id="allow-independent-switch"
              role="switch"
              aria-checked={allowIntentionallyIndependent}
              aria-labelledby="allow-independent-label"
              aria-describedby="allow-independent-desc"
              onClick={() =>
                setAllowIntentionallyIndependent((prev) => !prev)
              }
              className={cn(
                "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                allowIntentionallyIndependent ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform",
                  allowIntentionallyIndependent && "translate-x-5"
                )}
              />
            </button>
            <div className="min-w-0 space-y-1">
              <span
                id="allow-independent-label"
                className="block text-sm font-medium text-foreground"
              >
                Allow intentionally independent outcomes
              </span>
              <p
                id="allow-independent-desc"
                className="text-xs text-muted-foreground"
              >
                When on, teams can mark outcomes that sit outside the main
                quarter charter. Those outcomes are not treated like standard
                Anchored priorities for recommendations and nudges. This will
                apply once outcome settings support the option.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
