/** Admin ke "Preview" button ke liye website ka page URL. */
export function siteURL(page = 'index.html') {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:9007').replace(/\/$/, '')
  return `${base}/${page}`
}