import type { Access } from 'payload'

export const publicRead: Access = () => true

export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)
