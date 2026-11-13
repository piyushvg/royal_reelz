import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite'

import { ensureLiveSchema } from '../ensureLiveSchema'

/** first/middle/last name and the second mobile number were added after the live database was created. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await ensureLiveSchema(db)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep the columns. Dropping them would remove customer names and mobile numbers.
}
