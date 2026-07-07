'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'banned') {
      setError('Tài khoản của bạn đã bị khóa bởi quản trị viên.')
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex justify-center align-center" style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="card w-full max-w-md">
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <Link href="/" className="logo" style={{ display: 'inline-flex', marginBottom: '16px' }}>
            Blo<span>act</span>
          </Link>
          <h2>Đăng nhập</h2>
          <p style={{ marginTop: '8px' }}>Chào mừng bạn quay trở lại</p>
        </div>

        <form onSubmit={handleLogin}>
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

          <div className="form-group">
            <div className="flex justify-between align-center" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Mật khẩu</label>
              <Link href="/login/quen-mat-khau" style={{ fontSize: '14px', color: 'var(--accent)' }}>
                Quên mật khẩu?
              </Link>
            </div>
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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '24px' }}>
          <p>
            Chưa có tài khoản?{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: '600' }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
