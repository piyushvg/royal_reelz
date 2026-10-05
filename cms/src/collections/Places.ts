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
    { name: 'name', label: 'Country / City', type: 'text', required: true },
    ...uploadOrPath('icon', 'Logo'),
    {
      name: 'location',
      label: 'Sub line',
      type: 'text',
      admin: {
        description: 'Name ke neeche chhoti line, jaise country ka naam. Khaali bhi chhod sakte ho.',
      },
    },
    {
      name: 'venues',
      label: 'Locations',
      type: 'array',
      labels: { singular: 'Location', plural: 'Locations' },
      admin: {
        description: 'Venue / hotel list. Khaali chhodoge to sirf sub line dikhegi.',
      },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    orderField,
  ],
}