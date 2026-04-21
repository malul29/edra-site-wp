import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import { Client } from 'pg'

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
  console.error('Source and destination DATABASE_URL are identical. Aborting.')
  process.exit(1)
}

const tables = ['media', 'portfolio', 'portfolio_gallery', 'blogs']

async function fetchAll(client, table) {
  const res = await client.query(`select * from ${table}`)
  return res.rows
}

async function insertRows(client, table, rows) {
  if (!rows.length) return

  const columns = Object.keys(rows[0])
  const columnSql = columns.map((c) => `"${c}"`).join(', ')

  for (const row of rows) {
    const values = columns.map((c) => row[c])
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
    await client.query(
      `insert into ${table} (${columnSql}) values (${placeholders}) on conflict do nothing`,
      values
    )
  }
}

async function main() {
  const source = new Client({ connectionString: sourceDatabaseUrl })
  const destination = new Client({ connectionString: destinationDatabaseUrl })

  await source.connect()
  await destination.connect()

  const sourceData = {}
  for (const table of tables) {
    sourceData[table] = await fetchAll(source, table)
    console.log(`source ${table}: ${sourceData[table].length}`)
  }

  await destination.query('begin')
  try {
    await destination.query('truncate table portfolio_gallery, portfolio, blogs, media restart identity cascade')

    for (const table of tables) {
      await insertRows(destination, table, sourceData[table])
    }

    await destination.query(`
      select setval('media_id_seq', greatest(coalesce((select max(id) from media), 1), 1), true);
      select setval('portfolio_id_seq', greatest(coalesce((select max(id) from portfolio), 1), 1), true);
      select setval('blogs_id_seq', greatest(coalesce((select max(id) from blogs), 1), 1), true);
    `)

    await destination.query('commit')
  } catch (error) {
    await destination.query('rollback')
    throw error
  }

  for (const table of tables) {
    const check = await destination.query(`select count(*)::int as n from ${table}`)
    console.log(`destination ${table}: ${check.rows[0].n}`)
  }

  await source.end()
  await destination.end()

  console.log('CMS data copy completed successfully.')
}

main().catch((error) => {
  console.error('Failed to copy CMS data between DBs:', error)
  process.exit(1)
})
