import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Endpoint, Payload } from 'payload'

type UploadValue = { url?: string | null } | number | null | undefined

function publicURL(raw: string) {
  let value = raw.trim()
  const markdownMatch = value.match(/^\[.*\]\((.*)\)$/)
  if (markdownMatch) value = markdownMatch[1].trim()

  const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  if (base && value.startsWith(base) && !value.startsWith(`${base}/`)) {
    value = `${base}/${value.slice(base.length)}`
  }
  if (base && (value === base || value.startsWith(`${base}/`))) {
    value = value.slice(base.length) || '/'
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('//')) return value
  if (!value.startsWith('/')) value = `/${value.replace(/^\.\//, '')}`
  return value
}

function mediaFileOnDisk(url: string) {
  const match = url.match(/\/api\/media\/file\/([^?#]+)$/)
  if (!match) return true
  const filename = decodeURIComponent(match[1])
  if (!filename || filename.includes('..') || filename.includes('\\') || filename.startsWith('/')) return false
  return existsSync(path.join(process.cwd(), 'media', filename))
}

export function mediaSrc(file: UploadValue, fallback?: string | null): string {
  const uploaded = file && typeof file === 'object' && file.url ? publicURL(file.url) : ''
  const pathFallback = fallback ? publicURL(fallback) : ''
  if (uploaded && mediaFileOnDisk(uploaded)) return uploaded
  if (pathFallback) return pathFallback
  return uploaded
}

async function docsOf<
  T extends 'slides' | 'awards' | 'press' | 'places' | 'photos' | 'services' | 'team' | 'videos',
>(payload: Payload, collection: T) {
  const result = await payload.find({
    collection,
    depth: 1,
    limit: 500,
    sort: 'order',
    overrideAccess: true,
  })
  return result.docs
}

export const frontendEndpoint: Endpoint = {
  path: '/frontend',
  method: 'get',
  handler: async (req) => {
    const payload = req.payload
    const [
      site,
      about,
      destinations,
      gallery,
      contact,
      slides,
      awards,
      press,
      places,
      photos,
      services,
      team,
      videos,
    ] = await Promise.all([
      payload.findGlobal({ slug: 'site', depth: 1, overrideAccess: true }),
      payload.findGlobal({ slug: 'about', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'destinations', depth: 1, overrideAccess: true }),
      payload.findGlobal({ slug: 'gallery', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'contact', depth: 0, overrideAccess: true }),
      docsOf(payload, 'slides'),
      docsOf(payload, 'awards'),
      docsOf(payload, 'press'),
      docsOf(payload, 'places'),
      docsOf(payload, 'photos'),
      docsOf(payload, 'services'),
      docsOf(payload, 'team'),
      docsOf(payload, 'videos'),
    ])

    const mapPlace = (place: (typeof places)[number]) => ({
      name: place.name,
      icon: mediaSrc(place.icon, place.iconPath),
      location: place.location || '',
      venues: (place.venues || []).map((venue) => venue.name).filter(Boolean),
    })

    const body = {
      site: {
        title: site.title,
        loaderKicker: site.loaderKicker,
        logoWhite: mediaSrc(site.logoWhite, site.logoWhitePath),
        logoInk: mediaSrc(site.logoInk, site.logoInkPath),
        edition: site.edition,
        scrollHint: site.scrollHint,
        footer: site.footer,
        nav: (site.nav || []).map((item) => ({ label: item.label, href: item.href })),
        tagline: site.tagline || '',
        credit: {
          text: site.credit?.text || '',
          name: site.credit?.name || '',
          url: site.credit?.url || '',
        },
        socials: {
          facebook: site.socials?.facebook || '',
          instagram: site.socials?.instagram || '',
          youtube: site.socials?.youtube || '',
        },
        whatsapp: {
          number: site.whatsapp?.number || '',
          message: site.whatsapp?.message || '',
        },
        footerPlaces: (site.footerPlaces || []).map((place) => place.name).filter(Boolean),
      },
      slides: slides
        .map((slide) => ({
          src: mediaSrc(slide.image, slide.imagePath),
          alt: slide.alt,
        }))
        .filter((slide) => slide.src),
      about: {
        title: about.title,
        paragraphs: (about.paragraphs || []).map((paragraph) => paragraph.text).filter(Boolean),
        awardsTitle: about.awardsTitle,
        featuredLabel: about.featuredLabel,
        featuredIn: about.featuredIn,
        pageEyebrow: about.pageEyebrow || '',
        pageTitleGold: about.pageTitleGold || '',
        pageTitleRest: about.pageTitleRest || '',
        pageLede: about.pageLede || '',
        storyParagraphs: (about.storyParagraphs || []).map((p) => p.text).filter(Boolean),
        whyTitle: about.whyTitle || '',
        whyLede: about.whyLede || '',
        teamTitle: about.teamTitle || '',
        teamLede: about.teamLede || '',
        teamCta: about.teamCta || '',
      },
      awards: awards.map((award) => ({
        line1: award.line1,
        line2: award.line2 || '',
        note: award.note || '',
        years: award.years,
        longName: Boolean(award.longName),
      })),
      press: press.map((item) => item.name).filter(Boolean),
      destinations: {
        eyebrow: destinations.eyebrow,
        titleGold: destinations.titleGold,
        titleRest: destinations.titleRest,
        lede: destinations.lede,
        background: mediaSrc(destinations.background, destinations.backgroundPath),
        internationalTitle: destinations.internationalTitle,
        indiaTitle: destinations.indiaTitle,
      },
      places: {
        international: places.filter((place) => place.region !== 'india').map(mapPlace),
        india: places.filter((place) => place.region === 'india').map(mapPlace),
      },
      gallery: {
        eyebrow: gallery.eyebrow,
        titleGold: gallery.titleGold,
        titleRest: gallery.titleRest,
        lede: gallery.lede,
        loadMore: gallery.loadMore,
      },
      photos: photos
        .map((photo) => ({
          src: mediaSrc(photo.image, photo.imagePath),
          alt: photo.alt,
        }))
        .filter((photo) => photo.src),
      videos: videos.map((video) => ({
        title: video.title,
        url: video.youtubeUrl,
        caption: video.caption || '',
      })),
      services: services.map((service) => ({ title: service.title, body: service.body })),
      team: team.map((member) => ({
        name: member.name,
        role: member.role,
        photo: mediaSrc(member.photo, member.photoPath),
      })),
      contact: {
        eyebrow: contact.eyebrow || '',
        titleGold: contact.titleGold || '',
        titleRest: contact.titleRest || '',
        lede: contact.lede || '',
        infoTitle: contact.infoTitle || '',
        formTitle: contact.formTitle || '',
        address: contact.address || '',
        email: contact.email || '',
        phone: contact.phone || '',
        formAction: contact.formAction || '',
      },
    }

    return Response.json(body, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  },
}