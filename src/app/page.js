import Link from 'next/link'
import { createClient } from '../lib/supabase/server'

export default async function TrangChu() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: postsData } = await supabase
    .from('posts')
    .select('*, author:profiles(username, display_name, avatar_url)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <header className="navbar">
        <div className="container flex align-center justify-between">
          <Link href="/" className="logo">
            Blo<span>act</span>
          </Link>
          <nav className="nav-links">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">
                Vào Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary">
                  Đăng nhập
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {postsData && postsData.length > 0 ? (
          <>
            {/* Banner Section */}
            <section className="banner-section">
              <div className="container">
                <Link href={`/${postsData[0].author?.username}/${postsData[0].slug}`} className="banner-post">
                  <img 
                    src={postsData[0].cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop'} 
                    alt={postsData[0].title} 
                    className="banner-image"
                  />
                  <div className="banner-card">
                    <span className="tag-label">Technology</span>
                    <h2>{postsData[0].title}</h2>
                    <div className="post-meta">
                      <img 
                        src={postsData[0].author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + postsData[0].author?.username} 
                        alt={postsData[0].author?.display_name} 
                        className="author-avatar"
                      />
                      <span>{postsData[0].author?.display_name || postsData[0].author?.username}</span>
                      <span>&bull;</span>
                      <span>{new Date(postsData[0].created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
              </div>
            </section>

            {/* Advertisement Section */}
            <section className="ad-section">
              <div className="container flex justify-center">
                <div className="ad-placeholder">
                  <span style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Advertisement</span>
                  <span style={{ fontWeight: '600' }}>You can place ads</span>
                  <span>750x100</span>
                </div>
              </div>
            </section>

            {/* Latest Posts Grid */}
            <section className="posts-section">
              <div className="container">
                <h3 className="section-title">Latest Post</h3>
                <div className="post-grid">
                  {postsData.slice(1).map(post => (
                    <Link href={`/${post.author?.username}/${post.slug}`} key={post.id} className="post-card">
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
                            src={post.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.author?.username} 
                            alt={post.author?.display_name} 
                            className="author-avatar"
                            style={{ width: '24px', height: '24px' }}
                          />
                          <span style={{ fontSize: '13px' }}>{post.author?.display_name || post.author?.username}</span>
                          <span style={{ fontSize: '13px' }}>{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {postsData.length > 9 && (
                  <div className="flex justify-center">
                    <button className="btn btn-secondary">View All Post</button>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="hero-section">
            <div className="container text-center">
              <h2>Chưa có bài viết nào</h2>
              <p>Hãy là người đầu tiên xuất bản bài viết trên nền tảng!</p>
            </div>
          </section>
        )}
      </main>

      <footer className="footer-section">
        <div className="container flex align-center justify-between">
          <div>
            <p>&copy; {new Date().getFullYear()} Bloact. Mọi quyền được bảo lưu.</p>
          </div>
          <div className="flex gap-sm">
            <a href="mailto:contact@bloact.com" className="text-secondary">Liên hệ</a>
            <span className="text-secondary">|</span>
            <Link href="/" className="text-secondary">Chính sách bảo mật</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
