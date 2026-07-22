'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'
import { Edit, Trash, ExternalLink, ArrowUpDown, Eye, EyeOff } from 'lucide-react'

export default function BangBaiViet({ initialPosts, username }) {
  const [posts, setPosts] = useState(initialPosts || [])
  const [loadingId, setLoadingId] = useState(null)
  const [sortOrder, setSortOrder] = useState('newest')
  const supabase = createClient()

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return
    setLoadingId(id)

    const { error } = await supabase.from('posts').delete().eq('id', id)

    if (error) {
      alert('Lỗi khi xóa bài viết: ' + error.message)
      setLoadingId(null)
      return
    }

    setPosts(posts.filter(post => post.id !== id))
    setLoadingId(null)
  }

  const handleToggleVisibility = async (id, currentStatus) => {
    // If it's a draft, don't allow hiding/showing from here (or allow publishing)
    // Let's assume we toggle between published and hidden
    const newStatus = currentStatus === 'hidden' ? 'published' : 'hidden'
    setLoadingId(id)

    const { error } = await supabase.from('posts').update({ status: newStatus }).eq('id', id)

    if (error) {
      alert('Lỗi khi cập nhật trạng thái bài viết: ' + error.message)
      setLoadingId(null)
      return
    }

    setPosts(posts.map(post => post.id === id ? { ...post, status: newStatus } : post))
    setLoadingId(null)
  }

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })
  }, [posts, sortOrder])

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'

  return (
    <div>
      {posts.length > 0 && (
        <div className="flex justify-end" style={{ marginBottom: '16px' }}>
          <div className="flex align-center gap-xs">
            <ArrowUpDown size={16} style={{ color: 'var(--text-secondary)' }} />
            <select 
              className="form-control" 
              style={{ width: '150px', padding: '8px 12px', fontSize: '14px', cursor: 'pointer' }}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      )}
      <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        {posts.length === 0 ? (
        <div className="text-center" style={{ padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Bạn chưa có bài viết nào.</p>
          <Link href="/dashboard/posts/new" className="btn btn-primary">
            Viết bài đầu tiên
          </Link>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Lượt xem</th>
              <th>Ngày tạo</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {sortedPosts.map((post) => {
              const postUrl = `http://${mainDomain}/${username}/${post.slug}`
              let rowBg = 'transparent'
              if (post.status === 'published') rowBg = 'rgba(16, 185, 129, 0.04)'
              if (post.status === 'draft') rowBg = 'rgba(245, 158, 11, 0.06)'
              if (post.status === 'hidden') rowBg = 'rgba(239, 68, 68, 0.04)'

              return (
                <tr key={post.id} style={{ backgroundColor: rowBg, transition: 'background-color 0.2s' }}>
                  <td style={{ width: '80px' }}>
                    <img 
                      src={post.cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=150&auto=format&fit=crop'} 
                      alt={post.title} 
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      /{post.slug}
                    </div>
                  </td>
                  <td>
                    {post.status === 'published' && <span className="badge badge-success">Đã xuất bản</span>}
                    {post.status === 'draft' && <span className="badge badge-warning">Bản nháp</span>}
                    {post.status === 'hidden' && <span className="badge badge-danger">Đã ẩn (Admin)</span>}
                  </td>
                  <td>{post.view_count}</td>
                  <td>{new Date(post.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-sm">
                      <a 
                        href={postUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary" 
                        style={{ 
                          padding: '8px', 
                          visibility: post.status === 'published' ? 'visible' : 'hidden'
                        }} 
                        title="Xem bài viết"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <Link href={`/dashboard/posts/${post.id}/edit`} className="btn btn-secondary" style={{ padding: '8px' }} title="Sửa bài viết">
                        <Edit size={16} />
                      </Link>
                      {post.status !== 'draft' && (
                        <button 
                          onClick={() => handleToggleVisibility(post.id, post.status)}
                          className="btn btn-secondary"
                          style={{ padding: '8px' }}
                          disabled={loadingId === post.id}
                          title={post.status === 'hidden' ? "Hiện bài viết" : "Ẩn bài viết"}
                        >
                          {post.status === 'hidden' ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(post.id)} 
                        className="btn btn-danger" 
                        style={{ padding: '8px' }} 
                        disabled={loadingId === post.id}
                        title="Xóa bài viết"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      </div>
    </div>
  )
}

