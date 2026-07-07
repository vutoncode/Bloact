import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '../../../../lib/supabase/server'

export async function POST(request) {
  const { postId } = await request.json()
  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const cookieName = `viewed_${postId}`
  
  if (cookieStore.get(cookieName)) {
    return NextResponse.json({ success: true, status: 'already_viewed' })
  }

  const userAgent = request.headers.get('user-agent') || ''
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent)

  if (isBot) {
    return NextResponse.json({ success: true, status: 'bot_ignored' })
  }

  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('view_count')
    .eq('id', postId)
    .single()

  if (post) {
    await supabase
      .from('posts')
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq('id', postId)

    cookieStore.set(cookieName, 'true', { maxAge: 60 * 60 * 24 })
  }

  return NextResponse.json({ success: true })
}
