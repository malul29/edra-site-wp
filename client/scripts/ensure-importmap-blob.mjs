import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const importMapPath = path.resolve(__dirname, '..', 'app', '(payload)', 'admin', 'importMap.js')

const importLine = "import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_7f101f78d033a7673478f233fbbe8900 } from '@payloadcms/storage-vercel-blob/client'"
const mapKeyLine = '  "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler": VercelBlobClientUploadHandler_7f101f78d033a7673478f233fbbe8900,'

async function main() {
  let content = await fs.readFile(importMapPath, 'utf8')

  if (!content.includes("@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler")) {
    const exportIndex = content.indexOf('export const importMap = {')
    if (exportIndex === -1) {
      throw new Error('Unable to locate importMap object in importMap.js')
    }

    if (!content.includes(importLine)) {
      content = `${content.slice(0, exportIndex)}${importLine}\n${content.slice(exportIndex)}`
    }

    const mapStart = content.indexOf('export const importMap = {')
    const insertPos = content.indexOf('\n', mapStart) + 1
    content = `${content.slice(0, insertPos)}${mapKeyLine}\n${content.slice(insertPos)}`

    await fs.writeFile(importMapPath, content, 'utf8')
    console.log('Added Vercel Blob client upload handler to Payload importMap.')
    return
  }

  console.log('Payload importMap already contains Vercel Blob client upload handler.')
}

main().catch((error) => {
  console.error('Failed to ensure Blob importMap entry:', error)
  process.exit(1)
})
