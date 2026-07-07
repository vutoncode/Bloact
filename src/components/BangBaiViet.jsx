'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase/client'
import { Edit, Trash, ExternalLink } from 'lucide-react'

export default function BangBaiViet({ initialPosts, username }) {
  const [posts, setPosts] = useState(initialPosts || [])
  const [loadingId, setLoadingId] = useState(null)
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

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'

  return (
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
            {posts.map((post) => {
              const postUrl = `http://${mainDomain}/${username}/${post.slug}`
              return (
                <tr key={post.id}>
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
                      {post.status === 'published' && (
                        <a href={postUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '8px' }} title="Xem bài viết">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <Link href={`/dashboard/posts/${post.id}/edit`} className="btn btn-secondary" style={{ padding: '8px' }} title="Sửa bài viết">
                        <Edit size={16} />
                      </Link>
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
  )
}
