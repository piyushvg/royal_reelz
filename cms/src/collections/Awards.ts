import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField } from '../fields'

export const Awards: CollectionConfig = {
  slug: 'awards',
  labels: { singular: 'Award', plural: 'Awards' },
  admin: {
    useAsTitle: 'line1',
    defaultColumns: ['line1', 'line2', 'years', 'order'],
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
    { name: 'line1', label: 'Large line', type: 'text', required: true },
    { name: 'line2', label: 'Second line', type: 'text' },
    { name: 'note', label: 'Small note', type: 'text' },
    { name: 'years', label: 'Years', type: 'text', required: true },
    {
      name: 'longName',
      label: 'Long name (smaller type)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Turn this on for longer award names so they fit inside the wreath.',
      },
    },
    orderField,
  ],
}
