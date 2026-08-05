module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[project]/src/contexts/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "DEMO_USERS",
    ()=>DEMO_USERS,
    "getDepartmentFromRole",
    ()=>getDepartmentFromRole,
    "getRoleLabel",
    ()=>getRoleLabel,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/integrations/supabase/client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function getDepartmentFromRole(role) {
    if (role === "technician_electric") return "electric";
    if (role === "technician_plumbing") return "plumbing";
    if (role === "technician_general") return "general";
    return null;
}
function getRoleLabel(role) {
    switch(role){
        case "technician_electric":
            return "ช่างแผนกไฟฟ้า ⚡";
        case "technician_plumbing":
            return "ช่างแผนกประปา 💧";
        case "technician_general":
            return "ช่างแผนกซ่อมสร้าง 🔨";
        case "admin":
            return "ผู้ดูแลระบบ 🛡️";
        case "user":
        default:
            return "ผู้ใช้งานทั่วไป 👤";
    }
}
const DEMO_USERS = {
    user: {
        email: "user@demo.ac.th",
        pass: "demo1234",
        name: "สมชาย ใจดี (นักศึกษา)",
        phone: "081-234-5678",
        code: "65010001"
    },
    technician_electric: {
        email: "electric@demo.ac.th",
        pass: "demo1234",
        name: "ช่างสมศักดิ์ ไฟฟ้าแรงสูง",
        phone: "089-111-2233",
        code: "EMP-E01"
    },
    technician_plumbing: {
        email: "plumbing@demo.ac.th",
        pass: "demo1234",
        name: "ช่างสุรชัย ท่อน้ำดี",
        phone: "089-222-3344",
        code: "EMP-P01"
    },
    technician_general: {
        email: "general@demo.ac.th",
        pass: "demo1234",
        name: "ช่างวิชัย ซ่อมสร้างแกร่ง",
        phone: "089-333-4455",
        code: "EMP-G01"
    },
    admin: {
        email: "admin@demo.ac.th",
        pass: "demo1234",
        name: "ดร.วิชาการ บริหารระบบ (Admin)",
        phone: "080-999-8877",
        code: "ADM-001"
    }
};
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [roles, setRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentRole, setCurrentRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("user");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const fetchUserData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (userId, userEmail)=>{
        try {
            // 1. Fetch profile
            const { data: profileData, error: profileErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("profiles").select("id, full_name, phone, email, person_code").eq("id", userId).maybeSingle();
            if (profileData) {
                setProfile(profileData);
            } else if (!profileErr) {
                // Create initial fallback profile object if none
                setProfile({
                    id: userId,
                    email: userEmail || "",
                    full_name: "",
                    phone: "",
                    person_code: ""
                });
            }
            // 2. Fetch roles
            const { data: roleRows, error: roleErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("user_roles").select("role").eq("user_id", userId);
            if (roleRows && roleRows.length > 0) {
                const fetchedRoles = roleRows.map((r)=>r.role);
                setRoles(fetchedRoles);
                // Default current role: prioritize technician or admin if available
                const preferred = fetchedRoles.find((r)=>r !== "user") || fetchedRoles[0];
                setCurrentRole(preferred);
            } else {
                setRoles([
                    "user"
                ]);
                setCurrentRole("user");
            }
        } catch (err) {
            console.error("[Auth] Error fetching user data:", err);
        }
    }, []);
    const refreshProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (user?.id) {
            await fetchUserData(user.id, user.email);
        }
    }, [
        user,
        fetchUserData
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let mounted = true;
        async function initAuth() {
            try {
                const { data: { session: initSession } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                if (!mounted) return;
                if (initSession?.user) {
                    setSession(initSession);
                    setUser(initSession.user);
                    await fetchUserData(initSession.user.id, initSession.user.email);
                } else {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setRoles([]);
                    setCurrentRole("user");
                }
            } catch (err) {
                console.error("[Auth] Init session error:", err);
            } finally{
                if (mounted) setLoading(false);
            }
        }
        initAuth();
        const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange(async (event, newSession)=>{
            if (!mounted) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (newSession?.user) {
                await fetchUserData(newSession.user.id, newSession.user.email);
            } else {
                setProfile(null);
                setRoles([]);
                setCurrentRole("user");
            }
            setLoading(false);
        });
        return ()=>{
            mounted = false;
            subscription.unsubscribe();
        };
    }, [
        fetchUserData
    ]);
    const signIn = async (email, pass)=>{
        try {
            const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signInWithPassword({
                email: email.trim(),
                password: pass
            });
            if (error) return {
                error
            };
            if (data.user) {
                setUser(data.user);
                setSession(data.session);
                await fetchUserData(data.user.id, data.user.email);
            }
            return {
                error: null
            };
        } catch (err) {
            return {
                error: err
            };
        }
    };
    const signUp = async (data)=>{
        try {
            const roleToAssign = data.role || "user";
            const { data: authData, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signUp({
                email: data.email.trim(),
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name.trim(),
                        phone: data.phone.trim(),
                        person_code: data.person_code.trim()
                    }
                }
            });
            if (error) return {
                error
            };
            if (authData.user) {
                const userId = authData.user.id;
                // Upsert profile in case trigger had not populated it
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("profiles").upsert({
                    id: userId,
                    full_name: data.full_name.trim(),
                    phone: data.phone.trim(),
                    email: data.email.trim(),
                    person_code: data.person_code.trim()
                });
                // Insert selected role if different from default 'user'
                if (roleToAssign !== "user") {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("user_roles").upsert({
                        user_id: userId,
                        role: roleToAssign
                    });
                }
                await fetchUserData(userId, data.email);
            }
            return {
                error: null
            };
        } catch (err) {
            return {
                error: err
            };
        }
    };
    const signOut = async ()=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
        setRoles([]);
        setCurrentRole("user");
    };
    const switchRole = (role)=>{
        setCurrentRole(role);
    };
    const updateProfile = async (data)=>{
        if (!user) return {
            error: new Error("ไม่ได้เข้าสู่ระบบ")
        };
        try {
            const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$integrations$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from("profiles").update({
                full_name: data.full_name.trim(),
                phone: data.phone.trim(),
                person_code: data.person_code.trim()
            }).eq("id", user.id);
            if (error) return {
                error
            };
            setProfile((prev)=>prev ? {
                    ...prev,
                    full_name: data.full_name.trim(),
                    phone: data.phone.trim(),
                    person_code: data.person_code.trim()
                } : null);
            return {
                error: null
            };
        } catch (err) {
            return {
                error: err
            };
        }
    };
    const quickDemoLogin = async (role)=>{
        const demo = DEMO_USERS[role];
        if (!demo) return {
            error: new Error("ไม่พบบัญชีทดสอบ")
        };
        // Try sign in first
        let res = await signIn(demo.email, demo.pass);
        if (res.error) {
            // If user does not exist yet, auto sign up the demo account
            const signupRes = await signUp({
                email: demo.email,
                password: demo.pass,
                full_name: demo.name,
                phone: demo.phone,
                person_code: demo.code,
                role
            });
            if (signupRes.error) {
                return {
                    error: signupRes.error
                };
            }
            res = await signIn(demo.email, demo.pass);
        }
        if (!res.error) {
            setCurrentRole(role);
        }
        return res;
    };
    const department = getDepartmentFromRole(currentRole);
    const isTechnician = currentRole.startsWith("technician_");
    const isAdmin = currentRole === "admin";
    const isUser = currentRole === "user";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            session,
            profile,
            roles,
            currentRole,
            department,
            loading,
            isTechnician,
            isAdmin,
            isUser,
            signIn,
            signUp,
            signOut,
            switchRole,
            updateProfile,
            quickDemoLogin,
            refreshProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 366,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
}),
"[project]/src/integrations/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
function isNewSupabaseApiKey(value) {
    return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}
