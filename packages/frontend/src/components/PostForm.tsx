import { useState, useEffect } from 'react'
import type { Post, CreatePost, UpdatePost } from 'shared'
import { CreatePostSchema, UpdatePostSchema } from 'shared'
import { blogApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostFormProps {
  post?: Post | null // null for create, Post for edit
  onSave: (post: Post) => void
  onCancel: () => void
}

export function PostForm({ post, onSave, onCancel }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string
    content?: string
  }>({})

  const isEditing = Boolean(post)

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
    } else {
      setTitle('')
      setContent('')
    }
    setError(null)
    setFieldErrors({})
  }, [post])

  const validateForm = (): boolean => {
    const newFieldErrors: { title?: string; content?: string } = {}
    
    try {
      if (isEditing) {
        UpdatePostSchema.parse({ title: title || undefined, content: content || undefined })
      } else {
        CreatePostSchema.parse({ title, content })
      }
      setFieldErrors({})
      return true
    } catch (err: any) {
      if (err.errors) {
        err.errors.forEach((error: any) => {
          const field = error.path[0] as string
          if (field === 'title' || field === 'content') {
            newFieldErrors[field as keyof typeof newFieldErrors] = error.message
          }
        })
      }
      setFieldErrors(newFieldErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      let savedPost: Post

      if (isEditing && post) {
        const updateData: UpdatePost = {}
        if (title !== post.title) updateData.title = title
        if (content !== post.content) updateData.content = content
        
        savedPost = await blogApi.updatePost(post.id, updateData)
      } else {
        const createData: CreatePost = { title, content }
        savedPost = await blogApi.createPost(createData)
      }

      onSave(savedPost)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onCancel} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Your Post' : 'Write a New Post'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className={cn(fieldErrors.title && "border-destructive")}
                disabled={loading}
              />
              {fieldErrors.title && (
                <p className="text-sm text-destructive">{fieldErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content..."
                rows={12}
                className={cn(
                  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
                  fieldErrors.content && "border-destructive"
                )}
                disabled={loading}
              />
              {fieldErrors.content && (
                <p className="text-sm text-destructive">{fieldErrors.content}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading 
                  ? (isEditing ? 'Updating...' : 'Creating...') 
                  : (isEditing ? 'Update Post' : 'Create Post')
                }
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
