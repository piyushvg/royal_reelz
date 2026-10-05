import type { Field } from 'payload'

export function uploadOrPath(name: string, label: string, pathName?: string): Field[] {
  return [
    {
      name,
      label: `${label} upload`,
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Leave this empty to keep the image path below.',
        components: {
          Cell: '/components/ImagePreviewCell#ImagePreviewCell',
        },
      },
    },
    {
      name: pathName || `${name}Path`,
      label: `${label} path`,
      type: 'text',
      admin: {
        description: 'Path on the website, for example images/banner/01.jpg',
      },
    },
  ]
}

export const orderField: Field = {
  name: 'order',
  type: 'number',
  defaultValue: 0,
  admin: {
    position: 'sidebar',
    description: 'Lower numbers appear first on the website.',
  },
}