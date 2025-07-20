import { useState, useEffect } from 'react'
import type { Post } from 'shared'
import { blogApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface PostListProps {
  onCreatePost: () => void
  onEditPost: (post: Post) => void
  onViewPost: (post: Post) => void
}

export function PostList({ onCreatePost, onEditPost, onViewPost }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedPosts = await blogApi.getAllPosts()
      setPosts(fetchedPosts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      await blogApi.deletePost(postId)
      setPosts(posts.filter(post => post.id !== postId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-muted-foreground">Loading posts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="text-destructive">Error: {error}</div>
        <Button onClick={loadPosts} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button onClick={onCreatePost} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg mb-4">No posts yet.</p>
          <Button onClick={onCreatePost} variant="outline">
            Create your first post
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground line-clamp-3 flex-1 mb-4">
                  {post.content}
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => onViewPost(post)} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </Button>
                  <Button 
                    onClick={() => onEditPost(post)} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(post.id)} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
