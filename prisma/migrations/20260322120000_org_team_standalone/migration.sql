-- CreateTable
CREATE TABLE "OrgTeam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chatUserId" TEXT NOT NULL,
    "chatDisplayName" TEXT,
    "chatImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrgTeam_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OrgTeam_orgId_chatUserId_key" ON "OrgTeam"("orgId", "chatUserId");
