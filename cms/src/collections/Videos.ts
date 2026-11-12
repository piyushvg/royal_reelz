import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField } from '../fields'
import { siteURL } from '../preview'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Trailer video', plural: 'Trailer videos' },
  admin: {
    preview: () => siteURL('videos.html'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'youtubeUrl', 'order'],
    group: 'Videos',
    description: 'Paste the YouTube link. The video plays automatically when it scrolls into view.',
  },
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'youtubeUrl',
      label: 'YouTube link',
      type: 'text',
      required: true,
      admin: {
        description:
          'Any YouTube link works: youtube.com/watch?v=..., youtu.be/... or /shorts/...',
      },
    },
    {
      name: 'caption',
      label: 'Short line (optional)',
      type: 'text',
    },
    orderField,
  ],
}