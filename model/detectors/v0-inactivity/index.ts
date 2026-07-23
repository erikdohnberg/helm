/**
 * v0 inactivity baseline (spec §8.4): flag any charter with zero mapped signals
 * for N consecutive days.
 *
 * v0 has no real relevance mapping, so it uses the simplest possible one: a
 * signal maps to a charter if its content contains the charter title, any
 * alias, or the metric name (case-insensitive substring). N is a parameter.
 *
 * Because the replay runner only invokes the detector on days that have
 * signals, "N consecutive days" is measured in calendar days: on each observed
 * day it checks the gap since the charter's last mapped signal (or, if none yet,
 * since the first observed day). The clock starts at the first observed day, not
 * the anchor date — the seed scenarios begin near drift onset, not at anchoring.
 */
import {
  DriftEventSchema,
  type Charter,
  type DriftEvent,
  type Signal,
} from "../../contracts/index.ts";
import type { Detector } from "../../eval/detector.ts";

interface Cite {
  signal_id: string;
  content: string;
  source: string;
  date: string;
}

interface V0State {
  n: number;
  firstDay: string | null;
  lastMappedDay: Record<string, string | null>;
  lastMappedSignal: Record<string, Cite | null>;
  lastSeenSignal: Cite | null;
  flagged: Record<string, boolean>;
}

const MS_PER_DAY = 86_400_000;
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(to) - Date.parse(from)) / MS_PER_DAY);

const lower = (s: string) => s.toLowerCase();

/** v0's crude mapping: content contains the title, an alias, or the metric name. */
export function mapsToCharter(signal: Signal, charter: Charter): boolean {
  const needles = [...charter.aliases, charter.success_metric.name].map(lower).filter(Boolean);
  const content = lower(signal.content);
  return needles.some((n) => content.includes(n));
}

function citeOf(signal: Signal, date: string): Cite {
  return {
    signal_id: signal.id,
    content: signal.content,
    source: String(signal.metadata?.original_source ?? signal.source_type),
    date,
  };
}

export function v0InactivityDetector(n: number, version = "1.0.0"): Detector<V0State> {
  return {
    name: `v0-inactivity-n${n}`,
    version,
    initialState(charters: Charter[]): V0State {
      const lastMappedDay: Record<string, string | null> = {};
      const lastMappedSignal: Record<string, Cite | null> = {};
      const flagged: Record<string, boolean> = {};
      for (const c of charters) {
        lastMappedDay[c.id] = null;
        lastMappedSignal[c.id] = null;
        flagged[c.id] = false;
      }
      return { n, firstDay: null, lastMappedDay, lastMappedSignal, lastSeenSignal: null, flagged };
    },
    observe({ date, charters, daySignals, state }) {
      if (state.firstDay === null) state.firstDay = date;
      if (daySignals.length) {
        const last = daySignals[daySignals.length - 1];
        state.lastSeenSignal = citeOf(last, date);
      }

      // Refresh each charter's last-mapped clock from today's signals.
      for (const charter of charters) {
        const mapped = daySignals.filter((s) => mapsToCharter(s, charter));
        if (mapped.length) {
          state.lastMappedDay[charter.id] = date;
          state.lastMappedSignal[charter.id] = citeOf(mapped[mapped.length - 1], date);
        }
      }

      const events: DriftEvent[] = [];
      for (const charter of charters) {
        if (state.flagged[charter.id]) continue;
        const ref = state.lastMappedDay[charter.id] ?? state.firstDay!;
        if (daysBetween(ref, date) < state.n) continue;

        // Inactivity is attention decay; sustained zero-signal is its terminal
        // (silent-abandonment) endpoint, expressed as severity: major (spec §3).
        // Evidence is the last on-topic signal if any mapped; otherwise the most
        // recent signal seen — cited to satisfy the "every event cites a signal"
        // rule even though the flag is really about an absence.
        const cite = state.lastMappedSignal[charter.id] ?? state.lastSeenSignal!;
        events.push(
          DriftEventSchema.parse({
            id: `${charter.id}-v0-inactivity-${date}`,
            charter_id: charter.id,
            drift_type: "attention_decay",
            severity: "major",
            confidence: 0.5,
            evidence: [
              {
                signal_id: cite.signal_id,
                quote: cite.content.slice(0, 240),
                source: cite.source,
                occurred_at: cite.date,
              },
            ],
            suggested_recipients: charter.owners.map((a) => ({
              actor_id: a,
              reason: `charter owner — no mapped activity for ${state.n}+ days`,
            })),
          })
        );
        state.flagged[charter.id] = true;
      }
      return { events, state };
    },
  };
}
