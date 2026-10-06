import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '../access'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Contact enquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'phone', 'weddingDate', 'status', 'createdAt'],
    listSearchableFields: ['name', 'email', 'phone'],
    group: 'Contact',
    description: 'Contact form fill karne wale yahan list mein dikhte hain. Website form is collection mein save hoti hai.',
  },
  access: {
    read: isLoggedIn,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'weddingDate',
      label: 'Wedding date',
      type: 'text',
    },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
