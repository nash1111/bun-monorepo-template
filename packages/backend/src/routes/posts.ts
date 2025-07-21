import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { CreatePostSchema, UpdatePostSchema } from 'shared'
import { postsData } from '../data/posts'

const posts = new Hono()

// GET /posts - Get all posts
posts.get('/', (c) => {
  const allPosts = postsData.getAll()
  return c.json({
    success: true,
    data: allPosts,
  })
})

// GET /posts/:id - Get post by ID
posts.get('/:id', (c) => {
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

// POST /posts - Create new post
posts.post('/', zValidator('json', CreatePostSchema), (c) => {
  const validatedData = c.req.valid('json')
  const newPost = postsData.create(validatedData)

  return c.json(
    {
      success: true,
      message: 'Post created successfully',
      data: newPost,
    },
    201,
  )
})

// PUT /posts/:id - Update existing post
posts.put('/:id', zValidator('json', UpdatePostSchema), (c) => {
  const id = c.req.param('id')
  const validatedData = c.req.valid('json')

  const updatedPost = postsData.update(id, validatedData)

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
    message: 'Post updated successfully',
    data: updatedPost,
  })
})

// DELETE /posts/:id - Delete post
posts.delete('/:id', (c) => {
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

export { posts }
