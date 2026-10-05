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

const storyParagraphs = [
  'It all started on a coffee table where some freelance photography enthusiasts were discussing their plans. It then turned out to be a start-up and now is one of the top wedding photography companies in the town. The journey from some to a team is what makes Royal Reelz the favourite \u2018destination wedding photographers\u2019 for its esteemed clientele.',
  'With the utmost efforts, the perfect combination of photography techniques and the aesthetics, and an unbeatable team of \u2018lights-camera-action\u2019 are the reasons behind Royal Reelz success. In a short span of 6 years, we have conducted more than 200 wedding photo-shoots and over 500 corporate projects. Every single photograph is shot with a purpose and intention and we strive to capture not just the emotions but also the very essence of the experiences and stories unfolding in front of our lenses.',
  'We have investigated the blemish and fallibility in the current industrial behaviour and we put in our souls to make it distinct and ahead of the time. We are confident with our quality, which makes us to deliver the photographs within time, sometimes before time. Our motto, \u2018Royal moments \u2014 captured on time, and delivered on time\u2019 endorses our dedication and helps us to stand true to it every moment.',
]

const services: [string, string][] = [
  [
    'Wedding Films',
    'Unlike our counterparts, we did not keep ourselves stipulated to wedding photography only. Our finest blend of cinematography and the technical capabilities of high-fashion photography help us to create the most stunning photos with a surreal and suave feel. Regardless of the conditions at the site, we always strive to be a step ahead to provide with the best photographs to our esteemed clients.',
  ],
  ['Research and Planning', 'Add this text in the admin panel.'],
  ['Customizations', 'Add this text in the admin panel.'],
  ['Prompt Service', 'Add this text in the admin panel.'],
  ['The Variety of Our Projects', 'Add this text in the admin panel.'],
]

const team: [string, string, string][] = [
  ['Rishab Agarwal', 'Founder \u00b7 Director', 'images/team/01.jpg'],
  ['Taronish Bulsara', 'Team Head', 'images/team/02.jpg'],
  ['Amit Suryawanshi', 'Photographer', 'images/team/03.jpg'],
  ['Shantanu Suryawanshi', 'Photographer \u00b7 Editor', 'images/team/04.jpg'],
  ['Akshay Yadav', 'Photographer', 'images/team/05.jpg'],
  ['Prabhat Nihalani', 'Production Head', 'images/team/06.jpg'],
  ['Vikas Barod', 'Drone Pilot', 'images/team/07.jpg'],
  ['Kajal Agarwal', 'Content Writer', 'images/team/08.jpg'],
  ['Naeem Mulla', 'Editor', 'images/team/09.jpg'],
  ['Hiteshi Jain', 'Content Writer', 'images/team/10.jpg'],
  ['Sana Shaikh', 'Editor', 'images/team/11.jpg'],
]

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
      footer: '\u00a9 MMXXVI Royal Reelz. All rights reserved.',
      tagline: 'Atelier \u00b7 Cinema',
      credit: {
        text: 'Designed and Powered by',
        name: 'Sandvirp Solutions',
        url: 'https://sandvirp.com',
      },
      nav: [
        { label: 'Home', href: 'index.html' },
        { label: 'About', href: 'about.html' },
        { label: 'Destinations', href: 'index.html#destinations' },
        { label: 'Gallery', href: 'gallery.html' },
        { label: 'Videos', href: 'videos.html' },
        { label: 'Contact', href: 'contact.html' },
      ],
      socials: {
        facebook: 'https://www.facebook.com/RoyalReelz/',
        instagram: 'https://www.instagram.com/royalreelz',
        youtube: 'https://www.youtube.com/@royalreelz',
      },
      whatsapp: {
        number: '919322451778',
        message: "Hi Royal Reelz, I'd like to enquire about wedding photography.",
      },
      footerPlaces: ['Udaipur', 'Goa', 'Dubai', 'Bali', 'Maldives'].map((name) => ({ name })),
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
      pageEyebrow: 'Royal Reelz',
      pageTitleGold: 'About',
      pageTitleRest: 'Royal Reelz',
      pageLede: 'It all started on a coffee table. It turned into a start-up, and then into a team.',
      storyParagraphs: storyParagraphs.map((text) => ({ text })),
      whyTitle: 'Why choose us?',
      whyLede:
        'In the current times, we are the most sought-after luxury wedding photographers in the industry. We have established this image by our unique service catalogue that includes but is not limited to:',
      teamTitle: 'Creative team',
      teamLede: 'The people behind every frame.',
      teamCta: 'Join our team',
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

  await payload.updateGlobal({
    slug: 'contact',
    data: {
      eyebrow: 'Royal Reelz',
      titleGold: 'Get in',
      titleRest: 'Touch',
      lede: 'Tell us about your celebration \u2014 we\u2019ll come back to you within a day.',
      infoTitle: 'Contact us',
      formTitle: 'Get in touch',
      address:
        '162/2D, Adarsh Colony, Near: Milind Bakery, Road no. 6, Tingrenagar, Vishrantwadi, Pune \u2013 411015, Maharashtra',
      email: 'info@royalreelz.com',
      phone: '+91 93224 51778',
      formAction: 'mail.php',
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

  for (let i = 0; i < services.length; i++) {
    await payload.create({
      collection: 'services',
      data: { title: services[i][0], body: services[i][1], order: i + 1 },
    })
  }

  const videos: [string, string][] = [
    ['Wedding Trailer', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  ]

  for (let i = 0; i < videos.length; i++) {
    await payload.create({
      collection: 'videos',
      data: { title: videos[i][0], youtubeUrl: videos[i][1], order: i + 1 },
    })
  }

  for (let i = 0; i < team.length; i++) {
    await payload.create({
      collection: 'team',
      data: { name: team[i][0], role: team[i][1], photoPath: team[i][2], order: i + 1 },
    })
  }

  payload.logger.info('Royal Reelz content is ready.')
}