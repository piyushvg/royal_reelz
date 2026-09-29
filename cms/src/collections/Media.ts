import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Settings',
  },
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
  },
}
