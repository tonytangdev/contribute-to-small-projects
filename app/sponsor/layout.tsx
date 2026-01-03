import { redirect } from 'next/navigation'

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (process.env.NEXT_PUBLIC_SPONSORS_ENABLED !== 'true') {
    redirect('/')
  }

  return <>{children}</>
}
