// Ek baar chalao: Site table me favicon ke 2 naye columns jod deta hai.
// Run (cms folder me):  node --env-file=.env fix-site-columns.mjs
import { createClient } from '@libsql/client'

const url = process.env.DATABASE_URL || 'file:./royal-reelz.db'
const db = createClient({ url })

const have = (await db.execute('PRAGMA table_info(`site`)')).rows.map((r) => String(r.name))
console.log('Site table columns:', have.join(', '))

if (!have.includes('favicon_id')) {
  await db.execute('ALTER TABLE `site` ADD COLUMN `favicon_id` integer REFERENCES `media`(`id`) ON DELETE SET NULL')
  console.log('+ favicon_id joda')
}
if (!have.includes('favicon_path')) {
  await db.execute('ALTER TABLE `site` ADD COLUMN `favicon_path` text')
  console.log('+ favicon_path joda')
}
console.log('Done. Ab `pnpm run dev` chalao.')
process.exit(0)
