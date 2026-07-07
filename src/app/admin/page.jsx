import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import ThanhDieuHuongAdmin from '../../components/ThanhDieuHuongAdmin'

export default async function TrangOverviewQuanTri() {
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

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: allPosts } = await supabase
    .from('posts')
    .select('status, view_count')

  const totalPosts = allPosts?.length || 0
  const publishedCount = allPosts?.filter(p => p.status === 'published').length || 0
  const draftCount = allPosts?.filter(p => p.status === 'draft').length || 0
  const hiddenCount = allPosts?.filter(p => p.status === 'hidden').length || 0
  const totalViews = allPosts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*, author:profiles(display_name, username)')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="dashboard-container">
      <ThanhDieuHuongAdmin profile={profile} activePath="admin-dashboard" />
      
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Hệ thống quản trị Bloact</h1>
            <p style={{ marginTop: '4px' }}>Chào mừng trở lại, {profile.display_name}!</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Tổng người dùng</h4>
            <div className="stat-value">{usersCount || 0}</div>
          </div>
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Tổng bài viết</h4>
            <div className="stat-value">{totalPosts}</div>
          </div>
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Đã xuất bản / Nháp / Ẩn</h4>
            <div className="stat-value" style={{ fontSize: '20px', marginTop: '16px' }}>
              {publishedCount} / {draftCount} / {hiddenCount}
            </div>
          </div>
          <div className="stat-card">
            <h4 style={{ color: 'var(--text-secondary)' }}>Tổng lượt đọc</h4>
            <div className="stat-value">{totalViews}</div>
          </div>
        </div>

        <div className="grid-2 gap-lg" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <h2 style={{ marginBottom: '16px' }}>Bài viết mới nhất</h2>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              {recentPosts && recentPosts.length > 0 ? (
                <ul className="flex flex-col gap-sm" style={{ listStyle: 'none' }}>
                  {recentPosts.map((post) => (
                    <li key={post.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{post.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          Bởi {post.author?.display_name || 'Người dùng'} (@{post.author?.username})
                        </div>
                      </div>
                      <div>
                        {post.status === 'published' && <span className="badge badge-success">Đã xuất bản</span>}
                        {post.status === 'draft' && <span className="badge badge-warning">Bản nháp</span>}
                        {post.status === 'hidden' && <span className="badge badge-danger">Đã ẩn</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>Không có bài viết nào.</p>
              )}
            </div>
          </div>

          <div>
            <h2 style={{ marginBottom: '16px' }}>Thành viên mới nhất</h2>
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              {recentUsers && recentUsers.length > 0 ? (
                <ul className="flex flex-col gap-sm" style={{ listStyle: 'none' }}>
                  {recentUsers.map((userProfile) => (
                    <li key={userProfile.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{userProfile.display_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>@{userProfile.username || 'chua-onboard'}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(userProfile.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>Không có thành viên nào.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
