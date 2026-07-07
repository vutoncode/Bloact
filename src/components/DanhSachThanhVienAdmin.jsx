'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { UserCheck, UserMinus, Search } from 'lucide-react'

export default function DanhSachThanhVienAdmin({ initialUsers, adminId }) {
  const [users, setUsers] = useState(initialUsers || [])
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState(null)
  const supabase = createClient()

  const handleToggleBan = async (userProfile) => {
    const isBanned = !!userProfile.banned_at
    const action = isBanned ? 'unban' : 'ban'
    
    let reason = ''
    if (!isBanned) {
      reason = prompt('Nhập lý do khóa tài khoản:')
      if (reason === null) return
    } else {
      if (!confirm('Bạn có chắc chắn muốn mở khóa cho tài khoản này không?')) return
    }

    setLoadingId(userProfile.id)

    const updatedBannedAt = isBanned ? null : new Date().toISOString()

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ banned_at: updatedBannedAt })
      .eq('id', userProfile.id)

    if (profileError) {
      alert('Lỗi cập nhật trạng thái: ' + profileError.message)
      setLoadingId(null)
      return
    }

    await supabase.from('moderation_logs').insert({
      admin_id: adminId,
      action: action,
      target_id: userProfile.id,
      target_type: 'profile',
      reason: reason || 'Mở khóa tài khoản'
    })

    setUsers(users.map(u => u.id === userProfile.id ? { ...u, banned_at: updatedBannedAt } : u))
    setLoadingId(null)
  }

  const filteredUsers = users.filter(u => {
    const term = search.toLowerCase()
    const usernameMatch = u.username?.toLowerCase().includes(term)
    const displayNameMatch = u.display_name?.toLowerCase().includes(term)
    const emailMatch = u.email?.toLowerCase().includes(term)
    return usernameMatch || displayNameMatch || emailMatch
  })

  return (
    <div>
      <div className="flex justify-between align-center flex-wrap gap-sm" style={{ marginBottom: '24px' }}>
        <h2>Danh sách thành viên</h2>
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '40px' }}
            placeholder="Tìm theo tên, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-tertiary)' }} />
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Thành viên</th>
              <th>Username</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="flex align-center gap-sm">
                    <img 
                      src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop'} 
                      alt={u.display_name} 
                      className="avatar" 
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.display_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{u.email || 'Không có email'}</div>
                    </div>
                  </div>
                </td>
                <td>@{u.username || 'chua-onboard'}</td>
                <td>
                  {u.role === 'admin' ? (
                    <span className="badge badge-danger">Admin</span>
                  ) : (
                    <span className="badge badge-secondary">Tác giả</span>
                  )}
                </td>
                <td>{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                <td>
                  {u.banned_at ? (
                    <span className="badge badge-danger">Đang khóa</span>
                  ) : (
                    <span className="badge badge-success">Hoạt động</span>
                  )}
                </td>
                <td className="text-right">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleBan(u)}
                      className={`btn ${u.banned_at ? 'btn-primary' : 'btn-danger'}`}
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                      disabled={loadingId === u.id}
                    >
                      {u.banned_at ? (
                        <div className="flex align-center gap-xs">
                          <UserCheck size={14} />
                          <span>Mở khóa</span>
                        </div>
                      ) : (
                        <div className="flex align-center gap-xs">
                          <UserMinus size={14} />
                          <span>Khóa</span>
                        </div>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
