import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { Client } from 'pg'
import { getPayload } from 'payload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(rootDir, '.env') })
const sourceDatabaseUrl = process.env.DATABASE_URL

dotenv.config({ path: path.join(rootDir, '.env.local'), override: true })
const destinationDatabaseUrl = process.env.DATABASE_URL

if (!sourceDatabaseUrl) {
  console.error('Missing source DATABASE_URL from .env')
  process.exit(1)
}

if (!destinationDatabaseUrl) {
  console.error('Missing destination DATABASE_URL from .env.local')
  process.exit(1)
}

if (sourceDatabaseUrl === destinationDatabaseUrl) {
  console.error('Source and destination DATABASE_URL are identical. Aborting to prevent duplicate writes.')
  process.exit(1)
}

const mediaDir = path.join(rootDir, 'public', 'media')

function toIsoDate(value) {
  if (!value) return undefined
  try {
    return new Date(value).toISOString()
  } catch {
    return undefined
  }
}

async function main() {
  const source = new Client({ connectionString: sourceDatabaseUrl })
  await source.connect()

  const { default: config } = await import('../payload.config.ts')
  const payload = await getPayload({ config })

  const sourceMedia = await source.query(`
    select
      id,
      alt,
      filename,
      created_at,
      updated_at
    from media
    order by id asc
  `)

  const sourcePortfolio = await source.query(`
    select
      id,
      title,
      slug,
      location,
      category::text as category,
      year,
      description,
      image_id,
      created_at,
      updated_at
    from portfolio
    order by id asc
  `)

  const sourcePortfolioGallery = await source.query(`
    select
      _parent_id,
      image_id,
      _order
    from portfolio_gallery
    order by _parent_id asc, _order asc
  `)

  const sourceBlogs = await source.query(`
    select
      id,
      title,
      subtitle,
      date,
      tag::text as tag,
      excerpt,
      author,
      content,
      image_id,
      created_at,
      updated_at
    from blogs
    order by id asc
  `)

  const mediaIdMap = new Map()

  let mediaCreated = 0
  let mediaSkipped = 0
  for (const row of sourceMedia.rows) {
    const filename = row.filename
    if (!filename) {
      mediaSkipped += 1
      continue
    }

    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      mediaIdMap.set(row.id, existing.docs[0].id)
      mediaSkipped += 1
      continue
    }

    const filePath = path.join(mediaDir, filename)
    if (!fs.existsSync(filePath)) {
      console.log(`[missing-file] media:${row.id} filename=${filename}`)
      mediaSkipped += 1
      continue
    }

    const created = await payload.create({
      collection: 'media',
      data: {
        alt: row.alt || filename,
        createdAt: toIsoDate(row.created_at),
        updatedAt: toIsoDate(row.updated_at),
      },
      filePath,
      overrideAccess: true,
      depth: 0,
    })

    mediaIdMap.set(row.id, created.id)
    mediaCreated += 1
    console.log(`[media] created ${filename} -> ${created.id}`)
  }

  const galleryByParent = new Map()
  for (const row of sourcePortfolioGallery.rows) {
    if (!galleryByParent.has(row._parent_id)) galleryByParent.set(row._parent_id, [])
    galleryByParent.get(row._parent_id).push(row)
  }

  let portfolioCreated = 0
  let portfolioSkipped = 0
  for (const row of sourcePortfolio.rows) {
    const existing = await payload.find({
      collection: 'portfolio',
      where: { slug: { equals: row.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      portfolioSkipped += 1
      continue
    }

    const mappedMainImage = mediaIdMap.get(row.image_id)
    if (!mappedMainImage) {
      console.log(`[skip-portfolio] missing main image mapping for slug=${row.slug}`)
      portfolioSkipped += 1
      continue
    }

    const galleryRows = galleryByParent.get(row.id) || []
    const gallery = galleryRows
      .map((g) => mediaIdMap.get(g.image_id))
      .filter(Boolean)
      .map((image) => ({ image }))

    await payload.create({
      collection: 'portfolio',
      data: {
        title: row.title,
        slug: row.slug,
        location: row.location,
        category: row.category,
        year: row.year,
        description: row.description,
        image: mappedMainImage,
        gallery,
        createdAt: toIsoDate(row.created_at),
        updatedAt: toIsoDate(row.updated_at),
      },
      overrideAccess: true,
      depth: 0,
    })

    portfolioCreated += 1
    console.log(`[portfolio] created ${row.slug}`)
  }

  let blogsCreated = 0
  let blogsSkipped = 0
  for (const row of sourceBlogs.rows) {
    const existing = await payload.find({
      collection: 'blogs',
      where: { title: { equals: row.title } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      blogsSkipped += 1
      continue
    }

    const mappedImage = mediaIdMap.get(row.image_id)
    if (!mappedImage) {
      console.log(`[skip-blog] missing image mapping for title=${row.title}`)
      blogsSkipped += 1
      continue
    }

    await payload.create({
      collection: 'blogs',
      data: {
        title: row.title,
        subtitle: row.subtitle,
        date: row.date,
        tag: row.tag,
        excerpt: row.excerpt,
        author: row.author,
        content: row.content,
        image: mappedImage,
        createdAt: toIsoDate(row.created_at),
        updatedAt: toIsoDate(row.updated_at),
      },
      overrideAccess: true,
      depth: 0,
    })

    blogsCreated += 1
    console.log(`[blog] created ${row.title}`)
  }

  await source.end()

  console.log('--- DB Migration Summary ---')
  console.log(`source_media=${sourceMedia.rows.length}`)
  console.log(`created_media=${mediaCreated}`)
  console.log(`skipped_media=${mediaSkipped}`)
  console.log(`source_portfolio=${sourcePortfolio.rows.length}`)
  console.log(`created_portfolio=${portfolioCreated}`)
  console.log(`skipped_portfolio=${portfolioSkipped}`)
  console.log(`source_blogs=${sourceBlogs.rows.length}`)
  console.log(`created_blogs=${blogsCreated}`)
  console.log(`skipped_blogs=${blogsSkipped}`)
}

main().catch(async (error) => {
  console.error('Failed to migrate old DB to new DB:', error)
  process.exit(1)
})
