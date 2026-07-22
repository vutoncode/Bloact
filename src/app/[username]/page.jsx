import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'

export default async function TrangChuBlogCaNhan({ params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) return null

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('view_count', { ascending: false })

  return (
    <div>
      {posts && posts.length > 0 ? (
        <>
          {/* Banner Section */}
          <section className="banner-section">
            <div className="container">
              <div className="banner-grid">
                <Link href={`/${username}/${posts[0].slug}`} className="banner-post main-banner">
                  <img 
                    src={posts[0].cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop'} 
                    alt={posts[0].title} 
                    className="banner-image"
                  />
                  <div className="banner-card">
                    <span className="tag-label">Technology</span>
                    <h2>{posts[0].title}</h2>
                    <div className="post-meta">
                      <img 
                        src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.username} 
                        alt={profile.display_name} 
                        className="author-avatar"
                      />
                      <span>{profile.display_name || profile.username}</span>
                      <span>&bull;</span>
                      <span>{new Date(posts[0].published_at || posts[0].created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>

                {posts.length > 1 && (
                  <div className="sub-banners">
                    {posts.slice(1, 3).map(post => (
                      <Link href={`/${username}/${post.slug}`} key={post.id} className="banner-post sub-banner">
                        <img 
                          src={post.cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop'} 
                          alt={post.title} 
                          className="banner-image"
                        />
                        <div className="banner-card">
                          <span className="tag-label">Technology</span>
                          <h2>{post.title}</h2>
                          <div className="post-meta">
                            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Latest Posts Grid */}
          <section className="posts-section">
            <div className="container">
              <h3 className="section-title">Latest Post</h3>
              <div className="post-grid">
                {posts.slice(1).map(post => (
                  <Link href={`/${username}/${post.slug}`} key={post.id} className="post-card">
                    <img 
                      src={post.cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=600&auto=format&fit=crop'} 
                      alt={post.title} 
                      className="post-card-image"
                    />
                    <div className="post-card-content">
                      <span className="tag-label">Technology</span>
                      <h3>{post.title}</h3>
                      <div className="post-meta" style={{ marginTop: 'auto' }}>
                        <img 
                          src={profile.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.username} 
                          alt={profile.display_name} 
                          className="author-avatar"
                          style={{ width: '24px', height: '24px' }}
                        />
                        <span style={{ fontSize: '13px' }}>{profile.display_name || profile.username}</span>
                        <span style={{ fontSize: '13px' }}>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {posts.length > 9 && (
                <div className="flex justify-center">
                  <button className="btn btn-secondary">View All Post</button>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="text-center" style={{ padding: '80px 0' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Chưa có bài viết nào được xuất bản.</p>
        </div>
      )}
    </div>
  )
}
