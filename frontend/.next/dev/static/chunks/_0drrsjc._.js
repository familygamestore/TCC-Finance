(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "clearSuperAdminSession",
    ()=>clearSuperAdminSession,
    "getAuthRole",
    ()=>getAuthRole,
    "getAuthToken",
    ()=>getAuthToken,
    "getAuthUserId",
    ()=>getAuthUserId,
    "getAuthUserName",
    ()=>getAuthUserName,
    "getRequestAccessToken",
    ()=>getRequestAccessToken,
    "getSuperAdminEmail",
    ()=>getSuperAdminEmail,
    "getSuperAdminToken",
    ()=>getSuperAdminToken,
    "saveAuthSession",
    ()=>saveAuthSession,
    "saveRequestAccessToken",
    ()=>saveRequestAccessToken,
    "saveSuperAdminSession",
    ()=>saveSuperAdminSession
]);
const BASE_URL = '/api/apps-script';
const TOKEN_KEY = 'tcc_super_admin_token';
const EMAIL_KEY = 'tcc_super_admin_email';
const REQUEST_ACCESS_KEY = 'tcc_request_access_token';
const ROLE_KEY = 'tcc_auth_role';
const USER_ID_KEY = 'tcc_auth_user_id';
const USER_NAME_KEY = 'tcc_auth_user_name';
function getSuperAdminToken() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : localStorage.getItem(TOKEN_KEY) || '';
}
function getSuperAdminEmail() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : localStorage.getItem(EMAIL_KEY) || '';
}
function saveAuthSession(token, email, role, userId, userName) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem(ROLE_KEY, role);
    if (userId) localStorage.setItem(USER_ID_KEY, userId);
    if (userName) localStorage.setItem(USER_NAME_KEY, userName);
    if ("TURBOPACK compile-time truthy", 1) window.dispatchEvent(new Event('tcc-auth-changed'));
}
function saveSuperAdminSession(token, email) {
    saveAuthSession(token, email, 'SUPER_ADMIN', email, email);
}
function clearSuperAdminSession() {
    [
        TOKEN_KEY,
        EMAIL_KEY,
        ROLE_KEY,
        USER_ID_KEY,
        USER_NAME_KEY
    ].forEach((k)=>localStorage.removeItem(k));
    if ("TURBOPACK compile-time truthy", 1) window.dispatchEvent(new Event('tcc-auth-changed'));
}
function getAuthRole() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : localStorage.getItem(ROLE_KEY) || '';
}
function getAuthUserId() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : localStorage.getItem(USER_ID_KEY) || '';
}
function getAuthUserName() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : localStorage.getItem(USER_NAME_KEY) || '';
}
function getAuthToken() {
    return getSuperAdminToken();
}
function getRequestAccessToken() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : localStorage.getItem(REQUEST_ACCESS_KEY) || '';
}
function saveRequestAccessToken(token) {
    localStorage.setItem(REQUEST_ACCESS_KEY, token);
}
async function parseResponse(res) {
    const text = await res.text();
    let json;
    try {
        json = JSON.parse(text);
    } catch  {
        throw new Error(`Server mengembalikan respons tidak valid (${res.status}).`);
    }
    if (!res.ok) throw new Error(json.error || `Request gagal (${res.status})`);
    return json;
}
async function apiGet(action, params = {}, auth = false) {
    const all = {
        action,
        ...params
    };
    if (auth) all.token = getSuperAdminToken();
    const res = await fetch(`${BASE_URL}?${new URLSearchParams(all).toString()}`, {
        cache: 'no-store'
    });
    const json = await parseResponse(res);
    if (!json.success) throw new Error(json.error || 'Request gagal');
    return json.data;
}
async function apiSend(action, body = {}, method = 'POST', auth = false) {
    const payload = {
        action,
        method,
        ...body
    };
    if (auth) payload.token = getSuperAdminToken();
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
    });
    const json = await parseResponse(res);
    if (!json.success) throw new Error(json.error || 'Request gagal');
    return json.data;
}
const api = {
    login: (email, password)=>apiSend('login', {
            email,
            password
        }),
    logout: ()=>apiSend('logout', {
            token: getSuperAdminToken()
        }),
    getConfig: ()=>apiGet('config', {}, true),
    session: ()=>apiGet('session', {}, true),
    setConfig: (whatsapp_number)=>apiSend('config', {
            whatsapp_number
        }, 'PUT', true),
    changePassword: (current_password, new_password)=>apiSend('auth_password', {
            current_password,
            new_password
        }, 'PUT', true),
    getDashboard: ()=>apiGet('dashboard', {}, true),
    getTransactions: (params = {})=>apiGet('transactions', params, true),
    getEvents: (params = {})=>apiGet('events', params, true),
    getEventDetail: (id)=>apiGet('event_detail', {
            event_id: id
        }, true),
    getCategories: ()=>apiGet('categories'),
    getPaymentMethods: ()=>apiGet('payment_methods'),
    createIncome: (data)=>apiSend('income', data, 'POST', true),
    createExpense: (data)=>apiSend('expense', data, 'POST', true),
    createEvent: (data)=>apiSend('event', data, 'POST', true),
    updateTransaction: (sheet, id, fields)=>apiSend('transaction', {
            sheet,
            id,
            fields
        }, 'PUT', true),
    deleteTransaction: (sheet, id)=>apiSend('transaction', {
            sheet,
            id
        }, 'DELETE', true),
    updateEvent: (id, fields)=>apiSend('event', {
            id,
            fields
        }, 'PUT', true),
    deleteEvent: (id)=>apiSend('event', {
            id
        }, 'DELETE', true),
    getBrands: ()=>apiGet('brands', {}, true),
    getCash: ()=>apiGet('cash', {}, true),
    getRequests: (params = {}, auth = false)=>apiGet('requests', params, auth),
    getRequestStatus: (id)=>apiGet('request_status', {
            request_id: id,
            request_access_token: getRequestAccessToken()
        }),
    getUsers: ()=>apiGet('users', {}, true),
    createAdmin: (data)=>apiSend('auth_user', data, 'POST', true),
    createRequest: (data)=>apiSend('request', data, 'POST', !!getAuthToken()),
    approveRequest: (id, status, reason = '')=>apiSend('request', {
            id,
            status,
            reason
        }, 'PUT', true),
    createBrand: (data)=>apiSend('brand', data, 'POST', true),
    updateBrand: (id, fields)=>apiSend('brand', {
            id,
            fields
        }, 'PUT', true),
    deleteBrand: (id)=>apiSend('brand', {
            id
        }, 'DELETE', true),
    setupCash: (data)=>apiSend('cash_setup', data, 'POST', true),
    adjustCash: (data)=>apiSend('cash_adjustment', data, 'POST', true)
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/common/Navigation.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Navigation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const superItems = [
    {
        href: '/',
        label: 'Dashboard',
        icon: '⌂'
    },
    {
        href: '/requests',
        label: 'Pengajuan',
        icon: '✓'
    },
    {
        href: '/transactions',
        label: 'Transaksi',
        icon: '↕'
    },
    {
        href: '/events',
        label: 'Event Hub',
        icon: '◆'
    },
    {
        href: '/cash',
        label: 'Kas & Rekonsiliasi',
        icon: 'Rp'
    }
];
const adminItems = [
    {
        href: '/requests',
        label: 'Pengajuan Saya',
        icon: '✓'
    },
    {
        href: '/events',
        label: 'Event',
        icon: '◆'
    }
];
function Navigation() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [role, setRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [userName, setUserName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const sync = ()=>{
        setRole((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthRole"])());
        setUserName((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuthUserName"])());
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navigation.useEffect": ()=>{
            sync();
            window.addEventListener('tcc-auth-changed', sync);
            window.addEventListener('storage', sync);
            return ({
                "Navigation.useEffect": ()=>{
                    window.removeEventListener('tcc-auth-changed', sync);
                    window.removeEventListener('storage', sync);
                }
            })["Navigation.useEffect"];
        }
    }["Navigation.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Navigation.useEffect": ()=>setOpen(false)
    }["Navigation.useEffect"], [
        pathname
    ]);
    const items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Navigation.useMemo[items]": ()=>role === 'SUPER_ADMIN' ? superItems : role === 'ADMIN' ? adminItems : []
    }["Navigation.useMemo[items]"], [
        role
    ]);
    const initials = (userName || (role === 'SUPER_ADMIN' ? 'SA' : role === 'ADMIN' ? 'AD' : 'TC')).split(/\s+/).map((x)=>x[0]).join('').slice(0, 2).toUpperCase();
    async function logout() {
        try {
            if (role) await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["api"].logout();
        } catch  {}
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearSuperAdminSession"])();
        window.dispatchEvent(new Event('tcc-auth-changed'));
        router.push('/admin');
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "nav-system",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "mobile-menu-button",
                type: "button",
                "aria-label": "Buka menu",
                "aria-expanded": open,
                onClick: ()=>setOpen((v)=>!v),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/components/common/Navigation.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/components/common/Navigation.tsx",
                        lineNumber: 61,
                        columnNumber: 18
                    }, this),
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                        fileName: "[project]/components/common/Navigation.tsx",
                        lineNumber: 61,
                        columnNumber: 27
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/common/Navigation.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: `nav ${open ? 'open' : ''}`,
                "aria-label": "Navigasi utama",
                children: [
                    role === 'SUPER_ADMIN' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "nav-label",
                        children: "Workspace"
                    }, void 0, false, {
                        fileName: "[project]/components/common/Navigation.tsx",
                        lineNumber: 64,
                        columnNumber: 36
                    }, this),
                    items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: item.href,
                            className: pathname === item.href ? 'active' : '',
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "nav-icon",
                                    "aria-hidden": "true",
                                    children: item.icon
                                }, void 0, false, {
                                    fileName: "[project]/components/common/Navigation.tsx",
                                    lineNumber: 67,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: item.label
                                }, void 0, false, {
                                    fileName: "[project]/components/common/Navigation.tsx",
                                    lineNumber: 68,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, item.href, true, {
                            fileName: "[project]/components/common/Navigation.tsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)),
                    role === 'SUPER_ADMIN' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/super-admin",
                        className: pathname === '/super-admin' ? 'active' : '',
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "nav-icon",
                                children: "⚙"
                            }, void 0, false, {
                                fileName: "[project]/components/common/Navigation.tsx",
                                lineNumber: 71,
                                columnNumber: 118
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Super Admin"
                            }, void 0, false, {
                                fileName: "[project]/components/common/Navigation.tsx",
                                lineNumber: 71,
                                columnNumber: 153
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/common/Navigation.tsx",
                        lineNumber: 71,
                        columnNumber: 36
                    }, this),
                    !role && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/admin",
                                className: pathname === '/admin' ? 'active' : '',
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "nav-icon",
                                        children: "↪"
                                    }, void 0, false, {
                                        fileName: "[project]/components/common/Navigation.tsx",
                                        lineNumber: 73,
                                        columnNumber: 81
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Admin"
                                    }, void 0, false, {
                                        fileName: "[project]/components/common/Navigation.tsx",
                                        lineNumber: 73,
                                        columnNumber: 116
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/common/Navigation.tsx",
                                lineNumber: 73,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/super-admin",
                                className: pathname === '/super-admin' ? 'active' : '',
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "nav-icon",
                                        children: "♙"
                                    }, void 0, false, {
                                        fileName: "[project]/components/common/Navigation.tsx",
                                        lineNumber: 74,
                                        columnNumber: 93
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Super Admin"
                                    }, void 0, false, {
                                        fileName: "[project]/components/common/Navigation.tsx",
                                        lineNumber: 74,
                                        columnNumber: 128
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/common/Navigation.tsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/components/common/Navigation.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "nav-account",
                children: role ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "account-avatar",
                            children: initials
                        }, void 0, false, {
                            fileName: "[project]/components/common/Navigation.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "account-copy",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: userName || role.replace('_', ' ')
                                }, void 0, false, {
                                    fileName: "[project]/components/common/Navigation.tsx",
                                    lineNumber: 80,
                                    columnNumber: 41
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'
                                }, void 0, false, {
                                    fileName: "[project]/components/common/Navigation.tsx",
                                    lineNumber: 80,
                                    columnNumber: 94
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/common/Navigation.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "account-logout",
                            type: "button",
                            onClick: ()=>void logout(),
                            title: "Keluar",
                            children: "↪"
                        }, void 0, false, {
                            fileName: "[project]/components/common/Navigation.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "account-guest",
                    children: "Local workspace"
                }, void 0, false, {
                    fileName: "[project]/components/common/Navigation.tsx",
                    lineNumber: 82,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/common/Navigation.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/common/Navigation.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(Navigation, "CtpI+cCE0XYWN0OLJz8aJ5cn9ac=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = Navigation;
var _c;
__turbopack_context__.k.register(_c, "Navigation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0drrsjc._.js.map