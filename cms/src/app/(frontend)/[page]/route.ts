import { htmlResponse } from '../html/render'

const pages = new Set(['index.html', 'about.html', 'gallery.html', 'videos.html', 'contact.html'])

type Args = { params: Promise<{ page: string }> }

export async function GET(_req: Request, { params }: Args) {
  const { page } = await params
  if (!pages.has(page)) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
  return htmlResponse(page)
}
