import { NextRequest, NextResponse } from 'next/server';

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();

async function proxy(request: NextRequest) {
  if (!SCRIPT_URL) {
    return NextResponse.json(
      { success: false, error: 'NEXT_PUBLIC_APPS_SCRIPT_URL belum dikonfigurasi.' },
      { status: 500 }
    );
  }

  const url = new URL(SCRIPT_URL);
  if (request.method === 'GET') {
    request.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }

  try {
    const init: RequestInit = { method: request.method, redirect: 'follow', cache: 'no-store' };
    if (request.method !== 'GET') {
      init.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
      init.body = await request.text();
    }

    const response = await fetch(url.toString(), init);
    const text = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': contentType }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Gagal menghubungi Apps Script.' },
      { status: 502 }
    );
  }
}

export const GET = proxy;
export const POST = proxy;
