import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { put } from '@vercel/blob'
import { Client } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const mediaDir = path.join(rootDir, 'public', 'media')

dotenv.config({ path: path.join(rootDir, '.env') })
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true })

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN
const apply = process.argv.includes('--apply')

if (!databaseUrl) {
  console.error('Missing DATABASE_URL/POSTGRES_URL in env')
  process.exit(1)
}

if (!blobToken) {
  console.error('Missing blob token. Set BLOB_READ_WRITE_TOKEN or VERCEL_BLOB_READ_WRITE_TOKEN.')
  process.exit(1)
}

function mimeFromFilename(filename) {
  const ext = path.extname(filename || '').toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.avif') return 'image/avif'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.svg') return 'image/svg+xml'
  return 'application/octet-stream'
}

async function readLocalFile(filename) {
  if (!filename) return null

  const candidates = [
    filename,
    decodeURIComponent(filename),
    encodeURIComponent(filename),
  ]

  for (const candidate of candidates) {
    const abs = path.join(mediaDir, candidate)
    try {
      const buffer = await fs.readFile(abs)
      return { buffer, filename: candidate }
    } catch {
      // continue
    }
  }

  return null
}

async function upload(filename) {
  const local = await readLocalFile(filename)
  if (!local) return null

  if (!apply) {
    return `DRY_RUN_BLOB_URL/media/${encodeURIComponent(filename)}`
  }

  const blob = await put(`media/${filename}`, local.buffer, {
    token: blobToken,
    access: 'public',
    addRandomSuffix: false,
    contentType: mimeFromFilename(filename),
  })

  return blob.url
}

async function main() {
  const dbHost = (() => {
    try {
      return new URL(databaseUrl).host
    } catch {
      return '(invalid DATABASE_URL)'
    }
  })()

  console.log(`Using DB host: ${dbHost}`)
  console.log(`Mode: ${apply ? 'apply' : 'dry-run'}`)

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  const res = await client.query(`
    select
      id,
      filename,
      sizes_thumbnail_filename,
      sizes_card_filename,
      sizes_full_filename
    from media
    order by id desc
  `)

  let mediaDocs = 0
  let updatedDocs = 0
  let skippedDocs = 0
  let uploadedFiles = 0
  let missingFiles = 0

  for (const row of res.rows) {
    mediaDocs += 1

    const main = await upload(row.filename)
    if (!main) {
      skippedDocs += 1
      missingFiles += 1
      console.log(`[missing] media:${row.id} file=${row.filename}`)
      continue
    }

    const thumb = row.sizes_thumbnail_filename ? await upload(row.sizes_thumbnail_filename) : null
    const card = row.sizes_card_filename ? await upload(row.sizes_card_filename) : null
    const full = row.sizes_full_filename ? await upload(row.sizes_full_filename) : null

    uploadedFiles += 1 + (thumb ? 1 : 0) + (card ? 1 : 0) + (full ? 1 : 0)

    if (apply) {
      await client.query(
        `
        update media
        set
          url = $2,
          thumbnail_u_r_l = coalesce($3, thumbnail_u_r_l),
          sizes_thumbnail_url = coalesce($3, sizes_thumbnail_url),
          sizes_card_url = coalesce($4, sizes_card_url),
          sizes_full_url = coalesce($5, sizes_full_url)
        where id = $1
      `,
        [row.id, main, thumb, card, full]
      )
    }

    updatedDocs += 1
    console.log(`${apply ? '[updated]' : '[dry-run]'} media:${row.id} main=${row.filename}`)
  }

  if (apply) {
    const check = await client.query(`
      select count(*)::int as n
      from media
      where url like 'https://%.blob.vercel-storage.com/%'
    `)
    console.log(`blob_url_rows=${check.rows[0].n}`)
  }

  await client.end()

  console.log('--- Migration Summary ---')
  console.log(`mode=${apply ? 'apply' : 'dry-run'}`)
  console.log(`media_docs=${mediaDocs}`)
  console.log(`updated_docs=${updatedDocs}`)
  console.log(`skipped_docs=${skippedDocs}`)
  console.log(`uploaded_files=${uploadedFiles}`)
  console.log(`missing_files=${missingFiles}`)
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
