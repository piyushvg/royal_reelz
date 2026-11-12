import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto'
import type { Endpoint, Payload } from 'payload'

/**
 * Customer OTP login (passwordless) - MOBILE NUMBER ya EMAIL se
 *   POST /api/otp/request  { identifier }        -> code bhejta hai (identifier = mobile number ya email)
 *   POST /api/otp/verify   { identifier, code }  -> code sahi + subscription chalu => login cookie set
 *
 * ABHI KE LIYE: SMS provider nahi hai, isliye sabhi mobile numbers ka OTP fixed "123456" hai.
 * Real OTP chalu karne ke liye .env me  OTP_STATIC_CODE=off  daalo (phir email par random code jayega).
 *
 * Security:
 *  - code sirf HMAC hash ke roop me DB me; 10 minute me expire; max 5 galat try; ek baar use
 *  - resend 60 sec baad, ek ghante me max 5 code per email
 *  - unknown email par bhi same "ok" jawab (koi check nahi kar sakta ki kaun customer hai)
 *  - subscription khatam => 403 subscription_expired, session banta hi nahi
 */

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_GAP_MS = 60 * 1000
const MAX_PER_HOUR = 5
const MAX_ATTEMPTS = 5

/** '' / 'off' => real random OTP. Default => 123456 (testing). */
const STATIC_RAW = process.env.OTP_STATIC_CODE
const STATIC_CODE = STATIC_RAW === undefined ? '123456' : STATIC_RAW === '' || STATIC_RAW.toLowerCase() === 'off' ? '' : STATIC_RAW

const noStore = { 'Cache-Control': 'no-store' }
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { ...noStore, ...headers } })

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/** mobile number -> sirf aakhri 10 digit (+91, 0, space, dash sab hata deta hai) */
const normalizePhone = (v: string) => v.replace(/\D/g, '').slice(-10)

/** 'a@b.com' ya '9322451778' -> { key, email?, phone? } ; galat ho to null */
function parseIdentifier(raw: unknown) {
  const v = String(raw ?? '').trim().slice(0, 200)
  if (v.includes('@')) {
    const email = v.toLowerCase()
    return isEmail(email) ? { key: email, email } : null
  }
  const phone = normalizePhone(v)
  return phone.length === 10 ? { key: `tel:${phone}`, phone } : null
}

async function readBody(req: any): Promise<Record<string, unknown>> {
  try {
    return ((await req.json?.()) || {}) as Record<string, unknown>
  } catch {
    return {}
  }
}

