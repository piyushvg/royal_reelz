import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

import { isLoggedIn, isStaffUser } from '../access'
import { orderField } from '../fields'
import { siteURL } from '../preview'

/**
 * Customer ki apni photos / videos.
 * Customer website ke "Client Login" (portal.html) se sirf wahi dekh sakta hai jo uske naam par hai.
 * Photo / video file seedhe upload karo, ya video ka link (YouTube / Vimeo / Drive) paste karo.
 */
export const CustomerFiles: CollectionConfig = {
  slug: 'customer-files',
  labels: { singular: 'Customer file', plural: 'Customer files' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'customer', 'order', 'updatedAt'],
    group: 'Customers',
    description:
      'Customer chuno, phir photo / video upload karo ya video ka link paste karo. Customer ko sirf apni files dikhti hain.',
    preview: () => siteURL('portal.html'),
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isStaffUser(user as any)) return true
      return { customer: { equals: user.id } }
    },
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  defaultSort: 'order',
  upload: {
    staticDir: 'customer-media',
    mimeTypes: ['image/*', 'video/*'],
    filesRequiredOnCreate: false, // sirf link wali video ke liye file zaroori nahi
    displayPreview: true,
    imageSizes: [{ name: 'thumbnail', width: 480, height: 480, position: 'centre' }],
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && !req.file && !(data as any)?.videoUrl) {
          throw new APIError('Photo / video file upload karo, ya video ka link paste karo.', 400)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: { role: { equals: 'customer' } },
      admin: { description: 'Sirf "Customer" role wale users yahan dikhte hain. Pehle Users me customer banao.' },
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'videoUrl',
      label: 'Video link (optional)',
      type: 'text',
      admin: { description: 'YouTube (unlisted), Vimeo ya koi bhi link. Video file upload karni ho to ye khaali chhodo.' },
    },
    {
      name: 'downloadUrl',
      label: 'Download link (optional)',
      type: 'text',
      admin: { description: 'Full-quality files ka Google Drive / WeTransfer link.' },
    },
    { name: 'note', label: 'Note for customer (optional)', type: 'textarea' },
    orderField,
  ],
}