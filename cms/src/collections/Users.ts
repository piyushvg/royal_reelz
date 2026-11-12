import { APIError } from 'payload'
import type { CollectionConfig, Where } from 'payload'

import { isAdminUser, isStaffUser } from '../access'

const staffOnly = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user as any)
const isCustomerDoc = (siblingData: any, data: any) => (data?.role ?? siblingData?.role) === 'customer'

/** The main admin account (from .env). It is hidden from every other user's list. */
const SUPER_EMAIL = (process.env.ADMIN_EMAIL || 'admin@royalreelz.com').trim().toLowerCase()
const isSuperUser = (u: any) => String(u?.email || '').trim().toLowerCase() === SUPER_EMAIL
const notSuper: Where = { email: { not_equals: SUPER_EMAIL } }

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
    defaultColumns: ['email', 'name', 'phone', 'phone2', 'role', 'subscriptionEnd', 'updatedAt'],
    group: 'Settings',
    description:
      'Admin = full access. Editor = manages website content and customers. Customer = signs in to the website Client Login with an OTP to view their own photos and videos (1-year subscription).',
    hidden: ({ user }) => !isStaffUser(user as any),
    // The main admin account never appears in the Users list (not even for itself).
    baseListFilter: (): Where => notSuper,
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
      if (isAdminUser(user as any)) return isSuperUser(user) ? true : notSuper
      if (isStaffUser(user as any)) {
        const where: Where = { role: { equals: 'customer' } }
        return where
      }
      return false
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      // staff can see every user in the list, except that the main admin account is hidden from everyone else
      if (isStaffUser(user as any)) return isSuperUser(user) ? true : notSuper
      const own: Where = { id: { equals: user.id } }
      return own
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user as any)) return isSuperUser(user) ? true : notSuper
      if (isStaffUser(user as any)) {
        const where: Where = {
          and: [notSuper, { or: [{ id: { equals: user.id } }, { role: { equals: 'customer' } }] }],
        }
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

        // ---- name: first / middle / last -> full name (kept in the hidden "name" field) ----
        if (operation === 'create' || 'firstName' in d || 'middleName' in d || 'lastName' in d) {
          const part = (k: string) => String((k in d ? d[k] : prev[k]) ?? '').trim()
          const first = part('firstName')
          const middle = part('middleName')
          const last = part('lastName')
          if (role === 'customer' && !first) throw new APIError('First name is required for customers.', 400)
          const full = [first, middle, last].filter(Boolean).join(' ')
          if (full) d.name = full
        }

        // ---- mobile numbers: husband + wife, 10 digits each, required for customers, unique ----
        if (operation === 'create' || 'phone' in d || 'phone2' in d) {
          const p1 = normalizePhone('phone' in d ? d.phone : prev.phone)
          const p2 = normalizePhone('phone2' in d ? d.phone2 : prev.phone2)
          if (role === 'customer') {
            if (p1.length !== 10) throw new APIError("Husband's 10-digit mobile number is required.", 400)
            if (p2.length !== 10) throw new APIError("Wife's 10-digit mobile number is required.", 400)
          }
          if (p1 && p1 === p2) throw new APIError("Husband's and wife's mobile numbers must be different.", 400)
          if ('phone' in d || operation === 'create') d.phone = p1 || undefined
          if ('phone2' in d || operation === 'create') d.phone2 = p2 || undefined

          for (const n of [p1, p2].filter(Boolean)) {
            const dup = await req.payload.find({
              collection: 'users',
              where: { or: [{ phone: { equals: n } }, { phone2: { equals: n } }] } as any,
              limit: 5,
              depth: 0,
              overrideAccess: true,
            })
            const other = dup.docs.find((u: any) => String(u.id) !== String(prev.id ?? ''))
            if (other) throw new APIError(`The mobile number ${n} is already used by another user.`, 400)
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
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', label: 'First name' },
        { name: 'middleName', type: 'text', label: 'Middle name' },
        { name: 'lastName', type: 'text', label: 'Last name' },
      ],
    },
    // Combined name, filled automatically from the three fields above (also keeps older users' names).
    { name: 'name', type: 'text', label: 'Full name', admin: { hidden: true } },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: "Husband's mobile number",
          index: true,
          access: { create: staffOnly, update: staffOnly },
          admin: { placeholder: '9322451778' },
        },
        {
          name: 'phone2',
          type: 'text',
          label: "Wife's mobile number",
          index: true,
          access: { create: staffOnly, update: staffOnly },
          admin: { placeholder: '9322451779' },
        },
      ],
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
          'Either mobile number can sign in with OTP while "Access valid till" is in the future. A new customer automatically gets 1 year from today.',
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