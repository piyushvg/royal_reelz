import type { CollectionConfig } from 'payload'

import { isAdminUser, isStaffUser } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
    group: 'Settings',
    description:
      'Admin = poora access. Editor = website content manage kar sakta hai (users nahi). Customer = sirf website ke Client Login se apni photos / videos dekhta hai.',
    hidden: ({ user }) => !isAdminUser(user as any),
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 din login rahega
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000, // 10 minute
  },
  access: {
    // Admin panel me sirf staff (admin / editor) ghus sakta hai. Customer ke liye sirf portal.
    admin: ({ req }) => isStaffUser(req.user as any),
    create: ({ req }) => isAdminUser(req.user as any),
    delete: ({ req }) => isAdminUser(req.user as any),
    read: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user as any)) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user as any)) return true
      return { id: { equals: user.id } }
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        const d = data as any
        if (operation === 'create') {
          // Sabse pehla user hamesha admin hota hai, baaki default "customer".
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          d.role = totalDocs === 0 ? 'admin' : d.role || 'customer'
        } else if ('role' in d && !d.role) {
          // role khaali karke koi galti se admin na ban jaye
          d.role = 'customer'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Full name' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'customer',
      saveToJWT: true,
      options: [
        { label: 'Admin (full access)', value: 'admin' },
        { label: 'Editor (admin panel, content only)', value: 'editor' },
        { label: 'Customer (portal login only)', value: 'customer' },
      ],
      access: {
        // role sirf admin badal sakta hai - editor khud ko admin nahi bana sakta
        create: ({ req }) => isAdminUser(req.user as any),
        update: ({ req }) => isAdminUser(req.user as any),
      },
      admin: { position: 'sidebar' },
    },
  ],
}