import { readFile } from 'node:fs/promises'
import path from 'node:path'

const htmlDir = path.join(process.cwd(), 'src', 'app', '(frontend)', 'html')

export function htmlResponse(file: string) {
  return readFile(path.join(htmlDir, file), 'utf8').then(
    (html) =>
      new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }),
  )
}
