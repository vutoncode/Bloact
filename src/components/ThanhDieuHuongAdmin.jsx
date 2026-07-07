'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  ArrowLeft, 
  LogOut 
} from 'lucide-react'

export default function ThanhDieuHuongAdmin({ profile, activePath }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <Link href="/admin" className="logo" style={{ color: 'var(--danger)' }}>
            Blo<span>admin</span>
          </Link>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link href="/admin" className={`sidebar-link ${activePath === 'admin-dashboard' ? 'active' : ''}`}>
              <ShieldAlert size={20} />
              <span>Tổng quan Admin</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className={`sidebar-link ${activePath === 'admin-users' ? 'active' : ''}`}>
              <Users size={20} />
              <span>Quản lý thành viên</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/posts" className={`sidebar-link ${activePath === 'admin-posts' ? 'active' : ''}`}>
              <FileText size={20} />
              <span>Quản lý bài viết</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="sidebar-link">
              <ArrowLeft size={20} />
              <span>Về Dashboard</span>
            </Link>
          </li>
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
              {profile?.display_name || 'Quản trị viên'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
