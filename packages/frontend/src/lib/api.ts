import type {
  CreatePostRoute,
  DeletePostRoute,
  GetAllPostsRoute,
  GetPostRoute,
  UpdatePostRoute,
} from 'backend'
import { hc } from 'hono/client'
import type { CreatePost, Post, UpdatePost } from 'shared'

// Create individual Hono RPC clients for each route
const getAllPostsClient = hc<GetAllPostsRoute>('http://localhost:3000')
const getPostClient = hc<GetPostRoute>('http://localhost:3000')
const createPostClient = hc<CreatePostRoute>('http://localhost:3000')
const updatePostClient = hc<UpdatePostRoute>('http://localhost:3000')
const deletePostClient = hc<DeletePostRoute>('http://localhost:3000')

// API response types
interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// Blog API functions using Hono RPC client
export const blogApi = {
  // Get all posts
  getAllPosts: async (): Promise<Post[]> => {
    const response = await getAllPostsClient.api.posts.$get()
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    const result: ApiResponse<Post[]> = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch posts')
    }
    return result.data || []
  },

  // Get post by ID
  getPost: async (id: string): Promise<Post> => {
    const response = await getPostClient.api.posts[':id'].$get({
      param: { id },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch post')
    }
    const result: ApiResponse<Post> = await response.json()
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Post not found')
    }
    return result.data
  },

  // Create new post
  createPost: async (postData: CreatePost): Promise<Post> => {
    const response = await createPostClient.api.posts.$post({
      json: postData,
    })
    if (!response.ok) {
      throw new Error('Failed to create post')
    }
    const result: ApiResponse<Post> = await response.json()
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create post')
    }
    return result.data
  },

  // Update post
  updatePost: async (id: string, postData: UpdatePost): Promise<Post> => {
    const response = await updatePostClient.api.posts[':id'].$put({
      param: { id },
      json: postData,
    })
    if (!response.ok) {
      throw new Error('Failed to update post')
    }
    const result: ApiResponse<Post> = await response.json()
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update post')
    }
    return result.data
  },

  // Delete post
  deletePost: async (id: string): Promise<void> => {
    const response = await deletePostClient.api.posts[':id'].$delete({
      param: { id },
    })
    if (!response.ok) {
      throw new Error('Failed to delete post')
    }
    const result: ApiResponse = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete post')
    }
  },
}
