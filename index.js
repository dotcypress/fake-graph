const OpenGraph = require('ogp-meta')
const shortid = require('shortid')
const { json, send } = require('micro')

const baseUrl = process.env.BASE_URL || process.env.NOW_URL
const token = process.env.API_TOKEN
const pages = new Map()

function render ({ url, siteName, title, description, image, video, redirect }) {
  const ogp = new OpenGraph()
  ogp.title(title)
  ogp.type('website')
  ogp.url(url)
  ogp.site_name(siteName)
  ogp.description(description)
  ogp.video(video)
  ogp.image(image)
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${siteName} — ${title}</title>
        ${ogp.toHTML()}
        <script type="text/javascript">
          ${redirect ? `location.href = '${redirect}'` : ''}
        </script>
      </head>
      <body>
      </body>
    </html>
  `
}

module.exports = async function (req, res) {
  if (req.method == 'POST' && req.headers.authorization === `Bearer ${token}`) {
    const data = await json(req)
    const id = shortid.generate()
    data.url = `${baseUrl}/${id}`
    pages.set(id, data)
    return data
  }
  const page = pages.get(req.url.slice(1))
  if (!page) {
    return send(res, 404)
  }
  res.setHeader('content-type', 'text/html; charset=utf-8')
  send(res, 200, render(page))
}
