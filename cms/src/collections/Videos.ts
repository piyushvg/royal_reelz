import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField } from '../fields'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Trailer video', plural: 'Trailer videos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'youtubeUrl', 'order'],
    group: 'Videos',
    description: 'YouTube link paste karo. Page par video apne aap play hoti hai jab scroll me aati hai.',
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
          'Koi bhi YouTube link chalega: youtube.com/watch?v=..., youtu.be/..., ya /shorts/...',
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