import { sql } from '@payloadcms/db-sqlite'

type SqlRunner = {
  run: (query: ReturnType<typeof sql>) => Promise<{ rows: unknown[] }>
}

function columnNames(rows: unknown[]) {
  return new Set((rows as unknown as { name: string }[]).map((row) => row.name))
}

/**
 * The live SQLite file was created before later admin fields existed.
 * Login and the dashboard select those columns, so a missing one crashes the page.
 */
export async function ensureLiveSchema(db: SqlRunner) {
  const users = await db.run(sql`PRAGMA table_info(users)`)
  const userColumns = columnNames(users.rows)
  if (!userColumns.has('name')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`name\` text`)
  }
  if (!userColumns.has('role')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`role\` text DEFAULT 'admin' NOT NULL`)
  }
  if (!userColumns.has('phone')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`phone\` text`)
  }
  if (!userColumns.has('subscription_start')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`subscription_start\` text`)
  }
  if (!userColumns.has('subscription_end')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`subscription_end\` text`)
  }
  if (!userColumns.has('renew_one_year')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`renew_one_year\` integer DEFAULT 0`)
  }
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_phone_idx\` ON \`users\` (\`phone\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`users_subscription_end_idx\` ON \`users\` (\`subscription_end\`)`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`login_otps\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`email\` text NOT NULL,
    \`code_hash\` text NOT NULL,
    \`expires_at\` text NOT NULL,
    \`attempts\` numeric DEFAULT 0,
    \`used_at\` text,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  )`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`login_otps_email_idx\` ON \`login_otps\` (\`email\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`login_otps_updated_at_idx\` ON \`login_otps\` (\`updated_at\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`login_otps_created_at_idx\` ON \`login_otps\` (\`created_at\`)`)

  await db.run(sql`CREATE TABLE IF NOT EXISTS \`customer_files\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`customer_id\` integer NOT NULL,
    \`title\` text NOT NULL,
    \`video_url\` text,
    \`download_url\` text,
    \`note\` text,
    \`order\` numeric DEFAULT 0,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`url\` text,
    \`thumbnail_u_r_l\` text,
    \`filename\` text,
    \`mime_type\` text,
    \`filesize\` numeric,
    \`width\` numeric,
    \`height\` numeric,
    \`focal_x\` numeric,
    \`focal_y\` numeric,
    \`sizes_thumbnail_url\` text,
    \`sizes_thumbnail_width\` numeric,
    \`sizes_thumbnail_height\` numeric,
    \`sizes_thumbnail_mime_type\` text,
    \`sizes_thumbnail_filesize\` numeric,
    \`sizes_thumbnail_filename\` text,
    FOREIGN KEY (\`customer_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  )`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`customer_files_customer_idx\` ON \`customer_files\` (\`customer_id\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`customer_files_updated_at_idx\` ON \`customer_files\` (\`updated_at\`)`)
  await db.run(sql`CREATE INDEX IF NOT EXISTS \`customer_files_created_at_idx\` ON \`customer_files\` (\`created_at\`)`)
  await db.run(sql`CREATE UNIQUE INDEX IF NOT EXISTS \`customer_files_filename_idx\` ON \`customer_files\` (\`filename\`)`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`customer_files_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`customer_files\` (\`sizes_thumbnail_filename\`)`,
  )

  const rels = await db.run(sql`PRAGMA table_info(payload_locked_documents_rels)`)
  const relColumns = columnNames(rels.rows)
  if (!relColumns.has('customer_files_id')) {
    await db.run(
      sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`customer_files_id\` integer REFERENCES \`customer_files\`(\`id\`) ON UPDATE no action ON DELETE cascade`,
    )
  }
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_customer_files_id_idx\` ON \`payload_locked_documents_rels\` (\`customer_files_id\`)`,
  )
  if (!relColumns.has('login_otps_id')) {
    await db.run(
      sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`login_otps_id\` integer REFERENCES \`login_otps\`(\`id\`) ON UPDATE no action ON DELETE cascade`,
    )
  }
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_login_otps_id_idx\` ON \`payload_locked_documents_rels\` (\`login_otps_id\`)`,
  )
}
