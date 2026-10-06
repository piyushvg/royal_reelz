import type { Endpoint } from 'payload'

function text(value: unknown, max = 2000) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const enquiryEndpoint: Endpoint = {
  path: '/enquiry',
  method: 'post',
  handler: async (req) => {
    let body: Record<string, unknown> = {}

    try {
      const contentType = req.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        body = ((await req.json?.()) || {}) as Record<string, unknown>
      } else if (contentType.includes('form')) {
        const form = await req.formData?.()
        form?.forEach((value, key) => {
          if (typeof value === 'string') body[key] = value
        })
      }
    } catch {
      return Response.json({ error: 'Could not read the form.' }, { status: 400 })
    }

    const name = text(body.name, 200)
    const email = text(body.email, 200).toLowerCase()
    const phone = text(body.phone, 80)
    const weddingDate = text(body.date ?? body.weddingDate, 120)
    const message = text(body.message, 4000)

    if (!name || !isEmail(email)) {
      return Response.json({ error: 'Name and a valid email are required.' }, { status: 400 })
    }

    const enquiry = await req.payload.create({
      collection: 'enquiries',
      overrideAccess: true,
      data: {
        name,
        email,
        phone,
        weddingDate,
        message,
        status: 'new',
      },
    })

    return Response.json(
      { ok: true, id: enquiry.id },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  },
}
