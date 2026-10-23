import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField, uploadOrPath } from '../fields'
import { siteURL } from '../preview'

export const Photos: CollectionConfig = {
  slug: 'photos',
  labels: { singular: 'Gallery photo', plural: 'Gallery photos' },
  admin: {
    preview: () => siteURL('gallery.html'),
    useAsTitle: 'alt',
    defaultColumns: ['image', 'alt', 'order'],
    group: 'Gallery',
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
    { name: 'alt', label: 'Description', type: 'text', required: true },
    orderField,
  ],
}