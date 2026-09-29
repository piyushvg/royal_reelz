import type { GlobalConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { uploadOrPath } from '../fields'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site & header',
  admin: { group: 'Website' },
  access: { read: publicRead, update: isLoggedIn },
  fields: [
    { name: 'title', label: 'Browser title', type: 'text', required: true },
    { name: 'loaderKicker', label: 'Loading line', type: 'text', required: true },
    ...uploadOrPath('logoWhite', 'White logo'),
    ...uploadOrPath('logoInk', 'Dark logo'),
    { name: 'edition', label: 'Cover edition line', type: 'text', required: true },
    { name: 'scrollHint', label: 'Scroll hint', type: 'text', required: true },
    { name: 'footer', label: 'Footer', type: 'text', required: true },
    {
      name: 'nav',
      label: 'Menu',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'href',
          label: 'Link',
          type: 'text',
          required: true,
          admin: {
            description: 'Use #cover, #about, #destinations, or #gallery.',
          },
        },
      ],
    },
  ],
}
