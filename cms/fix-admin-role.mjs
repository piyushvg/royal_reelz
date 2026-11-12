// Usage (project root me, dev server band karke):
//   node fix-admin-role.mjs admin@royalreelz.com
// Us email ke user ka role "admin" kar deta hai (purane admin ko DB column default se "customer" mil gaya tha).
import { createClient } from '@libsql/client'

const email = (process.argv[2] || '').trim().toLowerCase()
const url = process.env.DATABASE_URL || 'file:./royal-reelz.db'
const db = createClient({ url })

const before = await db.execute('SELECT id, email, role FROM users')
console.log('Users abhi:')
console.table(before.rows.map((r) => ({ id: r.id, email: r.email, role: r.role })))

if (!email) {
  console.log('\nEmail do:  node fix-admin-role.mjs admin@royalreelz.com')
  process.exit(0)
}

const res = await db.execute({ sql: 'UPDATE users SET role = ? WHERE lower(email) = ?', args: ['admin', email] })
console.log(res.rowsAffected ? `\n✔ ${email} ab admin hai.` : `\n✘ ${email} naam ka koi user nahi mila (upar list dekho).`)
process.exit(0)
