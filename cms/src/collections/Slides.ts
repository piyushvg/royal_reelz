import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField, uploadOrPath } from '../fields'

export const Slides: CollectionConfig = {
  slug: 'slides',
  labels: { singular: 'Cover photo', plural: 'Cover photos' },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'order', 'updatedAt'],
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
