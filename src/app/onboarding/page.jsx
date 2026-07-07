'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'

const RESERVED_KEYWORDS = [
  'admin', 'api', 'www', 'app', 'static', 'main', 'assets',
  'dashboard', 'login', 'signup', 'onboarding', 'quen-mat-khau',
  'dat-lai-mat-khau', 'admin-panel', 'posts', 'users', 'auth'
]

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', currentUser.id)
        .single()

      if (profile && profile.username) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase])

  useEffect(() => {
    if (!username) {
      setError('')
      return
    }

    const validateUsernameFormat = (val) => {
      if (val.length < 3 || val.length > 30) {
        return 'Tên người dùng phải từ 3 đến 30 ký tự'
      }
      if (!/^[a-z0-9-]+$/.test(val)) {
        return 'Chỉ chấp nhận chữ thường không dấu (a-z), số (0-9) và dấu gạch ngang (-)'
      }
      if (val.startsWith('-') || val.endsWith('-')) {
        return 'Không được bắt đầu hoặc kết thúc bằng dấu gạch ngang'
      }
      if (RESERVED_KEYWORDS.includes(val)) {
        return 'Tên người dùng này thuộc từ khóa hệ thống, vui lòng chọn tên khác'
      }
      return ''
    }

    const formatError = validateUsernameFormat(username)
    if (formatError) {
      setError(formatError)
      return
    }

    setError('')
    setChecking(true)

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (data) {
        setError('Tên người dùng này đã được đăng ký, vui lòng chọn tên khác')
      } else {
        setError('')
      }
      setChecking(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [username, supabase])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (error || checking || !username || !user) return

    setLoading(true)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
  const blogUrl = `http://${username}.${mainDomain}`

  return (
    <div className="flex justify-center align-center" style={{ minHeight: '100vh', padding: '24px', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="card w-full max-w-md">
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <h2>Thiết lập Blog của bạn</h2>
          <p style={{ marginTop: '8px' }}>Chọn một tên người dùng duy nhất để tạo địa chỉ trang blog cá nhân</p>
        </div>

        {success ? (
          <div>
            <div className="badge badge-success text-center w-full" style={{ padding: '16px', display: 'block', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              Thiết lập thành công!
            </div>
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>Địa chỉ blog của bạn:</p>
              <a href={blogUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '18px', display: 'block', marginTop: '8px', wordBreak: 'break-all' }}>
                {username}.{mainDomain}
              </a>
            </div>
            <button onClick={() => { router.push('/dashboard'); router.refresh(); }} className="btn btn-primary w-full" style={{ height: '48px' }}>
              Vào Trang Quản Lý (Dashboard)
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tên người dùng (Username)</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                placeholder="my-awesome-blog"
                required
                disabled={loading}
              />
              {checking && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Đang kiểm tra tính khả dụng...</p>}
              {error && <p className="form-error">{error}</p>}
              {!error && !checking && username && (
                <p style={{ fontSize: '12px', color: 'var(--success)' }}>Tên người dùng này khả dụng!</p>
              )}
            </div>

            <div style={{ marginTop: '8px', marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Địa chỉ dự kiến: <strong style={{ color: 'var(--text-primary)' }}>{username || 'username'}.{mainDomain}</strong>
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ height: '48px' }} disabled={loading || checking || !!error || !username}>
              {loading ? 'Đang lưu...' : 'Xác nhận & Tạo Blog'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
