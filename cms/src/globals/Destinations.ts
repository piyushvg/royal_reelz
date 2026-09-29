import type { GlobalConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'
import { uploadOrPath } from '../fields'

export const Destinations: GlobalConfig = {
  slug: 'destinations',
  label: 'Destinations text',
  admin: { group: 'Destinations' },
  access: { read: publicRead, update: isLoggedIn },
  fields: [
    { name: 'eyebrow', label: 'Small line', type: 'text', required: true },
    { name: 'titleGold', label: 'Gold title', type: 'text', required: true },
    { name: 'titleRest', label: 'Second title line', type: 'text', required: true },
    { name: 'lede', label: 'Intro', type: 'textarea', required: true },
    ...uploadOrPath('background', 'Background'),
    { name: 'internationalTitle', label: 'International heading', type: 'text', required: true },
    { name: 'indiaTitle', label: 'India heading', type: 'text', required: true },
  ],
}
