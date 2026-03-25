import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shopName, city, website, email, categories, locale } = await req.json();

    const generateSlug = async (name: string, supabase: any): Promise<string> => {
      const base = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      let slug = base;
      let counter = 1;
      while (true) {
        const { data } = await supabase.from("vendors").select("id").eq("slug", slug).maybeSingle();
        if (!data) break;
        counter++;
        slug = `${base}-${counter}`;
      }
      return slug;
    };

    // Validate required fields
    if (!shopName?.trim() || !city?.trim() || !email?.trim()) {
      return new Response(
        JSON.stringify({ status: "validation_error", message: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ status: "validation_error", message: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const origin = req.headers.get("origin") || "https://outzip-signup.lovable.app";

    // Use service_role to manage auth users and bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check if auth user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      // Check if profile already exists
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, vendor_id")
        .eq("id", existingUser.id)
        .maybeSingle();

      if (profile?.vendor_id) {
        // Case B: fully linked account already exists
        return new Response(
          JSON.stringify({ status: "account_exists" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Case C: auth user exists but profile missing — repair
      const { data: existingVendor } = await supabaseAdmin
        .from("vendors")
        .select("id")
        .eq("email", normalizedEmail)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let vendorId: string;

      if (existingVendor) {
        await supabaseAdmin
          .from("vendors")
          .update({
            first_name: shopName,
            name: shopName,
            website: website || null,
            city: city || null,
            categories: categories?.length > 0 ? categories : null,
          })
          .eq("id", existingVendor.id);
        vendorId = existingVendor.id;
      } else {
        const { data: newVendor, error: vendorErr } = await supabaseAdmin
          .from("vendors")
          .insert({
            first_name: shopName,
            name: shopName,
            email: normalizedEmail,
            website: website || null,
            city: city || null,
            categories: categories?.length > 0 ? categories : null,
            status: "pending",
          })
          .select("id")
          .single();
        if (vendorErr) throw vendorErr;
        vendorId = newVendor.id;
      }

      // Create or update profile
      if (profile) {
        await supabaseAdmin
          .from("profiles")
          .update({ vendor_id: vendorId, email: normalizedEmail })
          .eq("id", existingUser.id);
      } else {
        await supabaseAdmin
          .from("profiles")
          .insert({ id: existingUser.id, email: normalizedEmail, vendor_id: vendorId });
      }

      // Re-send invite so the repaired user gets a login link
      await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
        data: { locale: locale || "de" },
        redirectTo: `${origin}/login`,
      });

      return new Response(
        JSON.stringify({ status: "success", repaired: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Case A: brand new email — use inviteUserByEmail which triggers auth-email-hook
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        data: { locale: locale || "de" },
        redirectTo: `${origin}/login`,
      }
    );

    if (authError) throw authError;

    const userId = authData.user.id;

    // Create vendor
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .insert({
        first_name: shopName,
        name: shopName,
        email: normalizedEmail,
        website: website || null,
        city: city || null,
        categories: categories?.length > 0 ? categories : null,
        status: "pending",
      })
      .select("id")
      .single();

    if (vendorError) throw vendorError;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, email: normalizedEmail, vendor_id: vendor.id });

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({ status: "success" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("register-vendor error:", err);
    return new Response(
      JSON.stringify({ status: "error", message: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
