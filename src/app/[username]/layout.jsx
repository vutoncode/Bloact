import Link from 'next/link'
import { createClient } from '../../lib/supabase/server'

export default async function BoKhungBlogCaNhan({ children, params }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    return (
      <div className="flex justify-center align-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '20px' }}>
        <h1>404 — Blog không tồn tại</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Trang blog cá nhân này không tồn tại trên hệ thống của chúng tôi.</p>
        <a href={`http://${process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'}`} className="btn btn-primary">
          Quay lại trang chủ Bloact
        </a>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', padding: '24px 0' }}>
        <div className="container flex align-center justify-between flex-wrap gap-sm">
          <Link href={`/${username}`} className="flex align-center gap-sm">
            <img 
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'} 
              alt={profile.display_name} 
              className="avatar" 
            />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{profile.display_name}</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>@{profile.username}</p>
            </div>
          </Link>
          <nav className="flex align-center gap-md">
            <Link href={`/${username}`} style={{ fontWeight: '500' }}>Bài viết</Link>
            <a href={`http://${process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
              Tạo Blog Ở Bloact
            </a>
          </nav>
        </div>
      </header>

      {profile.bio && (
        <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container">
            <p style={{ fontSize: '16px', fontStyle: 'italic', color: 'var(--text-secondary)', maxWidth: '600px' }}>
              &ldquo;{profile.bio}&rdquo;
            </p>
          </div>
        </section>
      )}

      <main style={{ flex: 1, padding: '48px 0' }}>
        {children}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container text-center">
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
            Cung cấp bởi <a href={`http://${process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'}`} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Bloact</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
