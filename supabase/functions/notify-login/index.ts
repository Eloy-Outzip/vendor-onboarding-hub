import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SITE_NAME = 'Outzip Rental Platform'
const SENDER_DOMAIN = 'notify.outzip.de'
const FROM_DOMAIN = 'outzip.de'
const NOTIFY_EMAIL = 'eloy@outzip.de'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Verify the caller is authenticated
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Verify the JWT to get user info
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userEmail = user.email || 'unknown'
  const now = new Date().toISOString()
  const messageId = crypto.randomUUID()

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Vendor Login Notification</h2>
      <p><strong>${userEmail}</strong> just logged in.</p>
      <p style="color: #666; font-size: 14px;">Time: ${now}</p>
    </div>
  `

  // Log and enqueue
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'login_notification',
    recipient_email: NOTIFY_EMAIL,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      run_id: messageId,
      message_id: messageId,
      to: NOTIFY_EMAIL,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: `Login: ${userEmail}`,
      html,
      text: `${userEmail} just logged in at ${now}`,
      purpose: 'transactional',
      label: 'login_notification',
      queued_at: now,
    },
  })

  if (enqueueError) {
    console.error('Failed to enqueue login notification', enqueueError)
    return new Response(JSON.stringify({ error: 'Failed to enqueue' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
