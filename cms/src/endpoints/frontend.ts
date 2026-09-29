import type { Endpoint, Payload } from 'payload'

type UploadValue = { url?: string | null } | number | null | undefined

function serverURL() {
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function mediaSrc(file: UploadValue, fallback?: string | null): string {
  if (file && typeof file === 'object' && file.url) {
    return file.url.startsWith('http') ? file.url : `${serverURL()}${file.url}`
  }
  return fallback || ''
}

async function docsOf(payload: Payload, collection: 'slides' | 'awards' | 'press' | 'places' | 'photos') {
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
    const [site, about, destinations, gallery, slides, awards, press, places, photos] = await Promise.all([
      payload.findGlobal({ slug: 'site', depth: 1, overrideAccess: true }),
      payload.findGlobal({ slug: 'about', depth: 0, overrideAccess: true }),
      payload.findGlobal({ slug: 'destinations', depth: 1, overrideAccess: true }),
      payload.findGlobal({ slug: 'gallery', depth: 0, overrideAccess: true }),
      docsOf(payload, 'slides'),
      docsOf(payload, 'awards'),
      docsOf(payload, 'press'),
      docsOf(payload, 'places'),
      docsOf(payload, 'photos'),
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
    }

    return Response.json(body, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  },
}
