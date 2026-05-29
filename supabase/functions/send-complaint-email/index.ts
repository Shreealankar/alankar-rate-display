import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const OWNER_EMAIL = 'kiranjadhav3231@gmail.com';
const FROM = 'Shree Alankar <onboarding@resend.dev>';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { ticket_number, name, phone, email, subject, message } = await req.json();

    if (!ticket_number || !name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const customerHtml = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#f5f5f5;padding:32px;border-radius:12px;">
        <h1 style="color:#d4af37;font-family:Georgia,serif;">Shree Alankar Jewellers</h1>
        <h2 style="color:#d4af37;">Complaint Received ✓</h2>
        <p>Dear ${name},</p>
        <p>Thank you for reaching out. Your complaint has been received and our team will respond shortly.</p>
        <div style="background:#1a1a1a;padding:20px;border-radius:8px;border-left:4px solid #d4af37;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#999;">Your Ticket Number</p>
          <p style="margin:8px 0 0;font-size:24px;color:#d4af37;font-weight:bold;letter-spacing:2px;">${ticket_number}</p>
        </div>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b><br/>${message.replace(/\n/g, '<br/>')}</p>
        <p style="margin-top:24px;">You can track your complaint status anytime by logging into your customer portal.</p>
        <hr style="border-color:#333;margin:24px 0;"/>
        <p style="font-size:12px;color:#777;">Shree Alankar Jewellers • +91 9921612155</p>
      </div>`;

    const ownerHtml = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:24px;">
        <h2 style="color:#b91c1c;">🔔 New Customer Complaint — ${ticket_number}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Name</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Phone</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Email</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><b>Subject</b></td><td style="padding:8px;border-bottom:1px solid #eee;">${subject}</td></tr>
          <tr><td style="padding:8px;vertical-align:top;"><b>Message</b></td><td style="padding:8px;">${message.replace(/\n/g, '<br/>')}</td></tr>
        </table>
        <p style="margin-top:20px;">Please log in to your owner dashboard to respond.</p>
      </div>`;

    const send = async (to: string, subj: string, html: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [to], subject: subj, html }),
      });

    const [r1, r2] = await Promise.all([
      send(email, `Complaint Received — Ticket ${ticket_number}`, customerHtml),
      send(OWNER_EMAIL, `New Complaint ${ticket_number} — ${subject}`, ownerHtml),
    ]);

    const ok = r1.ok && r2.ok;
    return new Response(JSON.stringify({ success: ok }), {
      status: ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
