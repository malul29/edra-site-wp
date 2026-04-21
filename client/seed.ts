// Seed script - run this after the database is set up and admin user is created
// Usage: npx tsx seed.ts
//
// NOTE: You must have DATABASE_URL set in your .env file

import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config.ts'
import path from 'path'
import fs from 'fs'
import os from 'os'

const portfolioData = [
    {
        title: "Urban Suites",
        location: "Bekasi, Indonesia",
        category: "High Rise",
        year: "2018",
        image: "/uploads/urban-suites-main.png",
        description: "Urban Suites adalah proyek konsep TOD yang berlokasi di Caman Bekasi dan berdiri diatas lahan 7900 m2. Dilengkasi fasilitas mall, F&B, fasilitas olahraga, kolam renang dan terkoneksi langsung dengan stasiun LRT diharapkan Apartment ini bisa menjadi pusat kegiatan bagi kaum commuter di sekitarnya.",
        slug: "urban-suites",
        gallery: [],
    },
    {
        title: "TOD Poris Plawad",
        location: "Tangerang, Indonesia",
        category: "High Rise",
        year: "2018",
        image: "/uploads/tod-poris-plawad-main.png",
        description: "Badan Pengelola Transportasi Jabodetabek (BPTJ) bersama dengan pengembang PT Mina Trasindo Totabuan tengah merancang konsep Transit Oriented Development (TOD) Poris Plawad.",
        slug: "tod-poris-plawad",
        gallery: [
            { imageUrl: "/uploads/tod-poris-plawad-gallery-0.png" },
            { imageUrl: "/uploads/tod-poris-plawad-gallery-1.png" },
            { imageUrl: "/uploads/tod-poris-plawad-gallery-2.png" },
            { imageUrl: "/uploads/tod-poris-plawad-gallery-3.png" },
        ],
    },
    {
        title: "La Montana Apartment",
        location: "Bogor, Indonesia",
        category: "High Rise",
        year: "2017",
        image: "/uploads/la-montana-apartment-main.png",
        description: "A tropical paradise residence blending modern comfort with natural beauty.",
        slug: "la-montana-apartment",
        gallery: [
            { imageUrl: "/uploads/la-montana-apartment-gallery-0.png" },
            { imageUrl: "/uploads/la-montana-apartment-gallery-1.png" },
            { imageUrl: "/uploads/la-montana-apartment-gallery-2.png" },
        ],
    },
    {
        title: "Jimbaran Avenue",
        location: "Bali, Indonesia",
        category: "Mall",
        year: "2017",
        image: "/uploads/jimbaran-avenue-main.png",
        description: "Jimbaran Avenue atau Jave merupakan lifestyle mall yang didesain dengan konsep outdoor, memasukkan banyak elemen landscape ke dalam bangunan sehingga aliran udara dan cahaya dapat maksimal masuk ke dalamnya.",
        slug: "jimbaran-avenue",
        gallery: [],
    },
    {
        title: "The Mansion",
        location: "Makassar, Indonesia",
        category: "Private House",
        year: "2020",
        image: "/uploads/the-mansion-main.png",
        description: "A luxurious private residence designed with a modern tropical approach.",
        slug: "the-mansion",
        gallery: [
            { imageUrl: "/uploads/the-mansion-gallery-0.png" },
            { imageUrl: "/uploads/the-mansion-gallery-1.png" },
            { imageUrl: "/uploads/the-mansion-gallery-2.png" },
        ],
    },
    {
        title: "Gateway Pasteur, Bandung",
        location: "Bandung, Indonesia",
        category: "High Rise",
        year: "2021",
        image: "/uploads/gateway-pasteur-bandung-main.png",
        description: "Gateway Pasteur apartment adalah sebuah kawasan Residential dan Commercial Bisnis Terbesar Dan Terlengkap di Kota Bandung.",
        slug: "gateway-pasteur-bandung",
        gallery: [
            { imageUrl: "/uploads/gateway-pasteur-bandung-gallery-0.png" },
            { imageUrl: "/uploads/gateway-pasteur-bandung-gallery-1.png" },
            { imageUrl: "/uploads/gateway-pasteur-bandung-gallery-2.png" },
        ],
    },
    {
        title: "Noir Showroom",
        location: "Jakarta, Indonesia",
        category: "Interior",
        year: "2023",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        description: "A sophisticated showroom featuring minimalist design and premium finishes.",
        slug: "noir-showroom",
        gallery: [
            { imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop" },
            { imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop" },
            { imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop" },
        ],
    },
]

const blogsData = [
    {
        title: "The Future of Green Architecture in Urban Planning",
        date: "Feb 2026",
        tag: "Architecture",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
        excerpt: "How passive systems, facade strategy, and urban data are shaping a new era of sustainable projects.",
    },
    {
        title: "Mastering Project Management for High-Rise Buildings",
        date: "Jan 2026",
        tag: "Construction",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop",
        excerpt: "A practical framework to control budget, schedule, and quality from project kickoff to final handover.",
    },
    {
        title: "Minimalist Interiors for Modern Residences",
        date: "Dec 2025",
        tag: "Interior",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
        excerpt: "Balancing function and calm atmosphere through proportion, detail, and material discipline.",
    },
    {
        title: "Embracing the Wabi-Sabi Aesthetic in Modern Homes",
        date: "Mar 2026",
        tag: "Design",
        image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop",
        excerpt: "Finding beauty in imperfection and the natural cycle of growth and decay within architectural spaces.",
        author: "Elena Rossi",
    },
    {
        title: "The Resurgence of Brutalism: Why Concrete is Cool Again",
        date: "Apr 2026",
        tag: "Architecture",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
        excerpt: "Exploring the unexpected comeback of the most controversial architectural style of the 20th century.",
        author: "Markus Vance",
    },
    {
        title: "Biophilic Design: Healing the Urban Disconnect",
        date: "May 2026",
        tag: "Design",
        image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
        excerpt: "Integrating natural elements into the built environment to improve mental health and cognitive function.",
        author: "Dr. Sarah Lin",
    },
    {
        title: "The Art of the Open Floor Plan: Pros and Cons",
        date: "Jun 2026",
        tag: "Interior",
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop",
        excerpt: "Navigating the complexities of open-concept living in the modern residential landscape.",
        author: "James Harrington",
    },
    {
        title: "Light as a Building Material",
        date: "Jul 2026",
        tag: "Architecture",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
        excerpt: "How architects manipulate natural and artificial light to define space and emotion.",
        author: "Arden Zwerlin",
    },
]



async function seed() {
    console.log('🌱 Starting seed...')

    const payload = await getPayload({ config })

    async function uploadMedia(url: string, altText: string) {
        if (!url) return null;
        try {
            if (url.startsWith('/uploads/')) {
                // Local file
                const filePath = path.join(process.cwd(), 'public', url)
                if (fs.existsSync(filePath)) {
                    const fileName = path.basename(filePath)
                    // Check if exists
                    const existing = await payload.find({
                        collection: 'media',
                        where: { filename: { equals: fileName } },
                        limit: 1,
                    })
                    if (existing.docs.length > 0) return existing.docs[0].id

                    const media = await payload.create({
                        collection: 'media',
                        data: { alt: altText || fileName },
                        filePath: filePath
                    })
                    return media.id
                } else {
                    console.log(`⚠️ Local file not found: ${filePath}`)
                    return null;
                }
            } else if (url.startsWith('http')) {
                // Remote file
                const parsedUrl = new URL(url)
                const fileName = path.basename(parsedUrl.pathname) || 'download.jpg'
                const uniqueName = Date.now() + '-' + fileName

                const existing = await payload.find({
                    collection: 'media',
                    where: { filename: { equals: uniqueName } },
                    limit: 1,
                })
                if (existing.docs.length > 0) return existing.docs[0].id

                const res = await fetch(url)
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

                const arrayBuffer = await res.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                const tmpPath = path.join(os.tmpdir(), uniqueName)
                fs.writeFileSync(tmpPath, buffer)

                const media = await payload.create({
                    collection: 'media',
                    data: { alt: altText || uniqueName },
                    filePath: tmpPath
                })

                fs.unlinkSync(tmpPath)
                return media.id
            }
        } catch (err: any) {
            console.log(`⚠️ Failed to upload media ${url}: ${err.message}`)
        }
        return null;
    }

    // Seed Portfolio
    console.log('📁 Seeding portfolio...')
    for (const item of portfolioData) {
        try {
            const mainImageId = await uploadMedia(item.image, item.title)

            const galleryImages = []
            if (item.gallery && item.gallery.length > 0) {
                for (let i = 0; i < item.gallery.length; i++) {
                    const galId = await uploadMedia(item.gallery[i].imageUrl, `${item.title} gallery ${i}`)
                    if (galId) galleryImages.push({ image: galId })
                }
            }

            const dataToInsert = {
                ...item,
                image: mainImageId,
                gallery: galleryImages
            }

            const existing = await payload.find({
                collection: 'portfolio',
                where: { slug: { equals: item.slug } },
            })

            if (existing.docs.length === 0) {
                await payload.create({
                    collection: 'portfolio',
                    data: dataToInsert as any,
                })
                console.log(`  ✅ Created: ${item.title}`)
            } else {
                console.log(`  ⏭️ Skipped (already exists): ${item.title}`)
            }
        } catch (err: any) {
            console.log(`  ⚠️ Skipped: ${item.title} (${err.message})`)
        }
    }

    // Seed Blogs
    console.log('📝 Seeding blogs...')
    for (const item of blogsData) {
        try {
            const imageId = await uploadMedia(item.image, item.title)

            const dataToInsert = {
                ...item,
                image: imageId
            }

            const existing = await payload.find({
                collection: 'blogs',
                where: { title: { equals: item.title } },
            })

            if (existing.docs.length === 0) {
                await payload.create({
                    collection: 'blogs',
                    data: dataToInsert as any,
                })
                console.log(`  ✅ Created: ${item.title}`)
            } else {
                console.log(`  ⏭️ Skipped (already exists): ${item.title}`)
            }
        } catch (err: any) {
            console.log(`  ⚠️ Skipped: ${item.title} (${err.message})`)
        }
    }



    console.log('\n✅ Seed complete!')
    process.exit(0)
}

seed().catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
})
