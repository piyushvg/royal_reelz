import { APIError } from 'payload'
import type { CollectionConfig } from 'payload'

import { isAdminUser, isStaffUser } from '../access'

const staffOnly = ({ req }: { req: { user?: unknown } }) => isStaffUser(req.user as any)
const isCustomerDoc = (siblingData: any, data: any) => (data?.role ?? siblingData?.role) === 'customer'

/** mobile -> sirf aakhri 10 digit */
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
      'Admin = poora access. Editor = website content + customers manage kar sakta hai. Customer = website ke Client Login se OTP dwara apni photos / videos dekhta hai (1 saal ki subscription).',
    hidden: ({ user }) => !isStaffUser(user as any),
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 din login rahega
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000, // 10 minute
  },
  access: {
    // Admin panel me sirf staff (admin / editor) ghus sakta hai. Customer ke liye sirf portal.
    admin: ({ req }) => isStaffUser(req.user as any),
    // Editor bhi customer bana sakta hai (role hamesha 'customer' hi rahega, neeche hook + field access).
    create: ({ req }) => isStaffUser(req.user as any),
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user as any)) return true
      if (isStaffUser(user as any)) return { role: { equals: 'customer' } }
      return false
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      // staff (admin + editor) list me sabko dekh sakta hai (admin users bhi)
      if (isStaffUser(user as any)) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (isAdminUser(user as any)) return true
      if (isStaffUser(user as any)) return { or: [{ id: { equals: user.id } }, { role: { equals: 'customer' } }] }
      return { id: { equals: user.id } }
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const d = data as any
        const prev = (originalDoc || {}) as any
        const now = new Date()

        if (operation === 'create') {
          // Sabse pehla user hamesha admin hota hai, baaki default "customer".
          const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
          d.role = totalDocs === 0 ? 'admin' : d.role || 'customer'
        } else if ('role' in d && !d.role) {
          // role khaali karke koi galti se admin na ban jaye
          d.role = 'customer'
        }

        const role = d.role ?? prev.role ?? (operation === 'create' ? 'customer' : undefined)

        // ---- mobile number: 10 digit, customer ke liye zaroori, duplicate nahi ----
        if (operation === 'create' || 'phone' in d) {
          const phone = normalizePhone(d.phone)
          if (role === 'customer' && phone.length !== 10) {
            throw new APIError('Customer ke liye 10-digit mobile number zaroori hai (login isi number se hoga).', 400)
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
            if (other) throw new APIError('Ye mobile number kisi aur user ke paas pehle se hai.', 400)
          }
        }

        if (role === 'customer') {
          // Naya customer => aaj se 1 saal ki subscription
          if (operation === 'create') {
            if (!d.subscriptionStart) d.subscriptionStart = now.toISOString()
            if (!d.subscriptionEnd) d.subscriptionEnd = addOneYear(new Date(d.subscriptionStart)).toISOString()
          }
          // "Renew for 1 year" tick karke save kiya => abhi ki end date se (ya aaj se, jo baad ho) +1 saal
          if (d.renewOneYear) {
            const current = new Date(d.subscriptionEnd ?? prev.subscriptionEnd ?? 0)
            const base = current.getTime() > now.getTime() ? current : now
            d.subscriptionEnd = addOneYear(base).toISOString()
            if (!d.subscriptionStart && !prev.subscriptionStart) d.subscriptionStart = now.toISOString()
          }
        }
        d.renewOneYear = false // checkbox hamesha reset
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Full name' },
    {
      name: 'phone',
      type: 'text',
      label: 'Mobile number (login ke liye)',
      index: true,
      access: { create: staffOnly, update: staffOnly },
      admin: {
        description: 'Customer isi 10-digit mobile number se OTP login karega. Customer ke liye zaroori hai.',
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
        // role sirf admin badal sakta hai - editor khud ko admin nahi bana sakta
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
          'Customer OTP se sirf tab login kar sakta hai jab "Access valid till" aaj ke baad ho. Naya customer banate hi 1 saal apne-aap set ho jata hai.',
      },
      fields: [
        {
          name: 'subscriptionStart',
          type: 'date',
          label: 'Subscription start',
          access: { create: staffOnly, update: staffOnly },
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
        },
        {
          name: 'subscriptionEnd',
          type: 'date',
          label: 'Access valid till',
          index: true,
          access: { create: staffOnly, update: staffOnly },
          admin: { date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd MMM yyyy' } },
        },
        {
          name: 'renewOneYear',
          type: 'checkbox',
          label: 'Renew for 1 more year (tick + Save)',
          defaultValue: false,
          access: { create: staffOnly, update: staffOnly },
          admin: { description: 'Tick karke Save karo => end date me +1 saal (agar expire ho chuka hai to aaj se +1 saal).' },
        },
      ],
    },
  ],
}