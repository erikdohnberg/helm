-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "fiscalYearStartMonth" INTEGER;
ALTER TABLE "Organization" ADD COLUMN "upcomingFiscalQuarter" INTEGER;
ALTER TABLE "Organization" ADD COLUMN "upcomingFiscalYearLabel" INTEGER;
ALTER TABLE "Organization" ADD COLUMN "upcomingQuarterEndDate" DATETIME;
ALTER TABLE "Organization" ADD COLUMN "upcomingQuarterStartDate" DATETIME;
ALTER TABLE "Organization" ADD COLUMN "upcomingQuarterStartMonth" INTEGER;
