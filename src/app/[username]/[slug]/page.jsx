import { notFound } from 'next/navigation'
import { createClient } from '../../../lib/supabase/server'
import HienThiNoiDung from '../../../components/HienThiNoiDung'
import BoDemLuotXem from '../../../components/BoDemLuotXem'

export async function generateMetadata({ params }) {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) return {}

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return {}

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'
  const canonicalUrl = `http://${mainDomain}/${username}/${slug}`

  return {
    title: `${post.seo_title || post.title} | ${username}`,
    description: post.seo_description || post.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      url: canonicalUrl,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
      type: 'article',
      publishedTime: post.published_at || post.created_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    }
  }
}

export default async function TrangChiTietBaiViet({ params }) {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) {
    notFound()
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <BoDemLuotXem postId={post.id} />
      
      <article>
        {post.cover_image_url && (
          <img 
            src={post.cover_image_url} 
            alt={post.title} 
            style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}
          />
        )}
        
        <h1 style={{ fontSize: '3rem', marginBottom: '16px', letterSpacing: '-0.02em' }}>{post.title}</h1>
        
        <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '40px' }}>
          Đăng ngày {new Date(post.published_at || post.created_at).toLocaleDateString('vi-VN')} &bull; {post.view_count || 0} lượt xem
        </div>
        
        <HienThiNoiDung json={post.content} />
      </article>
    </div>
  )
}
