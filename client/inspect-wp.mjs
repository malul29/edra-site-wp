/**
 * inspect-wp.js
 * Debug utility: test connection to WordPress REST API
 * Usage: node inspect-wp.js
 */
import 'dotenv/config'

const WP_BASE_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '')

if (!WP_BASE_URL) {
  console.error('ERROR: NEXT_PUBLIC_WORDPRESS_URL is not set in .env.local')
  process.exit(1)
}

async function run() {
  console.log(`Testing WordPress REST API at: ${WP_BASE_URL}/wp-json/wp/v2/`)

  // Test portfolio
  const portfolioRes = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/portfolio?_embed&per_page=5`)
  if (!portfolioRes.ok) {
    console.error('Portfolio API failed:', portfolioRes.status, portfolioRes.statusText)
    console.error('Is the portfolio Custom Post Type registered and REST API enabled?')
  } else {
    const portfolio = await portfolioRes.json()
    console.log(`\n✓ Portfolio: Found ${portfolio.length} items`)
    for (const p of portfolio) {
      console.log(`  - ${p.title?.rendered} (slug: ${p.slug}, acf:`, Object.keys(p.acf || {}), ')')
    }
  }

  // Test blog posts
  const postsRes = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/posts?_embed&per_page=5`)
  if (!postsRes.ok) {
    console.error('Posts API failed:', postsRes.status, postsRes.statusText)
  } else {
    const posts = await postsRes.json()
    console.log(`\n✓ Blog Posts: Found ${posts.length} items`)
    for (const p of posts) {
      console.log(`  - ${p.title?.rendered} (slug: ${p.slug})`)
    }
  }

  process.exit(0)
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
