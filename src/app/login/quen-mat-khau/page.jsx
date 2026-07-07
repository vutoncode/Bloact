'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'

export default function QuenMatKhauPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/dat-lai-mat-khau`
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="flex justify-center align-center" style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="card w-full max-w-md">
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <Link href="/" className="logo" style={{ display: 'inline-flex', marginBottom: '16px' }}>
            Blo<span>act</span>
          </Link>
          <h2>Quên mật khẩu</h2>
          <p style={{ marginTop: '8px' }}>Nhập email để nhận liên kết đặt lại mật khẩu</p>
        </div>

        {success ? (
          <div className="badge badge-success text-center w-full" style={{ padding: '16px', display: 'block', borderRadius: 'var(--radius-md)' }}>
            Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            {error && (
              <div className="badge badge-danger text-center w-full" style={{ padding: '12px', display: 'block', marginBottom: '20px', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '12px', height: '48px' }} disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi liên kết'}
            </button>
          </form>
        )}

        <div className="text-center" style={{ marginTop: '24px' }}>
          <p>
            Quay lại{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
