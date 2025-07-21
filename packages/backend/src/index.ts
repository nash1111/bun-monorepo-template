import { zValidator } from '@hono/zod-validator'
import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { CreatePostSchema, UpdatePostSchema } from 'shared'

const prisma = new PrismaClient()

const app = new Hono()

// CORS configuration
app.use(
  '*',
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://hogehoge.com'] // TODO: Replace with actual production domain
        : ['http://localhost:3030'], // Development: allow frontend port
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Blog API is running!',
    endpoints: {
      posts: '/api/posts',
    },
  })
})

// Individual API route definitions for proper RPC client type export
export const getAllPostsRoute = app.get('/api/posts', async (c) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return c.json({
      success: true,
      data: posts,
    })
  } catch (_error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch posts',
      },
      500,
    )
  }
})

export const getPostRoute = app.get('/api/posts/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return c.json(
        {
          success: false,
          error: 'Post not found',
        },
        404,
      )
    }

    return c.json({
      success: true,
      data: post,
    })
  } catch (_error) {
    return c.json(
      {
        success: false,
        error: 'Failed to fetch post',
      },
      500,
    )
  }
})

export const createPostRoute = app.post(
  '/api/posts',
  zValidator('json', CreatePostSchema),
  async (c) => {
    try {
      const postData = c.req.valid('json')
      const newPost = await prisma.post.create({
        data: postData,
      })

      return c.json(
        {
          success: true,
          data: newPost,
          message: 'Post created successfully',
        },
        201,
      )
    } catch (_error) {
      return c.json(
        {
          success: false,
          error: 'Failed to create post',
        },
        500,
      )
    }
  },
)

export const updatePostRoute = app.put(
  '/api/posts/:id',
  zValidator('json', UpdatePostSchema),
  async (c) => {
    try {
      const id = c.req.param('id')
      const postData = c.req.valid('json')

      const updatedPost = await prisma.post.update({
        where: { id },
        data: postData,
      })

      return c.json({
        success: true,
        data: updatedPost,
        message: 'Post updated successfully',
      })
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        return c.json(
          {
            success: false,
            error: 'Post not found',
          },
          404,
        )
      }
      return c.json(
        {
          success: false,
          error: 'Failed to update post',
        },
        500,
      )
    }
  },
)

export const deletePostRoute = app.delete('/api/posts/:id', async (c) => {
  try {
    const id = c.req.param('id')

    await prisma.post.delete({
      where: { id },
    })

    return c.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    if ((error as any)?.code === 'P2025') {
      return c.json(
        {
          success: false,
          error: 'Post not found',
        },
        404,
      )
    }
    return c.json(
      {
        success: false,
        error: 'Failed to delete post',
      },
      500,
    )
  }
})

// Export types for Hono RPC client
export type GetAllPostsRoute = typeof getAllPostsRoute
export type GetPostRoute = typeof getPostRoute
export type CreatePostRoute = typeof createPostRoute
export type UpdatePostRoute = typeof updatePostRoute
export type DeletePostRoute = typeof deletePostRoute

// Start server
export default {
  port: 3000,
  fetch: app.fetch,
}
