import type { NextRequest } from 'next/server'

const ONE_DAY = 86400

interface ItunesResult {
  artistName?: string
  previewUrl?: string
  trackViewUrl?: string
}

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get('artist')
  const track  = request.nextUrl.searchParams.get('track')

  if (!artist || !track) {
    return Response.json({ error: 'Missing artist or track' }, { status: 400 })
  }

  const term = encodeURIComponent(`${artist} ${track}`)

  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=5&country=gb`, {
      next: { revalidate: ONE_DAY },
    } as RequestInit & { next?: { revalidate?: number } })

    if (!res.ok) {
      return Response.json({ error: `iTunes search failed: ${res.status}` }, { status: res.status })
    }

    const data = await res.json() as { results?: ItunesResult[] }
    const wanted = artist.toLowerCase()
    const match = data.results?.find(r => r.artistName?.toLowerCase().includes(wanted))

    const body = match?.previewUrl
      ? { previewUrl: match.previewUrl, trackViewUrl: match.trackViewUrl ?? null }
      : { previewUrl: null }

    return Response.json(body, {
      headers: { 'Cache-Control': `public, max-age=${ONE_DAY}` },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
