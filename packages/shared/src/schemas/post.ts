import { z } from 'zod'

export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreatePostSchema = PostSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})

export const UpdatePostSchema = CreatePostSchema.partial()

export type Post = z.infer<typeof PostSchema>
export type CreatePost = z.infer<typeof CreatePostSchema>
export type UpdatePost = z.infer<typeof UpdatePostSchema>
