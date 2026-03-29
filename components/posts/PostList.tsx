import { PostCard } from './PostCard'
import type { PostWithAuthor } from '@/lib/types/database'

export function PostList({ posts }: { posts: PostWithAuthor[] }) {
  if (posts.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        No posts yet. Be the first to post!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
