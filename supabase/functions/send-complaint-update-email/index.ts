import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM = 'Shree Alankar <onboarding@resend.dev>';

const STATUS_LABEL: Record<string, string> = {
  raised: 'Raised',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { ticket_number, name, email, status, description } = await req.json();
    if (!email || !ticket_number) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#f5f5f5;padding:32px;border-radius:12px;">
        <h1 style="color:#d4af37;font-family:Georgia,serif;">Shree Alankar Jewellers</h1>
        <h2 style="color:#d4af37;">Complaint Update</h2>
        <p>Dear ${name || 'Customer'},</p>
        <p>Your complaint <b style="color:#d4af37;">${ticket_number}</b> has a new update.</p>
        <div style="background:#1a1a1a;padding:20px;border-radius:8px;border-left:4px solid #d4af37;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#999;">New Status</p>
          <p style="margin:8px 0 0;font-size:20px;color:#d4af37;font-weight:bold;">${STATUS_LABEL[status] || status}</p>
        </div>
        ${description ? `<p><b>Note from our team:</b><br/>${description.replace(/\n/g, '<br/>')}</p>` : ''}
        <p style="margin-top:24px;">Log in to your customer portal to view the full timeline.</p>
        <hr style="border-color:#333;margin:24px 0;"/>
        <p style="font-size:12px;color:#777;">Shree Alankar Jewellers • +91 9921612155</p>
      </div>`;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [email], subject: `Complaint ${ticket_number} — ${STATUS_LABEL[status] || status}`, html }),
    });

    return new Response(JSON.stringify({ success: r.ok }), {
      status: r.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
