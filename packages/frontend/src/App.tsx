import { useState } from 'react'
import type { Post } from 'shared'
import { PostForm } from './components/PostForm'
import { PostList } from './components/PostList'

type View = 'list' | 'create' | 'edit' | 'view'

export function App() {
  const [currentView, setCurrentView] = useState<View>('list')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const handleCreatePost = () => {
    setSelectedPost(null)
    setCurrentView('create')
  }

  const handleEditPost = (post: Post) => {
    setSelectedPost(post)
    setCurrentView('edit')
  }

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setCurrentView('view')
  }

  const handleSavePost = (_post: Post) => {
    setCurrentView('list')
    setSelectedPost(null)
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedPost(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {currentView === 'list' && (
          <PostList
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            onViewPost={handleViewPost}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <PostForm
            post={currentView === 'edit' ? selectedPost : null}
            onSave={handleSavePost}
            onCancel={handleCancel}
          />
        )}

        {currentView === 'view' && selectedPost && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                ← Back to Posts
              </button>
              <button
                type="button"
                onClick={() => handleEditPost(selectedPost)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Edit Post
              </button>
            </div>

            <article className="prose prose-slate max-w-none">
              <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
              <div className="text-muted-foreground text-sm mb-6">
                Published on {new Date(selectedPost.createdAt).toLocaleDateString()}
                {selectedPost.updatedAt !== selectedPost.createdAt && (
                  <span> · Updated {new Date(selectedPost.updatedAt).toLocaleDateString()}</span>
                )}
              </div>
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {selectedPost.content}
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
