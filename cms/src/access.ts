import type { Access } from 'payload'

/**
 * Roles
 *  - admin    : sab kuch (users bhi banata hai)            -> Sandvirp / owner
 *  - editor   : admin panel me website content manage karta hai (users nahi)  -> client ka staff
 *  - customer : sirf website ke "Client Login" portal par apni photos/videos dekhta hai
 *
 * Purane users (jinke paas role nahi hai) admin maane jaate hain, taaki koi lock na ho.
 */
type MaybeUser = { id?: number | string; role?: string | null } | null | undefined

export const isAdminUser = (user: MaybeUser) => Boolean(user) && (user!.role === 'admin' || !user!.role)
export const isStaffUser = (user: MaybeUser) =>
  Boolean(user) && (user!.role === 'admin' || user!.role === 'editor' || !user!.role)
export const isCustomerUser = (user: MaybeUser) => Boolean(user) && user!.role === 'customer'

export const publicRead: Access = () => true

/**
 * NOTE: naam purana hai, par ab iska matlab "staff (admin ya editor)" hai.
 * Customer login karne ke baad bhi content edit / delete nahi kar sakta.
 */
export const isLoggedIn: Access = ({ req: { user } }) => isStaffUser(user as MaybeUser)
export const isStaff = isLoggedIn
export const isAdmin: Access = ({ req: { user } }) => isAdminUser(user as MaybeUser)