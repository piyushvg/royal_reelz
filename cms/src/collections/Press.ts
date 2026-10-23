import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField } from '../fields'
import { siteURL } from '../preview'

export const Press: CollectionConfig = {
  slug: 'press',
  labels: { singular: 'Featured name', plural: 'Featured in' },
  admin: {
    preview: () => siteURL('index.html#about'),
    useAsTitle: 'name',
    defaultColumns: ['name', 'order'],
    group: 'About',
  },
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    orderField,
  ],
}