function createSupabaseFetch(supabaseKey) {
    return (input, init)=>{
        const headers = new Headers(typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined);
        if (init?.headers) {
            new Headers(init.headers).forEach((value, key)=>headers.set(key, value));
        }
        if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
            headers.delete('Authorization');
        }
        headers.set('apikey', supabaseKey);
        return fetch(input, {
            ...init,
            headers
        });
    };
}
function createSupabaseClient() {
    const SUPABASE_URL = ("TURBOPACK compile-time value", "https://ytvawdbegplqmmngvdqz.supabase.co") || process.env.SUPABASE_URL || '';
    const SUPABASE_PUBLISHABLE_KEY = ("TURBOPACK compile-time value", "sb_publishable_q6oovJ8-M_Htms-wTJFT1g_20UcVKgq") || ("TURBOPACK compile-time value", "sb_publishable_q6oovJ8-M_Htms-wTJFT1g_20UcVKgq") || process.env.SUPABASE_PUBLISHABLE_KEY || '';
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: {
            fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY)
        },
        auth: {
            storage: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined,
            persistSession: true,
            autoRefreshToken: true
        }
    });
}
let _supabase;
const supabase = new Proxy({}, {
    get (_, prop, receiver) {
        if (!_supabase) _supabase = createSupabaseClient();
        return Reflect.get(_supabase, prop, receiver);
    }
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1_4j75p._.js.map