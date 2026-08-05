import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return { needsSignIn: true as const, details: null };

    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return { needsSignIn: false as const, details: data };
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      โหลดคำขอเชื่อมต่อไม่สำเร็จ: {String((error as Error)?.message ?? error)}
    </main>
  ),
});

function Consent() {
  const loaderData = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const router = Route.useRouteContext ? undefined : undefined;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    window.location.reload();
  }

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("ไม่ได้รับ redirect จากเซิร์ฟเวอร์");
      return;
    }
    window.location.href = target;
  }

  if (loaderData.needsSignIn) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardContent className="space-y-4 p-6">
            <h1 className="text-xl font-semibold">เข้าสู่ระบบเพื่ออนุญาตการเชื่อมต่อ</h1>
            <p className="text-sm text-muted-foreground">
              ใช้บัญชีระบบแจ้งซ่อมของคุณ เพื่อให้แอปภายนอกทำงานแทนคุณได้
            </p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <form className="space-y-3" onSubmit={signIn}>
              <div>
                <Label>อีเมล</Label>
                <Input type="email" required className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>รหัสผ่าน</Label>
                <Input
                  type="password"
                  required
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                เข้าสู่ระบบ
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  const clientName = loaderData.details?.client?.name ?? "แอปภายนอก";

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-semibold">เชื่อมต่อ {clientName} กับบัญชีของคุณ</h1>
          <p className="text-sm text-muted-foreground">
            {clientName} จะสามารถดูและสร้างใบแจ้งซ่อมในระบบแทนคุณได้
          </p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
              อนุญาต
            </Button>
            <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
              ปฏิเสธ
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
