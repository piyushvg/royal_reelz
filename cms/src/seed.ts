import type { Payload } from 'payload'

const paragraphs = [
  'Royal Reelz is a luxury wedding photography and cinematography brand, creating personal, cinematic and timeless stories across India and destinations worldwide.',
  'With 460+ celebrations captured, we don’t simply document what happens. We take the time to understand the people, the energy and the details behind every celebration, allowing us to create photographs and films that feel honest, cinematic and timeless.',
  'We believe the most beautiful stories unfold naturally—and our role is to be present, observe closely and preserve the moments you’ll want to relive for years to come.',
]

const slides = [
  ['images/banner/01.jpg', 'A couple under palace arches'],
  ['images/banner/02.jpg', 'A couple on a lake boat'],
  ['images/banner/03.jpg', 'A couple in falling snow'],
  ['images/banner/04.jpg', 'A couple drawing a heart on a rainy window'],
  ['images/banner/05.jpg', 'A couple walking under rose petals'],
  ['images/banner/06.jpg', 'A couple looking out over the water'],
  ['images/banner/07.jpg', 'A couple on palace steps'],
  ['images/banner/08.jpg', 'A couple laughing during the ceremony'],
  ['images/banner/09.jpg', 'A couple during the haldi ritual'],
]

const awards = [
  { line1: 'Wow', line2: 'Award', note: '', years: '2025', longName: false },
  { line1: 'Wedding', line2: 'Sutra', note: '8 Awards', years: '2024 · 25 · 26', longName: true },
  { line1: 'Giwa', line2: '', note: 'Nominated', years: '2023 · 25', longName: true },
  { line1: 'WV', line2: 'Connect', note: 'Nominated', years: '2026', longName: true },
]

const press = ['WeddingSutra', 'WeddingWire', 'WedMeGood', 'Weddingz.in', 'The Economic Times']

const international = [
  ['images/dest/icon-emirates.png', 'Emirates Palace', 'Abu Dhabi'],
  ['images/dest/icon-almaty.png', 'Almaty', 'Kazakhstan'],
  ['images/dest/icon-bali.png', 'Bali', 'Indonesia'],
  ['images/dest/icon-maldives.png', 'Ananta', 'Maldives'],
  ['images/dest/icon-dubai.png', 'Dubai', 'UAE'],
]

const india: { icon: string; name: string; venues: string[] }[] = [
  {
    icon: 'images/dest/icon-udaipur.png',
    name: 'Udaipur',
    venues: ['Fairmont', 'ITC Momento', 'Leela Palace', 'Ananta'],
  },
  {
    icon: 'images/dest/icon-goa.png',
    name: 'Goa',
    venues: ['W Goa', 'Grand Hyatt', 'Alila Diwa', 'The Lalit Goa'],
  },
  {
    icon: 'images/dest/icon-mumbai.png',
    name: 'Mumbai',
    venues: ['St Regis', 'Fairmont', 'Taj Mahal Palace', 'Della Resorts'],
  },
  {
    icon: 'images/dest/icon-pune.png',
    name: 'Pune',
    venues: ['Ritz Carlton', 'Oxford Resorts', 'J.W. Marriott', 'Westin', 'Conrad'],
  },
  {
    icon: 'images/dest/icon-hrishikesh.png',
    name: 'Hrishikesh',
    venues: ['Westin Himalayas'],
  },
]

