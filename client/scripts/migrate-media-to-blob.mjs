import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { put } from '@vercel/blob'
import { getPayload } from 'payload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const mediaDir = path.join(rootDir, 'public', 'media')

dotenv.config({ path: path.join(rootDir, '.env') })
dotenv.config({ path: path.join(rootDir, '.env.local'), override: true })

const blobToken = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN
const apply = process.argv.includes('--apply')
const allowEmpty = process.argv.includes('--allow-empty')

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

async function readLocalFileByFilename(filename) {
  if (!filename) return null

  const candidates = [
    filename,
    decodeURIComponent(filename),
    encodeURIComponent(filename),
  ]

  for (const candidate of candidates) {
    const absolute = path.join(mediaDir, candidate)
    try {
      const buffer = await fs.readFile(absolute)
      return { buffer, absolute, filename: candidate }
    } catch {
      // try next candidate
    }
  }

  return null
}

async function uploadToBlob(filename) {
  const local = await readLocalFileByFilename(filename)
  if (!local) return null

  if (!apply) {
    return {
      url: `DRY_RUN_BLOB_URL/media/${encodeURIComponent(filename)}`,
      localPath: local.absolute,
    }
  }

  const blob = await put(`media/${filename}`, local.buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType: mimeFromFilename(filename),
    token: blobToken,
  })

  return {
    url: blob.url,
    localPath: local.absolute,
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const dbHost = (() => {
    try {
      return new URL(databaseUrl).host
    } catch {
      return '(invalid-or-missing DATABASE_URL)'
    }
  })()

  console.log(`Using DB host: ${dbHost}`)
  console.log(`Mode: ${apply ? 'apply' : 'dry-run'}`)

  const { default: config } = await import('../payload.config.ts')
  const payload = await getPayload({ config })

  let page = 1
  let totalPages = 1

  let totalDocs = 0
  let updatedDocs = 0
  let skippedDocs = 0
  let missingFiles = 0
  let uploadedFiles = 0

  const firstPage = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    page: 1,
    pagination: true,
    overrideAccess: true,
  })

  if ((firstPage.totalDocs || 0) === 0 && !allowEmpty) {
    throw new Error(
      'No media docs found in current DATABASE_URL. If intentional, rerun with --allow-empty.'
    )
  }

  page = 1
  totalPages = 1

  while (page <= totalPages) {
    const res = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      page,
      pagination: true,
      overrideAccess: true,
    })

    totalPages = res.totalPages || 1

    for (const doc of res.docs) {
      totalDocs += 1

      const updateData = {}
      let didChange = false

      const mainFilename = doc.filename || null
      const uploadedMain = await uploadToBlob(mainFilename)

      if (!uploadedMain) {
        skippedDocs += 1
        if (mainFilename) {
          missingFiles += 1
          console.log(`[missing] media:${doc.id} file=${mainFilename}`)
        }
        continue
      }

      uploadedFiles += 1
      updateData.url = uploadedMain.url
      didChange = true

      const nextSizes = doc.sizes ? { ...doc.sizes } : undefined

      if (nextSizes && typeof nextSizes === 'object') {
        for (const [sizeKey, sizeValue] of Object.entries(nextSizes)) {
          if (!sizeValue || typeof sizeValue !== 'object') continue
          const sizeFilename = sizeValue.filename || null
          if (!sizeFilename) continue

          const uploadedSize = await uploadToBlob(sizeFilename)
          if (!uploadedSize) {
            missingFiles += 1
            console.log(`[missing-size] media:${doc.id} size=${sizeKey} file=${sizeFilename}`)
            continue
          }

          uploadedFiles += 1
          nextSizes[sizeKey] = {
            ...sizeValue,
            url: uploadedSize.url,
          }
          didChange = true

          if (sizeKey === 'thumbnail') {
            updateData.thumbnailURL = uploadedSize.url
          }
        }
      }

      if (nextSizes) {
        updateData.sizes = nextSizes
      }

      if (!didChange) {
        skippedDocs += 1
        continue
      }

      if (apply) {
        await payload.update({
          collection: 'media',
          id: doc.id,
          data: updateData,
          depth: 0,
          overrideAccess: true,
        })
      }

      updatedDocs += 1
      console.log(`${apply ? '[updated]' : '[dry-run]'} media:${doc.id} main=${mainFilename}`)
    }

    page += 1
  }

  console.log('--- Migration Summary ---')
  console.log(`mode=${apply ? 'apply' : 'dry-run'}`)
  console.log(`media_docs=${totalDocs}`)
  console.log(`updated_docs=${updatedDocs}`)
  console.log(`skipped_docs=${skippedDocs}`)
  console.log(`uploaded_files=${uploadedFiles}`)
  console.log(`missing_files=${missingFiles}`)
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
