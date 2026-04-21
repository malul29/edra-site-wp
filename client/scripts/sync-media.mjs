import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const sourceDir = path.join(rootDir, 'media')
const targetDir = path.join(rootDir, 'public', 'media')

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function syncDirectory(source, target) {
  await fs.mkdir(target, { recursive: true })
  const entries = await fs.readdir(source, { withFileTypes: true })

  await Promise.all(entries.map(async (entry) => {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await syncDirectory(sourcePath, targetPath)
      return
    }

    await fs.copyFile(sourcePath, targetPath)
  }))
}

if (await pathExists(sourceDir)) {
  await syncDirectory(sourceDir, targetDir)
  console.log(`Synced media assets from ${sourceDir} to ${targetDir}`)
} else {
  await fs.mkdir(targetDir, { recursive: true })
  console.log(`Media source not found at ${sourceDir}, ensured ${targetDir} exists`)
}