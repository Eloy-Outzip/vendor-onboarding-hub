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
      // Find newest pending vendor for this email
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
        // Update the existing vendor with fresh data
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
        // Create vendor
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

      return new Response(
        JSON.stringify({ status: "success", repaired: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Case A: brand new email
    // Create vendor first
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

    // Create auth user
    const password = crypto.randomUUID().slice(0, 32) + "Aa1!";
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: { locale: locale || "de" },
    });

    if (authError) throw authError;

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, email: normalizedEmail, vendor_id: vendor.id });

    if (profileError) throw profileError;

    // Send confirmation email by generating a signup link
    // (admin-created users don't get auto-confirmation emails)
    await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: normalizedEmail,
      options: {
        redirectTo: `${req.headers.get("origin") || "https://outzip-signup.lovable.app"}/profile`,
      },
    });

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
