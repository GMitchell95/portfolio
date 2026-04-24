import type { NextRequest } from 'next/server'

// Module-level token cache — survives across requests in a single server process
let tokenCache: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.value
  }

  const clientId     = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not set')
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Spotify auth failed: ${res.status}`)
  }

  const data = await res.json()
  tokenCache = {
    value:     data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // 60s safety buffer
  }
  return tokenCache.value
}

export async function GET(request: NextRequest) {
  const trackId = request.nextUrl.searchParams.get('trackId')

  if (!trackId) {
    return Response.json({ error: 'Missing trackId' }, { status: 400 })
  }

  try {
    const token = await getAccessToken()

    const res = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    } as RequestInit & { next?: { revalidate?: number } })

    if (!res.ok) {
      return Response.json({ error: `Track fetch failed: ${res.status}` }, { status: res.status })
    }

    const track = await res.json()
    console.log(`[spotify-preview] trackId=${trackId}`, {
      name: track.name,
      artists: track.artists?.map((a: { name: string }) => a.name),
      preview_url: track.preview_url,
    })
    return Response.json(
      { previewUrl: track.preview_url ?? null },
      { headers: { 'Cache-Control': 'public, max-age=3600' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
