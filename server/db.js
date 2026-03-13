import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, "..", ".data");
const dbPath = join(dataDir, "sunsmart.sqlite");

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    settings_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    skin_tone TEXT NOT NULL,
    start_time TEXT NOT NULL,
    reminder_interval TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reminder_log (
    reminder_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reminder_type TEXT NOT NULL,
    scheduled_for TEXT NOT NULL,
    sent_at TEXT NOT NULL,
    delivery_status TEXT NOT NULL,
    provider_message TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );
`);

const seedUserId = "demo-user";

db.prepare(`
  INSERT INTO users (user_id, email, name)
  VALUES (?, ?, ?)
  ON CONFLICT(user_id) DO NOTHING
`).run(seedUserId, "student@monash.edu", "SunSmart Demo User");

db.prepare(`
  INSERT INTO user_settings (settings_id, user_id, location, skin_tone, start_time, reminder_interval)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id) DO NOTHING
`).run(`${seedUserId}-settings`, seedUserId, "Melbourne, VIC", "light", "09:00", "2 hours");

const getJoinedSettings = db.prepare(`
  SELECT
    u.user_id,
    u.email,
    u.name,
    s.settings_id,
    s.location,
    s.skin_tone,
    s.start_time,
    s.reminder_interval
  FROM users u
  LEFT JOIN user_settings s ON s.user_id = u.user_id
  WHERE u.user_id = ?
`);

const upsertUser = db.prepare(`
  INSERT INTO users (user_id, email, name)
  VALUES (?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    email = excluded.email,
    name = excluded.name
`);

const upsertSettings = db.prepare(`
  INSERT INTO user_settings (settings_id, user_id, location, skin_tone, start_time, reminder_interval)
  VALUES (?, ?, ?, ?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    location = excluded.location,
    skin_tone = excluded.skin_tone,
    start_time = excluded.start_time,
    reminder_interval = excluded.reminder_interval
`);

const listSettingsRows = db.prepare(`
  SELECT
    u.user_id,
    u.email,
    u.name,
    s.settings_id,
    s.location,
    s.skin_tone,
    s.start_time,
    s.reminder_interval
  FROM users u
  INNER JOIN user_settings s ON s.user_id = u.user_id
`);

const getReminderLogBySchedule = db.prepare(`
  SELECT reminder_id
  FROM reminder_log
  WHERE user_id = ?
    AND reminder_type = ?
    AND scheduled_for = ?
  LIMIT 1
`);

const insertReminderLog = db.prepare(`
  INSERT INTO reminder_log (
    reminder_id,
    user_id,
    reminder_type,
    scheduled_for,
    sent_at,
    delivery_status,
    provider_message
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

export function getUserSettings(userId) {
  const row = getJoinedSettings.get(userId);

  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    settingsId: row.settings_id,
    email: row.email,
    name: row.name,
    location: row.location,
    skinTone: row.skin_tone,
    startTime: row.start_time,
    interval: row.reminder_interval,
  };
}

export function saveUserSettings({
  userId,
  email,
  name,
  location,
  skinTone,
  startTime,
  interval,
}) {
  const existing = getUserSettings(userId);
  const settingsId = existing?.settingsId ?? `${userId}-${randomUUID()}`;

  upsertUser.run(userId, email, name);
  upsertSettings.run(settingsId, userId, location, skinTone, startTime, interval);

  return getUserSettings(userId);
}

export function getDatabasePath() {
  return dbPath;
}

export function listAllSettings() {
  return listSettingsRows.all().map((row) => ({
    userId: row.user_id,
    settingsId: row.settings_id,
    email: row.email,
    name: row.name,
    location: row.location,
    skinTone: row.skin_tone,
    startTime: row.start_time,
    interval: row.reminder_interval,
  }));
}

export function hasReminderBeenSent(userId, reminderType, scheduledFor) {
  return Boolean(getReminderLogBySchedule.get(userId, reminderType, scheduledFor));
}

export function logReminder({
  userId,
  reminderType,
  scheduledFor,
  deliveryStatus,
  providerMessage = "",
}) {
  insertReminderLog.run(
    randomUUID(),
    userId,
    reminderType,
    scheduledFor,
    new Date().toISOString(),
    deliveryStatus,
    providerMessage,
  );
}
