import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Live SQLite was created before Users had `name` and `role`.
 * Login selects those columns and crashes with "no such column" if they are missing.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const info = await db.run(sql`PRAGMA table_info(users)`)
  const names = new Set((info.rows as unknown as { name: string }[]).map((row) => row.name))

  if (!names.has('name')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`name\` text`)
  }
  if (!names.has('role')) {
    await db.run(sql`ALTER TABLE \`users\` ADD \`role\` text DEFAULT 'admin' NOT NULL`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // SQLite cannot drop a column without rebuilding the table.
}
