import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { voornaam, achternaam, email, dienst, bericht, _trap } = await request.json()

    // Honeypot anti-spam check
    if (_trap) return Response.json({ success: true }) // bots vullen dit in, stilletjes negeren

    if (!voornaam?.trim() || !email?.trim() || !bericht?.trim()) {
      return Response.json({ error: 'Vul alle verplichte velden in.' }, { status: 400 })
    }

    // Email validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Ongeldig e-mailadres.' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'GV Performance <noreply@gvperformance.nl>', // FIXED: eigen domein
      to: 'guidovperformance@gmail.com',
      replyTo: email.trim(),
      subject: `Nieuwe aanvraag — ${voornaam.trim()} ${achternaam?.trim() || ''}`.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A0A0A; padding: 24px; text-align: center;">
            <h1 style="color: #FF4D00; margin: 0; font-size: 22px; letter-spacing: 3px;">GV PERFORMANCE</h1>
            <p style="color: #888; margin: 8px 0 0; font-size: 12px; letter-spacing: 2px;">NIEUWE AANVRAAG VIA WEBSITE</p>
          </div>
          <div style="background: #f9f9f9; padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; width: 130px; font-weight: bold;">NAAM</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${voornaam.trim()} ${achternaam?.trim() || ''}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; font-weight: bold;">E-MAIL</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #FF4D00;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 12px; font-weight: bold;">DIENST</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">${dienst?.trim() || 'Niet opgegeven'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #888; font-size: 12px; font-weight: bold; vertical-align: top; padding-top: 16px;">BERICHT</td>
                <td style="padding: 12px 0; padding-top: 16px; line-height: 1.7;">${bericht.trim().replace(/\n/g, '<br/>')}</td>
              </tr>
            </table>
          </div>
          <div style="background: #0A0A0A; padding: 16px; text-align: center;">
            <p style="color: #555; margin: 0; font-size: 11px;">Via gvperformance.nl · Je kunt direct beantwoorden naar dit bericht</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ error: 'Er ging iets mis. Probeer opnieuw of mail direct naar guidovperformance@gmail.com' }, { status: 500 })
  }
}