const photos: [string, string][] = [
  ['images/gallery/01.jpg', 'Wedding photograph 1'],
  ['images/gallery/05.jpg', 'Wedding photograph 3'],
  ['images/gallery/06.jpg', 'Wedding photograph 4'],
  ['images/gallery/07.jpg', 'Wedding photograph 5'],
  ['images/gallery/08.jpg', 'Wedding photograph 6'],
  ['images/gallery/09.jpg', 'Wedding photograph 7'],
  ['images/gallery/10.jpg', 'Wedding photograph 8'],
  ['images/gallery/11.jpg', 'Wedding photograph 9'],
  ['images/gallery/12.jpg', 'Wedding photograph 10'],
  ['images/gallery/13.jpg', 'Wedding photograph 11'],
  ['images/gallery/14.jpg', 'Wedding photograph 12'],
  ['images/gallery/15.jpg', 'Wedding photograph 13'],
  ['images/gallery/16.jpg', 'Wedding photograph 14'],
  ['images/gallery/17.jpg', 'Wedding photograph 15'],
  ['images/gallery/18.jpg', 'Wedding photograph 16'],
  ['images/gallery/19.jpg', 'Wedding photograph 17'],
  ['images/gallery/20.jpg', 'Wedding photograph 18'],
  ['images/gallery/21.jpg', 'Wedding photograph 19'],
  ['images/gallery/22.jpg', 'Wedding photograph 20'],
  ['images/gallery/23.jpg', 'Wedding photograph 21'],
  ['images/gallery/24.jpg', 'Wedding photograph 22'],
  ['images/gallery/25.jpg', 'Wedding photograph 23'],
  ['images/gallery/26.jpg', 'Wedding photograph 24'],
  ['images/gallery/27.jpg', 'Wedding photograph 25'],
  ['images/gallery/28.jpg', 'Wedding photograph 26'],
]

export async function seedIfEmpty(payload: Payload) {
  const users = await payload.find({ collection: 'users', limit: 1, depth: 0 })
  if (users.totalDocs > 0) return

  payload.logger.info('Seeding Royal Reelz admin content…')

  await payload.create({
    collection: 'users',
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@royalreelz.com',
      password: process.env.ADMIN_PASSWORD || 'RoyalReelz@2026',
    },
  })

  await payload.updateGlobal({
    slug: 'site',
    data: {
      title: 'Royal Reelz — Luxury Wedding Films & Photography',
      loaderKicker: 'A celebration of love',
      logoWhitePath: 'images/logo-white.png',
      logoInkPath: 'images/logo-ink.png',
      edition: '2026 Edition',
      scrollHint: 'Discover',
      footer: 'Royal Reelz · 2026 Edition',
      nav: [
        { label: 'Cover', href: '#cover' },
        { label: 'About', href: '#about' },
        { label: 'Destinations', href: '#destinations' },
        { label: 'Gallery', href: '#gallery' },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'about',
    data: {
      title: 'About Royal Reelz',
      paragraphs: paragraphs.map((text) => ({ text })),
      awardsTitle: 'Awards',
      featuredLabel: 'Featured',
      featuredIn: 'in',
    },
  })

  await payload.updateGlobal({
    slug: 'destinations',
    data: {
      eyebrow: 'Royal Reelz',
      titleGold: 'Destinations',
      titleRest: 'We’ve Captured',
      lede: 'From intimate celebrations in India to extraordinary destination weddings across the world.',
      backgroundPath: 'images/dest-bg.jpg',
      internationalTitle: 'International',
      indiaTitle: 'India',
    },
  })

  await payload.updateGlobal({
    slug: 'gallery',
    data: {
      eyebrow: 'Royal Reelz',
      titleGold: 'Wedding',
      titleRest: 'Gallery',
      lede: 'A glimpse of celebrations we’ve had the honour to capture.',
      loadMore: 'Load More',
    },
  })

  for (let i = 0; i < slides.length; i++) {
    await payload.create({
      collection: 'slides',
      data: { imagePath: slides[i][0], alt: slides[i][1], order: i + 1 },
    })
  }

  for (let i = 0; i < awards.length; i++) {
    await payload.create({
      collection: 'awards',
      data: { ...awards[i], order: i + 1 },
    })
  }

  for (let i = 0; i < press.length; i++) {
    await payload.create({
      collection: 'press',
      data: { name: press[i], order: i + 1 },
    })
  }

  for (let i = 0; i < international.length; i++) {
    await payload.create({
      collection: 'places',
      data: {
        region: 'international',
        iconPath: international[i][0],
        name: international[i][1],
        location: international[i][2],
        order: i + 1,
      },
    })
  }

  for (let i = 0; i < india.length; i++) {
    await payload.create({
      collection: 'places',
      data: {
        region: 'india',
        iconPath: india[i].icon,
        name: india[i].name,
        venues: india[i].venues.map((name) => ({ name })),
        order: i + 1,
      },
    })
  }

  for (let i = 0; i < photos.length; i++) {
    await payload.create({
      collection: 'photos',
      data: { imagePath: photos[i][0], alt: photos[i][1], order: i + 1 },
    })
  }

  payload.logger.info('Royal Reelz content is ready.')
}