function hashCode(email: string, code: string) {
  const secret = process.env.PAYLOAD_SECRET || 'dev-secret'
  return createHmac('sha256', secret).update(`${email}:${code}`).digest('hex')
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

async function findCustomer(payload: Payload, id: { email?: string; phone?: string }) {
  const res = await payload.find({
    collection: 'users',
    where: {
      and: [id.email ? { email: { equals: id.email } } : { phone: { equals: id.phone } }, { role: { equals: 'customer' } }],
    } as any,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return (res.docs[0] as any) || null
}

/* ------------------------------------------------------------ email */
async function sendOtpEmail(payload: Payload, to: string, name: string, code: string) {
  const subject = `Your Royal Reelz login code: ${code}`
  const text = `Hi ${name || 'there'},\n\nYour Royal Reelz login code is ${code}.\nIt is valid for 10 minutes. If you did not ask for it, you can ignore this email.\n\n— Royal Reelz`
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:28px;border:1px solid #eee">
    <h2 style="margin:0 0 12px;color:#6b1d2a;font-weight:600">Royal Reelz</h2>
    <p style="color:#333">Hi ${escapeHtml(name || 'there')},</p>
    <p style="color:#333">Your login code is</p>
    <p style="font-size:34px;letter-spacing:8px;font-weight:700;color:#6b1d2a;margin:8px 0 16px">${code}</p>
    <p style="color:#666;font-size:13px">Valid for 10 minutes. If you did not request this, ignore this email.</p></div>`

  const host = process.env.SMTP_HOST
  if (host) {
    // nodemailer ko dynamic import kiya hai taaki install na ho to bhi app crash na kare
    const moduleName = 'nodemailer'
    const nodemailer: any = await import(/* webpackIgnore: true */ moduleName)
    const transport = (nodemailer.default || nodemailer).createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    })
    return
  }

  // SMTP set nahi => Payload ka email adapter (dev me console par print hota hai)
  await payload.sendEmail({ to, subject, text, html })
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/* ---------------------------------------------------------- request */
export const otpRequestEndpoint: Endpoint = {
  path: '/otp/request',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload
    const body = await readBody(req)
    const id = parseIdentifier(body.identifier ?? body.email ?? body.phone)
    if (!id) return json({ error: 'Please enter a valid 10-digit mobile number or email.' }, 400)
    const email = id.key // OTP record ki key (email ya tel:XXXXXXXXXX)

    const now = Date.now()

    // rate limit
    const recent = await payload.find({
      collection: 'login-otps',
      where: { and: [{ email: { equals: email } }, { createdAt: { greater_than: new Date(now - 3600_000).toISOString() } }] } as any,
      sort: '-createdAt',
      limit: MAX_PER_HOUR,
      depth: 0,
      overrideAccess: true,
    })
    const last = recent.docs[0] as any
    if (last && !STATIC_CODE) {
      const wait = RESEND_GAP_MS - (now - new Date(last.createdAt).getTime())
      if (wait > 0) {
        return json({ error: 'Please wait before requesting another code.', retryAfter: Math.ceil(wait / 1000) }, 429)
      }
    }
    if (!STATIC_CODE && recent.docs.length >= MAX_PER_HOUR) {
      return json({ error: 'Too many requests. Please try again in an hour.', retryAfter: 3600 }, 429)
    }

    // code hamesha banta hai (unknown email par bhi) -> response/time se pata nahi chalta
    const code = STATIC_CODE || String(randomInt(0, 1_000_000)).padStart(6, '0')
    await payload.create({
      collection: 'login-otps',
      overrideAccess: true,
      data: { email, codeHash: hashCode(email, code), expiresAt: new Date(now + OTP_TTL_MS).toISOString(), attempts: 0 } as any,
    })

    if (STATIC_CODE) {
      // testing mode: koi email / SMS nahi, code fixed hai
      payload.logger.info(`[OTP] static code mode ON for ${email}`)
    } else {
      const customer = await findCustomer(payload, id)
      if (customer) {
        try {
          // mobile se login karne par bhi code customer ki email par jata hai (SMS provider baad me jodenge)
          await sendOtpEmail(payload, customer.email, customer.name || '', code)
        } catch (err) {
          payload.logger.error({ err }, 'OTP email send failed')
        }
        if (process.env.NODE_ENV !== 'production') payload.logger.info(`[DEV] OTP for ${email}: ${code}`)
      }
    }

    // purane (1 din se purane) OTP records saaf karo
    payload
      .delete({
        collection: 'login-otps',
        where: { expiresAt: { less_than: new Date(now - 24 * 3600_000).toISOString() } } as any,
        overrideAccess: true,
      })
      .catch(() => {})

    return json({ ok: true, resendIn: RESEND_GAP_MS / 1000, expiresIn: OTP_TTL_MS / 1000 })
  },
}

/* ----------------------------------------------------------- verify */
export const otpVerifyEndpoint: Endpoint = {
  path: '/otp/verify',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload
    const body = await readBody(req)
    const id = parseIdentifier(body.identifier ?? body.email ?? body.phone)
    const code = String(body.code ?? '').replace(/\D/g, '').slice(0, 6)
    if (!id || code.length !== 6) return json({ error: 'Enter the 6-digit code.' }, 400)
    const email = id.key

    const nowISO = new Date().toISOString()
    const found = await payload.find({
      collection: 'login-otps',
      where: {
        and: [{ email: { equals: email } }, { usedAt: { exists: false } }, { expiresAt: { greater_than: nowISO } }],
      } as any,
      sort: '-createdAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const otp = found.docs[0] as any
    if (!otp) return json({ error: 'This code has expired. Please request a new one.', code: 'expired_code' }, 400)

    const attempts = Number(otp.attempts || 0)
    if (attempts >= MAX_ATTEMPTS) {
      return json({ error: 'Too many wrong attempts. Please request a new code.', code: 'too_many_attempts' }, 429)
    }

    if (!safeEqual(hashCode(email, code), String(otp.codeHash))) {
      await payload.update({ collection: 'login-otps', id: otp.id, data: { attempts: attempts + 1 } as any, overrideAccess: true })
      const left = MAX_ATTEMPTS - attempts - 1
      return json(
        { error: left > 0 ? `Wrong code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many wrong attempts. Please request a new code.', code: 'wrong_code', attemptsLeft: left },
        400,
      )
    }

    // code sahi - ek baar hi chalega
    await payload.update({ collection: 'login-otps', id: otp.id, data: { usedAt: nowISO } as any, overrideAccess: true })

    const customer = await findCustomer(payload, id)
    if (!customer) return json({ error: 'No client account found for this mobile number / email.', code: 'no_account' }, 404)

    // 1-saal subscription check
    const end = customer.subscriptionEnd ? new Date(customer.subscriptionEnd) : null
    if (!end || end.getTime() <= Date.now()) {
      return json(
        {
          error: 'Your one-year access has ended. Please contact Royal Reelz to renew.',
          code: 'subscription_expired',
          subscriptionEnd: end ? end.toISOString() : null,
        },
        403,
      )
    }

    // Session: customer ka password har login par random kar dete hain (customer password kabhi use nahi karta),
    // phir Payload ka apna login chalate hain -> sahi JWT + cookie.
    const password = randomBytes(24).toString('hex')
    await payload.update({ collection: 'users', id: customer.id, data: { password } as any, overrideAccess: true })
    const session: any = await payload.login({ collection: 'users', data: { email: customer.email, password } })
    if (!session?.token) return json({ error: 'Could not sign you in. Please try again.' }, 500)

    const maxAge = Math.max(60, Math.min(Math.floor((session.exp ?? Date.now() / 1000 + 604800) - Date.now() / 1000), 60 * 60 * 24 * 7))
    const prefix = (payload.config as any).cookiePrefix || 'payload'
    const cookie = [
      `${prefix}-token=${session.token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${maxAge}`,
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ')

    const u = session.user || customer
    return json(
      {
        ok: true,
        user: {
          id: u.id,
          email: u.email,
          phone: customer.phone || '',
          name: u.name || '',
          role: u.role,
          subscriptionStart: customer.subscriptionStart || null,
          subscriptionEnd: end.toISOString(),
        },
      },
      200,
      { 'Set-Cookie': cookie },
    )
  },
}