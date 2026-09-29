import type { GlobalConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About text',
  admin: { group: 'About' },
  access: { read: publicRead, update: isLoggedIn },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'paragraphs',
      type: 'array',
      labels: { singular: 'Paragraph', plural: 'Paragraphs' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    { name: 'awardsTitle', label: 'Awards heading', type: 'text', required: true },
    { name: 'featuredLabel', label: 'Featured word', type: 'text', required: true },
    { name: 'featuredIn', label: 'Small italic word', type: 'text', required: true },
  ],
}
