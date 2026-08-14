import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();
const MAX_PROXY_BODY_BYTES = 12 * 1024 * 1024;

function errorResponse(message:string,status:number){
  return NextResponse.json({success:false,error:message},{status,headers:{'Cache-Control':'no-store'}});
}

async function proxy(request: NextRequest) {
  if (!SCRIPT_URL) return errorResponse('NEXT_PUBLIC_APPS_SCRIPT_URL belum dikonfigurasi di Vercel.',500);

  let target: URL;
  try {
    target = new URL(SCRIPT_URL);
    if (target.protocol !== 'https:' || target.hostname !== 'script.google.com') {
      throw new Error('URL Apps Script tidak valid.');
    }
  } catch {
    return errorResponse('NEXT_PUBLIC_APPS_SCRIPT_URL harus berupa URL HTTPS Google Apps Script yang valid.',500);
  }

  if (!['GET','POST'].includes(request.method)) return errorResponse('Method tidak diizinkan.',405);

  if (request.method === 'GET') {
    request.nextUrl.searchParams.forEach((value,key)=>target.searchParams.set(key,value));
  }

  try {
    const init:RequestInit={method:request.method,redirect:'follow',cache:'no-store'};
    if(request.method==='POST'){
      const length=Number(request.headers.get('content-length')||0);
      if(length>MAX_PROXY_BODY_BYTES) return errorResponse('Payload terlalu besar.',413);
      init.headers={'Content-Type':'text/plain;charset=utf-8'};
      init.body=await request.text();
    }

    const response=await fetch(target.toString(),init);
    const text=await response.text();

    return new NextResponse(text,{
      status:response.status,
      headers:{
        'Content-Type':response.headers.get('content-type')||'application/json',
        'Cache-Control':'no-store,no-cache,must-revalidate',
        'Pragma':'no-cache'
      }
    });
  } catch(error) {
    return errorResponse(error instanceof Error?error.message:'Gagal menghubungi Apps Script.',502);
  }
}

export const GET=proxy;
export const POST=proxy;
