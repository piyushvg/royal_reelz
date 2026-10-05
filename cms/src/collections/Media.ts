import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
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
  admin: {
    group: 'Settings',
    useAsTitle: 'alt',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*'],
    displayPreview: true,
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 320, position: 'centre' },
    ],
  },
}