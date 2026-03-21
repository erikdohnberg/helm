import { describe, expect, it } from "vitest";

import {
  computeUpcomingQuarterFromUserSelection,
  firstMonthOfFiscalQuarter,
  fiscalYearLabelForQuarterStart,
  fiscalYearStartContaining,
  inferFiscalYearStartMonthFromQuarterAndMonth,
  quarterEndDateUtc,
  quarterStartMonthMatchesFiscalSlot,
  resolveNextQuarterStartUtc,
  utcDate,
} from "./fiscal-quarter";
import type { FiscalQuarter1to4, Month1to12 } from "./fiscal-quarter";

describe("firstMonthOfFiscalQuarter", () => {
  it("uses October fiscal start: Q1=Oct, Q2=Jan, Q3=Apr, Q4=Jul", () => {
    expect(firstMonthOfFiscalQuarter(10, 1)).toBe(10);
    expect(firstMonthOfFiscalQuarter(10, 2)).toBe(1);
    expect(firstMonthOfFiscalQuarter(10, 3)).toBe(4);
    expect(firstMonthOfFiscalQuarter(10, 4)).toBe(7);
  });

  it("uses January fiscal start: Q1=Jan, Q2=Apr, …", () => {
    expect(firstMonthOfFiscalQuarter(1, 1)).toBe(1);
    expect(firstMonthOfFiscalQuarter(1, 2)).toBe(4);
    expect(firstMonthOfFiscalQuarter(1, 3)).toBe(7);
    expect(firstMonthOfFiscalQuarter(1, 4)).toBe(10);
  });
});

describe("quarterStartMonthMatchesFiscalSlot", () => {
  it("rejects wrong month for slot", () => {
    expect(quarterStartMonthMatchesFiscalSlot(10, 3, 1)).toBe(false);
    expect(quarterStartMonthMatchesFiscalSlot(10, 3, 4)).toBe(true);
  });
});

describe("fiscalYearStartContaining", () => {
  it("places April 2026 in FY starting Oct 2025", () => {
    const qs = utcDate(2026, 4, 1);
    const fy0 = fiscalYearStartContaining(10, qs);
    expect(fy0.getUTCFullYear()).toBe(2025);
    expect(fy0.getUTCMonth()).toBe(9);
  });
});

describe("fiscalYearLabelForQuarterStart", () => {
  it("labels Oct FY Q3 start April 2026 as FY26-style year 2026", () => {
    const label = fiscalYearLabelForQuarterStart(10, utcDate(2026, 4, 1));
    expect(label).toBe(2026);
  });
});

describe("resolveNextQuarterStartUtc", () => {
  it("returns first matching month on or after reference", () => {
    const ref = utcDate(2026, 3, 15);
    const start = resolveNextQuarterStartUtc(10, 3, 4, ref);
    expect(start.toISOString().slice(0, 10)).toBe("2026-04-01");
  });
});

describe("quarterEndDateUtc", () => {
  it("covers three calendar months inclusive", () => {
    const start = utcDate(2026, 4, 1);
    const end = quarterEndDateUtc(start);
    expect(end.toISOString().slice(0, 10)).toBe("2026-06-30");
  });
});

describe("inferFiscalYearStartMonthFromQuarterAndMonth", () => {
  it("inverts firstMonthOfFiscalQuarter for every FY start and quarter", () => {
    for (let s = 1; s <= 12; s++) {
      for (let q = 1; q <= 4; q++) {
        const M = firstMonthOfFiscalQuarter(s as Month1to12, q as FiscalQuarter1to4);
        expect(
          inferFiscalYearStartMonthFromQuarterAndMonth(M, q as FiscalQuarter1to4)
        ).toBe(s);
      }
    }
  });
});

describe("computeUpcomingQuarterFromUserSelection", () => {
  it("derives October FY and next Q3 start from April + Q3 with a March reference", () => {
    const ref = utcDate(2026, 3, 15);
    const out = computeUpcomingQuarterFromUserSelection(4, 3, ref);
    expect(out.fiscalYearStartMonth).toBe(10);
    expect(out.start.toISOString().slice(0, 10)).toBe("2026-04-01");
    expect(out.end.toISOString().slice(0, 10)).toBe("2026-06-30");
    expect(out.fiscalYearLabel).toBe(2026);
  });

  it("picks the next calendar occurrence of the quarter start month", () => {
    const ref = utcDate(2026, 5, 1);
    const out = computeUpcomingQuarterFromUserSelection(7, 4, ref);
    expect(out.fiscalYearStartMonth).toBe(10);
    expect(out.start.toISOString().slice(0, 10)).toBe("2026-07-01");
  });
});
