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
    { name: 'footer', label: 'Footer copyright line', type: 'text', required: true },
    { name: 'tagline', label: 'Logo tagline', type: 'text' },
    {
      name: 'credit',
      label: 'Footer credit',
      type: 'group',
      fields: [
        { name: 'text', type: 'text', admin: { description: 'Jaise: Designed and Powered by' } },
        { name: 'name', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    {
      name: 'socials',
      label: 'Social links',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'youtube', type: 'text' },
      ],
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp button',
      type: 'group',
      fields: [
        {
          name: 'number',
          type: 'text',
          admin: { description: 'Country code, no + or spaces. For example 919322451778' },
        },
        { name: 'message', label: 'Pre-filled message', type: 'textarea' },
      ],
    },
    {
      name: 'footerPlaces',
      label: 'Footer destinations row',
      type: 'array',
      fields: [{ name: 'name', type: 'text', required: true }],
    },
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