import type { GlobalConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'

export const Gallery: GlobalConfig = {
  slug: 'gallery',
  label: 'Gallery text',
  admin: { group: 'Gallery' },
  access: { read: publicRead, update: isLoggedIn },
  fields: [
    { name: 'eyebrow', label: 'Small line', type: 'text', required: true },
    { name: 'titleGold', label: 'Gold title', type: 'text', required: true },
    { name: 'titleRest', label: 'Second title line', type: 'text', required: true },
    { name: 'lede', label: 'Intro', type: 'textarea', required: true },
    { name: 'loadMore', label: 'Load more button', type: 'text', required: true },
  ],
}
