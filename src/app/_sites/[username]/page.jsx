import Link from 'next/link'
import { createClient } from '../../../lib/supabase/server'

export default async function BlogHomePage({ params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) return null

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      {posts && posts.length > 0 ? (
        <div className="flex flex-col gap-lg">
          {posts.map((post) => {
            const wordCount = post.content ? JSON.stringify(JSON.parse(post.content)).split(/\s+/).length : 0
            const readTime = Math.ceil(wordCount / 200) || 1

            return (
              <article key={post.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {post.cover_image_url && (
                  <Link href={`/${post.slug}`}>
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                    />
                  </Link>
                )}
                <div style={{ padding: '32px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                    {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')} &bull; {readTime} phút đọc
                  </div>
                  <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>
                    <Link href={`/${post.slug}`} style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '16px' }}>
                      {post.excerpt}
                    </p>
                  )}
                  <Link href={`/${post.slug}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                    Đọc tiếp
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="text-center" style={{ padding: '80px 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Chưa có bài viết nào được xuất bản.</p>
        </div>
      )}
    </div>
  )
}
