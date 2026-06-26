import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { inviteEmail } from '@/lib/emails/nurture'

const resend = new Resend(process.env.RESEND_API_KEY)
const INVITE_DELAY_DAYS = 2

// Dagelijkse cron (zie vercel.json): verstuurt mail 2 (uitnodiging gratis
// kennismaking) aan leads die INVITE_DELAY_DAYS geleden zijn aangemeld en
// die mail nog niet hebben gehad.
export async function GET(request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - INVITE_DELAY_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('id, name, email')
    .is('invite_sent_at', null)
    .lte('created_at', cutoff)

  if (error) {
    console.error('Nurture cron query error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  for (const lead of leads || []) {
    try {
      const { subject, html } = inviteEmail({ name: lead.name })
      await resend.emails.send({
        from: 'GV Performance <noreply@gvperformance.nl>',
        to: lead.email,
        replyTo: 'guidovperformance@gmail.com',
        subject,
        html,
      })
      await supabaseAdmin.from('leads').update({ invite_sent_at: new Date().toISOString() }).eq('id', lead.id)
      sent++
    } catch (e) {
      console.error('Nurture cron send error for', lead.email, e)
    }
  }

  return Response.json({ success: true, checked: leads?.length || 0, sent })
}
