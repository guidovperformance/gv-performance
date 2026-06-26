import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { welcomeEmail } from '@/lib/emails/nurture'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { name, email, source, _trap } = await request.json()

    // Honeypot anti-spam check
    if (_trap) return Response.json({ success: true })

    if (!name?.trim() || !email?.trim()) {
      return Response.json({ error: 'Vul je naam en e-mailadres in.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gvperformance.nl'

    const { error: dbError } = await supabaseAdmin
      .from('leads')
      .upsert({ name: name.trim(), email: cleanEmail, source: source || null }, { onConflict: 'email', ignoreDuplicates: true })

    if (dbError) {
      console.error('Lead insert error:', dbError)
      return Response.json({ error: 'Er ging iets mis bij het opslaan. Probeer opnieuw.' }, { status: 500 })
    }

    const { subject, html } = welcomeEmail({ name: name.trim(), siteUrl })
    await resend.emails.send({
      from: 'GV Performance <noreply@gvperformance.nl>',
      to: cleanEmail,
      replyTo: 'guidovperformance@gmail.com',
      subject,
      html,
    })

    return Response.json({ success: true, pdfUrl: `${siteUrl}/GV-Performance-Pre-Selectie-Krachttest.pdf` })
  } catch (error) {
    console.error('Lead signup error:', error)
    return Response.json({ error: 'Er ging iets mis. Probeer opnieuw of mail direct naar guidovperformance@gmail.com' }, { status: 500 })
  }
}
