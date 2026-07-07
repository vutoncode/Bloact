'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('Mật khẩu phải dài tối thiểu 8 ký tự')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0]
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (signUpError) {
      setError(signUpError.message)
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
          <h2>Đăng ký tài khoản</h2>
          <p style={{ marginTop: '8px' }}>Bắt đầu hành trình viết blog của bạn</p>
        </div>

        {success ? (
          <div className="badge badge-success text-center w-full" style={{ padding: '16px', display: 'block', borderRadius: 'var(--radius-md)' }}>
            Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản.
          </div>
        ) : (
          <form onSubmit={handleSignup}>
            {error && (
              <div className="badge badge-danger text-center w-full" style={{ padding: '12px', display: 'block', marginBottom: '20px', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tên hiển thị</label>
              <input
                type="text"
                className="form-control"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

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

            <div className="form-group">
              <label className="form-label">Mật khẩu (tối thiểu 8 ký tự)</label>
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
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
            </button>
          </form>
        )}

        <div className="text-center" style={{ marginTop: '24px' }}>
          <p>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
