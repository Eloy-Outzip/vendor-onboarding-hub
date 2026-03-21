import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loading, hasProfile } = useAuth();
  const { t, locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && hasProfile) navigate("/profile", { replace: true });
  }, [hasProfile, loading, navigate]);

  const handleSendLink = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("join.errorEmail"));
      return;
    }
    setSending(true);
    setSent(false);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/profile`,
          data: { locale },
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      const msg = err.message?.toLowerCase().includes("signups not allowed")
        ? t("join.errorAccountNotFound")
        : err.message || t("join.errorMagic");
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <div className="mx-auto max-w-md w-full px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("login.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("login.subtitle")}</p>
        </div>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder={t("join.magicPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button className="w-full" disabled={sending} onClick={handleSendLink}>
            {sending ? t("join.sendingLink") : t("join.sendLink")}
          </Button>
          {sent && (
            <p className="text-sm text-primary text-center">{t("join.magicSent")}</p>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link to="/join" className="text-primary font-medium hover:underline">
              {t("login.joinLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
