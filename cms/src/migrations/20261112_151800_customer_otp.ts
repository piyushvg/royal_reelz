import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-sqlite'

import { ensureLiveSchema } from '../ensureLiveSchema'

/** Phone, subscription dates, and the OTP table were added after the live database was created. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await ensureLiveSchema(db)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep the columns. Dropping them would remove customer phone numbers and subscriptions.
}
