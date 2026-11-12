import { APIError } from 'payload'
import type { CollectionConfig, Where } from 'payload'

import { isAdminUser, isStaffUser } from '../access'

const staffOnly = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user as any)
const isCustomerDoc = (siblingData: any, data: any) => (data?.role ?? siblingData?.role) === 'customer'

/** mobile number -> last 10 digits only */
const normalizePhone = (v: unknown) => String(v ?? '').replace(/\D/g, '').slice(-10)

function addOneYear(from: Date) {
  const d = new Date(from.getTime())
  d.setFullYear(d.getFullYear() + 1)
  return d
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'phone', 'role', 'subscriptionEnd', 'updatedAt'],
    group: 'Settings',
    description:
      'Admin = full access. Editor = manages website content and customers. Customer = signs in to the website Client Login with an OTP to view their own photos and videos (1-year subscription).',
    hidden: ({ user }) => !isStaffUser(user as any),
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // stay signed in for 7 days
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000, // 10 minutes
  },
  access: {
    // Only staff (admin / editor) can open the admin panel. Customers only use the website portal.
    admin: ({ req }) => isStaffUser(req.user as any),
    // Editors can create customers too (role is always forced to 'customer' by the hook + field access below).
    create: ({ req }) => isStaffUser(req.user as any),
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user as any)) return true
      if (isStaffUser(user as any)) {
        const where: Where = { role: { equals: 'customer' } }
        return where
      }
      return false
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      // staff (admin + editor) can see every user in the list, including admins
      if (isStaffUser(user as any)) return true
      const own: Where = { id: { equals: user.id } }
      return own
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user as any)) return true
      if (isStaffUser(user as any)) {
        const where: Where = { or: [{ id: { equals: user.id } }, { role: { equals: 'customer' } }] }
        return where
      }
      const own: Where = { id: { equals: user.id } }
      return own
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const d = data as any
        const prev = (originalDoc || {}) as any
        const now = new Date()

        if (operation === 'create') {
          // The very first user is always admin; everyone else defaults to "customer".
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          d.role = totalDocs === 0 ? 'admin' : d.role || 'customer'
        } else if ('role' in d && !d.role) {
          // clearing the role must never turn a user into an admin
          d.role = 'customer'
        }

        const role = d.role ?? prev.role ?? (operation === 'create' ? 'customer' : undefined)

        // ---- mobile number: 10 digits, required for customers, must be unique ----
        if (operation === 'create' || 'phone' in d) {
          const phone = normalizePhone(d.phone)
          if (role === 'customer' && phone.length !== 10) {
            throw new APIError('A 10-digit mobile number is required for customers (they sign in with it).', 400)
          }
          d.phone = phone || undefined
          if (phone) {
            const dup = await req.payload.find({
              collection: 'users',
              where: { phone: { equals: phone } } as any,
              limit: 1,
              depth: 0,
              overrideAccess: true,
            })
            const other = dup.docs.find((u: any) => String(u.id) !== String(prev.id ?? ''))
            if (other) throw new APIError('This mobile number is already used by another user.', 400)
          }
        }

        // Admins / editors have no subscription: drop the pre-filled dates for them
        if (operation === 'create' && role !== 'customer') {
          d.subscriptionStart = null
          d.subscriptionEnd = null
        }

        if (role === 'customer') {
          // New customer => 1-year subscription starting today
          if (operation === 'create') {
            if (!d.subscriptionStart) d.subscriptionStart = now.toISOString()
            if (!d.subscriptionEnd) d.subscriptionEnd = addOneYear(new Date(d.subscriptionStart)).toISOString()
          }
          // "Renew for 1 year" ticked and saved => +1 year from the current end date (or from today, whichever is later)
          if (d.renewOneYear) {
            const current = new Date(d.subscriptionEnd ?? prev.subscriptionEnd ?? 0)
            const base = current.getTime() > now.getTime() ? current : now
            d.subscriptionEnd = addOneYear(base).toISOString()
            if (!d.subscriptionStart && !prev.subscriptionStart) d.subscriptionStart = now.toISOString()
          }
        }
        d.renewOneYear = false // always reset the checkbox
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Full name' },
    {
      name: 'phone',
      type: 'text',
      label: 'Mobile number (used to sign in)',
      index: true,
      access: { create: staffOnly, update: staffOnly },
      admin: {
        description: 'The customer signs in with an OTP sent to this 10-digit mobile number. Required for customers.',
        placeholder: '9322451778',
      },
    },
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
        // only an admin can change the role - an editor cannot promote themselves
        create: ({ req }) => isAdminUser(req.user as any),
        update: ({ req }) => isAdminUser(req.user as any),
      },
      admin: { position: 'sidebar' },
    },
    {
      type: 'collapsible',
      label: 'Subscription (1 year access)',
      admin: {
        initCollapsed: false,
        condition: (data, siblingData) => isCustomerDoc(siblingData, data),
        description:
          'A customer can sign in with OTP only while "Access valid till" is in the future. A new customer automatically gets 1 year from today.',
      },
      fields: [
        {
          name: 'subscriptionStart',
          type: 'date',
          label: 'Subscription start',
          defaultValue: () => new Date().toISOString(), // pre-filled with today on the create form
          access: { create: staffOnly, update: staffOnly },
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
        },
        {
          name: 'subscriptionEnd',
          type: 'date',
          label: 'Access valid till',
          index: true,
          defaultValue: () => addOneYear(new Date()).toISOString(), // pre-filled with today + 1 year
          access: { create: staffOnly, update: staffOnly },
          admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd MMM yyyy' } },
        },
        {
          name: 'renewOneYear',
          type: 'checkbox',
          label: 'Renew for 1 more year (tick and Save)',
          defaultValue: false,
          access: { create: staffOnly, update: staffOnly },
          admin: { description: 'Tick this and Save to add 1 year to the end date (if already expired, 1 year from today).' },
        },
      ],
    },
  ],
}