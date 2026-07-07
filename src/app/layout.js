import "./globals.css";

export const metadata = {
  title: "Bloact — Nền tảng blog cá nhân tối giản",
  description: "Viết và chia sẻ bài viết của bạn với tên miền phụ cá nhân miễn phí.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
