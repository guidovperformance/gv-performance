// Tijdzone-veilige datumhelpers voor 'YYYY-MM-DD' strings.
//
// Waarom dit bestaat: `new Date('2026-06-23')` parsed als UTC-middernacht,
// terwijl `new Date(y, m-1, d)` lokale middernacht geeft. Zodra je die twee
// mixt met `.toISOString()` (altijd UTC-output) en lokale getters/setters
// (getDay, setDate — altijd lokale tijd), schuift de datum makkelijk een dag
// op, afhankelijk van tijdzone/DST. Gebruik daarom uitsluitend deze helpers
// voor datum-only waarden — nooit toISOString() of `new Date(str)` direct.

function pad(n) { return String(n).padStart(2, '0') }

// 'YYYY-MM-DD' -> Date (lokale middernacht, geen UTC-conversie)
export function parseDateStr(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Date (lokaal) -> 'YYYY-MM-DD', zonder UTC-shift
export function fmtDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 'YYYY-MM-DD' + n dagen -> 'YYYY-MM-DD'
export function addDaysStr(dateStr, n) {
  const d = parseDateStr(dateStr)
  d.setDate(d.getDate() + n)
  return fmtDateStr(d)
}

// Snap een 'YYYY-MM-DD' string naar de maandag van die week
export function mondayOfStr(dateStr) {
  const d = parseDateStr(dateStr)
  const dow = d.getDay() // 0=zo, 1=ma, ..., 6=za
  const back = dow === 0 ? 6 : dow - 1
  d.setDate(d.getDate() - back)
  return fmtDateStr(d)
}

// 'YYYY-MM-DD' van vandaag (lokaal)
export function todayStr() {
  return fmtDateStr(new Date())
}

// 'YYYY-MM-DD' van vandaag in Nederland — veilig voor servercode die op UTC draait
// (Vercel functions gebruiken standaard UTC, niet Europe/Amsterdam).
export function todayStrNL() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date())
}
