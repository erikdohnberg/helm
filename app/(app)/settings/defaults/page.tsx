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
      <p className="text-sm text-muted-foreground">
        Set default values and preferences for new items.
      </p>

      <div className="max-w-xl space-y-6 rounded-lg border border-border bg-card p-4 shadow-sm">
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
            className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Days</p>
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
            className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Days</p>
        </div>

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
            className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={allowIntentionallyIndependent}
            aria-label="Allow intentionally independent"
            onClick={() =>
              setAllowIntentionallyIndependent((prev) => !prev)
            }
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full border border-border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
          <span className="text-sm font-medium text-foreground">
            Allow intentionally independent
          </span>
        </div>
      </div>
    </div>
  );
}
