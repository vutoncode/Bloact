'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function TrangDatLaiMatKhau() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Mật khẩu phải dài tối thiểu 8 ký tự')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  return (
    <div className="flex justify-center align-center" style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="card w-full max-w-md">
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <Link href="/" className="logo" style={{ display: 'inline-flex', marginBottom: '16px' }}>
            Blo<span>act</span>
          </Link>
          <h2>Đặt lại mật khẩu</h2>
          <p style={{ marginTop: '8px' }}>Nhập mật khẩu mới của bạn</p>
        </div>

        {success ? (
          <div className="badge badge-success text-center w-full" style={{ padding: '16px', display: 'block', borderRadius: 'var(--radius-md)' }}>
            Mật khẩu đã được cập nhật thành công! Đang chuyển hướng về trang đăng nhập...
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            {error && (
              <div className="badge badge-danger text-center w-full" style={{ padding: '12px', display: 'block', marginBottom: '20px', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Mật khẩu mới (tối thiểu 8 ký tự)</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '12px', height: '48px' }} disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
