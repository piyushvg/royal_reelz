import config from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

/** Welcome banner + quick stats shown above the dashboard collection list. */
export const BeforeDashboard: React.FC = async () => {
  const payload = await getPayload({ config })

  const count = async (collection: any, where?: any) => {
    try {
      const res = await payload.count({ collection, where, overrideAccess: true })
      return res.totalDocs
    } catch {
      return 0
    }
  }

  const [newEnquiries, enquiries, photos, videos, places] = await Promise.all([
    count('enquiries', { status: { equals: 'new' } }),
    count('enquiries'),
    count('photos'),
    count('videos'),
    count('places'),
  ])

  const stats = [
    { label: 'New enquiries', value: newEnquiries, href: '/admin/collections/enquiries', accent: true },
    { label: 'All enquiries', value: enquiries, href: '/admin/collections/enquiries' },
    { label: 'Gallery photos', value: photos, href: '/admin/collections/photos' },
    { label: 'Videos', value: videos, href: '/admin/collections/videos' },
    { label: 'Destinations', value: places, href: '/admin/collections/places' },
  ]

  return (
    <section className="rr-welcome">
      <div className="rr-welcome__top">
        <div>
          <p className="rr-welcome__kicker">Royal Reelz</p>
          <h2 className="rr-welcome__title">Welcome back</h2>
          <p className="rr-welcome__sub">Manage your website content from here.</p>
        </div>
        <a className="rr-welcome__btn" href="/admin/globals/site">
          Site settings
        </a>
      </div>

      <div className="rr-stats">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className={`rr-stat${s.accent ? ' rr-stat--accent' : ''}`}>
            <span className="rr-stat__value">{s.value}</span>
            <span className="rr-stat__label">{s.label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}