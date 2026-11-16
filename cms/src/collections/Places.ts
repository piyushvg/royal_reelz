import type { CollectionConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { orderField, uploadOrPath } from '../fields'
import { siteURL } from '../preview'

export const Places: CollectionConfig = {
  slug: 'places',
  labels: { singular: 'Place', plural: 'Places' },
  admin: {
    preview: () => siteURL('index.html#destinations'),
    useAsTitle: 'name',
    defaultColumns: ['icon', 'name', 'region', 'order'],
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
        description: 'Short line below the name, e.g. the country. Can be left empty.',
      },
    },
    {
      name: 'venues',
      label: 'Locations',
      type: 'array',
      labels: { singular: 'Location', plural: 'Locations' },
      admin: {
        description: 'Venue / hotel list. If left empty, only the sub line is shown.',
      },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    orderField,
  ],
}