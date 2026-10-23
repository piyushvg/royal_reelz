import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField, uploadOrPath } from '../fields'
import { siteURL } from '../preview'

export const Slides: CollectionConfig = {
  slug: 'slides',
  labels: { singular: 'Cover photo', plural: 'Cover photos' },
  admin: {
    preview: () => siteURL('index.html#cover'),
    useAsTitle: 'alt',
    defaultColumns: ['image', 'alt', 'order', 'updatedAt'],
    group: 'Cover',
    description: 'Photos in the opening banner. Order controls the slideshow.',
  },
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  defaultSort: 'order',
  fields: [
    ...uploadOrPath('image', 'Photo'),
    {
      name: 'alt',
      label: 'Description',
      type: 'text',
      required: true,
    },
    orderField,
  ],
}