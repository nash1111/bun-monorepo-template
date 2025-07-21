import type { Post } from 'shared'

// In-memory data store for blog posts
const posts: Post[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Welcome to our Blog!',
    content:
      "This is our first blog post. We're excited to share our thoughts and ideas with you. Stay tuned for more content!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Getting Started with Bun and Hono',
    content:
      "In this post, we'll explore how to build a modern web API using Bun runtime and Hono framework. Bun provides incredible performance improvements over traditional Node.js applications.",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export const postsData = {
  // Get all posts
  getAll: (): Post[] => posts,

  // Get post by ID
  getById: (id: string): Post | undefined => posts.find((post) => post.id === id),

  // Create new post
  create: (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post => {
    const newPost: Post = {
      id: crypto.randomUUID(),
      ...postData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    posts.unshift(newPost) // Add to beginning for newest first
    return newPost
  },

  // Update existing post
  update: (id: string, updates: Partial<Omit<Post, 'id' | 'createdAt'>>): Post | null => {
    const index = posts.findIndex((post) => post.id === id)
    if (index === -1) return null

    posts[index] = {
      ...posts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return posts[index]
  },

  // Delete post
  delete: (id: string): boolean => {
    const index = posts.findIndex((post) => post.id === id)
    if (index === -1) return false

    posts.splice(index, 1)
    return true
  },
}
