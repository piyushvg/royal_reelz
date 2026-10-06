import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Awards } from './collections/Awards'
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
import { About } from './globals/About'
import { Contact } from './globals/Contact'
import { Destinations } from './globals/Destinations'
import { Gallery } from './globals/Gallery'
import { Site } from './globals/Site'
import { seedIfEmpty } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— Royal Reelz',
    },
  },
  collections: [Users, Media, Slides, Awards, Press, Places, Photos, Services, Team, Videos, Enquiries],
  globals: [Site, About, Destinations, Gallery, Contact],
  endpoints: [frontendEndpoint, enquiryEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:80',
    'http://127.0.0.1:80',

    // Royal Reelz local frontend
    'http://127.0.0.1:5500',
    'http://localhost:5500',
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./royal-reelz.db',
    },
    push: true,
  }),
  sharp,
  plugins: [],
  onInit: async (payload) => {
    await seedIfEmpty(payload)
  },
})