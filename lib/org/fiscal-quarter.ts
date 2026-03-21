/**
 * Fiscal quarters: Q1–Q4 are three consecutive calendar months each, in order,
 * starting from fiscalYearStartMonth (1 = January, 12 = December). Wraps across years.
 *
 * Example: fiscalYearStartMonth = 10 (October). Then Q1 = Oct–Dec, Q2 = Jan–Mar,
 * Q3 = Apr–Jun, Q4 = Jul–Sep.
 */

import type { Quarter } from "@/lib/types";

/** Calendar month 1–12 */
export type Month1to12 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Fiscal quarter slot 1–4 */
export type FiscalQuarter1to4 = 1 | 2 | 3 | 4;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** First calendar month (1–12) of fiscal quarter Q for a FY that starts in month S. */
export function firstMonthOfFiscalQuarter(
  fiscalYearStartMonth: Month1to12,
  fiscalQuarter: FiscalQuarter1to4
): Month1to12 {
  const s = fiscalYearStartMonth - 1;
  const q = fiscalQuarter - 1;
  return (mod(s + q * 3, 12) + 1) as Month1to12;
}

export function quarterStartMonthMatchesFiscalSlot(
  fiscalYearStartMonth: Month1to12,
  fiscalQuarter: FiscalQuarter1to4,
  claimedStartMonth: Month1to12
): boolean {
  return firstMonthOfFiscalQuarter(fiscalYearStartMonth, fiscalQuarter) === claimedStartMonth;
}

/**
 * The unique fiscal year start month S (1–12) such that fiscal quarter Q begins in
 * calendar month M. (Every pair (M, Q) defines exactly one FY calendar.)
 *
 * Inverse of: firstMonthOfFiscalQuarter(S, Q) === M
 */
export function inferFiscalYearStartMonthFromQuarterAndMonth(
  nextQuarterFirstMonth: Month1to12,
  fiscalQuarter: FiscalQuarter1to4
): Month1to12 {
  const M = nextQuarterFirstMonth;
  const q = fiscalQuarter - 1;
  const s0 = mod(M - 1 - 3 * q, 12);
  return (s0 + 1) as Month1to12;
}

/** UTC date at midnight for calendar Y-M-D. */
export function utcDate(y: number, month1to12: number, day: number): Date {
  return new Date(Date.UTC(y, month1to12 - 1, day));
}

/** Inclusive end date (UTC midnight) of the 3-month block starting at quarterStart. */
export function quarterEndDateUtc(quarterStart: Date): Date {
  const y = quarterStart.getUTCFullYear();
  const m = quarterStart.getUTCMonth();
  const lastDay = new Date(Date.UTC(y, m + 3, 0));
  return new Date(
    Date.UTC(lastDay.getUTCFullYear(), lastDay.getUTCMonth(), lastDay.getUTCDate())
  );
}

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

/**
 * Start of the fiscal year period that contains `quarterStart` (FY begins first day of month S).
 */
export function fiscalYearStartContaining(
  fiscalYearStartMonth: Month1to12,
  quarterStart: Date
): Date {
  const qs = startOfUtcDay(quarterStart);
  const baseY = qs.getUTCFullYear();
  const S = fiscalYearStartMonth;

  for (let dy = -2; dy <= 2; dy++) {
    const fy0 = utcDate(baseY + dy, S, 1);
    const fy1 = utcDate(baseY + dy + 1, S, 1);
    if (qs >= fy0 && qs < fy1) {
      return fy0;
    }
  }

  return utcDate(baseY, S, 1);
}

/** Label year (e.g. 2026 for "FY26"): max calendar year in the 12 fiscal months starting at fy0. */
export function fiscalYearLabelFromFyStart(fy0: Date, fiscalYearStartMonth: Month1to12): number {
  const fy1 = utcDate(fy0.getUTCFullYear() + 1, fiscalYearStartMonth, 1);
  let maxY = fy0.getUTCFullYear();
  for (let d = new Date(fy0); d < fy1; ) {
    maxY = Math.max(maxY, d.getUTCFullYear());
    d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  }
  return maxY;
}

export function fiscalYearLabelForQuarterStart(
  fiscalYearStartMonth: Month1to12,
  quarterStart: Date
): number {
  const fy0 = fiscalYearStartContaining(fiscalYearStartMonth, quarterStart);
  return fiscalYearLabelFromFyStart(fy0, fiscalYearStartMonth);
}

/**
 * Next quarter start: first day of `quarterStartMonth` on or after `reference`, after validating
 * that month is the first month of `fiscalQuarter` under `fiscalYearStartMonth`.
 */
