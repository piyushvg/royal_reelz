import type { CollectionConfig } from 'payload'

/**
 * Login OTP ka record (sirf server use karta hai: /api/otp/request aur /api/otp/verify).
 * Code kabhi plain-text me save nahi hota - sirf HMAC hash. Koi bhi (admin bhi) REST se isko padh / likh nahi sakta.
 */
export const LoginOtps: CollectionConfig = {
  slug: 'login-otps',
  admin: { hidden: true, group: 'Settings' },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  timestamps: true,
  fields: [
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'codeHash', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'usedAt', type: 'date' },
  ],
}