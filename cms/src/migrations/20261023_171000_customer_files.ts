import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite'

import { ensureLiveSchema } from '../ensureLiveSchema'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await ensureLiveSchema(db)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Leaving the table in place avoids dropping customer files on rollback.
}
