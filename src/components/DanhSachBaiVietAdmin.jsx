'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { Eye, EyeOff, Trash, Search, Filter } from 'lucide-react'

export default function DanhSachBaiVietAdmin({ initialPosts, adminId }) {
  const [posts, setPosts] = useState(initialPosts || [])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loadingId, setLoadingId] = useState(null)
  const supabase = createClient()

  const handleToggleHide = async (post) => {
    const isHidden = post.status === 'hidden'
    const newStatus = isHidden ? 'draft' : 'hidden'
    const action = isHidden ? 'unhide' : 'hide'

    let reason = ''
    if (!isHidden) {
      reason = prompt('Nhập lý do ẩn bài viết:')
      if (reason === null) return
    } else {
      if (!confirm('Bạn có chắc muốn mở khóa hiển thị cho bài viết này?')) return
    }

    setLoadingId(post.id)

    const { error: postError } = await supabase
      .from('posts')
      .update({ status: newStatus })
      .eq('id', post.id)

    if (postError) {
      alert('Lỗi cập nhật bài viết: ' + postError.message)
      setLoadingId(null)
      return
    }

    await supabase.from('moderation_logs').insert({
      admin_id: adminId,
      action: action,
      target_id: post.id,
      target_type: 'post',
      reason: reason || 'Mở ẩn bài viết'
    })

    setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p))
    setLoadingId(null)
  }

  const handleDelete = async (post) => {
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết này không? Hành động này không thể hoàn tác.')) return
    const reason = prompt('Nhập lý do xóa bài viết (tùy chọn):')
    if (reason === null) return

    setLoadingId(post.id)

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)

    if (deleteError) {
      alert('Lỗi khi xóa bài viết: ' + deleteError.message)
      setLoadingId(null)
      return
    }

    await supabase.from('moderation_logs').insert({
      admin_id: adminId,
      action: 'delete',
      target_id: post.id,
      target_type: 'post',
      reason: reason || 'Xóa vĩnh viễn bài viết'
    })

    setPosts(posts.filter(p => p.id !== post.id))
    setLoadingId(null)
  }

  const filteredPosts = posts.filter(p => {
    const term = search.toLowerCase()
    const titleMatch = p.title?.toLowerCase().includes(term)
    const authorMatch = p.author?.display_name?.toLowerCase().includes(term) || p.author?.username?.toLowerCase().includes(term)
    const matchesSearch = titleMatch || authorMatch

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="flex justify-between align-center flex-wrap gap-sm" style={{ marginBottom: '24px' }}>
        <h2>Danh sách bài viết</h2>
        
        <div className="flex gap-sm flex-wrap">
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '40px' }}
              placeholder="Tìm theo tiêu đề, tác giả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-tertiary)' }} />
          </div>

          <div className="flex align-center gap-xs">
            <Filter size={18} style={{ color: 'var(--text-secondary)' }} />
            <select
              className="form-control"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Bài viết / Tác giả</th>
              <th>Trạng thái</th>
              <th>Lượt xem</th>
              <th>Ngày tạo</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((p) => (
              <tr key={p.id}>
                <td style={{ width: '80px' }}>
                  <img 
                    src={p.cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=150&auto=format&fit=crop'} 
                    alt={p.title} 
                    style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                </td>
                <td>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Bởi {p.author?.display_name || 'Người dùng'} (@{p.author?.username})
                  </div>
                </td>
                <td>
                  {p.status === 'published' && <span className="badge badge-success">Đã xuất bản</span>}
                  {p.status === 'draft' && <span className="badge badge-warning">Bản nháp</span>}
                  {p.status === 'hidden' && <span className="badge badge-danger">Đã ẩn</span>}
                </td>
                <td>{p.view_count}</td>
                <td>{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-sm">
                    <button
                      onClick={() => handleToggleHide(p)}
                      className={`btn ${p.status === 'hidden' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '8px' }}
                      disabled={loadingId === p.id}
                      title={p.status === 'hidden' ? 'Hiện bài viết' : 'Ẩn bài viết'}
                    >
                      {p.status === 'hidden' ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="btn btn-danger"
                      style={{ padding: '8px' }}
                      disabled={loadingId === p.id}
                      title="Xóa vĩnh viễn"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
