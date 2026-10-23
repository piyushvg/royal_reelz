import { sql, sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type Payload } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Awards } from './collections/Awards'
import { CustomerFiles } from './collections/CustomerFiles'
import { Enquiries } from './collections/Enquiries'
import { Media } from './collections/Media'
import { Photos } from './collections/Photos'
import { Places } from './collections/Places'
import { Press } from './collections/Press'
import { Services } from './collections/Services'
import { Slides } from './collections/Slides'
import { Team } from './collections/Team'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { enquiryEndpoint } from './endpoints/enquiry'
import { frontendEndpoint } from './endpoints/frontend'
import { migrations } from './migrations'
import { About } from './globals/About'
import { Contact } from './globals/Contact'
import { Destinations } from './globals/Destinations'
import { Gallery } from './globals/Gallery'
import { Site } from './globals/Site'
import { seedIfEmpty } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Production DB predates the name/role columns. Login SELECTs them and 500s if they are absent. */
async function ensureUserColumns(payload: Payload) {
  const info = await payload.db.drizzle.run(sql`PRAGMA table_info(users)`)
  const names = new Set((info.rows as { name: string }[]).map((row) => row.name))

  if (!names.has('name')) {
    await payload.db.drizzle.run(sql`ALTER TABLE \`users\` ADD \`name\` text`)
  }
  if (!names.has('role')) {
    await payload.db.drizzle.run(sql`ALTER TABLE \`users\` ADD \`role\` text DEFAULT 'admin' NOT NULL`)
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Royal Reelz CMS',
      description: 'Royal Reelz CMS — manage the Royal Reelz luxury wedding films & photography website.',
      icons: [{ rel: 'icon', url: '/favicon.ico' }],
      openGraph: {
        siteName: 'Royal Reelz CMS',
        title: 'Royal Reelz CMS',
        description: 'Royal Reelz CMS — manage the Royal Reelz luxury wedding films & photography website.',
        images: [],
      },
    },
    theme: 'light',
    components: {
      beforeNavLinks: ['/components/SidebarLogo#SidebarLogo'],
      graphics: {
        Logo: '/components/Logo#Logo',
        Icon: '/components/Icon#Icon',
      },
      beforeDashboard: ['/components/BeforeDashboard#BeforeDashboard'],
    },
  },
  collections: [Users, Media, Slides, Awards, Press, Places, Photos, Services, Team, Videos, Enquiries, CustomerFiles],
  globals: [Site, About, Destinations, Gallery, Contact],
  endpoints: [frontendEndpoint, enquiryEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:9007',
  cors: [
    'http://localhost:9007',
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:80',
    'http://127.0.0.1:80',

    // Royal Reelz local frontend
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://royalreelz.sandvirp.com',
    'https://cms.sandvirp.com',
  ],
  csrf: [
    'http://localhost:9007',
    'http://localhost',
    'http://127.0.0.1',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://royalreelz.sandvirp.com',
    'https://cms.sandvirp.com',
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./royal-reelz.db',
    },
    push: true,
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    await ensureUserColumns(payload)
    await seedIfEmpty(payload)

    // Role column add hote hi purana owner "customer" ban gaya tha,
    // isliye admin panel login reject ho raha tha.
    try {
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@royalreelz.com').toLowerCase()
      const owners = await payload.find({
        collection: 'users',
        where: { email: { equals: adminEmail } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const owner = owners.docs[0]
      if (owner && owner.role !== 'admin') {
        await payload.update({
          collection: 'users',
          id: owner.id,
          data: { role: 'admin' } as any,
          overrideAccess: true,
        })
      }
    } catch (err) {
      payload.logger.warn({ err }, 'Could not restore the admin role')
    }
  },
})