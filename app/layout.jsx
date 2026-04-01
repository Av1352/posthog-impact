import './globals.css'
export const metadata = { title: 'PostHog Engineering Impact', description: 'Top 5 most impactful engineers — PostHog, last 90 days' }
export default function RootLayout({ children }) {
    return <html lang="en"><body>{children}</body></html>
}