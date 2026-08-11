import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();

async function proxy(request: NextRequest) {
  if (!SCRIPT_URL) {
    return NextResponse.json(
      { success: false, error: 'NEXT_PUBLIC_APPS_SCRIPT_URL belum dikonfigurasi di Vercel.' },
      { status: 500 }
    );
  }

  let target: URL;
  try {
    target = new URL(SCRIPT_URL);
    if (target.protocol !== 'https:') {
      throw new Error('NEXT_PUBLIC_APPS_SCRIPT_URL harus menggunakan HTTPS.');
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'NEXT_PUBLIC_APPS_SCRIPT_URL tidak valid.' },
      { status: 500 }
    );
  }

  if (request.method === 'GET') {
    request.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  }

  try {
    const init: RequestInit = {
      method: request.method,
      redirect: 'follow',
      cache: 'no-store'
    };

    if (request.method !== 'GET') {
      init.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
      init.body = await request.text();
    }

    const response = await fetch(target.toString(), init);
    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gagal menghubungi Apps Script.'
      },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
