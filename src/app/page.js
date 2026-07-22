import Link from 'next/link'
import { createClient } from '../lib/supabase/server'

export default async function TrangChu() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <header className="navbar">
        <div className="container flex align-center justify-between">
          <Link href="/" className="logo">
            Blo<span>act</span>
          </Link>
          <nav className="nav-links">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">
                Vào Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary">
                  Đăng nhập
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="container">
            <h1 className="hero-title">Viết Blog Cá Nhân Độc Bản Với Tên Miền Riêng</h1>
            <p className="hero-subtitle">
              Nền tảng viết blog tối giản, tải trang siêu nhanh, hỗ trợ subdomain miễn phí cho từng tác giả.
            </p>
            <div>
              {user ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Quản lý blog của bạn
                </Link>
              ) : (
                <Link href="/signup" className="btn btn-primary">
                  Bắt đầu viết blog miễn phí
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="container">
            <h2 className="section-title">Tại sao chọn Bloact?</h2>
            <div className="feature-grid">
              <div className="card">
                <h3>Subdomain riêng biệt</h3>
                <p>Mỗi tác giả sở hữu một trang blog riêng với địa chỉ độc quyền dạng username.domain.com hoàn toàn miễn phí.</p>
              </div>
              <div className="card">
                <h3>Trình soạn thảo cao cấp</h3>
                <p>Trình soạn thảo chuẩn Word/Google Docs trực quan, chèn bảng, code block, hình ảnh kéo thả dễ dàng.</p>
              </div>
              <div className="card">
                <h3>Tối giản và Chuẩn SEO</h3>
                <p>Giao diện hiện đại, tốc độ tải trang tối ưu vượt trội, hỗ trợ đầy đủ sitemap, robots và thẻ SEO meta.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer-section">
        <div className="container flex align-center justify-between">
          <div>
            <p>&copy; {new Date().getFullYear()} Bloact. Mọi quyền được bảo lưu.</p>
          </div>
          <div className="flex gap-sm">
            <a href="mailto:contact@bloact.com" className="text-secondary">Liên hệ</a>
            <span className="text-secondary">|</span>
            <Link href="/" className="text-secondary">Chính sách bảo mật</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
