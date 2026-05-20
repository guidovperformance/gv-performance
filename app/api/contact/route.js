import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { voornaam, achternaam, email, dienst, bericht } = await request.json()

    if (!voornaam || !email || !bericht) {
      return Response.json({ error: 'Vul alle verplichte velden in.' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'guidovperformance@gmail.com',
      subject: `Nieuwe aanvraag via GV Performance — ${voornaam} ${achternaam}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A0A0A; padding: 24px; text-align: center;">
            <h1 style="color: #FF4D00; margin: 0; font-size: 24px; letter-spacing: 3px;">GV PERFORMANCE</h1>
            <p style="color: #888; margin: 8px 0 0; font-size: 13px; letter-spacing: 2px;">NIEUWE AANVRAAG</p>
          </div>
          <div style="background: #f9f9f9; padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px; width: 140px;">NAAM</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: bold;">${voornaam} ${achternaam}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">E-MAIL</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #FF4D00;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #888; font-size: 13px;">DIENST</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${dienst || 'Niet opgegeven'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">BERICHT</td>
                <td style="padding: 10px 0; line-height: 1.6;">${bericht}</td>
              </tr>
            </table>
          </div>
          <div style="background: #0A0A0A; padding: 16px; text-align: center;">
            <p style="color: #555; margin: 0; font-size: 12px;">Via gvperformance.nl contactformulier</p>
          </div>
        </div>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 })
  }
}
