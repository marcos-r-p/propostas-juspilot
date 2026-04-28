import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/x-icon'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// POST: scrape logo from URL
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { url } = await request.json();
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JusPilot/1.0)' },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: 'Não foi possível acessar o site' }, { status: 422 });
    }

    const html = await res.text();
    const logoUrl = extractLogoUrl(html, url);

    if (!logoUrl) {
      return NextResponse.json({ error: 'Logo não encontrada no site. Tente o upload manual.' }, { status: 422 });
    }

    // Download the image
    const imgRes = await fetch(logoUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JusPilot/1.0)' },
    });
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'Não foi possível baixar a logo' }, { status: 422 });
    }

    const contentType = imgRes.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ error: 'Logo muito grande (máx 2MB)' }, { status: 422 });
    }

    const ext = contentType.includes('svg') ? 'svg' : contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const fileName = `${user.id}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('escritorio-logos')
      .upload(fileName, buffer, { contentType, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: 'Erro ao salvar logo' }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from('escritorio-logos')
      .getPublicUrl(fileName);

    return NextResponse.json({ logo_url: publicUrl.publicUrl });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ error: 'Timeout ao acessar o site' }, { status: 422 });
    }
    return NextResponse.json({ error: 'Erro ao buscar logo do site' }, { status: 500 });
  }
}

// PUT: manual upload
export async function PUT(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Arquivo deve ter no máximo 2MB' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${user.id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('escritorio-logos')
    .upload(fileName, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: 'Erro ao salvar arquivo' }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from('escritorio-logos')
    .getPublicUrl(fileName);

  return NextResponse.json({ logo_url: publicUrl.publicUrl });
}

function extractLogoUrl(html: string, baseUrl: string): string | null {
  const base = new URL(baseUrl);

  const resolveUrl = (href: string): string => {
    try {
      return new URL(href, base).href;
    } catch {
      return '';
    }
  };

  // 1. <link rel="icon" type="image/png"> or svg
  const iconLink = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["'][^>]*>/i);
  if (iconLink) {
    const resolved = resolveUrl(iconLink[1]);
    if (resolved && !resolved.endsWith('.ico')) return resolved;
  }

  // 2. <meta property="og:image">
  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImage) {
    const resolved = resolveUrl(ogImage[1]);
    if (resolved) return resolved;
  }

  // 3. First <img> inside <header> or <nav>
  const headerOrNav = html.match(/<(?:header|nav)[^>]*>([\s\S]*?)<\/(?:header|nav)>/i);
  if (headerOrNav) {
    const imgMatch = headerOrNav[1].match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      const resolved = resolveUrl(imgMatch[1]);
      if (resolved) return resolved;
    }
  }

  // 4. Favicon fallback (even .ico)
  if (iconLink) {
    const resolved = resolveUrl(iconLink[1]);
    if (resolved) return resolved;
  }

  return null;
}