export function resolveNextQuarterStartUtc(
  fiscalYearStartMonth: Month1to12,
  fiscalQuarter: FiscalQuarter1to4,
  quarterStartMonth: Month1to12,
  reference: Date
): Date {
  const expected = firstMonthOfFiscalQuarter(fiscalYearStartMonth, fiscalQuarter);
  if (quarterStartMonth !== expected) {
    throw new Error(
      "Quarter start month does not match fiscal quarter for this fiscal year start."
    );
  }

  const ref = startOfUtcDay(reference);
  const refY = ref.getUTCFullYear();
  const M = quarterStartMonth;

  for (let delta = -1; delta <= 5; delta++) {
    const y = refY + delta;
    const candidate = utcDate(y, M, 1);
    if (candidate >= ref) {
      return candidate;
    }
  }
  return utcDate(refY + 6, M, 1);
}

export function formatFyQuarterLabel(fiscalYearLabel: number, fiscalQuarter: FiscalQuarter1to4): string {
  const two = fiscalYearLabel % 100;
  const yy = two < 10 ? `0${two}` : String(two);
  return `FY${yy} Q${fiscalQuarter}`;
}

export function orgPrimaryQuarterId(orgId: string): string {
  return `org:${orgId}:primary`;
}

export type OrgQuarterFields = {
  orgId: string;
  upcomingQuarterStartDate: Date;
  upcomingQuarterEndDate: Date;
  upcomingFiscalYearLabel: number;
  upcomingFiscalQuarter: FiscalQuarter1to4;
};

/** Build domain Quarter for the org's configured primary (upcoming) quarter. */
/** Load persisted org row into a domain Quarter, or null if not configured. */
export type OrgQuarterPersisted = {
  id: string;
  upcomingQuarterStartDate: Date | null;
  upcomingQuarterEndDate: Date | null;
  upcomingFiscalYearLabel: number | null;
  upcomingFiscalQuarter: number | null;
};

export function quarterFromOrgRow(org: OrgQuarterPersisted): Quarter | null {
  if (
    !org.upcomingQuarterStartDate ||
    !org.upcomingQuarterEndDate ||
    org.upcomingFiscalYearLabel == null ||
    org.upcomingFiscalQuarter == null ||
    org.upcomingFiscalQuarter < 1 ||
    org.upcomingFiscalQuarter > 4
  ) {
    return null;
  }
  return orgFieldsToQuarter({
    orgId: org.id,
    upcomingQuarterStartDate: org.upcomingQuarterStartDate,
    upcomingQuarterEndDate: org.upcomingQuarterEndDate,
    upcomingFiscalYearLabel: org.upcomingFiscalYearLabel,
    upcomingFiscalQuarter: org.upcomingFiscalQuarter as FiscalQuarter1to4,
  });
}

export function orgFieldsToQuarter(fields: OrgQuarterFields): Quarter {
  const id = orgPrimaryQuarterId(fields.orgId);
  const startIso = fields.upcomingQuarterStartDate.toISOString().slice(0, 10);
  const endIso = fields.upcomingQuarterEndDate.toISOString().slice(0, 10);
  const now = startOfUtcDay(new Date());
  const hasStarted = fields.upcomingQuarterStartDate <= now;

  return {
    id,
    label: formatFyQuarterLabel(
      fields.upcomingFiscalYearLabel,
      fields.upcomingFiscalQuarter
    ),
    year: fields.upcomingFiscalYearLabel,
    startDate: startIso,
    endDate: endIso,
    narrativeSummary: null,
    hasStarted,
  };
}

/**
 * Compute persisted bounds + inferred fiscal year start from onboarding inputs:
 * the first month of the next quarter, and which fiscal quarter (Q1–Q4) that is.
 */
export function computeUpcomingQuarterFromUserSelection(
  nextQuarterFirstMonth: Month1to12,
  fiscalQuarter: FiscalQuarter1to4,
  reference: Date = new Date()
): {
  fiscalYearStartMonth: Month1to12;
  start: Date;
  end: Date;
  fiscalYearLabel: number;
} {
  const fiscalYearStartMonth = inferFiscalYearStartMonthFromQuarterAndMonth(
    nextQuarterFirstMonth,
    fiscalQuarter
  );
  const start = resolveNextQuarterStartUtc(
    fiscalYearStartMonth,
    fiscalQuarter,
    nextQuarterFirstMonth,
    reference
  );
  const end = quarterEndDateUtc(start);
  const fiscalYearLabel = fiscalYearLabelForQuarterStart(fiscalYearStartMonth, start);
  return { fiscalYearStartMonth, start, end, fiscalYearLabel };
}
