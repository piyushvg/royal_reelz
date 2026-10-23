import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField, uploadOrPath } from '../fields'
import { siteURL } from '../preview'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Team member', plural: 'Creative team' },
  admin: {
    preview: () => siteURL('about.html'),
    useAsTitle: 'name',
    defaultColumns: ['photo', 'name', 'role', 'order'],
    group: 'About',
    description: 'Cards shown in the Creative team section on the About page.',
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
    {
      name: 'role',
      type: 'text',
      required: true,
      admin: { description: 'For example: Founder · Director' },
    },
    ...uploadOrPath('photo', 'Photo'),
    orderField,
  ],
}