-- US-E3: per-user email notification preferences.
--
-- Stores a JSON map of EmailNotificationPreferences (see
-- packages/shared/src/notifications.ts). Empty default = every kind is
-- ON (the helper layers the defaults at read time, so existing users
-- need no backfill).

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" JSONB NOT NULL DEFAULT '{}';
