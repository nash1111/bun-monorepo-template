import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { CreatePostSchema, UpdatePostSchema } from 'shared'
import { postsData } from './data/posts'

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
export const getAllPostsRoute = app.get('/api/posts', (c) => {
  return c.json({
    success: true,
    data: postsData.getAll(),
  })
})

export const getPostRoute = app.get('/api/posts/:id', (c) => {
  const id = c.req.param('id')
  const post = postsData.getById(id)

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
})

export const createPostRoute = app.post('/api/posts', zValidator('json', CreatePostSchema), (c) => {
  const postData = c.req.valid('json')
  const newPost = postsData.create(postData)

  return c.json(
    {
      success: true,
      data: newPost,
      message: 'Post created successfully',
    },
    201,
  )
})

export const updatePostRoute = app.put(
  '/api/posts/:id',
  zValidator('json', UpdatePostSchema),
  (c) => {
    const id = c.req.param('id')
    const postData = c.req.valid('json')
    const updatedPost = postsData.update(id, postData)

    if (!updatedPost) {
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
      data: updatedPost,
      message: 'Post updated successfully',
    })
  },
)

export const deletePostRoute = app.delete('/api/posts/:id', (c) => {
  const id = c.req.param('id')
  const deleted = postsData.delete(id)

  if (!deleted) {
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
    message: 'Post deleted successfully',
  })
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
