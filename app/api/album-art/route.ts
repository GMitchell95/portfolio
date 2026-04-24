import type { NextRequest } from 'next/server'

const ALLOWED_HOST = 'i.scdn.co'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return new Response('Missing url param', { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new Response('Invalid url', { status: 400 })
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new Response('URL not allowed', { status: 403 })
  }

  const upstream = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'force-cache',
    next: { revalidate: 604800 },
  } as RequestInit & { next?: { revalidate?: number } })

  if (!upstream.ok) {
    return new Response('Upstream fetch failed', { status: upstream.status })
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
  const buffer = await upstream.arrayBuffer()

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
    },
  })
}
