export const metadata = {
  title: 'GV Performance — Dashboard',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0A0A0A',
}

export default function DashboardLayout({ children }) {
  return <div className="app-shell">{children}</div>
}
