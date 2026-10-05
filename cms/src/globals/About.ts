import type { GlobalConfig } from 'payload'

import { isLoggedIn, publicRead } from '../access'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About text',
  admin: { group: 'About' },
  access: { read: publicRead, update: isLoggedIn },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'pageEyebrow', label: 'About page small line', type: 'text' },
    { name: 'pageTitleGold', label: 'About page gold title', type: 'text' },
    { name: 'pageTitleRest', label: 'About page second title line', type: 'text' },
    { name: 'pageLede', label: 'About page intro', type: 'textarea' },
    {
      name: 'storyParagraphs',
      label: 'About page story',
      type: 'array',
      labels: { singular: 'Paragraph', plural: 'Paragraphs' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    { name: 'whyTitle', label: 'Why choose us heading', type: 'text' },
    { name: 'whyLede', label: 'Why choose us intro', type: 'textarea' },
    { name: 'teamTitle', label: 'Team heading', type: 'text' },
    { name: 'teamLede', label: 'Team intro', type: 'text' },
    { name: 'teamCta', label: 'Team button', type: 'text' },
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
