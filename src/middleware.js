import { NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request) {
  const { supabase, response, user } = await updateSession(request)
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const host = request.headers.get('host') || ''
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000'

  let subdomain = null
  if (host) {
    const hostClean = host.split(':')[0]
    const mainDomainClean = mainDomain.split(':')[0]

    if (hostClean !== mainDomainClean && hostClean !== `www.${mainDomainClean}`) {
      if (hostClean.endsWith('.vercel.app')) {
        const parts = hostClean.split('.')
        if (parts.length > 3) {
          subdomain = parts[0]
        }
      } else if (hostClean.endsWith(`.${mainDomainClean}`)) {
        subdomain = hostClean.slice(0, -(mainDomainClean.length + 1))
      } else {
        const parts = hostClean.split('.')
        if (parts.length > 2) {
          subdomain = parts[0]
        }
      }
    }
  }

  if (subdomain && subdomain !== 'www') {
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
      return response
    }
    url.pathname = `/_sites/${subdomain}${pathname}`
    return NextResponse.rewrite(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, role, banned_at')
      .eq('id', user.id)
      .single()

    if (profile && profile.banned_at) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=banned', request.url))
    }

    if (pathname.startsWith('/dashboard')) {
      if (!profile || !profile.username) {
        if (pathname !== '/onboarding') {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }
    }

    if (pathname.startsWith('/admin')) {
      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (pathname === '/onboarding') {
      if (profile && profile.username) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|assets|favicon.ico|.*\\..*$).*)',
  ],
}
