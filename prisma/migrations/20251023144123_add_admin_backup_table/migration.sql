-- CreateTable
CREATE TABLE "admin_backups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "aiToolsCount" INTEGER NOT NULL DEFAULT 0,
    "templatesCount" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL DEFAULT 0,
    "checksum" TEXT NOT NULL DEFAULT '',
    "data" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "admin_backups_createdBy_idx" ON "admin_backups"("createdBy");

-- CreateIndex
CREATE INDEX "admin_backups_type_idx" ON "admin_backups"("type");

-- CreateIndex
CREATE INDEX "admin_backups_status_idx" ON "admin_backups"("status");

-- CreateIndex
CREATE INDEX "admin_backups_createdAt_idx" ON "admin_backups"("createdAt");
