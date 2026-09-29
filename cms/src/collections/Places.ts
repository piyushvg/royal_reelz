import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField, uploadOrPath } from '../fields'

export const Places: CollectionConfig = {
  slug: 'places',
  labels: { singular: 'Place', plural: 'Places' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'region', 'order'],
    group: 'Destinations',
    description: 'International cards show a location. India cards show a venue list.',
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
      name: 'region',
      type: 'select',
      required: true,
      defaultValue: 'international',
      options: [
        { label: 'International', value: 'international' },
        { label: 'India', value: 'india' },
      ],
    },
    { name: 'name', type: 'text', required: true },
    ...uploadOrPath('icon', 'Icon'),
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      admin: {
        condition: (data) => data?.region !== 'india',
        description: 'Shown under the name on international cards.',
      },
    },
    {
      name: 'venues',
      type: 'array',
      labels: { singular: 'Venue', plural: 'Venues' },
      admin: {
        condition: (data) => data?.region === 'india',
      },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    orderField,
  ],
}
