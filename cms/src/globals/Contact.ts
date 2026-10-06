import type { GlobalConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'

export const Contact: GlobalConfig = {
  slug: 'contact',
  label: 'Contact page',
  admin: { group: 'Contact' },
  access: { read: publicRead, update: isLoggedIn },
  fields: [
    { name: 'eyebrow', label: 'Small line', type: 'text' },
    { name: 'titleGold', label: 'Gold title', type: 'text' },
    { name: 'titleRest', label: 'Second title line', type: 'text' },
    { name: 'lede', label: 'Intro', type: 'textarea' },
    { name: 'infoTitle', label: 'Left heading', type: 'text' },
    { name: 'formTitle', label: 'Form heading', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' },
    {
      name: 'formAction',
      label: 'Form action URL',
      type: 'text',
      defaultValue: '/api/enquiry',
      admin: {
        description:
          'Contact form yahan post hoti hai. Submissions Contact enquiries list mein dikhti hain. Default: /api/enquiry',
      },
    },
  ],
}
