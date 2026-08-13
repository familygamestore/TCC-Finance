module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/apps-script/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const runtime = 'nodejs';
const dynamic = 'force-dynamic';
const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();
const MAX_PROXY_BODY_BYTES = 12 * 1024 * 1024;
function errorResponse(message, status) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: false,
        error: message
    }, {
        status,
        headers: {
            'Cache-Control': 'no-store'
        }
    });
}
async function proxy(request) {
    if (!SCRIPT_URL) return errorResponse('NEXT_PUBLIC_APPS_SCRIPT_URL belum dikonfigurasi di Vercel.', 500);
    let target;
    try {
        target = new URL(SCRIPT_URL);
        if (target.protocol !== 'https:' || target.hostname !== 'script.google.com') {
            throw new Error('URL Apps Script tidak valid.');
        }
    } catch  {
        return errorResponse('NEXT_PUBLIC_APPS_SCRIPT_URL harus berupa URL HTTPS Google Apps Script yang valid.', 500);
    }
    if (![
        'GET',
        'POST'
    ].includes(request.method)) return errorResponse('Method tidak diizinkan.', 405);
    if (request.method === 'GET') {
        request.nextUrl.searchParams.forEach((value, key)=>target.searchParams.set(key, value));
    }
    try {
        const init = {
            method: request.method,
            redirect: 'follow',
            cache: 'no-store'
        };
        if (request.method === 'POST') {
            const length = Number(request.headers.get('content-length') || 0);
            if (length > MAX_PROXY_BODY_BYTES) return errorResponse('Payload terlalu besar.', 413);
            init.headers = {
                'Content-Type': 'text/plain;charset=utf-8'
            };
            init.body = await request.text();
        }
        const response = await fetch(target.toString(), init);
        const text = await response.text();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](text, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('content-type') || 'application/json',
                'Cache-Control': 'no-store,no-cache,must-revalidate',
                'Pragma': 'no-cache'
            }
        });
    } catch (error) {
        return errorResponse(error instanceof Error ? error.message : 'Gagal menghubungi Apps Script.', 502);
    }
}
const GET = proxy;
const POST = proxy;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1usq8el._.js.map