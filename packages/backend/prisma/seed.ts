import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.post.deleteMany()
  console.log('Cleared existing posts')

  // Create seed data
  const posts = await prisma.post.createMany({
    data: [
      {
        title: 'Welcome to our Blog!',
        content:
          "This is our first blog post. We're excited to share our thoughts and ideas with you. Stay tuned for more content!",
      },
      {
        title: 'Getting Started with Bun and Hono',
        content:
          "In this post, we'll explore how to build a modern web API using Bun runtime and Hono framework. Bun provides incredible performance improvements over traditional Node.js applications.",
      },
    ],
  })

  console.log(`✅ Created ${posts.count} posts`)
  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
