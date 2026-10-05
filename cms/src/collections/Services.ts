import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField } from '../fields'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service tab', plural: 'Why choose us' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order'],
    group: 'About',
    description: 'Each entry becomes one tab in the Why choose us section.',
  },
  access: {
    read: publicRead,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      label: 'Tab name',
      type: 'text',
      required: true,
      admin: { description: 'For example: Wedding Films' },
    },
    { name: 'body', label: 'Text', type: 'textarea', required: true },
    orderField,
  ],
}
