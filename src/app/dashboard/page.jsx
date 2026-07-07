import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import DashboardNav from '../../components/DashboardNav'
import PostsTable from '../../components/PostsTable'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.username) {
    redirect('/onboarding')
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const totalPosts = posts?.length || 0
  const publishedPosts = posts?.filter(p => p.status === 'published').length || 0
  const draftPosts = posts?.filter(p => p.status === 'draft').length || 0
  const totalViews = posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0

  return (
    <div className="dashboard-container">
      <DashboardNav profile={profile} activePath="dashboard" />
      
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Tổng quan Blog</h1>
            <p style={{ marginTop: '4px' }}>Chào mừng trở lại, {profile.display_name}!</p>
          </div>
          <a 
            href={`/dashboard/posts/new`} 
            className="btn btn-primary"
          >
            Viết bài mới
          </a>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Tổng lượt xem</h4>
            <div className="stat-value">{totalViews}</div>
          </div>
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Bài viết</h4>
            <div className="stat-value">{totalPosts}</div>
          </div>
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Đã xuất bản</h4>
            <div className="stat-value">{publishedPosts}</div>
          </div>
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Bản nháp</h4>
            <div className="stat-value">{draftPosts}</div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Danh sách bài viết</h2>
          <PostsTable initialPosts={posts} username={profile.username} />
        </div>
      </main>
    </div>
  )
}
