'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import { 
  LayoutDashboard, 
  Globe, 
  PlusCircle, 
  LogOut, 
  ShieldAlert 
} from 'lucide-react'

export default function ThanhDieuHuongDashboard({ profile, activePath }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
  const blogUrl = profile?.username ? `http://${mainDomain}/${profile.username}` : '#'

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <Link href="/dashboard" className="logo">
            Blo<span>act</span>
          </Link>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link href="/dashboard" className={`sidebar-link ${activePath === 'dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Tổng quan</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/posts/new" className={`sidebar-link ${activePath === 'new-post' ? 'active' : ''}`}>
              <PlusCircle size={20} />
              <span>Viết bài mới</span>
            </Link>
          </li>
          {profile?.username && (
            <li>
              <a href={blogUrl} target="_blank" rel="noopener noreferrer" className="sidebar-link">
                <Globe size={20} />
                <span>Xem blog của bạn</span>
              </a>
            </li>
          )}
          {profile?.role === 'admin' && (
            <li>
              <Link href="/admin" className={`sidebar-link ${activePath.startsWith('admin') ? 'active' : ''}`}>
                <ShieldAlert size={20} />
                <span>Quản trị viên</span>
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div>
        <button onClick={handleSignOut} className="sidebar-link w-full text-left" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>

        <div className="sidebar-profile">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="avatar" 
            />
          ) : (
            <div 
              className="avatar" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: 'var(--accent)', 
                color: '#ffffff', 
                fontWeight: 'bold', 
                fontSize: '16px',
                userSelect: 'none'
              }}
            >
              {(profile?.display_name || profile?.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>
              {profile?.display_name || 'Người dùng'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              @{profile?.username || 'chua-dat-ten'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
