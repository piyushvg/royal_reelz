import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

import { isLoggedIn, isStaffUser, isSubscriptionActive } from '../access'
import { orderField } from '../fields'
import { siteURL } from '../preview'

/**
 * A customer's own photos / videos.
 * Customers see only their own files, through the website Client Login (portal.html).
 * Upload a photo / video file directly, or paste a video link (YouTube / Vimeo / Drive).
 */
export const CustomerFiles: CollectionConfig = {
  slug: 'customer-files',
  labels: { singular: 'Customer file', plural: 'Customer files' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'viewLink', 'customer', 'order', 'updatedAt'],
    group: 'Customers',
    description:
      'Choose a customer, then upload a photo / video or paste a video link. Customers only see their own files.',
    preview: () => siteURL('portal.html'),
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isStaffUser(user as any)) return true
      // subscription khatam => customer ko files nahi milengi (list bhi nahi, file download bhi nahi)
      if (!isSubscriptionActive(user)) return false
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
    // File URLs are always relative to this site (/api/customer-files/file/<name>), so previews and downloads
    // keep working even if NEXT_PUBLIC_SERVER_URL points to a different host or port.
    afterRead: [
      ({ doc }) => {
        const d = doc as any
        if (!d?.filename) return doc
        const base = '/api/customer-files/file/'
        const path = (name: string) => base + encodeURIComponent(name)
        d.url = path(d.filename)
        if (d.sizes) {
          for (const key of Object.keys(d.sizes)) {
            if (d.sizes[key]?.filename) d.sizes[key].url = path(d.sizes[key].filename)
          }
        }
        d.thumbnailURL = path(d.sizes?.thumbnail?.filename || d.filename)
        return d
      },
    ],
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && !req.file && !(data as any)?.videoUrl) {
          throw new APIError('Upload a photo / video file, or paste a video link.', 400)
        }
        return data
      },
    ],
  },
  fields: [
    // Edit screen: big preview + "open in new tab" link for the saved photo / video
    {
      name: 'filePreview',
      type: 'ui',
      admin: { components: { Field: '/components/FilePreviewField#FilePreviewField' } },
    },
    // List column: click to open the photo / video (not stored in the database)
    {
      name: 'viewLink',
      label: 'Open',
      type: 'text',
      virtual: true,
      admin: {
        condition: () => false,
        disableBulkEdit: true,
        components: { Cell: '/components/FileLinkCell#FileLinkCell' },
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: { role: { equals: 'customer' } },
      admin: { description: 'Only users with the "Customer" role are listed. Create the customer under Users first.' },
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'videoUrl',
      label: 'Video link (optional)',
      type: 'text',
      admin: { description: 'YouTube (unlisted), Vimeo or any other link. Leave empty if you are uploading a video file.' },
    },
    {
      name: 'downloadUrl',
      label: 'Download link (optional)',
      type: 'text',
      admin: { description: 'Google Drive / WeTransfer link for the full-quality files.' },
    },
    { name: 'note', label: 'Note for customer (optional)', type: 'textarea' },
    orderField,
  ],
}