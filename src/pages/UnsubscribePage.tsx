import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";

type Status = "loading" | "valid" | "already_unsubscribed" | "invalid" | "success" | "error";

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const validate = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json();
        if (!res.ok) { setStatus("invalid"); return; }
        setStatus(data.valid === false ? "already_unsubscribed" : "valid");
      } catch { setStatus("error"); }
    };
    validate();
  }, [token]);

  const handleConfirm = async () => {
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      setStatus(error ? "error" : "success");
    } catch { setStatus("error"); }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        {status === "loading" && <p className="text-muted-foreground">Loading…</p>}
        {status === "valid" && (
          <>
            <h1 className="text-xl font-bold text-foreground">Unsubscribe</h1>
            <p className="text-muted-foreground">Click below to unsubscribe from future emails.</p>
            <Button onClick={handleConfirm}>Confirm Unsubscribe</Button>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-xl font-bold text-foreground">Unsubscribed ✓</h1>
            <p className="text-muted-foreground">You won't receive further emails from us.</p>
          </>
        )}
        {status === "already_unsubscribed" && (
          <>
            <h1 className="text-xl font-bold text-foreground">Already unsubscribed</h1>
            <p className="text-muted-foreground">This email address has already been unsubscribed.</p>
          </>
        )}
        {status === "invalid" && <p className="text-destructive">Invalid or expired unsubscribe link.</p>}
        {status === "error" && <p className="text-destructive">Something went wrong. Please try again.</p>}
      </div>
    </div>
  );
};

export default UnsubscribePage;
